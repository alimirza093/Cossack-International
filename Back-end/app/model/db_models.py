import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from database.db import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), default="user")  # user/admin
    created_at = Column(DateTime, default=func.current_timestamp())
    phone_number = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    products = relationship("Product", back_populates="category")


class ConfigType(str, enum.Enum):
    """Dynamic config category — drives pricing rules for size/color vs custom."""

    size = "size"
    color = "color"
    custom = "custom"


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150))
    description = Column(Text)
    # Renamed from price: catalog base before variant/config modifiers
    base_price = Column(Numeric(10, 2))
    base_image = Column(Text)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    created_at = Column(DateTime, default=func.current_timestamp())

    category = relationship("Category", back_populates="products")
    variants = relationship(
        "ProductVariant", back_populates="product", cascade="all, delete-orphan"
    )
    configs = relationship(
        "ProductConfig", back_populates="product", cascade="all, delete-orphan"
    )
    static_configs = relationship(
        "ProductStaticConfig", back_populates="product", cascade="all, delete-orphan"
    )


class ProductVariant(Base):
    """Color-based stock unit; images live on ProductImage."""

    __tablename__ = "product_variants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"))
    color = Column(String(50))
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.current_timestamp())

    product = relationship("Product", back_populates="variants")
    images = relationship(
        "ProductImage", back_populates="variant", cascade="all, delete-orphan"
    )


class ProductImage(Base):
    """Multiple images per color variant; one may be marked primary."""

    __tablename__ = "product_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="CASCADE"))
    image_url = Column(Text, nullable=False)
    is_primary = Column(Boolean, default=False)

    variant = relationship("ProductVariant", back_populates="images")


class ProductConfig(Base):
    """Dynamic option group (size, color, sleeves) — options carry price modifiers."""

    __tablename__ = "product_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"))
    name = Column(String(100))  # e.g. "size", "color", "sleeves"
    type = Column(Enum(ConfigType), default=ConfigType.custom)

    product = relationship("Product", back_populates="configs")
    options = relationship(
        "ProductConfigOption", back_populates="config", cascade="all, delete-orphan"
    )


class ProductConfigOption(Base):
    __tablename__ = "product_config_options"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id = Column(UUID(as_uuid=True), ForeignKey("product_configs.id", ondelete="CASCADE"))
    value = Column(String(100))
    price_modifier = Column(Numeric(10, 2), default=0)

    config = relationship("ProductConfig", back_populates="options")


class ProductStaticConfig(Base):
    """Non-pricing product attributes (material, washable, etc.)."""

    __tablename__ = "product_static_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"))
    key = Column(String(100), nullable=False)
    value = Column(String(255), nullable=False)

    product = relationship("Product", back_populates="static_configs")


class Cart(Base):
    __tablename__ = "cart"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cart_id = Column(UUID(as_uuid=True), ForeignKey("cart.id", ondelete="CASCADE"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"))
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL"))
    # Snapshot of chosen dynamic options, e.g. {"size": "Large", "color": "Green"}
    selected_options = Column(JSON, default=dict)
    final_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.current_timestamp())

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    total_price = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=func.current_timestamp())

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Checkout snapshot — mirrors CartItem structure at purchase time."""

    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"))
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL"))
    selected_options = Column(JSON, default=dict)
    final_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.current_timestamp())

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")
