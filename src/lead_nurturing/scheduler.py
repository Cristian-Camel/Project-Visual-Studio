from __future__ import annotations

from datetime import datetime, timedelta
from typing import Iterable

from .models import Lead, ScheduledJob
from .queue import InMemoryQueue


DELAY_SCHEDULE_DAYS = (0, 5, 10, 15, 20, 25)


def schedule_lead_sequence(lead: Lead, queue: InMemoryQueue, templates: Iterable[str], now: datetime) -> None:
    """Enqueue delayed jobs for a new lead following the nurture cadence."""

    for index, template_id in enumerate(templates):
        delay_days = DELAY_SCHEDULE_DAYS[index]
        job = ScheduledJob(
            job_id=f"{lead.id}-{template_id}",
            lead_id=lead.id,
            template_id=template_id,
            run_at=now + timedelta(days=delay_days),
        )
        queue.enqueue(job)
