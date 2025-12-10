from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List

from .models import DeliveryAttempt


@dataclass
class LeadSequenceState:
    lead_id: str
    cancelled: bool = False
    cancelled_reason: str | None = None
    cancelled_at: datetime | None = None


class LeadNurturingRepository:
    """In-memory persistence for delivery attempts and cancellations."""

    def __init__(self) -> None:
        self.attempts: Dict[str, List[DeliveryAttempt]] = defaultdict(list)
        self.sequence_state: Dict[str, LeadSequenceState] = {}

    def record_attempt(self, lead_id: str, attempt: DeliveryAttempt) -> None:
        self.attempts[lead_id].append(attempt)

    def get_attempts(self, lead_id: str) -> List[DeliveryAttempt]:
        return list(self.attempts.get(lead_id, []))

    def cancel_sequence(self, lead_id: str, reason: str, cancelled_at: datetime) -> None:
        self.sequence_state[lead_id] = LeadSequenceState(
            lead_id=lead_id, cancelled=True, cancelled_reason=reason, cancelled_at=cancelled_at
        )

    def is_cancelled(self, lead_id: str) -> bool:
        return self.sequence_state.get(lead_id, LeadSequenceState(lead_id)).cancelled
