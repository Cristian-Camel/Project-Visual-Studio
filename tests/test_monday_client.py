import pytest

from src.monday_client import MondayClient, RateLimitError


class FakeResponse:
    def __init__(self, status_code, json_data=None, headers=None):
        self.status_code = status_code
        self._json = json_data or {}
        self.headers = headers or {}

    def json(self):
        return self._json

    def raise_for_status(self):
        raise Exception(f"HTTP {self.status_code}")


class SequenceSession:
    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = 0

    def post(self, *_args, **_kwargs):
        self.calls += 1
        if not self.responses:
            raise AssertionError("No more responses configured")
        return self.responses.pop(0)


def test_rate_limit_retries(monkeypatch):
    responses = [
        FakeResponse(429, headers={"Retry-After": "0"}),
        FakeResponse(500),
        FakeResponse(200, {"data": {"ok": True}}),
    ]
    session = SequenceSession(responses)
    client = MondayClient("token", session=session, max_retries=3, backoff_factor=0)

    sleep_calls = []

    def fake_sleep(duration):
        sleep_calls.append(duration)

    monkeypatch.setattr("time.sleep", fake_sleep)

    result = client.execute("query { me { id } }")

    assert result["data"]["ok"] is True
    assert session.calls == 3
    assert len(sleep_calls) == 2


def test_rate_limit_exceeds_retry(monkeypatch):
    responses = [FakeResponse(429, headers={"Retry-After": "0"}) for _ in range(5)]
    session = SequenceSession(responses)
    client = MondayClient("token", session=session, max_retries=2, backoff_factor=0)

    monkeypatch.setattr("time.sleep", lambda _duration: None)

    with pytest.raises(RateLimitError):
        client.execute("query { me { id } }")


def test_get_items_page_builds_structure(monkeypatch):
    payload = {"data": {"boards": [{"items_page": {"cursor": "abc", "items": [{"id": "1"}]}}]}}
    session = SequenceSession([FakeResponse(200, payload)])
    client = MondayClient("token", session=session)

    result = client.get_items_page(board_id=123, limit=1, cursor=None)

    assert result == {"items": [{"id": "1"}], "cursor": "abc"}
