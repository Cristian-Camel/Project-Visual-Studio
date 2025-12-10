from __future__ import annotations

import heapq
from datetime import datetime
from typing import List, Optional

from .models import ScheduledJob


class InMemoryQueue:
    """Priority queue ordered by run_at to simulate delayed jobs."""

    def __init__(self) -> None:
        self._heap: List[ScheduledJob] = []

    def enqueue(self, job: ScheduledJob) -> None:
        heapq.heappush(self._heap, job)

    def pop_due(self, now: datetime) -> List[ScheduledJob]:
        due: List[ScheduledJob] = []
        while self._heap and self._heap[0].run_at <= now:
            due.append(heapq.heappop(self._heap))
        return due

    def peek_next(self) -> Optional[ScheduledJob]:
        return self._heap[0] if self._heap else None

    def __len__(self) -> int:  # pragma: no cover - simple delegation
        return len(self._heap)
