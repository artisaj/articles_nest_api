# Sistema de Gerenciamento de Artigos

Sistema completo de gerenciamento de artigos com autenticação JWT e controle de permissões baseado em roles (RBAC).

## 🚀 Tecnologias Utilizadas

- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Linguagem de programação tipada
- **Prisma ORM** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - JSON Web Tokens para autenticação
- **Docker & Docker Compose** - Containerização
- **Swagger/OpenAPI** - Documentação da API
- **Jest** - Framework de testes

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Porta 3000 disponível

## 🔧 Como Executar

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd artigos
```

2. Execute o projeto com Docker:
```bash
docker compose up --build
```

3. A aplicação estará disponível em:
- **API**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api

As migrations e seeds serão executados automaticamente na inicialização.

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger em:
```
http://localhost:3000/api
```

### Autenticação

Todos os endpoints (exceto `/auth/login`) requerem autenticação via JWT.

**Login:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "permissions": ["ADMIN"]
  }
}
```

**Usar o token:**
```http
Authorization: Bearer {access_token}
```

### Endpoints Principais

#### Autenticação
- `POST /auth/login` - Login (público)

#### Usuários
- `POST /users` - Criar usuário (ADMIN)
- `GET /users` - Listar usuários (requer autenticação)
- `GET /users/:id` - Buscar usuário (requer autenticação)
- `PUT /users/:id` - Atualizar usuário (ADMIN)
- `DELETE /users/:id` - Deletar usuário (ADMIN)
- `POST /users/:userId/permissions/:permissionId` - Atribuir permissão (ADMIN)

#### Artigos
- `POST /articles` - Criar artigo (ADMIN, EDITOR)
- `GET /articles` - Listar artigos (ADMIN, EDITOR, READER)
- `GET /articles/:id` - Buscar artigo (ADMIN, EDITOR, READER)
- `PUT /articles/:id` - Atualizar artigo (ADMIN, EDITOR)
- `DELETE /articles/:id` - Deletar artigo (ADMIN, EDITOR)

#### Permissões
- `GET /permissions` - Listar permissões (requer autenticação)

## 👥 Sistema de Permissões (RBAC)

O sistema possui três níveis de acesso:

### ADMIN
- Acesso total ao sistema
- CRUD completo em usuários
- CRUD completo em artigos
- Gerenciar permissões

### EDITOR
- CRUD completo em artigos
- Visualizar usuários (sem modificar)

### READER
- Apenas leitura de artigos
- Visualizar usuários (sem modificar)

## 🔐 Credenciais Padrão

O sistema cria automaticamente um usuário administrador:

```
Email: admin@example.com
Senha: Admin@123
Role: ADMIN
```

## 🗄️ Banco de Dados

O sistema utiliza PostgreSQL com as seguintes tabelas:

- **users** - Usuários do sistema
- **articles** - Artigos criados
- **permissions** - Permissões disponíveis (ADMIN, EDITOR, READER)
- **user_permissions** - Relação many-to-many entre usuários e permissões

### Migrations e Seeds

As migrations e seeds são executados automaticamente ao iniciar o container:

1. **Migrations**: Criam a estrutura do banco
2. **Seeds**: Populam dados iniciais
   - Permissões (ADMIN, EDITOR, READER)
   - Usuário administrador padrão

## 🌍 Variáveis de Ambiente

Arquivo `.env` (já configurado no docker-compose.yml):

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/articles_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=1d

# Application
NODE_ENV=production
PORT=3000
```

## 🧪 Testes

### Executar Testes E2E

```bash
# Dentro do container
docker compose exec app npm run test:e2e

# Ou localmente (após npm install)
npm run test:e2e
```

Cobertura de testes:
- ✅ Autenticação (4 testes)
- ✅ CRUD de Usuários (13 testes)
- ✅ CRUD de Artigos (18 testes)
- ✅ Permissões e RBAC (15 testes)

**Total: 50 testes E2E**

## 📁 Estrutura do Projeto

```
artigos/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── common/          # Decorators, guards, filters
│   │   ├── modules/
│   │   │   ├── auth/        # Autenticação JWT
│   │   │   ├── users/       # Gerenciamento de usuários
│   │   │   ├── articles/    # Gerenciamento de artigos
│   │   │   └── permissions/ # Sistema de permissões
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                # Testes E2E
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🐳 Comandos Docker Úteis

```bash
# Iniciar serviços
docker compose up

# Iniciar com rebuild
docker compose up --build

# Parar serviços
docker compose down

# Parar e remover volumes (limpar banco)
docker compose down -v

# Ver logs
docker compose logs -f app

# Acessar shell do container
docker compose exec app sh

# Executar migrations manualmente
docker compose exec app npx prisma migrate deploy

# Executar seeds manualmente
docker compose exec app npx prisma db seed
```

## 📊 Status HTTP e Tratamento de Erros

O sistema retorna os seguintes status HTTP:

- `200 OK` - Sucesso
- `201 Created` - Recurso criado
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Conflito (ex: email duplicado)
- `500 Internal Server Error` - Erro no servidor

Todas as respostas de erro seguem o formato:
```json
{
  "statusCode": 400,
  "message": "Descrição do erro",
  "error": "Bad Request"
}
```

## 🔒 Segurança

- ✅ Senhas armazenadas com hash bcrypt
- ✅ JWT com expiração configurável
- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurado
- ✅ Validação de entrada em todos os endpoints
- ✅ Guards de autenticação e autorização
- ✅ Variáveis sensíveis em .env

## 📝 Exemplos de Uso

### 1. Fazer Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}'
```

### 2. Criar Usuário (como ADMIN)
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "Senha@123"
  }'
```

### 3. Atribuir Permissão EDITOR
```bash
curl -X POST http://localhost:3000/users/{userId}/permissions/{permissionId} \
  -H "Authorization: Bearer {token}"
```

### 4. Criar Artigo (como EDITOR ou ADMIN)
```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "Meu Primeiro Artigo",
    "content": "Conteúdo do artigo..."
  }'
```

### 5. Listar Artigos (qualquer usuário autenticado)
```bash
curl http://localhost:3000/articles \
  -H "Authorization: Bearer {token}"
```

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** com:

- **Separação de responsabilidades** por módulos
- **DTOs** para validação e transferência de dados
- **Services** para lógica de negócio
- **Controllers** para roteamento HTTP
- **Guards** para autenticação e autorização
- **Decorators** para código reutilizável
- **Prisma** como camada de abstração do banco

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 👨‍💻 Desenvolvimento

Para desenvolvimento local sem Docker:

1. Instale as dependências:
```bash
cd api
npm install
```

2. Configure o `.env` apontando para um PostgreSQL local

3. Execute as migrations:
```bash
npx prisma migrate deploy
npx prisma db seed
```

4. Inicie em modo desenvolvimento:
```bash
npm run start:dev
```

## 🆘 Troubleshooting

### Porta 3000 já em uso
```bash
# Mudar a porta no docker-compose.yml
ports:
  - "3001:3000"
```

### Banco de dados não conecta
```bash
# Verificar se o PostgreSQL está rodando
docker compose ps

# Ver logs do banco
docker compose logs postgres
```

### Resetar banco de dados
```bash
# Parar e remover volumes
docker compose down -v

# Subir novamente (vai recriar tudo)
docker compose up --build
```

## 📮 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com NestJS e ❤️**
