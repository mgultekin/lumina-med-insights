# Lumina — AI for Medical Insight
> From medical image upload to publishable academic content — powered by AI, Supabase, and modern web technologies.

---
```
[ React + TypeScript UI ]
↳ Auth → Supabase
↳ Upload → Supabase Storage (private)
↳ Webhooks → n8n workflows (secured with tokens)
↳ AI Models (vision + NLP)
↳ Return structured JSON
↳ Supabase DB → store results, reports, article sections
↳ Rich Text Editor → compose final article
↳ Publish → External systems (WordPress, etc.)
```

## 🌍 Overview

Lumina is a full-stack AI-powered medical imaging platform that:
- Analyzes multi-modal medical images (CT, MRI, X-ray, Ultrasound) using vision LLMs  
- Generates standardized medical reports  
- Composes academic articles in ready-made templates with optional AI-assisted sections  
- Publishes content directly to journals, WordPress, or institutional repositories  

The application integrates secure file storage, real-time processing, and template-first publishing into a unified workflow.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Multi-modal AI Analysis** | Supports multiple medical imaging types with secure uploads and AI model inference |
| **Report Generation** | Structured reports formatted according to clinical standards |
| **Template-First Article Creation** | Predefined academic structures (Case Report, Studies, Reviews, Technical Note) |
| **Optional AI Assistance** | AI can generate or expand selected sections without altering core analysis results |
| **Secure Storage** | Supabase private buckets with Row Level Security |
| **Bulk Uploads** | Supports single images, folders, or large datasets |
| **Publishing** | One-click export to external platforms |

---

## 🛠 Technology Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query  
**Backend:** Supabase (PostgreSQL, Edge Functions, Row Level Security), Supabase Storage  
**AI Orchestration:** n8n webhooks with GPT-4o Vision, Gemini Pro Vision, and custom CV models  
**Deployment:** Vercel / Netlify / Supabase Hosting  
**Security:** End-to-end encryption, signed URLs, audit logging

---

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│   Supabase       │───▶│  n8n Workflows  │
│                 │    │                  │    │                 │
│ • Authentication│    │ • PostgreSQL DB  │    │ • GPT-4o Vision │
│ • Medical UI    │    │ • File Storage   │    │ • Report Gen    │
│ • Real-time     │    │ • Edge Functions │    │ • Article Gen   │
│   Updates       │    │ • Realtime API   │    │ • Publishing    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🔐 Security

- Row Level Security (RLS) on all user data  
- Bearer token authentication for webhook calls  
- Signed URL generation for controlled file access  
- Data encryption in storage and transit  
- Audit logging for all key actions

---

## 📸 Screenshots

*(Add dashboard, analysis viewer, report editor, and article composer screenshots here)*

---

## 💻 Local Development

```bash
git clone https://github.com/mgultekin/lumina-med-insights.git
cd lumina-med-insights
npm install
cp .env.example .env.local  # Add Supabase credentials
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📈 Workflow

1. **Upload** medical images
2. **AI analysis** via secure webhook
3. **Report generation** stored in database
4. **Insert results** into selected academic template
5. **Optionally generate** additional narrative sections with AI
6. **Publish or export** final document

---

## 🔗 Links

**Live Demo:** [Lumina on Lovable](https://lovable.dev/projects/f0cec422-d3d7-4f4a-aeb6-0126389beb08)

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.