import logging
from datetime import timedelta
from typing import Optional

from .lead_sync_service import LeadSyncService


class LeadReconciliationJob:
    def __init__(
        self,
        service: LeadSyncService,
        interval: timedelta = timedelta(hours=2),
        logger: Optional[logging.Logger] = None,
    ) -> None:
        if interval < timedelta(hours=1) or interval > timedelta(hours=3):
            raise ValueError("Interval must be between 1 and 3 hours")
        self.service = service
        self.interval = interval
        self.logger = logger or logging.getLogger(__name__)

    def run_once(self):
        self.logger.info("Running lead reconciliation job")
        desynced = self.service.reconcile_board()
        if desynced:
            self.logger.error("Detected desync for leads: %s", desynced)
        else:
            self.logger.info("No desync detected")
        return desynced
