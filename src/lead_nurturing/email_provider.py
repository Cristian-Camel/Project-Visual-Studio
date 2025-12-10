from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from .models import EmailSendResult, EmailTemplate, Lead


class EmailProvider(Protocol):
    def send(self, lead: Lead, template: EmailTemplate) -> EmailSendResult:
        ...


@dataclass
class DummyProvider:
    """Simulates a provider such as SMTP or SendGrid with optional open metrics."""

    open_tracking: bool = True

    def send(self, lead: Lead, template: EmailTemplate) -> EmailSendResult:  # pragma: no cover - deterministic
        return EmailSendResult(
            provider_message_id=f"msg-{lead.id}-{template.id}-{int(datetime.utcnow().timestamp())}",
            delivered=True,
            opened=self.open_tracking,
            metadata={"provider": "dummy"},
        )
