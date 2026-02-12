from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# --- CONFIGURAÇÃO ZEROCORE ---
# 1. Adiciona o diretório atual ao path para importar 'database' e 'models'
sys.path.append(os.getcwd())

# 2. Importa o Base (onde a metadata vive) e os Models (para registrar as tabelas)
from database import Base
import models  # Importante: isso força o registro das tabelas no Base.metadata

# 3. Pega a URL do Banco das Variáveis de Ambiente (mesma do Docker)
# Se não achar, usa um default (ajuste se necessário, mas o Docker deve prover)
db_url = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/zerocore")

config = context.config

# Sobrescreve a URL do alembic.ini com a do ambiente Docker
config.set_main_option("sqlalchemy.url", db_url)

# Interpreta o arquivo de log
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Define a metadata para o autogenerate
target_metadata = Base.metadata
# -----------------------------

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()