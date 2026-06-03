from datetime import datetime, timezone

import cloudinary.uploader
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import Boolean, or_

from auth.jwt_handler import verify_token
from database.db import get_db
from model.db_models import (
    Category,
    User,
    Product,
    ProductConfig,
    ProductConfigOption,
    ProductImage,
    ProductStaticConfig,
    ProductVariant,
)
from utils.uuid_utils import parse_uuid
from uuid import UUID


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def ensure_user_created_at(user: User, db: Session) -> User:
    if user.created_at is None:
        user.created_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
    return user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = parse_uuid(payload.get("user_id"))
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return ensure_user_created_at(user, db)



def admin_required(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user


def upload_image(file):
    result = cloudinary.uploader.upload(file)
    return result.get("secure_url")



PRODUCT_LOAD_OPTIONS = (
    joinedload(Product.category),
    joinedload(Product.static_configs),
    joinedload(Product.configs).joinedload(ProductConfig.options),
    joinedload(Product.variants).joinedload(ProductVariant.images),
)


def active_category_filter():
    """SQLAlchemy filter: category exists and is not soft-deleted."""
    return or_(Product.category_id.is_(None), Category.is_deleted.is_(False))


def public_products_query(db: Session):
    """Products visible to storefront: not deleted, category not soft-deleted."""
    return (
        db.query(Product)
        .options(*PRODUCT_LOAD_OPTIONS)
        .outerjoin(Category, Product.category_id == Category.id)
        .filter(Product.is_deleted.is_(False))
        .filter(active_category_filter())
    )


def get_active_category(db: Session, category_id: UUID) -> Category | None:
    return (
        db.query(Category)
        .filter(Category.id == category_id, Category.is_deleted.is_(False))
        .first()
    )


def load_product(
    db: Session,
    product_id: UUID,
    is_del: Boolean = False,
    *,
    public_only: bool = False,
) -> Product | None:
    query = (
        db.query(Product)
        .options(*PRODUCT_LOAD_OPTIONS)
        .outerjoin(Category, Product.category_id == Category.id)
        .filter(Product.id == product_id, Product.is_deleted == is_del)
    )
    if public_only:
        query = query.filter(active_category_filter())
    return query.first()


def is_product_available(product: Product) -> bool:
    if product.is_deleted:
        return False
    category = product.category
    if category is not None and category.is_deleted:
        return False
    return True


def upsert_static_config(db: Session, product_id: UUID, cfg) -> None:
    existing = None
    if cfg.id:
        existing = (
            db.query(ProductStaticConfig)
            .filter(
                ProductStaticConfig.id == cfg.id,
                ProductStaticConfig.product_id == product_id,
            )
            .first()
        )
        if not existing:
            raise HTTPException(
                status_code=400,
                detail=f"Static config {cfg.id} not found for this product",
            )
    elif cfg.key:
        existing = (
            db.query(ProductStaticConfig)
            .filter(
                ProductStaticConfig.product_id == product_id,
                ProductStaticConfig.key == cfg.key,
            )
            .first()
        )

    if existing:
        if cfg.key is not None:
            existing.key = cfg.key
        if cfg.value is not None:
            existing.value = cfg.value
        return

    if not cfg.key or cfg.value is None:
        raise HTTPException(
            status_code=400,
            detail="New static config requires both key and value",
        )
    db.add(
        ProductStaticConfig(
            product_id=product_id,
            key=cfg.key,
            value=cfg.value,
        )
    )


def upsert_dynamic_config(db: Session, product_id: UUID, cfg) -> ProductConfig:
    config = None
    if cfg.id:
        config = (
            db.query(ProductConfig)
            .filter(
                ProductConfig.id == cfg.id,
                ProductConfig.product_id == product_id,
            )
            .first()
        )
        if not config:
            raise HTTPException(
                status_code=400,
                detail=f"Dynamic config {cfg.id} not found for this product",
            )
    elif cfg.name:
        config = (
            db.query(ProductConfig)
            .filter(
                ProductConfig.product_id == product_id,
                ProductConfig.name == cfg.name,
            )
            .first()
        )

    if not config:
        if not cfg.name or cfg.type is None:
            raise HTTPException(
                status_code=400,
                detail="New dynamic config requires name and type",
            )
        config = ProductConfig(
            product_id=product_id,
            name=cfg.name,
            type=cfg.type,
        )
        db.add(config)
        db.flush()
        return config

    if cfg.name is not None:
        config.name = cfg.name
    if cfg.type is not None:
        config.type = cfg.type
    return config


def upsert_config_option(db: Session, config: ProductConfig, opt) -> None:
    option = None
    if opt.id:
        option = (
            db.query(ProductConfigOption)
            .filter(
                ProductConfigOption.id == opt.id,
                ProductConfigOption.config_id == config.id,
            )
            .first()
        )
        if not option:
            raise HTTPException(
                status_code=400,
                detail=f"Config option {opt.id} not found for this config",
            )
    elif opt.value:
        option = (
            db.query(ProductConfigOption)
            .filter(
                ProductConfigOption.config_id == config.id,
                ProductConfigOption.value == opt.value,
            )
            .first()
        )

    if not option:
        if opt.value is None:
            raise HTTPException(
                status_code=400,
                detail="New config option requires value",
            )
        db.add(
            ProductConfigOption(
                config_id=config.id,
                value=opt.value,
                price_modifier=opt.price_modifier or 0,
            )
        )
        return

    if opt.value is not None:
        option.value = opt.value
    if opt.price_modifier is not None:
        option.price_modifier = opt.price_modifier


def upsert_variant(db: Session, product_id: UUID, var) -> ProductVariant:
    variant = None
    if var.id:
        variant = (
            db.query(ProductVariant)
            .filter(
                ProductVariant.id == var.id,
                ProductVariant.product_id == product_id,
            )
            .first()
        )
        if not variant:
            raise HTTPException(
                status_code=400,
                detail=f"Variant {var.id} not found for this product",
            )
    elif var.color:
        variant = (
            db.query(ProductVariant)
            .filter(
                ProductVariant.product_id == product_id,
                ProductVariant.color == var.color,
            )
            .first()
        )

    if not variant:
        if not var.color or var.stock is None:
            raise HTTPException(
                status_code=400,
                detail="New variant requires color and stock",
            )
        variant = ProductVariant(
            product_id=product_id,
            color=var.color,
            stock=var.stock,
        )
        db.add(variant)
        db.flush()
        return variant

    if var.color is not None:
        variant.color = var.color
    if var.stock is not None:
        variant.stock = var.stock
    return variant


def replace_variant_images(db: Session, variant: ProductVariant, images) -> None:
    db.query(ProductImage).filter(ProductImage.variant_id == variant.id).delete()
    if not images:
        return

    has_primary = any(img.is_primary for img in images if img.is_primary is not None)
    for idx, img in enumerate(images):
        if not img.image_url:
            continue
        db.add(
            ProductImage(
                variant_id=variant.id,
                image_url=img.image_url,
                is_primary=img.is_primary if has_primary else idx == 0,
            )
        )
