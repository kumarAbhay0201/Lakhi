from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import app
from app import videos


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    settings = Settings(
        video_max_upload_size_bytes=500,
        video_max_duration_seconds=180,
        video_probe_timeout_seconds=1,
        video_upload_concurrency=2,
    )
    monkeypatch.setattr(videos, "get_settings", lambda: settings)
    monkeypatch.setattr(videos, "probe_slots", videos.asyncio.Semaphore(2))
    return TestClient(app)


def probe_metadata(duration: float = 120.0) -> dict:
    return {
        "format": {"format_name": "mov,mp4,m4a,3gp,3g2,mj2", "duration": str(duration)},
        "streams": [{"codec_type": "video", "width": 1920, "height": 1080}],
    }


@pytest.mark.parametrize("filename", ["clip.mp4", "clip.MOV"])
def test_valid_video_is_accepted(client: TestClient, monkeypatch: pytest.MonkeyPatch, filename: str) -> None:
    monkeypatch.setattr(videos, "_probe_file", lambda path, settings: probe_metadata())

    response = client.post("/api/v1/videos/validate", files={"file": (filename, b"video")})

    assert response.status_code == 200
    assert response.json()["video"]["filename"] == filename
    assert response.json()["video"]["size"] == 5


def test_exact_duration_is_accepted(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(videos, "_probe_file", lambda path, settings: probe_metadata(180))

    assert client.post("/api/v1/videos/validate", files={"file": ("clip.mp4", b"video")}).status_code == 200


def test_long_video_is_rejected(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(videos, "_probe_file", lambda path, settings: probe_metadata(180.0001))

    response = client.post("/api/v1/videos/validate", files={"file": ("clip.mp4", b"video")})

    assert response.status_code == 422


@pytest.mark.parametrize(
    ("filename", "metadata"),
    [
        ("audio-renamed.mp4", {"streams": [{"codec_type": "audio"}]}),
        ("document.mp4", {"streams": []}),
    ],
)
def test_non_video_content_is_rejected(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, filename: str, metadata: dict
) -> None:
    monkeypatch.setattr(videos, "_probe_file", lambda path, settings: metadata)

    assert client.post("/api/v1/videos/validate", files={"file": (filename, b"not-video")}).status_code == 422


def test_unsupported_extension_is_rejected_without_probe(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    calls = 0

    def probe(path: str, settings: Settings) -> dict:
        nonlocal calls
        calls += 1
        return probe_metadata()

    monkeypatch.setattr(videos, "_probe_file", probe)

    response = client.post("/api/v1/videos/validate", files={"file": ("document.pdf", b"data")})

    assert response.status_code == 415
    assert calls == 0


def test_empty_upload_is_rejected(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    calls = 0

    def probe(path: str, settings: Settings) -> dict:
        nonlocal calls
        calls += 1
        return probe_metadata()

    monkeypatch.setattr(videos, "_probe_file", probe)

    response = client.post("/api/v1/videos/validate", files={"file": ("empty.mp4", b"")})

    assert response.status_code == 400
    assert calls == 0


@pytest.mark.parametrize("exception", [RuntimeError("ffprobe is unavailable"), TimeoutError()])
def test_probe_failures_are_safe(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, exception: Exception
) -> None:
    monkeypatch.setattr(videos, "_probe_file", lambda path, settings: (_ for _ in ()).throw(exception))

    response = client.post("/api/v1/videos/validate", files={"file": ("clip.mp4", b"video")})

    assert response.status_code in {422, 503}
    assert "path" not in response.text.lower()


@pytest.mark.parametrize("metadata", [{"format": {}, "streams": []}, {"format": {"duration": "-1"}, "streams": []}])
def test_invalid_duration_or_metadata_is_rejected(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, metadata: dict
) -> None:
    monkeypatch.setattr(videos, "_probe_file", lambda path, settings: metadata)

    assert client.post("/api/v1/videos/validate", files={"file": ("clip.mp4", b"video")}).status_code == 422


def test_oversized_upload_is_rejected(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    calls = 0

    def probe(path: str, settings: Settings) -> dict:
        nonlocal calls
        calls += 1
        return probe_metadata()

    monkeypatch.setattr(videos, "_probe_file", probe)

    response = client.post("/api/v1/videos/validate", files={"file": ("large.mp4", b"x" * 501)})

    assert response.status_code == 413
    assert calls == 0


def test_temporary_file_is_removed_after_validation(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    observed: list[str] = []

    def probe(path: str, settings: Settings) -> dict:
        observed.append(path)
        assert Path(path).exists()
        return probe_metadata()

    monkeypatch.setattr(videos, "_probe_file", probe)
    response = client.post("/api/v1/videos/validate", files={"file": ("..\\outside.mp4", b"video")})

    assert response.status_code == 200
    assert observed
    assert not Path(observed[0]).exists()


def test_corrupt_probe_result_is_rejected_and_cleaned(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    observed: list[str] = []

    def probe(path: str, settings: Settings) -> dict:
        observed.append(path)
        raise ValueError("corrupt")

    monkeypatch.setattr(videos, "_probe_file", probe)
    response = client.post("/api/v1/videos/validate", files={"file": ("clip.mp4", b"broken")})

    assert response.status_code == 400
    assert not Path(observed[0]).exists()
