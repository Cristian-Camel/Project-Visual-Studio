from datetime import timedelta

import pytest

from src.jobs import LeadReconciliationJob
from src.lead_sync_service import LeadSyncService
from src.repository import InMemoryLeadRepository
from src.monday_client import MondayClient


class StaticClient(MondayClient):
    def __init__(self):
        super().__init__("token")

    def paginate_board_items(self, board_id: int, page_size: int = 50):
        return iter([])


def test_interval_validation():
    service = LeadSyncService(StaticClient(), InMemoryLeadRepository(), board_id=1)
    with pytest.raises(ValueError):
        LeadReconciliationJob(service, interval=timedelta(minutes=30))


def test_run_once_returns_desyncs():
    service = LeadSyncService(StaticClient(), InMemoryLeadRepository(), board_id=1)
    job = LeadReconciliationJob(service)

    desynced = job.run_once()

    assert desynced == []
