# VisionCRM - Product Requirements Document

**Version:** 1.0  
**Last Updated:** 2026-01-01  
**Status:** MVP Phase  
**Target Launch:** 21 days from kickoff

---

## 1. Executive Summary

### 1.1 Vision
VisionCRM is a multi-tenant AI-powered CRM platform designed for French automotive garages and service businesses. It combines traditional CRM functionality with advanced AI agents (powered by Gemini 2.0) to automate customer interactions, data entry, and business intelligence.

### 1.2 Market Positioning
- **Target Market:** French SMEs in automotive, service industries (1-50 employees)
- **USP:** First CRM with native French legal compliance + AI-native workflows
- **Competitive Edge:** OCR invoice processing, WhatsApp integration, multi-language support (FR/EN/AR)

### 1.3 Business Model
**Freemium + Paid Tiers:**
- **Free:** 1 user, 100 contacts, basic features
- **Starter:** €29/month - 3 users, 1000 contacts, AI limited (100 queries/month)
- **Pro:** €79/month - 10 users, unlimited contacts, full AI (1000 queries/month)
- **Enterprise:** €199/month - unlimited users, dedicated support, API access

### 1.4 Success Metrics (MVP)
- 50 active tenants in first 3 months
- 70% conversion free → paid after 30 days
- <2s average page load time
- 99.5% uptime

---

## 2. User Personas & Use Cases

### 2.1 Primary Personas

#### Persona A: "Marc - Garage Owner"
- **Age:** 45-60
- **Tech Level:** Intermediate
- **Pain Points:** Manual quote generation, lost customer follow-ups, tax compliance
- **Goals:** Automate administrative tasks, increase repeat business by 30%
- **Key Features:** OCR invoices, automated email campaigns, revenue dashboards

#### Persona B: "Sophia - Service Manager"
- **Age:** 30-40
- **Tech Level:** Advanced
- **Pain Points:** No centralized customer history, manual scheduling
- **Goals:** Reduce admin time by 50%, improve customer satisfaction scores
- **Key Features:** Kanban pipeline, WhatsApp integration, AI assistant

### 2.2 Core Use Cases

#### UC1: Onboarding New Customer
1. User uploads vehicle registration card (carte grise)
2. OCR extracts: owner name, address, VIN, make/model
3. AI assistant auto-creates contact + vehicle record
4. System sends automated welcome email

**Acceptance Criteria:**
- OCR accuracy >95% for French carte grise
- Full onboarding completes in <60 seconds
- Email sent within 5 minutes

#### UC2: Generate Quote → Invoice Flow
1. User creates quote from template (e.g., "Oil change + tire rotation")
2. AI suggests upsells based on vehicle history
3. Client approves via WhatsApp link
4. System auto-generates legally compliant invoice (RGPD + French tax)
5. Syncs with accounting software (optional)

**Acceptance Criteria:**
- Quote generation <30 seconds
- Invoice legally compliant (CGV, SIRET, TVA)
- WhatsApp delivery <1 minute

#### UC3: AI-Powered Pipeline Analysis
1. Manager accesses dashboard
2. AI agent analyzes pipeline data (stalled deals, conversion rates)
3. Generates actionable insights: "3 deals stalled >14 days, contact them today"
4. One-click action: send automated follow-up emails

**Acceptance Criteria:**
- Analysis completes in <10 seconds
- Insights accuracy validated by 3 beta users
- Follow-up emails sent in batch

---

## 3. Architecture Overview

### 3.1 Multi-Tenant Model

**Isolation Strategy:** Shared database with Row-Level Security (RLS)

