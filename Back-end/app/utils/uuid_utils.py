from uuid import UUID


def parse_uuid(value) -> UUID | None:
    """Parse JWT/API string or UUID into UUID for DB lookups."""
    if value is None:
        return None
    if isinstance(value, UUID):
        return value
    return UUID(str(value))
