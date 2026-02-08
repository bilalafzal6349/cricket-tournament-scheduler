from app.db.session import Base
import enum

class TournamentFormat(str, enum.Enum):
    ROUND_ROBIN = "round_robin"
    KNOCKOUT = "knockout"
    LEAGUE = "league"
    DOUBLE_ROUND_ROBIN = "double_round_robin"

class MatchStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"

class TournamentStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