```sql
-- PostgreSQL RLS pattern
CREATE POLICY tenant_isolation ON contacts
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

**Subdomain Routing:**
- `tenant1.visioncrm.app` → `tenant_id = uuid-xxx`
- `tenant2.visioncrm.app` → `tenant_id = uuid-yyy`

**Data Partitioning:**
- Tables: `tenants`, `users`, `contacts`, `vehicles`, `quotes`, `invoices`, `activities`
- All tables include `tenant_id` foreign key + RLS policies
- Indexes: `CREATE INDEX idx_contacts_tenant ON contacts(tenant_id, created_at DESC);`

### 3.2 Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript 5.3+
- Tailwind CSS + Shadcn UI
- React Query (server state)
- Zustand (client state)

**Backend:**
- Next.js API Routes (serverless)
- Prisma ORM
- PostgreSQL 16
- Redis (session cache)

**AI Layer:**
- Gemini 2.0 Flash (primary agent)
- Gemini 2.0 Flash-Thinking (analytics)
- Context caching enabled

**Infrastructure:**
- Vercel (hosting + edge functions)
- Supabase (PostgreSQL + Auth)
- Cloudflare (CDN + DDoS)
- Sentry (error tracking)

**External Integrations:**
- Stripe (payments)
- Twilio (WhatsApp Business API)
- Google Cloud Vision (OCR)
- Resend (transactional emails)

### 3.3 Security Architecture

**Authentication:**
- NextAuth.js with multiple providers:
  - Email/Password (bcrypt hashing)
  - Google OAuth
  - Magic links
- MFA optional (TOTP via `@otplib`)

**Authorization:**
- Role-Based Access Control (RBAC):
  - `SUPER_ADMIN`: Platform admin
  - `OWNER`: Tenant admin (full access)
  - `MANAGER`: Read/write (no billing)
  - `USER`: Read-only + assigned tasks

**Data Security:**
- Encryption at rest (PostgreSQL native)
- TLS 1.3 for all traffic
- Field-level encryption for PII (AES-256)
- Automatic PII redaction in logs

**RGPD Compliance:**
- Data export API (GDPR Article 20)
- Right to deletion (soft delete + 30-day hard delete)
- Consent management (tracked in `user_consents` table)
- Data retention policies (logs purged after 90 days)

---

## 4. Functional Requirements

### 4.1 Module: Contact Management

#### Features:
1. **CRUD Operations**
   - Create/Read/Update/Delete contacts
   - Bulk import via CSV
   - Duplicate detection (fuzzy match on email + phone)

2. **Contact Fields**
   ```typescript
   interface Contact {
     id: string;
     tenant_id: string;
     first_name: string;
     last_name: string;
     email?: string;
     phone?: string;
     company?: string;
     address?: Address;
     vehicles?: Vehicle[];
     tags?: string[];
     custom_fields?: Record<string, any>;
     created_at: Date;
     updated_at: Date;
   }
   ```

3. **Search & Filters**
   - Full-text search (PostgreSQL tsvector)
   - Filters: tags, created date, last contact date, vehicle type
   - Saved views (e.g., "VIP Customers", "Overdue for service")

4. **AI Features**
   - Auto-enrichment: AI suggests missing fields (e.g., company from email domain)
   - Sentiment analysis on notes (flag unhappy customers)

#### API Endpoints:
```typescript
POST   /api/contacts          // Create contact
GET    /api/contacts          // List with pagination/filters
GET    /api/contacts/:id      // Get single contact
PATCH  /api/contacts/:id      // Update contact
DELETE /api/contacts/:id      // Soft delete
POST   /api/contacts/import   // Bulk CSV import
```

### 4.2 Module: Vehicle Registry

#### Features:
1. **OCR Carte Grise**
   - Upload image → extract: VIN, make, model, year, owner
   - Support formats: JPEG, PNG, PDF
   - Accuracy target: >95%

2. **Vehicle Tracking**
   - Service history timeline
   - Mileage tracking (manual + auto from service records)
   - Warranty expiration alerts

3. **Vehicle Fields**
   ```typescript
   interface Vehicle {
     id: string;
     tenant_id: string;
     owner_id: string; // FK to contacts
     vin: string; // Unique
     license_plate: string;
     make: string;
     model: string;
     year: number;
     mileage?: number;
     service_records?: ServiceRecord[];
   }
   ```

#### API Endpoints:
```typescript
POST   /api/vehicles/ocr           // Upload carte grise, returns extracted data
POST   /api/vehicles               // Create vehicle
GET    /api/vehicles               // List vehicles (filter by owner)
GET    /api/vehicles/:id/history   // Service history
PATCH  /api/vehicles/:id/mileage   // Update mileage
```

### 4.3 Module: Quotes & Invoices

#### Features:
1. **Quote Generation**
   - Template library (e.g., "Full service package")
   - Line items: description, quantity, unit price, VAT rate
   - AI upsell suggestions
   - PDF export (French legal format)

2. **Quote → Invoice Conversion**
   - One-click conversion
   - Auto-increment invoice number (legal requirement)
   - French legal requirements:
     - SIRET, TVA intra-communautaire
     - Mentions légales (CGV)
     - Payment terms (30 days standard)

3. **Invoice Fields**
   ```typescript
   interface Invoice {
     id: string;
     tenant_id: string;
     invoice_number: string; // e.g., "2026-001"
     contact_id: string;
     issue_date: Date;
     due_date: Date;
     items: LineItem[];
     subtotal: number;
     vat_amount: number;
     total: number;
     status: 'draft' | 'sent' | 'paid' | 'overdue';
     payment_method?: 'cash' | 'card' | 'bank_transfer';
     paid_at?: Date;
   }
   ```

4. **Payment Tracking**
   - Manual mark as paid
   - Stripe payment link generation (optional)
   - Overdue reminders (automated emails)

#### API Endpoints:
```typescript
POST   /api/quotes                    // Create quote
GET    /api/quotes                    // List quotes
POST   /api/quotes/:id/convert        // Convert to invoice
POST   /api/invoices                  // Create invoice
GET    /api/invoices                  // List invoices (filter: paid, overdue)
PATCH  /api/invoices/:id/status       // Update status
GET    /api/invoices/:id/pdf          // Generate PDF
```

### 4.4 Module: AI Agents

#### Agent 1: Conversational Assistant
**Purpose:** Help users navigate CRM, answer questions, perform actions

**Capabilities:**
- Natural language queries: "Show me all unpaid invoices from last month"
- Action execution: "Send follow-up email to contact #123"
- Onboarding guidance: "How do I import contacts?"

**Implementation:**
```typescript
// API route: /api/ai/assistant
const assistantAgent = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: `You are VisionCRM assistant. You help users:
    - Find data (contacts, invoices, etc)
    - Perform actions (send emails, create tasks)
    - Learn features
    Always respond in French. Be concise.`,
  tools: [
    { name: 'search_contacts', params: { query: 'string' } },
    { name: 'create_task', params: { title: 'string', assignee: 'string' } }
  ]
});
```

**Rate Limits:**
- Free tier: 10 queries/day
- Starter: 100 queries/month
- Pro: 1000 queries/month
- Enterprise: unlimited

#### Agent 2: Data Analyst
**Purpose:** Generate business insights from CRM data

**Capabilities:**
- Pipeline analysis: conversion rates, bottlenecks, stalled deals
- Revenue forecasting: predict monthly revenue based on pipeline
- Customer segmentation: identify high-value, at-risk, dormant customers

**Implementation:**
```typescript
// API route: /api/ai/analyze
const analystAgent = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-thinking', // Advanced reasoning
  systemInstruction: `Analyze CRM data and provide actionable insights.
    Focus on: revenue, conversion rates, customer retention.
    Output JSON with insights + recommended actions.`
});

