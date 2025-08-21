from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from datetime import date, datetime

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.base_class import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).
        **Parameters**
        * `model`: A SQLAlchemy model class
        * `schema`: A Pydantic model (schema) class
        """
        self.model = model

    async def get(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()

    def _convert_date_fields(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert string dates back to date objects for SQLAlchemy"""
        converted_data = {}
        for key, value in data.items():
            if key in ['start_date', 'end_date', 'graduation_date']:
                if isinstance(value, str):
                    try:
                        # Try to parse as date
                        converted_data[key] = datetime.strptime(value, "%Y-%m-%d").date()
                    except ValueError:
                        # If it's not a valid date string, keep as is
                        converted_data[key] = value
                elif isinstance(value, date):
                    # Already a date object, keep as is
                    converted_data[key] = value
                else:
                    # Keep other types as is
                    converted_data[key] = value
            else:
                converted_data[key] = value
        return converted_data

    async def create(self, db: AsyncSession, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = jsonable_encoder(obj_in)
        # Convert date strings back to date objects
        obj_in_data = self._convert_date_fields(obj_in_data)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        # Convert date strings back to date objects
        update_data = self._convert_date_fields(update_data)
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, *, id: Any) -> Optional[ModelType]:
        obj = await db.get(self.model, id)
        if obj:
            await db.delete(obj)
            await db.commit()
            return obj
        return None 
    
    async def get_all(self, db: AsyncSession) -> List[ModelType]:
        result = await db.execute(select(self.model))
        return result.scalars().all()