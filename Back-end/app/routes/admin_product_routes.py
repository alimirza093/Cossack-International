from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database.db import get_db
from model.db_models import (
    Product,
    ProductConfig,
    ProductConfigOption,
    ProductImage,
    ProductStaticConfig,
    ProductVariant,
)
from schemas.product_schema import ProductFullCreate, ProductOut
from utils.helping_funcs import admin_required

router = APIRouter()


@router.post("/products/full", response_model=ProductOut, status_code=201)
def create_product_full(
    payload: ProductFullCreate,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    """
    Create product with static configs, dynamic configs (options + modifiers),
    color variants, and multiple images per variant in a single transaction.
    """
    product = Product(
        name=payload.name,
        description=payload.description,
        base_price=payload.base_price,
        base_image=payload.base_image,
        category_id=payload.category_id,
    )
    db.add(product)
    db.flush()

    for static in payload.static_configs:
        db.add(
            ProductStaticConfig(
                product_id=product.id,
                key=static.key,
                value=static.value,
            )
        )

    for dynamic in payload.dynamic_configs:
        config = ProductConfig(
            product_id=product.id,
            name=dynamic.name,
            type=dynamic.type,
        )
        db.add(config)
        db.flush()

        for opt in dynamic.options:
            db.add(
                ProductConfigOption(
                    config_id=config.id,
                    value=opt.value,
                    price_modifier=opt.price_modifier,
                )
            )

    for variant_in in payload.variants:
        variant = ProductVariant(
            product_id=product.id,
            color=variant_in.color,
            stock=variant_in.stock,
        )
        db.add(variant)
        db.flush()

        if not variant_in.images:
            continue

        has_primary = any(img.is_primary for img in variant_in.images)
        for idx, img in enumerate(variant_in.images):
            db.add(
                ProductImage(
                    variant_id=variant.id,
                    image_url=img.image_url,
                    is_primary=img.is_primary if has_primary else idx == 0,
                )
            )

    db.commit()

    product = (
        db.query(Product)
        .options(
            joinedload(Product.static_configs),
            joinedload(Product.configs).joinedload(ProductConfig.options),
            joinedload(Product.variants).joinedload(ProductVariant.images),
        )
        .filter(Product.id == product.id)
        .first()
    )
    return product