// Example usage
const analysis = await analystAgent.generateContent({
  prompt: 'Analyze pipeline for stalled deals',
  context: {
    deals: pipelineData, // Last 90 days
    historical_conversion: 0.35 // 35% avg
  }
});
```

**Output Format:**
```json
{
  "insights": [
    {
      "type": "stalled_deals",
      "count": 5,
      "value_at_risk": 12500,
      "message": "5 deals worth €12,500 have been stalled >14 days"
    }
  ],
  "recommendations": [
    {
      "action": "send_followup",
      "targets": ["contact_123", "contact_456"],
      "template": "gentle_reminder"
    }
  ]
}
```

#### Agent 3: Content Generator
**Purpose:** Generate emails, SMS, marketing content

**Capabilities:**
- Email campaigns: personalized based on customer segment
- Follow-up emails: quote reminders, service reminders
- SMS messages: appointment confirmations

**Implementation:**
```typescript
// API route: /api/ai/generate
const writerAgent = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: `Generate professional French business communications.
    Tone: friendly but professional. Max 200 words per email.`
});

// Example
const email = await writerAgent.generateContent({
  prompt: `Generate follow-up email for customer who received quote 7 days ago.
    Quote details: Oil change + tire rotation, €180.
    Customer name: Marc Dupont.`
});
```

### 4.5 Module: Communication Hub

#### Features:
1. **Email Integration**
   - Send from CRM (via Resend API)
   - Track opens/clicks (optional)
   - Templates library
   - Merge fields: `{customer_name}`, `{quote_link}`

2. **WhatsApp Business API**
   - Send quote/invoice links
   - Appointment confirmations
   - Service reminders
   - Two-way messaging (inbox view)

3. **SMS Fallback**
   - Use when WhatsApp unavailable
   - Twilio integration

#### API Endpoints:
```typescript
POST /api/communications/email       // Send email
POST /api/communications/whatsapp    // Send WhatsApp message
GET  /api/communications/inbox       // Fetch WhatsApp conversations
POST /api/communications/templates   // Create email template
```

### 4.6 Module: Task & Activity Management

#### Features:
1. **Kanban Board**
   - Columns: To Do, In Progress, Done
   - Drag & drop
   - Filter by assignee, due date

2. **Task Fields**
   ```typescript
   interface Task {
     id: string;
     tenant_id: string;
     title: string;
     description?: string;
     assignee_id?: string;
     contact_id?: string; // Link to contact
     due_date?: Date;
     status: 'todo' | 'in_progress' | 'done';
     priority: 'low' | 'medium' | 'high';
   }
   ```

3. **Activity Timeline**
   - Auto-logged: emails sent, calls made, notes added
   - Manual entries: meetings, site visits
   - Filterable by contact, user, date range

#### API Endpoints:
```typescript
POST  /api/tasks           // Create task
GET   /api/tasks           // List tasks (Kanban view)
PATCH /api/tasks/:id       // Update task (e.g., change status)
GET   /api/activities      // Activity timeline
POST  /api/activities      // Log manual activity
```

### 4.7 Module: Reporting & Dashboards

#### Features:
1. **Executive Dashboard**
   - KPIs: monthly revenue, conversion rate, avg deal size
   - Charts: revenue trend (12 months), pipeline by stage
   - Quick actions: view overdue invoices, stalled deals

2. **Revenue Report**
   - Time filters: this month, last month, custom range
   - Breakdown: by service type, by user
   - Export to CSV

3. **Customer Analytics**
   - Lifetime value (LTV)
   - Churn rate
   - Customer acquisition cost (if ad spend tracked)

#### API Endpoints:
```typescript
GET /api/reports/revenue       // Revenue data (filters: date range)
GET /api/reports/pipeline      // Pipeline metrics
GET /api/reports/customers     // Customer analytics
```

---

## 5. Data Model

### 5.1 Core Schema (Prisma)

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Multi-tenancy
model Tenant {
  id            String   @id @default(uuid())
  subdomain     String   @unique
  name          String
  plan          Plan     @default(FREE)
  stripe_customer_id String?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  
  users         User[]
  contacts      Contact[]
  vehicles      Vehicle[]
  quotes        Quote[]
  invoices      Invoice[]
  tasks         Task[]
  activities    Activity[]
}

enum Plan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

// Users & Auth
model User {
  id         String   @id @default(uuid())
  tenant_id  String
  tenant     Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  
  email      String   @unique
  password   String?  // Null if OAuth only
  name       String
  role       Role     @default(USER)
  
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  assigned_tasks Task[]
  activities     Activity[]
  
  @@index([tenant_id])
}

enum Role {
  SUPER_ADMIN
  OWNER
  MANAGER
  USER
}

// Contacts
model Contact {
  id          String   @id @default(uuid())
  tenant_id   String
  tenant      Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  
  first_name  String
  last_name   String
  email       String?
  phone       String?
  company     String?
  
  // Address (embedded JSON)
  address     Json?
  
  // Metadata
  tags        String[]
  custom_fields Json?
  
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  vehicles    Vehicle[]
  quotes      Quote[]
  invoices    Invoice[]
  tasks       Task[]
  activities  Activity[]
  
  @@index([tenant_id, email])
  @@index([tenant_id, phone])
}

// Vehicles
model Vehicle {
  id            String   @id @default(uuid())
  tenant_id     String
  tenant        Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  
  owner_id      String
  owner         Contact  @relation(fields: [owner_id], references: [id], onDelete: Cascade)
  
  vin           String   @unique
  license_plate String
  make          String
  model         String
  year          Int
  mileage       Int?
  
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  
  service_records ServiceRecord[]
  
  @@index([tenant_id, owner_id])
}

model ServiceRecord {
  id          String   @id @default(uuid())
  vehicle_id  String
  vehicle     Vehicle  @relation(fields: [vehicle_id], references: [id], onDelete: Cascade)
  
  date        DateTime
  mileage     Int
  description String
  cost        Float?
  
  created_at  DateTime @default(now())
  
  @@index([vehicle_id, date])
}

// Quotes
model Quote {
  id          String   @id @default(uuid())
  tenant_id   String
  tenant      Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  
  contact_id  String
  contact     Contact  @relation(fields: [contact_id], references: [id])
  
  quote_number String  @unique
  issue_date  DateTime @default(now())
  valid_until DateTime
  
  items       Json     // Array of line items
  subtotal    Float
  vat_amount  Float
  total       Float
  
  status      QuoteStatus @default(DRAFT)
  
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  invoice     Invoice?
  
  @@index([tenant_id, status])
}

enum QuoteStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
  EXPIRED
}

// Invoices
model Invoice {
  id             String   @id @default(uuid())
  tenant_id      String
  tenant         Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  
  contact_id     String
  contact        Contact  @relation(fields: [contact_id], references: [id])
  
  quote_id       String?  @unique
  quote          Quote?   @relation(fields: [quote_id], references: [id])
  
  invoice_number String   @unique
  issue_date     DateTime @default(now())
  due_date       DateTime
  
  items          Json
  subtotal       Float
  vat_amount     Float
  total          Float
  
  status         InvoiceStatus @default(DRAFT)
  payment_method PaymentMethod?
  paid_at        DateTime?
  
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt
  
  @@index([tenant_id, status])
  @@index([tenant_id, due_date])
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

enum PaymentMethod {
  CASH
  CARD
  BANK_TRANSFER
  STRIPE
}

// Tasks
model Task {
  id          String   @id @default(uuid())
  tenant_id   String
  tenant      Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  
  title       String
  description String?
  
  assignee_id String?
  assignee    User?    @relation(fields: [assignee_id], references: [id])
  
  contact_id  String?
  contact     Contact? @relation(fields: [contact_id], references: [id])
  
  due_date    DateTime?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  @@index([tenant_id, status])
  @@index([tenant_id, assignee_id])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

// Activity Log
model Activity {
  id          String   @id @default(uuid())
  tenant_id   String
  tenant      Tenant   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)
  
  user_id     String
  user        User     @relation(fields: [user_id], references: [id])
  
  contact_id  String?
  contact     Contact? @relation(fields: [contact_id], references: [id])
  
  type        ActivityType
  description String
  metadata    Json?    // Extra data (e.g., email subject, call duration)
  
  created_at  DateTime @default(now())
  
  @@index([tenant_id, created_at])
  @@index([tenant_id, contact_id])
}

enum ActivityType {
  EMAIL_SENT
  WHATSAPP_SENT
  CALL_MADE
  NOTE_ADDED
  MEETING
  SITE_VISIT
}
```

