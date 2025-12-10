from __future__ import annotations

from datetime import datetime
from typing import Dict

from .models import Lead, ScheduledJob
from .queue import InMemoryQueue
from .service import LeadNurturingService


class LeadWorker:
    """Processes nurture jobs using a queue. It is idempotent thanks to repository state checks."""

    def __init__(self, service: LeadNurturingService, queue: InMemoryQueue, leads: Dict[str, Lead]) -> None:
        self.service = service
        self.queue = queue
        self.leads = leads

    def run_pending(self, now: datetime) -> None:
        for job in self.queue.pop_due(now):
            lead = self.leads.get(job.lead_id)
            if not lead:
                continue
            succeeded = self.service.send_nurture_email(job, lead)
            if not succeeded and job.attempt_number < job.max_retries:
                retry_job = job.next_attempt_time(self.service.backoff_seconds)
                self.queue.enqueue(retry_job)
            elif not succeeded:
                # Give up but still idempotent due to repository tracking.
                self.service.repository.cancel_sequence(job.lead_id, "max_retries", datetime.utcnow())
