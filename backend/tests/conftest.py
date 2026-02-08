
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.db.session import Base
from app.main import app
from app.core.config import settings

# Use an in-memory SQLite database for testing, or a separate test DB
# For this project, we'll use a test database to ensure full compatibility
# Ideally, valid PostgreSQL connection string for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db" 

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