### 5.2 Database Indexes (Performance)

**Critical Indexes:**
```sql
-- Contacts: tenant + email lookup
CREATE INDEX idx_contacts_tenant_email ON contacts(tenant_id, email);

-- Invoices: overdue check
CREATE INDEX idx_invoices_overdue ON invoices(tenant_id, due_date) 
WHERE status != 'PAID';

-- Tasks: Kanban view
CREATE INDEX idx_tasks_kanban ON tasks(tenant_id, status, created_at DESC);

-- Activities: timeline view
CREATE INDEX idx_activities_timeline ON activities(tenant_id, created_at DESC);
```

### 5.3 Row-Level Security (RLS)

**PostgreSQL Policies:**
```sql
-- Enable RLS on all tenant tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their tenant's data
CREATE POLICY tenant_isolation_contacts ON contacts
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_vehicles ON vehicles
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Apply to all tables...
```

**Prisma Middleware (enforce tenant context):**
```typescript
// lib/prisma.ts
prisma.$use(async (params, next) => {
  const tenantId = await getCurrentTenantId(); // From session
  
  if (params.model && ['Contact', 'Vehicle', 'Quote', 'Invoice'].includes(params.model)) {
    if (params.action === 'create') {
      params.args.data.tenant_id = tenantId;
    }
    if (['findMany', 'findFirst', 'update', 'delete'].includes(params.action)) {
      params.args.where = { ...params.args.where, tenant_id: tenantId };
    }
  }
  
  return next(params);
});
```

