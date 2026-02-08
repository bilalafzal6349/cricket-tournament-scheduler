import logging
from app.db.session import engine, Base, SessionLocal
from app.models import Tournament, Team, Venue, Match
from init_db import seed_sample_data, init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_database():
    logger.info("🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    logger.info("✅ Tables dropped.")

    logger.info("🔄 Re-initializing database schema...")
    init_db()
    
    # db = SessionLocal()
    # try:
    #     seed_sample_data(db)
    # finally:
    #     db.close()
    
    logger.info("✨ Database reset successfully (No data seeded)!")

if __name__ == "__main__":
    reset_database()
