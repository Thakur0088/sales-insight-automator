# 📊 Sales Insight Automator

Upload CSV/XLSX sales files → AI generates a summary → Sent to your inbox.

## 🚀 Run Locally with Docker
```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/sales-insight-automator
cd sales-insight-automator

# Add your keys to .env
cp .env.example .env
# Edit .env with your keys

# Run everything
docker-compose up --build
```

Visit: http://localhost:3000
Swagger: http://localhost:5000/api-docs

## 🔐 Security

- `helmet` — sets secure HTTP headers
- `express-rate-limit` — 10 requests per 15 min per IP
- File type + size validation (CSV/XLSX, max 5MB)
- Email format validation
- CORS restricted to frontend origin only
- Memory-only file storage (no disk writes)

## 🔑 Environment Variables

See `.env.example`