---

## 6. External Integrations

### 6.1 Gemini API (AI Agents)

**Configuration:**
```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const agents = {
  assistant: genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: 'VisionCRM conversational assistant...'
  }),
  
  analyst: genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-thinking',
    systemInstruction: 'Analyze CRM data...'
  }),
  
  writer: genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: 'Generate French business content...'
  })
};
```

**Rate Limiting:**
```typescript
// lib/ai-rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function checkAIQuota(tenantId: string, plan: Plan): Promise<boolean> {
  const limits = {
    FREE: 10,
    STARTER: 100,
    PRO: 1000,
    ENTERPRISE: Infinity
  };
  
  const key = `ai:quota:${tenantId}:${getMonthKey()}`;
  const usage = await redis.incr(key);
  
  if (usage === 1) {
    await redis.expire(key, 30 * 24 * 60 * 60); // 30 days
  }
  
  return usage <= limits[plan];
}
```

### 6.2 Stripe (Payments)

**Webhook Handler:**
```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();
  
  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      // Upgrade tenant plan
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.tenant.update({
        where: { stripe_customer_id: session.customer },
        data: { plan: 'PRO' } // Based on price_id
      });
      break;
      
    case 'customer.subscription.deleted':
      // Downgrade to free
      await prisma.tenant.update({
        where: { stripe_customer_id: event.data.object.customer },
        data: { plan: 'FREE' }
      });
      break;
  }
  
  return new Response(JSON.stringify({ received: true }));
}
```

