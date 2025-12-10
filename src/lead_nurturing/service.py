from __future__ import annotations

import logging
from datetime import datetime

from .email_provider import EmailProvider
from .models import DeliveryAttempt, EmailTemplate, Lead, ScheduledJob
from .repository import LeadNurturingRepository
from .template_repository import EmailTemplateRepository

logger = logging.getLogger(__name__)


class LeadNurturingService:
    def __init__(
        self,
        templates: EmailTemplateRepository,
        repository: LeadNurturingRepository,
        provider: EmailProvider,
        backoff_seconds: int = 60,
    ) -> None:
        self.templates = templates
        self.repository = repository
        self.provider = provider
        self.backoff_seconds = backoff_seconds

    def send_nurture_email(self, job: ScheduledJob, lead: Lead) -> bool:
        if lead.converted:
            logger.info("Lead %s already converted. Cancelling sequence.", lead.id)
            self.repository.cancel_sequence(lead.id, "converted", datetime.utcnow())
            return False
        if lead.opted_out:
            logger.info("Lead %s opted out. Cancelling sequence.", lead.id)
            self.repository.cancel_sequence(lead.id, "opted_out", datetime.utcnow())
            return False
        if self.repository.is_cancelled(lead.id):
            logger.info("Lead %s already cancelled. Skipping job %s.", lead.id, job.job_id)
            return False

        try:
            template: EmailTemplate = self.templates.get(job.template_id)
            result = self.provider.send(lead, template)
            self.repository.record_attempt(
                lead.id,
                DeliveryAttempt(
                    job_id=job.job_id,
                    template_id=job.template_id,
                    attempt_number=job.attempt_number,
                    scheduled_at=job.run_at,
                    attempted_at=datetime.utcnow(),
                    status="sent",
                    provider_message_id=result.provider_message_id,
                    delivered=result.delivered,
                    opened=result.opened,
                ),
            )
            return True
        except Exception as exc:  # pragma: no cover - safety net
            logger.exception("Error sending email for lead %s: %s", lead.id, exc)
            self.repository.record_attempt(
                lead.id,
                DeliveryAttempt(
                    job_id=job.job_id,
                    template_id=job.template_id,
                    attempt_number=job.attempt_number,
                    scheduled_at=job.run_at,
                    attempted_at=datetime.utcnow(),
                    status="failed",
                    error_message=str(exc),
                ),
            )
            return False

    def cancel_sequence(self, lead_id: str, reason: str) -> None:
        self.repository.cancel_sequence(lead_id, reason, datetime.utcnow())
