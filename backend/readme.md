ZeroCore API - Backend

Este projeto utiliza FastAPI e PostgreSQL.
O gerenciamento de banco de dados é feito via SQLAlchemy e Alembic.

🛠 Comandos do Alembic (Banco de Dados)

Como estamos rodando em Docker, todos os comandos devem ser executados via docker-compose exec.

1. Criar uma nova Migração

Sempre que você alterar ou criar um arquivo em models/, rode este comando para gerar o arquivo de migração:

docker-compose exec backend alembic revision --autogenerate -m "Descreva a mudanca aqui"


Isso vai criar um arquivo na pasta alembic/versions/.

2. Aplicar Migrações (Atualizar Banco)

Para efetivar as mudanças no banco de dados que está rodando:

docker-compose exec backend alembic upgrade head


3. Voltar atrás (Downgrade)

Se algo der errado e você precisar desfazer a última migração aplicada:

docker-compose exec backend alembic downgrade -1


📂 Estrutura de Models

Para evitar conflitos em equipe, os modelos estão separados por domínio na pasta models/:

models/users.py: Tabelas de Usuários (User) e Funcionários (Employee).

models/announcements.py: Tabela do Mural de Avisos (Announcement).

models/__init__.py: Importante! Se criar um arquivo de modelo novo, você DEVE importá-lo neste arquivo para que o Alembic consiga detectá-lo.

🚀 Instalação Local (Desenvolvimento)

Certifique-se que o Docker está rodando.

Suba o ambiente completo:

docker-compose up -d --build


A API estará disponível em: http://localhost:8000

A Documentação (Swagger) estará em: http://localhost:8000/docs