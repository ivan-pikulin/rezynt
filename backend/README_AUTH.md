# Настройка аутентификации с подтверждением email

## Переменные окружения

Создайте файл `.env` в папке `backend` со следующими переменными:

```env
# Project settings
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_MINUTES=10080

# Database settings
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=rezynt

# Email settings
EMAIL_HOST=smtp.yandex.ru
EMAIL_PORT=465
EMAIL_USERNAME=your-email@yandex.ru
EMAIL_PASSWORD=your-app-password

# Redis settings
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0

# Frontend URL
FRONTEND_URL=http://127.0.0.1:8000/api/v1
```

## Настройка email

### Для Yandex:
1. Включите двухфакторную аутентификацию
2. Создайте пароль приложения в настройках безопасности
3. Используйте этот пароль в `EMAIL_PASSWORD`

### Для Gmail:
1. Включите двухфакторную аутентификацию
2. Создайте пароль приложения
3. Используйте `smtp.gmail.com` и порт `587`

## Запуск

### 1. Запустите Redis:
```bash
redis-server
```

### 2. Запустите Celery worker:
```bash
cd backend
celery -A app.core.celery_app worker -l INFO
```

### 3. Запустите FastAPI:
```bash
cd backend
uvicorn app.main:app --reload
```

## API Endpoints

### Регистрация
```
POST /api/v1/auth/signup
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Вход
```
POST /api/v1/auth/login
Form data:
- username: user@example.com
- password: password123
```

### Подтверждение email
```
GET /api/v1/auth/register_confirm?token=your-token
```

### Обновление токена
```
POST /api/v1/auth/refresh
{
  "refresh_token": "your-refresh-token"
}
```

## Процесс регистрации

1. Пользователь регистрируется через `/signup`
2. Создается пользователь с `is_verified=False`
3. Отправляется email с токеном подтверждения
4. Пользователь переходит по ссылке в email
5. Email подтверждается, `is_verified=True`
6. Пользователь может войти в систему

## Безопасность

- Пароли хешируются с помощью bcrypt
- Токены подтверждения имеют срок действия 24 часа
- JWT токены имеют настраиваемое время жизни
- Все чувствительные данные хранятся в переменных окружения 