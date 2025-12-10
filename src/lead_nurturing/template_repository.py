from __future__ import annotations

import json
import pathlib
from typing import Dict, List

from .models import EmailTemplate


class EmailTemplateRepository:
    """Loads and caches email templates from a YAML file."""

    def __init__(self, template_path: pathlib.Path) -> None:
        self.template_path = template_path
        self._templates: Dict[str, EmailTemplate] = {}

    def load(self) -> None:
        data = json.loads(self.template_path.read_text(encoding="utf-8"))
        templates: List[EmailTemplate] = [
            EmailTemplate(id=item["id"], subject=item["subject"], body=item["body"])
            for item in data
        ]
        self._templates = {template.id: template for template in templates}

    def get(self, template_id: str) -> EmailTemplate:
        if not self._templates:
            self.load()
        template = self._templates.get(template_id)
        if not template:
            raise KeyError(f"Template {template_id} not found")
        return template

    def all(self) -> List[EmailTemplate]:
        if not self._templates:
            self.load()
        return list(self._templates.values())
