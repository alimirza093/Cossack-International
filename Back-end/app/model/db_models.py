from sqlalchemy import Column, Integer, String, Text, DateTime , Numeric, ForeignKey
from sqlalchemy.sql import func
from database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
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

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, default=0)
    image_url = Column(Text)

    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"))

    created_at = Column(DateTime, default=func.current_timestamp())


class Cart(Base):
    __tablename__ = "cart"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)

    created_at = Column(DateTime, default=func.current_timestamp())
    


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)

    cart_id = Column(Integer, ForeignKey("cart.id", ondelete="CASCADE"))
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))

    quantity = Column(Integer, default=1)

    created_at = Column(DateTime, default=func.current_timestamp())


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    total_price = Column(Numeric(10, 2), nullable=False)

    status = Column(String(20), default="pending")  # pending/paid/shipped/delivered

    created_at = Column(DateTime, default=func.current_timestamp())
    
    
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"))

    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)  # snapshot price

    created_at = Column(DateTime, default=func.current_timestamp())
    

