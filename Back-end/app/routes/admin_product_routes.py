from types import SimpleNamespace
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from database.db import get_db
from model.db_models import (
    Product,
    ProductConfig,
    ProductConfigOption,
    ProductImage,
    ProductStaticConfig,
    ProductVariant,
)
from schemas.product_schema import ProductFullCreate, ProductOut, ProductUpdate
from utils.helping_funcs import (
    PRODUCT_LOAD_OPTIONS,
    admin_required,
    load_product,
    replace_variant_images,
    upload_image,
    upsert_config_option,
    upsert_dynamic_config,
    upsert_static_config,
    upsert_variant,
)



router = APIRouter()


async def _parse_product_payload(request: Request) -> tuple[ProductFullCreate, UploadFile | None, list]:
    """JSON body, or multipart with `data` (JSON) + optional image files."""
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        form = await request.form()
        payload = ProductFullCreate.model_validate_json(form["data"])
        base_image_file = form.get("base_image")
        variant_files = form.getlist("variant_images")
        return payload, base_image_file, variant_files

    payload = ProductFullCreate.model_validate(await request.json())
    return payload, None, []


def _image_url_from_upload(file: UploadFile | None) -> str | None:
    if file is None or not getattr(file, "filename", None):
        return None
    return upload_image(file.file)


def _resolve_image_url(url: str | None, file: UploadFile | None) -> str | None:
    uploaded = _image_url_from_upload(file)
    if uploaded:
        return uploaded
    return url


@router.post("/full", response_model=ProductOut, status_code=201)
async def create_product_full(
    request: Request,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    """Create product with nested configs, variants, and images in one transaction."""
    payload, base_image_file, variant_files = await _parse_product_payload(request)
    base_image_url = _resolve_image_url(payload.base_image, base_image_file)
    variant_file_iter = iter(variant_files)

    try:
        product = Product(
            name=payload.name,
            description=payload.description,
            base_price=payload.base_price,
            base_image=base_image_url,
            category_id=payload.category_id,
        )
        db.add(product)
        db.flush()

        seen_static_keys: set[str] = set()
        for static in payload.static_configs:
            if static.key in seen_static_keys:
                continue
            seen_static_keys.add(static.key)
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

            seen_option_values: set[str] = set()
            for opt in dynamic.options:
                if opt.value in seen_option_values:
                    continue
                seen_option_values.add(opt.value)
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
                price_modifier=variant_in.price_modifier,
            )
            db.add(variant)
            db.flush()

            if not variant_in.images:
                continue

            has_primary = any(img.is_primary for img in variant_in.images)
            for idx, img in enumerate(variant_in.images):
                image_url = img.image_url
                if not image_url:
                    next_file = next(variant_file_iter, None)
                    image_url = _image_url_from_upload(next_file)
                if not image_url:
                    continue
                db.add(
                    ProductImage(
                        variant_id=variant.id,
                        image_url=image_url,
                        is_primary=img.is_primary if has_primary else idx == 0,
                    )
                )

        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    result = load_product(db, product.id)
    if not result:
        raise HTTPException(status_code=500, detail="Product created but could not be loaded")
    return result


async def _parse_product_update(request: Request) -> tuple[ProductUpdate, UploadFile | None, list]:
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        form = await request.form()
        payload = ProductUpdate.model_validate_json(form["data"])
        base_image_file = form.get("base_image")
        variant_files = form.getlist("variant_images")
        return payload, base_image_file, variant_files

    payload = ProductUpdate.model_validate(await request.json())
    return payload, None, []


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    product = load_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    payload, base_image_file, variant_files = await _parse_product_update(request)
    variant_file_iter = iter(variant_files)

    try:
        if payload.name is not None:
            product.name = payload.name
        if payload.description is not None:
            product.description = payload.description
        if payload.base_price is not None:
            product.base_price = payload.base_price
        if base_image_file is not None or payload.base_image is not None:
            product.base_image = _resolve_image_url(payload.base_image, base_image_file)
        if payload.category_id is not None:
            product.category_id = payload.category_id

        if payload.static_configs:
            for cfg in payload.static_configs:
                upsert_static_config(db, product_id, cfg)

        if payload.dynamic_configs:
            for cfg in payload.dynamic_configs:
                config = upsert_dynamic_config(db, product_id, cfg)
                if cfg.options:
                    for opt in cfg.options:
                        upsert_config_option(db, config, opt)

        if payload.variants:
            for var in payload.variants:
                variant = upsert_variant(db, product_id, var)
                if "images" in var.model_fields_set:
                    resolved_images = []
                    for img in var.images or []:
                        image_url = img.image_url
                        if not image_url:
                            next_file = next(variant_file_iter, None)
                            image_url = _image_url_from_upload(next_file)
                        if not image_url:
                            continue
                        resolved_images.append(
                            SimpleNamespace(
                                image_url=image_url,
                                is_primary=img.is_primary,
                            )
                        )
                    replace_variant_images(db, variant, resolved_images)

        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    result = load_product(db, product_id)
    if not result:
        raise HTTPException(status_code=404, detail="Product not found after update")
    return result



@router.delete("/{product_id}", status_code=200)
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    product = load_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_deleted = True
    db.commit()
    return{
        "detail": "Product soft-deleted successfully"
    }
    

@router.post("/{product_id}/restore", response_model=ProductOut)
def restore_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
):
    product = load_product(db, product_id, is_del=True)
    if not product:
        raise HTTPException(status_code=404, detail="Deleted product not found")
    product.is_deleted = False
    db.commit()
    return product


    

@router.get("/", response_model=list[ProductOut])
def list_admin_products(
    db: Session = Depends(get_db),
    admin=Depends(admin_required),
    is_deleted: bool = False,
):
    query = db.query(Product).options(*PRODUCT_LOAD_OPTIONS)
    query = query.filter(Product.is_deleted == is_deleted)
    return query.all()

