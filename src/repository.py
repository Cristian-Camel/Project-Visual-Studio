import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Iterable, List, Optional

from .models import Lead


class LeadRepository(ABC):
    @abstractmethod
    def save(self, lead: Lead) -> None:
        raise NotImplementedError

    @abstractmethod
    def get(self, lead_id: int) -> Optional[Lead]:
        raise NotImplementedError

    @abstractmethod
    def all(self) -> Iterable[Lead]:
        raise NotImplementedError

    @abstractmethod
    def record_desync(self, lead_id: int, reason: str) -> None:
        raise NotImplementedError


class InMemoryLeadRepository(LeadRepository):
    def __init__(self, logger: Optional[logging.Logger] = None) -> None:
        self._leads: Dict[int, Lead] = {}
        self.desync_events: List[Dict[str, str]] = []
        self.logger = logger or logging.getLogger(__name__)

    def save(self, lead: Lead) -> None:
        self.logger.debug("Saving lead %s", lead.id)
        self._leads[lead.id] = lead

    def get(self, lead_id: int) -> Optional[Lead]:
        return self._leads.get(lead_id)

    def all(self) -> Iterable[Lead]:
        return list(self._leads.values())

    def record_desync(self, lead_id: int, reason: str) -> None:
        self.logger.warning("Desync detected for %s: %s", lead_id, reason)
        self.desync_events.append({"lead_id": str(lead_id), "reason": reason, "timestamp": datetime.utcnow().isoformat()})