### 6.3 Twilio (WhatsApp Business API)

**Send Message:**
```typescript
// lib/whatsapp.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsApp(to: string, message: string) {
  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`,
    body: message
  });
}
```

### 6.4 Resend (Transactional Emails)

**Email Template:**
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendQuoteEmail(contact: Contact, quote: Quote) {
  await resend.emails.send({
    from: 'VisionCRM <noreply@visioncrm.app>',
    to: contact.email!,
    subject: `Devis ${quote.quote_number}`,
    html: `
      <h1>Bonjour ${contact.first_name},</h1>
      <p>Veuillez trouver votre devis ci-joint.</p>
      <a href="https://app.visioncrm.app/quotes/${quote.id}">Voir le devis</a>
    `
  });
}
```

### 6.5 Google Cloud Vision (OCR)

**Carte Grise OCR:**
```typescript
// lib/ocr.ts
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();

export async function extractCarteGrise(imageBuffer: Buffer) {
  const [result] = await client.textDetection(imageBuffer);
  const text = result.fullTextAnnotation?.text || '';
  
  // Parse extracted text
  const vinMatch = text.match(/VIN:\s*([A-Z0-9]{17})/i);
  const plateMatch = text.match(/Immatriculation:\s*([A-Z0-9-]+)/i);
  
  return {
    vin: vinMatch?.[1],
    license_plate: plateMatch?.[1],
    // Additional parsing logic...
  };
}
```

---

## 7. Security & Compliance

### 7.1 RGPD Requirements

**Data Processing:**
1. **Legal Basis:** Legitimate interest (CRM management) + Consent (marketing)
2. **Data Retention:** 
   - Active customers: indefinite
   - Inactive customers: 3 years after last interaction
   - Deleted accounts: 30-day soft delete, then hard delete

