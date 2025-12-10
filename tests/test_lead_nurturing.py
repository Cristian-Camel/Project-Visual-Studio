from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path

from lead_nurturing.email_provider import DummyProvider
from lead_nurturing.models import Lead
from lead_nurturing.queue import InMemoryQueue
from lead_nurturing.repository import LeadNurturingRepository
from lead_nurturing.scheduler import DELAY_SCHEDULE_DAYS, schedule_lead_sequence
from lead_nurturing.service import LeadNurturingService
from lead_nurturing.template_repository import EmailTemplateRepository
from lead_nurturing.worker import LeadWorker

TEMPLATE_PATH = "src/lead_nurturing/templates/email_templates.json"


def build_service():
    template_repo = EmailTemplateRepository(template_path=Path(TEMPLATE_PATH))
    repository = LeadNurturingRepository()
    provider = DummyProvider()
    service = LeadNurturingService(
        templates=template_repo,
        repository=repository,
        provider=provider,
        backoff_seconds=1,
    )
    return service, repository


def test_scheduler_creates_six_delayed_jobs():
    lead = Lead(id="123", email="lead@example.com", first_name="Pat")
    queue = InMemoryQueue()
    schedule_lead_sequence(lead, queue, [f"nurture-{i}" for i in range(1, 7)], now=datetime(2024, 1, 1))

    assert len(queue) == 6
    run_times = [queue.pop_due(datetime(2024, 1, 1) + timedelta(days=day)) for day in DELAY_SCHEDULE_DAYS]
    flattened = [job for sub in run_times for job in sub]
    assert [job.template_id for job in flattened] == [f"nurture-{i}" for i in range(1, 7)]


def test_worker_sends_emails_and_stores_attempts():
    service, repository = build_service()
    queue = InMemoryQueue()
    lead = Lead(id="abc", email="demo@example.com", first_name="Demo")
    schedule_lead_sequence(lead, queue, ["nurture-1"], now=datetime.utcnow())

    worker = LeadWorker(service=service, queue=queue, leads={lead.id: lead})
    worker.run_pending(datetime.utcnow())

    attempts = repository.get_attempts(lead.id)
    assert len(attempts) == 1
    assert attempts[0].status == "sent"


def test_opt_out_cancels_future_attempts():
    service, repository = build_service()
    queue = InMemoryQueue()
    lead = Lead(id="opt", email="opt@example.com", first_name="Opt", opted_out=True)
    schedule_lead_sequence(lead, queue, ["nurture-1"], now=datetime.utcnow())

    worker = LeadWorker(service=service, queue=queue, leads={lead.id: lead})
    worker.run_pending(datetime.utcnow())

    assert repository.is_cancelled(lead.id) is True
    assert len(repository.get_attempts(lead.id)) == 0


def test_failed_delivery_retries_with_backoff(monkeypatch):
    service, repository = build_service()
    queue = InMemoryQueue()
    lead = Lead(id="retry", email="retry@example.com", first_name="Retry")
    schedule_lead_sequence(lead, queue, ["nurture-1"], now=datetime(2024, 1, 1))

    # Force provider to fail the first attempt
    def fail_send(lead, template):
        raise RuntimeError("provider unavailable")

    monkeypatch.setattr(service.provider, "send", fail_send)

    worker = LeadWorker(service=service, queue=queue, leads={lead.id: lead})
    worker.run_pending(datetime(2024, 1, 1))

    # A retry should be scheduled for t0 + backoff_seconds
    assert len(queue) == 1
    retry_job = queue.peek_next()
    assert retry_job.attempt_number == 2
    assert retry_job.run_at == datetime(2024, 1, 1) + timedelta(seconds=service.backoff_seconds)

    # Allow second attempt to succeed
    monkeypatch.setattr(service.provider, "send", DummyProvider().send)
    worker.run_pending(retry_job.run_at)

    attempts = repository.get_attempts(lead.id)
    assert len(attempts) == 2
    assert attempts[0].status == "failed"
    assert attempts[1].status == "sent"
