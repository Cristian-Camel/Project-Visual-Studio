from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Lead:
    id: int
    name: str
    email: Optional[str]
    owner: Optional[str]
    stage: Optional[str]
    created_at: datetime
