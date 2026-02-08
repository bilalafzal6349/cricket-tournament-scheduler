import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Tournament, Team, Venue
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_and_seed():
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Delete specific tournaments
        logger.info("Cleaning up demo tournaments...")
        tournaments_to_delete = ["IPL 2024 Demo", "API Test Tournament", "Test Tournament"]
        
        for t_name in tournaments_to_delete:
            t = db.query(Tournament).filter(Tournament.name == t_name).first()
            if t:
                logger.info(f"Deleting tournament: {t.name} ({t.id})")
                db.delete(t)
            else:
                logger.info(f"Tournament not found: {t_name}")
        
        db.commit()
        logger.info("Cleanup complete.")

    except Exception as e:
        logger.error(f"Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_and_seed()
