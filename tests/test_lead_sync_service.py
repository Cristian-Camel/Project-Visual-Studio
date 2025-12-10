from datetime import datetime

import pytest

from src.lead_sync_service import LeadSyncService
from src.monday_client import MondayClient
from src.repository import InMemoryLeadRepository


class DummyClient(MondayClient):
    def __init__(self, items):
        super().__init__("token")
        self._items = items
        self.fetched = []

    def paginate_board_items(self, board_id: int, page_size: int = 50):
        yield from self._items

    def get_item(self, item_id: int):
        self.fetched.append(item_id)
        for item in self._items:
            if int(item["id"]) == item_id:
                return item
        return {}


def sample_item(item_id: int, name: str = "Lead", status: str = "New"):
    return {
        "id": str(item_id),
        "name": name,
        "created_at": datetime.utcnow().isoformat(),
        "column_values": [
            {"id": "email", "text": f"lead{item_id}@example.com"},
            {"id": "person", "text": "owner"},
            {"id": "status", "text": status},
        ],
    }


def test_backfill_normalizes_and_saves():
    items = [sample_item(1), sample_item(2, name="Lead2")]
    client = DummyClient(items)
    repo = InMemoryLeadRepository()
    service = LeadSyncService(client, repo, board_id=1, metrics={})

    stored = service.backfill_all_leads(page_size=1)

    assert len(stored) == 2
    assert repo.get(1).email == "lead1@example.com"
    assert repo.get(2).name == "Lead2"
    assert service.metrics["backfill_saved"] == 2


def test_webhook_fetches_and_updates():
    items = [sample_item(5)]
    client = DummyClient(items)
    repo = InMemoryLeadRepository()
    service = LeadSyncService(client, repo, board_id=1, metrics={})

    lead = service.handle_webhook_event({"pulseId": 5})

    assert lead is not None
    assert repo.get(5).stage == "New"
    assert client.fetched == [5]
    assert service.metrics["webhook_updates"] == 1


def test_reconcile_detects_missing_and_mismatch():
    items = [sample_item(1, status="Won"), sample_item(2)]
    client = DummyClient(items)
    repo = InMemoryLeadRepository()
    service = LeadSyncService(client, repo, board_id=1, metrics={})

    repo.save(service.normalize_item(sample_item(1, status="Lost")))

    desynced = service.reconcile_board()

    assert set(desynced) == {1, 2}
    reasons = {e["reason"] for e in repo.desync_events}
    assert "Field mismatch" in reasons
    assert "Missing locally" in reasons
