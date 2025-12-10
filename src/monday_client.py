import json
import logging
import time
import urllib.error
import urllib.request
from typing import Any, Dict, Generator, Iterable, Optional


class RateLimitError(Exception):
    """Raised when monday.com signals a rate-limit condition beyond retry budget."""


class _Response:
    def __init__(self, status_code: int, body: str, headers: Dict[str, str]):
        self.status_code = status_code
        self.text = body
        self.headers = headers

    def json(self) -> Dict[str, Any]:
        return json.loads(self.text) if self.text else {}

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise Exception(f"HTTP {self.status_code}: {self.text}")


class _UrllibSession:
    """Minimal session implementation using urllib to avoid external deps."""

    def post(self, url: str, json: Dict[str, Any], headers: Dict[str, str]):
        data = json and json.dumps(json).encode("utf-8")
        request = urllib.request.Request(url, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(request) as response:
                body = response.read().decode()
                return _Response(response.status, body, dict(response.headers))
        except urllib.error.HTTPError as error:  # pragma: no cover - network paths not used in tests
            body = error.read().decode() if error.fp else ""
            return _Response(error.code, body, dict(error.headers or {}))


class MondayClient:
    """Simple GraphQL client for monday.com with retry and rate-limit handling."""

    def __init__(
        self,
        api_token: str,
        endpoint: str = "https://api.monday.com/v2",
        max_retries: int = 3,
        backoff_factor: float = 1.5,
        session: Optional[Any] = None,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        self.api_token = api_token
        self.endpoint = endpoint
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self.session = session or _UrllibSession()
        self.logger = logger or logging.getLogger(__name__)

    def execute(self, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        payload = {"query": query, "variables": variables or {}}
        headers = {"Authorization": self.api_token, "Content-Type": "application/json"}
        retries = 0
        backoff = self.backoff_factor

        while True:
            response = self.session.post(self.endpoint, json=payload, headers=headers)
            status = response.status_code

            if status == 200:
                body = response.json()
                if "errors" in body:
                    self.logger.warning("monday.com responded with errors: %s", body["errors"])
                return body

            if status == 429:
                retry_after = float(response.headers.get("Retry-After", backoff))
                self.logger.info("Rate limited; retrying after %s seconds", retry_after)
                time.sleep(retry_after)
                retries += 1
            elif status >= 500:
                self.logger.warning("Server error %s; retrying in %.2fs", status, backoff)
                time.sleep(backoff)
                retries += 1
                backoff *= self.backoff_factor
            else:
                response.raise_for_status()

            if retries > self.max_retries:
                raise RateLimitError(f"Exceeded retries after status {status}")

    def get_items_page(self, board_id: int, limit: int = 50, cursor: Optional[str] = None) -> Dict[str, Any]:
        query = """
        query($board_id: Int!, $limit: Int!, $cursor: String) {
          boards (ids: [$board_id]) {
            items_page (limit: $limit, cursor: $cursor) {
              cursor
              items {
                id
                name
                created_at
                column_values { id text value title }
              }
            }
          }
        }
        """
        variables = {"board_id": board_id, "limit": limit, "cursor": cursor}
        result = self.execute(query, variables)
        boards = result.get("data", {}).get("boards", [])
        if not boards:
            return {"items": [], "cursor": None}
        page = boards[0].get("items_page", {})
        return {"items": page.get("items", []), "cursor": page.get("cursor")}

    def paginate_board_items(self, board_id: int, page_size: int = 50) -> Generator[Dict[str, Any], None, None]:
        cursor: Optional[str] = None
        while True:
            page = self.get_items_page(board_id, limit=page_size, cursor=cursor)
            items = page.get("items", [])
            for item in items:
                yield item
            cursor = page.get("cursor")
            if not cursor or not items:
                break

    def get_item(self, item_id: int) -> Dict[str, Any]:
        query = """
        query($item_id: [Int]) {
          items (ids: $item_id) {
            id
            name
            created_at
            board { id }
            column_values { id text value title }
          }
        }
        """
        result = self.execute(query, {"item_id": item_id})
        items: Iterable[Dict[str, Any]] = result.get("data", {}).get("items", [])
        return next(iter(items), {})