**User Rights Implementation:**
```typescript
// API: /api/gdpr/export
export async function exportUserData(tenantId: string, userId: string) {
  const data = await prisma.user.findUnique({
    where: { id: userId },
    include: { contacts: true, tasks: true, activities: true }
  });
  
  return JSON.stringify(data, null, 2);
}

// API: /api/gdpr/delete
export async function deleteUserData(tenantId: string, userId: string) {
  // Soft delete first
  await prisma.user.update({
    where: { id: userId },
    data: { deleted_at: new Date() }
  });
  
  // Hard delete after 30 days (cron job)
}
```

**Consent Tracking:**
```typescript
model UserConsent {
  id         String   @id @default(uuid())
  user_id    String
  
  marketing_emails  Boolean @default(false)
  analytics         Boolean @default(false)
  
  granted_at DateTime @default(now())
  revoked_at DateTime?
}
```

### 7.2 Authentication Security

**Password Policy:**
- Minimum 12 characters
- Must include: uppercase, lowercase, number, special char
- Bcrypt hashing (cost factor 12)

**MFA Implementation:**
```typescript
// lib/mfa.ts
import * as OTPAuth from 'otpauth';

export function generateMFASecret(email: string) {
  const totp = new OTPAuth.TOTP({
    issuer: 'VisionCRM',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30
  });
  
  return totp.secret.base32;
}

export function verifyMFAToken(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret) });
  return totp.validate({ token, window: 1 }) !== null;
}
```

### 7.3 API Security

**Rate Limiting:**
```typescript
// middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
  analytics: true
});

export async function rateLimitMiddleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
}
```

