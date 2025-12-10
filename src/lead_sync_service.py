import logging
from datetime import datetime
from typing import Dict, Iterable, List, Optional

from .models import Lead
from .monday_client import MondayClient
from .repository import LeadRepository


class LeadSyncService:
    def __init__(
        self,
        client: MondayClient,
        repository: LeadRepository,
        board_id: int,
        logger: Optional[logging.Logger] = None,
        metrics: Optional[Dict[str, int]] = None,
    ) -> None:
        self.client = client
        self.repository = repository
        self.board_id = board_id
        self.logger = logger or logging.getLogger(__name__)
        self.metrics = metrics if metrics is not None else {}

    def normalize_item(self, item: Dict) -> Lead:
        column_values: Iterable[Dict] = item.get("column_values", [])
        column_lookup = {col.get("id"): col for col in column_values}

        def _text(id_: str) -> Optional[str]:
            value = column_lookup.get(id_)
            return value.get("text") if value else None

        created_at_raw: str = item.get("created_at") or item.get("createdAt") or datetime.utcnow().isoformat()
        created_at = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))

        return Lead(
            id=int(item["id"]),
            name=item.get("name", ""),
            email=_text("email"),
            owner=_text("person"),
            stage=_text("status"),
            created_at=created_at,
        )

    def backfill_all_leads(self, page_size: int = 50) -> List[Lead]:
        stored: List[Lead] = []
        for item in self.client.paginate_board_items(self.board_id, page_size=page_size):
            lead = self.normalize_item(item)
            self.repository.save(lead)
            stored.append(lead)
            self.metrics["backfill_saved"] = self.metrics.get("backfill_saved", 0) + 1
        self.logger.info("Backfilled %s leads", len(stored))
        return stored

    def handle_webhook_event(self, payload: Dict[str, any]) -> Optional[Lead]:
        self.logger.debug("Handling webhook payload: %s", payload)
        item_id = payload.get("pulseId") or payload.get("itemId") or payload.get("id")
        if not item_id:
            self.logger.error("Webhook payload missing item identifier")
            return None
        item = self.client.get_item(int(item_id))
        if not item:
            self.logger.error("Item %s not found in monday.com", item_id)
            return None
        lead = self.normalize_item(item)
        self.repository.save(lead)
        self.metrics["webhook_updates"] = self.metrics.get("webhook_updates", 0) + 1
        return lead

    def reconcile_board(self, page_size: int = 50) -> List[int]:
        desynced: List[int] = []
        remote_map = {}
        for item in self.client.paginate_board_items(self.board_id, page_size=page_size):
            lead = self.normalize_item(item)
            remote_map[lead.id] = lead

        for local in self.repository.all():
            remote = remote_map.get(local.id)
            if not remote:
                reason = "Missing remotely"
                self.repository.record_desync(local.id, reason)
                desynced.append(local.id)
                continue
            if self._lead_differs(local, remote):
                reason = "Field mismatch"
                self.repository.record_desync(local.id, reason)
                desynced.append(local.id)

        for lead_id in remote_map:
            if not self.repository.get(lead_id):
                reason = "Missing locally"
                self.repository.record_desync(lead_id, reason)
                desynced.append(lead_id)
        self.metrics["desync_detected"] = self.metrics.get("desync_detected", 0) + len(desynced)
        return desynced

    @staticmethod
    def _lead_differs(local: Lead, remote: Lead) -> bool:
        return any(
            [
                local.name != remote.name,
                local.email != remote.email,
                local.owner != remote.owner,
                local.stage != remote.stage,
            ]
        )
