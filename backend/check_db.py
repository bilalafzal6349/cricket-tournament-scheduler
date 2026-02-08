from app.db.session import SessionLocal
from app.models import Tournament, Team
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_db():
    db = SessionLocal()
    try:
        t_count = db.query(Tournament).count()
        team_count = db.query(Team).count()
        logger.info(f"Tournaments: {t_count}")
        logger.info(f"Teams: {team_count}")
        if t_count == 0:
            logger.info("Database is empty (Reset successful).")
        else:
            logger.info("Database contains data.")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