**CORS Configuration:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://*.visioncrm.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE' }
        ]
      }
    ];
  }
};
```

---

## 8. UI/UX Guidelines

### 8.1 Design System

**Colors:**
```css
:root {
  --primary: #2563eb;      /* Blue */
  --secondary: #64748b;    /* Slate */
  --success: #10b981;      /* Green */
  --warning: #f59e0b;      /* Amber */
  --error: #ef4444;        /* Red */
  --background: #ffffff;
  --foreground: #0f172a;
}
```

**Typography:**
- Font: Inter (headings), IBM Plex Sans (body)
- Sizes: 12px (small), 14px (body), 16px (large), 24px (h2), 32px (h1)

**Components (Shadcn UI):**
- Buttons: Primary, Secondary, Outline, Ghost
- Forms: Input, Select, Textarea, Checkbox, Radio
- Feedback: Alert, Toast, Dialog, Sheet
- Navigation: Sidebar, Tabs, Breadcrumbs

### 8.2 Key Screens

**Dashboard:**
- Top: KPIs (Revenue MTD, Conversion Rate, Avg Deal Size)
- Middle: Revenue chart (12 months)
- Bottom: Recent activities, Overdue invoices

**Contacts List:**
- Table view with filters (tags, date, vehicle type)
- Search bar (full-text)
- Bulk actions (export, delete, tag)

**Contact Detail:**
- Left: Contact info + quick actions (email, WhatsApp, call)
- Right: Activity timeline, Vehicles, Quotes/Invoices

**Kanban (Tasks):**
- 3 columns: To Do, In Progress, Done
- Drag & drop
- Filters: assignee, due date, priority

**Quote/Invoice Form:**
- Customer selector (autocomplete)
- Line items table (add/remove rows)
- Preview panel (PDF on right side)
- Actions: Save draft, Send email, Convert to invoice

### 8.3 Responsive Design

**Breakpoints:**
```typescript
const breakpoints = {
  sm: '640px',  // Mobile landscape
  md: '768px',  // Tablet
  lg: '1024px', // Desktop
  xl: '1280px'  // Wide desktop
};
```

**Mobile-First Approach:**
- Navigation: Bottom tab bar on mobile, sidebar on desktop
- Tables: Card view on mobile, table on desktop
- Forms: Single column on mobile, multi-column on desktop

---

## 9. Performance & Scalability

### 9.1 Performance Targets

**Page Load:**
- Initial load: <2s (75th percentile)
- Time to Interactive: <3s
- Largest Contentful Paint: <2.5s

**API Response:**
- GET endpoints: <200ms (p95)
- POST endpoints: <500ms (p95)
- AI endpoints: <10s (timeout)

**Database:**
- Query time: <50ms (p95)
- Connection pool: 20 connections max
- Indexes on all foreign keys + frequently queried fields

### 9.2 Scalability Strategy

**Horizontal Scaling:**
- Vercel: Auto-scales serverless functions
- PostgreSQL: Read replicas for reporting queries
- Redis: Cluster mode for session storage

**Caching:**
```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return cached as T;
  
  const fresh = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(fresh));
  return fresh;
}
```

**Database Optimization:**
- Connection pooling: Prisma with `pgbouncer`
- Prepared statements (automatic with Prisma)
- EXPLAIN ANALYZE for slow queries

### 9.3 Monitoring

**Tools:**
- Vercel Analytics (RUM)
- Sentry (error tracking)
- Axiom (log aggregation)
- Uptime Robot (uptime monitoring)

**Alerts:**
- Error rate >1% → Slack alert
- API latency p95 >1s → Email alert
- Database CPU >80% → PagerDuty

---

## 10. Roadmap

### 10.1 MVP Phase (Days 1-21)

**Week 1: Foundation**
- Day 1-2: Project setup, database schema, auth
- Day 3-4: Contact CRUD + basic UI
- Day 5-7: Vehicle registry + OCR integration

**Week 2: Core Features**
- Day 8-10: Quote/Invoice module
- Day 11-12: Task Kanban
- Day 13-14: AI assistant integration

**Week 3: Polish & Launch**
- Day 15-17: Email/WhatsApp integration
- Day 18-19: Dashboard + reporting
- Day 20: Testing, bug fixes
- Day 21: Production deployment

**MVP Scope:**
- 100% feature parity with PRD Modules 4.1-4.6
- Supports 50 concurrent tenants
- French language only
- Basic AI features (10 queries/day free tier)

### 10.2 Phase 2: Garage-Specific Features (Months 2-3)

**New Features:**
- Service reminders (automated emails based on mileage/date)
- Parts inventory management
- Supplier integration (order parts from CRM)
- Calendar view for appointments
- Mobile app (React Native)

**Enhancements:**
- Multi-language support (English, Arabic)
- Advanced AI analytics (predictive maintenance)
- Accounting software sync (QuickBooks, Sage)

### 10.3 Phase 3: Enterprise & Scale (Months 4-6)

**Enterprise Features:**
- Custom workflows (Zapier-like automation)
- Advanced RBAC (custom roles)
- API access (public REST API)
- White-label option
- Dedicated support SLA

**Scalability:**
- Support 1000+ concurrent tenants
- Multi-region deployment (EU, US)
- 99.9% SLA guarantee

---

## 11. Success Criteria

### 11.1 Business Metrics (6 months post-launch)

- **ARR:** €500,000 (Annual Recurring Revenue)
- **Customers:** 200 paying tenants
- **Churn:** <5% monthly
- **NPS:** >50

### 11.2 Technical Metrics

- **Uptime:** 99.5%
- **Page Load:** <2s (p75)
- **Error Rate:** <0.1%
- **Security:** Zero breaches

### 11.3 User Satisfaction

- **Onboarding:** 90% complete onboarding within 24h
- **Feature Adoption:** 70% use AI assistant at least once/week
- **Support:** <2h average response time

---

## 12. Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Gemini API downtime | High | Low | Fallback to cached responses, retry logic |
| RGPD non-compliance | Critical | Medium | Legal review, audit logs, consent tracking |
| Database scale issues | High | Medium | Read replicas, query optimization, caching |
| Slow AI response times | Medium | High | Timeout after 10s, async processing, caching |
| Low user adoption | Critical | Medium | Beta testing, user feedback loop, marketing |

---

## Appendices

### A. Glossary

- **Tenant:** Single customer organization (e.g., one garage)
- **RLS:** Row-Level Security (PostgreSQL feature)
- **OCR:** Optical Character Recognition
- **RGPD:** French GDPR (data protection regulation)
- **Carte Grise:** Vehicle registration document

### B. References

- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Gemini API: https://ai.google.dev/docs
- Stripe API: https://stripe.com/docs/api
- French RGPD: https://www.cnil.fr/

### C. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-01 | Kuetey | Initial PRD for MVP |

---

**END OF DOCUMENT**
