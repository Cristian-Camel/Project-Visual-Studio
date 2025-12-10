from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, Optional


@dataclass
class Lead:
    id: str
    email: str
    first_name: str
    converted: bool = False
    opted_out: bool = False


@dataclass
class EmailTemplate:
    id: str
    subject: str
    body: str


@dataclass
class EmailSendResult:
    provider_message_id: str
    delivered: bool
    opened: bool = False
    metadata: Dict[str, str] = field(default_factory=dict)


@dataclass
class DeliveryAttempt:
    job_id: str
    template_id: str
    attempt_number: int
    scheduled_at: datetime
    attempted_at: datetime
    status: str
    provider_message_id: Optional[str] = None
    opened: Optional[bool] = None
    delivered: Optional[bool] = None
    error_message: Optional[str] = None


@dataclass(order=True)
class ScheduledJob:
    run_at: datetime
    job_id: str = field(compare=False)
    lead_id: str = field(compare=False)
    template_id: str = field(compare=False)
    attempt_number: int = field(default=1, compare=False)
    max_retries: int = field(default=3, compare=False)

    def next_attempt_time(self, backoff_seconds: int) -> "ScheduledJob":
        next_run = self.run_at + timedelta(seconds=backoff_seconds)
        return ScheduledJob(
            job_id=self.job_id,
            lead_id=self.lead_id,
            template_id=self.template_id,
            run_at=next_run,
            attempt_number=self.attempt_number + 1,
            max_retries=self.max_retries,
        )
