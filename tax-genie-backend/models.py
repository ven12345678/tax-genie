from sqlalchemy import Column, Integer, String, Date, Float
from database import Base

class Expense(Base):
    __tablename__ = 'expenses'

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    category = Column(String)
    amount = Column(Float)
    type = Column(String)  # Income or Expense
