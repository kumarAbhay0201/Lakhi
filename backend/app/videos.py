import asyncio
import json
import math
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from fastapi import APIRouter, UploadFile
from fastapi.responses import JSONResponse

from .config import Settings, get_settings

router = APIRouter(prefix="/api/v1/videos", tags=["videos"])

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4v"}
CHUNK_SIZE = 1024 * 1024
probe_slots = asyncio.Semaphore(get_settings().video_upload_concurrency)


def _error(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "message": message},
    )


def _probe_file(path: str, settings: Settings) -> dict[str, Any]:
    command = [
        settings.ffprobe_path,
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        "-count_frames",
        path,
    ]
    try:
        completed = subprocess.run(
            command,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=settings.video_probe_timeout_seconds,
            shell=False,
            check=False,
        )
    except FileNotFoundError as exc:
        raise RuntimeError("ffprobe is unavailable") from exc
    except subprocess.TimeoutExpired as exc:
        raise TimeoutError("media inspection timed out") from exc
    except OSError as exc:
        raise RuntimeError("media inspection could not be started") from exc

    if completed.returncode != 0:
        raise ValueError("media inspection failed")
    try:
        result = json.loads(completed.stdout)
    except (json.JSONDecodeError, TypeError) as exc:
        raise ValueError("media inspection returned invalid metadata") from exc
    if not isinstance(result, dict):
        raise ValueError("media inspection returned invalid metadata")
    return result


def _number(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def _validate_probe(metadata: dict[str, Any], settings: Settings) -> dict[str, Any]:
    streams = metadata.get("streams")
    if not isinstance(streams, list) or not streams or len(streams) > 32:
        raise ValueError("media streams are invalid")

    video_streams = [stream for stream in streams if isinstance(stream, dict) and stream.get("codec_type") == "video"]
    if not video_streams:
        raise ValueError("media contains no video stream")

    video = video_streams[0]
    width = video.get("width")
    height = video.get("height")
    if not isinstance(width, int) or not isinstance(height, int) or width <= 0 or height <= 0:
        raise ValueError("video dimensions are invalid")

    duration = _number((metadata.get("format") or {}).get("duration"))
    if duration is None or duration <= 0:
        raise ValueError("media duration is invalid")
    if duration > settings.video_max_duration_seconds:
        raise OverflowError

    format_name = (metadata.get("format") or {}).get("format_name")
    return {
        "format": format_name if isinstance(format_name, str) and format_name else None,
        "duration": duration,
        "width": width,
        "height": height,
    }


@router.post("/validate")
async def validate_video(file: UploadFile) -> JSONResponse:
    settings = get_settings()
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        await file.close()
        return _error(415, "Unsupported video format.")

    temporary_path: str | None = None
    acquired = False
    try:
        try:
            await asyncio.wait_for(probe_slots.acquire(), settings.video_probe_timeout_seconds)
            acquired = True
        except asyncio.TimeoutError:
            return _error(503, "Video validation is temporarily unavailable.")

        descriptor, temporary_path = tempfile.mkstemp(prefix="lakhi-video-", suffix=".upload")
        os.close(descriptor)
        total_size = 0
        with open(temporary_path, "wb") as destination:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                total_size += len(chunk)
                if total_size > settings.video_max_upload_size_bytes:
                    return _error(413, "Video upload exceeds the maximum allowed size.")
                destination.write(chunk)

        if total_size == 0:
            return _error(400, "The uploaded video is empty.")

        try:
            metadata = await asyncio.to_thread(_probe_file, temporary_path, settings)
        except RuntimeError:
            return _error(503, "Video validation is unavailable.")
        except TimeoutError:
            return _error(422, "Video validation timed out.")
        except ValueError:
            return _error(400, "The uploaded media is malformed or unreadable.")

        try:
            video = _validate_probe(metadata, settings)
        except OverflowError:
            return _error(422, "Video duration must not exceed 180 seconds.")
        except ValueError:
            return _error(422, "Required video metadata could not be validated.")

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Video validated successfully.",
                "video": {
                    "filename": filename,
                    "format": video["format"],
                    "duration": video["duration"],
                    "width": video["width"],
                    "height": video["height"],
                    "size": total_size,
                },
            },
        )
    except (OSError, IOError):
        return _error(500, "The video could not be processed.")
    finally:
        await file.close()
        if acquired:
            probe_slots.release()
        if temporary_path is not None:
            try:
                os.unlink(temporary_path)
            except FileNotFoundError:
                pass
            except OSError:
                pass
