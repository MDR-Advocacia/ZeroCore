# Importa os modelos para que sejam registrados no Base.metadata
from .users import User, Employee
from .announcements import Announcement

# Quando alguém fizer "from models import User", vai funcionar.