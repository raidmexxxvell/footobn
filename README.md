# Деплой на Render.com

## Backend (Node.js)

1. **Build & Start**
   - Build command: `npm run build`
   - Start command: `npm start`
2. **Переменные окружения**
   - Все секреты и ключи вынести в .env (например, DATABASE_URL, GOOGLE_SERVICE_KEY и др.)
   - Пример .env:
     ```env
     PORT=10000
     DATABASE_URL=postgres://user:password@host:port/dbname
     GOOGLE_SERVICE_KEY=... (или путь к json)
     ```
3. **Порт**
   - Сервер должен слушать порт из переменной окружения: `process.env.PORT`

## Frontend (Vite)

1. **Build**
   - Build command: `npm run build`
   - Output directory: `dist`
2. **Переменные окружения**
   - В .env:
     ```env
     VITE_API_URL=https://your-backend-url.onrender.com
     ```
3. **Static Site**
   - В Render укажите папку `dist` как корневую для статики.

## Общие рекомендации
- Не храните секреты в репозитории.
- Проверьте, что все зависимости указаны в package.json.
- Добавьте инструкции по запуску в README.md.

---

## Пример .env для backend
```
PORT=10000
DATABASE_URL=postgres://user:password@host:port/dbname
GOOGLE_SERVICE_KEY=... (или путь к json)
```

## Пример .env для frontend
```
VITE_API_URL=https://your-backend-url.onrender.com
```

## Пример README.md
```
# Football League

## Backend
- Build: `npm run build`
- Start: `npm start`
- .env: PORT, DATABASE_URL, GOOGLE_SERVICE_KEY

## Frontend
- Build: `npm run build`
- Output: `dist`
- .env: VITE_API_URL
```
