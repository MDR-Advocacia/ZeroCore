FROM python:3.12-slim

# Instala dependências de sistema para LDAP (Active Directory)
RUN apt-get update && apt-get install -y \
    build-essential \
    libldap2-dev \
    libsasl2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala as bibliotecas base
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    sqlalchemy \
    psycopg2-binary \
    python-jose[cryptography] \
    passlib[bcrypt] \
    python-multipart \
    python-ldap

# Comando para rodar com hot-reload (auto-atualiza ao salvar no Mac)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]