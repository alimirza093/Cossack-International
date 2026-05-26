"""
Daraz-style single-layer pricing: size modifier takes priority over color.
Only one dynamic pricing layer is applied per line item (no stacking).
"""
from decimal import Decimal
from typing import Any

from model.db_models import Product


def _option_modifier(product: Product, config_name: str, option_value: str) -> Decimal:
    """Look up price_modifier for a config option by config name and selected value."""
    if not option_value:
        return Decimal("0")

    name_key = config_name.lower()
    value_key = str(option_value).lower()

    for config in product.configs:
        if config.name.lower() != name_key:
            continue
        for opt in config.options:
            if opt.value.lower() == value_key:
                return Decimal(opt.price_modifier or 0)
    return Decimal("0")


def calculate_price(product: Product, selected_options: dict[str, Any] | None) -> Decimal:
    """
    Compute final unit price from base_price and selected dynamic options.

    1. Start with product.base_price
    2. If "size" is selected and its price_modifier > 0 → base + size modifier only
    3. Else if "color" is selected → base + color modifier
    4. Other config keys (e.g. sleeves) do not stack on top of size/color
    """
    base = Decimal(product.base_price or 0)
    options = selected_options or {}

    size_modifier = _option_modifier(product, "size", options.get("size", ""))
    if size_modifier > 0:
        return base + size_modifier

    color_modifier = _option_modifier(product, "color", options.get("color", ""))
    return base + color_modifier
