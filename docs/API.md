# Lumina Medical AI Platform - API Documentation

## Overview

The Lumina Medical AI Platform uses Supabase as its backend, providing a RESTful API and real-time subscriptions. This document outlines the key API endpoints and data structures.

## Authentication

All API requests require authentication using Supabase Auth. The platform supports:

- Email/Password authentication
- JWT token-based sessions
- Row Level Security (RLS) for data access

### Authentication Headers

```http
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
```

## Core Entities

### Analysis

Represents a medical image analysis session.

```typescript
interface Analysis {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'report_draft' | 'article_draft' | 'published';
  modality: string;
  body_region: string;
  image_paths: string[];
  analysis_result?: string;
  report_text?: string;
  article_text?: string;
  article_title?: string;
  template_key?: string;
  tone?: string;
  keywords?: string[];
  citations?: string[];
  published_url?: string;
}
```

### Profile

User profile information.

```typescript
interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}
```

## API Endpoints

### Analyses

#### Get All Analyses

```http
GET /rest/v1/analyses
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "status": "analyzed",
    "modality": "MRI",
    "body_region": "Brain",
    "image_paths": ["path/to/image.jpg"],
    "analysis_result": "AI analysis results..."
  }
]
```

#### Get Single Analysis

```http
GET /rest/v1/analyses?id=eq.{id}
```

#### Create Analysis

```http
POST /rest/v1/analyses
Content-Type: application/json

{
  "modality": "MRI",
  "body_region": "Brain",
  "image_paths": ["path/to/image.jpg"],
  "status": "uploaded"
}
```

#### Update Analysis

```http
PATCH /rest/v1/analyses?id=eq.{id}
Content-Type: application/json

{
  "status": "analyzed",
  "analysis_result": "Updated results..."
}
```

#### Delete Analysis

```http
DELETE /rest/v1/analyses?id=eq.{id}
```

### Storage

#### Upload Medical Image

```http
POST /storage/v1/object/medical-images/{file_path}
Content-Type: multipart/form-data

{file_data}
```

#### Get Image URL

```http
GET /storage/v1/object/public/medical-images/{file_path}
```

## Edge Functions

### Analyze Medical Image

Triggers AI analysis of uploaded medical images.

```http
POST /functions/v1/analyze-medical-image
Content-Type: application/json

{
  "analysis_id": "uuid",
  "image_paths": ["path/to/image.jpg"],
  "modality": "MRI",
  "body_region": "Brain"
}
```

**Response:**
```json
{
  "success": true,
  "analysis_id": "uuid",
  "findings": "AI analysis results..."
}
```

### Generate Report

Generates clinical report from analysis results.

```http
POST /functions/v1/generate-report
Content-Type: application/json

{
  "analysis_id": "uuid",
  "analysis_result": "AI findings..."
}
```

**Response:**
```json
{
  "success": true,
  "report_text": "Generated clinical report..."
}
```

### Generate Article

Creates academic article from analysis and report data.

```http
POST /functions/v1/generate-article
Content-Type: application/json

{
  "analysis_id": "uuid",
  "template_key": "case_report",
  "title": "Article Title",
  "tone": "academic",
  "keywords": ["keyword1", "keyword2"],
  "citations": ["citation1", "citation2"],
  "use_report": true,
  "use_analysis": true
}
```

**Response:**
```json
{
  "success": true,
  "article_text": "Generated article content..."
}
```

### Publish Article

Publishes article to external platform.

```http
POST /functions/v1/publish-article
Content-Type: application/json

{
  "analysis_id": "uuid",
  "article_text": "Article content...",
  "title": "Article Title",
  "template_key": "case_report",
  "keywords": ["keyword1", "keyword2"]
}
```

**Response:**
```json
{
  "success": true,
  "published_url": "https://published-article-url.com"
}
```

## Real-time Subscriptions

### Analysis Updates

Subscribe to real-time analysis updates:

```javascript
const subscription = supabase
  .channel('analyses')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'analyses',
      filter: `user_id=eq.${userId}`
    }, 
    (payload) => {
      console.log('Analysis updated:', payload.new);
    }
  )
  .subscribe();
```

## Error Handling

All API endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authentication endpoints**: 10 requests per minute
- **Analysis endpoints**: 100 requests per hour
- **File upload**: 50 MB per request, 1 GB per hour

## Data Security

### Encryption

- All data is encrypted in transit using TLS 1.3
- Sensitive data is encrypted at rest using AES-256
- Medical images are stored with client-side encryption

### Access Control

- Row Level Security (RLS) enforces user data isolation
- API keys are scoped to specific operations
- Regular security audits and penetration testing

### HIPAA Compliance

- Business Associate Agreement (BAA) with Supabase
- Audit logging for all data access
- Data retention policies compliant with healthcare regulations
- Secure data backup and disaster recovery

## SDK and Client Libraries

### JavaScript/TypeScript

```bash
npm install @supabase/supabase-js
```

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Get analyses
const { data: analyses } = await supabase
  .from('analyses')
  .select('*')
  .eq('user_id', userId);
```

### React Hooks

The platform includes custom React hooks for common operations:

```javascript
import { useAnalyses, useAnalysis } from '@/hooks/useAnalyses';

// Get all analyses
const { analyses, loading, error } = useAnalyses();

// Get single analysis
const { analysis, loading, error } = useAnalysis(analysisId);
```

## Webhooks

The platform supports webhooks for external integrations:

### Analysis Complete

Triggered when AI analysis is completed.

```json
{
  "event": "analysis.completed",
  "data": {
    "analysis_id": "uuid",
    "user_id": "uuid",
    "status": "analyzed",
    "findings": "AI analysis results..."
  }
}
```

### Article Published

Triggered when an article is successfully published.

```json
{
  "event": "article.published",
  "data": {
    "analysis_id": "uuid",
    "article_title": "Published Article Title",
    "published_url": "https://published-url.com"
  }
}
```

## Development and Testing

### Local Development

```bash
# Start Supabase local development
npx supabase start

# Run database migrations
npx supabase db reset

# Start local functions
npx supabase functions serve
```

### Testing

The platform includes comprehensive API tests:

```bash
# Run API tests
npm run test:api

# Run integration tests
npm run test:integration
```

For more detailed information, see the [Contributing Guide](../CONTRIBUTING.md) and [Development Setup](../README.md#getting-started).