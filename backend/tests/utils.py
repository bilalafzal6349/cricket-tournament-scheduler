from app.main import app
from app.db.session import get_db

def test_override_dependency(db):
    app.dependency_overrides[get_db] = lambda: db
