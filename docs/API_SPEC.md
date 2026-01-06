# VisionCRM - API Specification

**Base URL:** `https://{tenant}.visioncrm.app/api`  
**Version:** v1  
**Authentication:** Session-based (NextAuth.js)

## Authentication

All API endpoints (except `/api/auth/*`) require authentication via session cookie.

### POST /api/auth/signin

**Request:**
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "owner@garage-dupont.fr",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-xxx",
    "email": "owner@garage-dupont.fr",
    "name": "Marc Dupont",
    "tenantId": "uuid-tenant",
    "role": "OWNER"
  },
  "expires": "2026-01-08T10:00:00.000Z"
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### POST /api/auth/signup

**Request:**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "new@garage.fr",
  "password": "SecurePassword123!",
  "name": "Jean Martin",
  "subdomain": "garage-martin",
  "tenantName": "Garage Martin & Fils"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-user",
    "email": "new@garage.fr",
    "tenantId": "uuid-tenant"
  },
  "tenant": {
    "id": "uuid-tenant",
    "subdomain": "garage-martin",
    "name": "Garage Martin & Fils"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Subdomain already taken",
  "code": "SUBDOMAIN_EXISTS"
}
```

## Contacts

### GET /api/contacts

List contacts with pagination and filters.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string, optional)
- `tags` (string[], optional)
- `is_vip` (boolean, optional)

**Request:**
```http
GET /api/contacts?page=1&limit=20&search=dupont&is_vip=true
Authorization: Session-Cookie
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-contact-1",
      "first_name": "Marc",
      "last_name": "Dupont",
      "email": "marc.dupont@example.fr",
      "phone": "+33612345678",
      "company": "Dupont SARL",
      "address": {
        "street": "12 Rue de la Paix",
        "city": "Paris",
        "postal_code": "75001",
        "country": "France"
      },
      "tags": ["client_fidele", "commercial"],
      "is_vip": true,
      "vehicles_count": 3,
      "created_at": "2025-12-15T10:30:00.000Z",
      "updated_at": "2026-01-01T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### POST /api/contacts

Create a new contact.

**Request:**
```http
POST /api/contacts
Content-Type: application/json
Authorization: Session-Cookie

{
  "first_name": "Sophie",
  "last_name": "Martin",
  "email": "sophie.martin@example.fr",
  "phone": "+33698765432",
  "company": "Martin Transport",
  "address": {
    "street": "45 Avenue des Champs",
    "city": "Lyon",
    "postal_code": "69001",
    "country": "France"
  },
  "tags": ["prospect"],
  "custom_fields": {
    "source": "website",
    "budget": "high"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-new-contact",
    "first_name": "Sophie",
    "last_name": "Martin",
    "email": "sophie.martin@example.fr",
    "phone": "+33698765432",
    "company": "Martin Transport",
    "address": {
      "street": "45 Avenue des Champs",
      "city": "Lyon",
      "postal_code": "69001",
      "country": "France"
    },
    "tags": ["prospect"],
    "is_vip": false,
    "custom_fields": {
      "source": "website",
      "budget": "high"
    },
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "phone",
      "message": "Phone number must start with +"
    }
  ]
}
```

### GET /api/contacts/:id

Get a single contact by ID.

**Request:**
```http
GET /api/contacts/uuid-contact-1
Authorization: Session-Cookie
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-contact-1",
    "first_name": "Marc",
    "last_name": "Dupont",
    "email": "marc.dupont@example.fr",
    "phone": "+33612345678",
    "company": "Dupont SARL",
    "address": { /* ... */ },
    "tags": ["client_fidele"],
    "is_vip": true,
    "vehicles": [
      {
        "id": "uuid-vehicle-1",
        "vin": "VF1AAAA1234567890",
        "license_plate": "AB-123-CD",
        "make": "Renault",
        "model": "Clio",
        "year": 2020
      }
    ],
    "recent_quotes": [ /* ... */ ],
    "recent_activities": [ /* ... */ ],
    "created_at": "2025-12-15T10:30:00.000Z",
    "updated_at": "2026-01-01T09:15:00.000Z"
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "error": "Contact not found"
}
```

### PATCH /api/contacts/:id

Update a contact.

**Request:**
```http
PATCH /api/contacts/uuid-contact-1
Content-Type: application/json
Authorization: Session-Cookie

{
  "phone": "+33612345679",
  "tags": ["client_fidele", "vip"],
  "is_vip": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-contact-1",
    "first_name": "Marc",
    "last_name": "Dupont",
    "phone": "+33612345679",
    "tags": ["client_fidele", "vip"],
    "is_vip": true,
    "updated_at": "2026-01-01T10:05:00.000Z"
  }
}
```

### DELETE /api/contacts/:id

Soft delete a contact.

**Request:**
```http
DELETE /api/contacts/uuid-contact-1
Authorization: Session-Cookie
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contact deleted successfully",
  "deleted_at": "2026-01-01T10:10:00.000Z"
}
```

## Vehicles

### POST /api/vehicles/ocr

Extract vehicle data from carte grise (registration document) using OCR.

**Request:**
```http
POST /api/vehicles/ocr
Content-Type: multipart/form-data
Authorization: Session-Cookie

file: <binary-image-data>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vin": "VF1AAAA1234567890",
    "license_plate": "AB-123-CD",
    "make": "Renault",
    "model": "Clio V",
    "year": 2020,
    "owner_name": "Marc Dupont",
    "owner_address": "12 Rue de la Paix, 75001 Paris",
    "confidence": 0.95
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid file format. Supported: JPEG, PNG, PDF"
}
```

### POST /api/vehicles

Create a vehicle record.

**Request:**
```http
POST /api/vehicles
Content-Type: application/json
Authorization: Session-Cookie

{
  "owner_id": "uuid-contact-1",
  "vin": "VF1AAAA1234567890",
  "license_plate": "AB-123-CD",
  "make": "Renault",
  "model": "Clio",
  "year": 2020,
  "color": "Bleu",
  "mileage": 45000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-vehicle-1",
    "owner_id": "uuid-contact-1",
    "vin": "VF1AAAA1234567890",
    "license_plate": "AB-123-CD",
    "make": "Renault",
    "model": "Clio",
    "year": 2020,
    "color": "Bleu",
    "mileage": 45000,
    "created_at": "2026-01-01T10:00:00.000Z"
  }
}
```

### GET /api/vehicles/:id/history

Get service history for a vehicle.

**Request:**
```http
GET /api/vehicles/uuid-vehicle-1/history
Authorization: Session-Cookie
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "id": "uuid-vehicle-1",
      "license_plate": "AB-123-CD",
      "make": "Renault",
      "model": "Clio",
      "year": 2020,
      "current_mileage": 45000
    },
    "service_records": [
      {
        "id": "uuid-service-1",
        "date": "2025-12-15",
        "mileage": 45000,
        "description": "Vidange + contrôle freins",
        "cost": 180.50,
        "parts": [
          { "name": "Huile moteur 5W30", "quantity": 5, "unit_price": 8.50 },
          { "name": "Filtre à huile", "quantity": 1, "unit_price": 12.00 }
        ],
        "labor_hours": 1.5
      }
    ]
  }
}
```

### PATCH /api/vehicles/:id/mileage

Update vehicle mileage.

**Request:**
```http
PATCH /api/vehicles/uuid-vehicle-1/mileage
Content-Type: application/json
Authorization: Session-Cookie

{
  "mileage": 47500
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-vehicle-1",
    "mileage": 47500,
    "updated_at": "2026-01-01T10:15:00.000Z"
  }
}
```

## Quotes

### POST /api/quotes

Create a new quote.

**Request:**
```http
POST /api/quotes
Content-Type: application/json
Authorization: Session-Cookie

{
  "contact_id": "uuid-contact-1",
  "valid_until": "2026-02-01",
  "items": [
    {
      "description": "Vidange moteur",
      "quantity": 1,
      "unit_price": 120.00
    },
    {
      "description": "Remplacement plaquettes freins",
      "quantity": 1,
      "unit_price": 180.00
    }
  ],
  "vat_rate": 20.0,
  "notes": "Devis valable 30 jours"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-quote-1",
    "quote_number": "2026-001",
    "contact_id": "uuid-contact-1",
    "issue_date": "2026-01-01",
    "valid_until": "2026-02-01",
    "items": [
      {
        "description": "Vidange moteur",
        "quantity": 1,
        "unit_price": 120.00,
        "total": 120.00
      },
      {
        "description": "Remplacement plaquettes freins",
        "quantity": 1,
        "unit_price": 180.00,
        "total": 180.00
      }
    ],
    "subtotal": 300.00,
    "vat_rate": 20.0,
    "vat_amount": 60.00,
    "total": 360.00,
    "status": "DRAFT",
    "created_at": "2026-01-01T10:00:00.000Z"
  }
}
```

### PATCH /api/quotes/:id/status

Update quote status (e.g., send, accept, reject).

**Request:**
```http
PATCH /api/quotes/uuid-quote-1/status
Content-Type: application/json
Authorization: Session-Cookie

{
  "status": "SENT"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-quote-1",
    "status": "SENT",
    "updated_at": "2026-01-01T10:20:00.000Z"
  }
}
```

### POST /api/quotes/:id/convert

Convert quote to invoice.

**Request:**
```http
POST /api/quotes/uuid-quote-1/convert
Content-Type: application/json
Authorization: Session-Cookie

{
  "due_date": "2026-02-01",
  "payment_method": "BANK_TRANSFER"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "uuid-invoice-1",
      "invoice_number": "2026-001",
      "quote_id": "uuid-quote-1",
      "contact_id": "uuid-contact-1",
      "issue_date": "2026-01-01",
      "due_date": "2026-02-01",
      "total": 360.00,
      "status": "SENT",
      "payment_method": "BANK_TRANSFER"
    }
  }
}
```

### GET /api/quotes/:id/pdf

Generate and download quote PDF.

**Request:**
```http
GET /api/quotes/uuid-quote-1/pdf
Authorization: Session-Cookie
```

**Response (200 OK):**
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="devis-2026-001.pdf"

<binary-pdf-data>
```

## Invoices

### GET /api/invoices

List invoices with filters.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional: DRAFT|SENT|PAID|OVERDUE)
- `from_date` (ISO date, optional)
- `to_date` (ISO date, optional)

**Request:**
```http
GET /api/invoices?status=OVERDUE&from_date=2025-12-01
Authorization: Session-Cookie
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-invoice-1",
      "invoice_number": "2025-045",
      "contact": {
        "id": "uuid-contact-1",
        "name": "Marc Dupont"
      },
      "issue_date": "2025-12-15",
      "due_date": "2026-01-14",
      "total": 450.00,
      "status": "OVERDUE",
      "days_overdue": 17
    }
  ],
  "pagination": { /* ... */ }
}
```

### PATCH /api/invoices/:id/status

Mark invoice as paid.

**Request:**
```http
PATCH /api/invoices/uuid-invoice-1/status
Content-Type: application/json
Authorization: Session-Cookie

{
  "status": "PAID",
  "payment_method": "CARD",
  "paid_at": "2026-01-01T14:30:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-invoice-1",
    "status": "PAID",
    "payment_method": "CARD",
    "paid_at": "2026-01-01T14:30:00.000Z",
    "updated_at": "2026-01-01T14:30:00.000Z"
  }
}
```

### GET /api/invoices/:id/pdf

Download invoice PDF.

**Request:**
```http
GET /api/invoices/uuid-invoice-1/pdf
Authorization: Session-Cookie
```

**Response (200 OK):**
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="facture-2025-045.pdf"

<binary-pdf-data>
```

## Tasks

### GET /api/tasks

List tasks (Kanban view).

**Query Parameters:**
- `status` (string, optional: TODO|IN_PROGRESS|DONE)
- `assignee_id` (uuid, optional)
- `contact_id` (uuid, optional)

**Request:**
```http
GET /api/tasks?status=TODO&assignee_id=uuid-user-1
Authorization: Session-Cookie
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-task-1",
      "title": "Rappeler client Dupont",
      "description": "Suivi devis 2026-001",
      "assignee": {
        "id": "uuid-user-1",
        "name": "Marc Dupont"
      },
      "contact": {
        "id": "uuid-contact-1",
        "name": "Jean Martin"
      },
      "due_date": "2026-01-03T17:00:00.000Z",
      "status": "TODO",
      "priority": "HIGH",
      "created_at": "2026-01-01T10:00:00.000Z"
    }
  ]
}
```

### POST /api/tasks

Create a new task.

**Request:**
```http
POST /api/tasks
Content-Type: application/json
Authorization: Session-Cookie

{
  "title": "Préparer devis pneus",
  "description": "Client demande 4 pneus Michelin 195/65R15",
  "assignee_id": "uuid-user-1",
  "contact_id": "uuid-contact-2",
  "due_date": "2026-01-05T17:00:00.000Z",
  "priority": "MEDIUM"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-task-2",
    "title": "Préparer devis pneus",
    "description": "Client demande 4 pneus Michelin 195/65R15",
    "assignee_id": "uuid-user-1",
    "contact_id": "uuid-contact-2",
    "due_date": "2026-01-05T17:00:00.000Z",
    "status": "TODO",
    "priority": "MEDIUM",
    "created_at": "2026-01-01T11:00:00.000Z"
  }
}
```

### PATCH /api/tasks/:id

Update task (e.g., change status, reassign).

**Request:**
```http
PATCH /api/tasks/uuid-task-1
Content-Type: application/json
Authorization: Session-Cookie

{
  "status": "IN_PROGRESS"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-task-1",
    "status": "IN_PROGRESS",
    "updated_at": "2026-01-01T11:05:00.000Z"
  }
}
```

## Activities

### GET /api/activities

Get activity timeline.

**Query Parameters:**
- `contact_id` (uuid, optional)
- `user_id` (uuid, optional)
- `type` (string, optional: EMAIL_SENT|CALL_MADE|etc)
- `from_date` (ISO date, optional)

**Request:**
```http
GET /api/activities?contact_id=uuid-contact-1&from_date=2025-12-01
Authorization: Session-Cookie
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-activity-1",
      "type": "EMAIL_SENT",
      "description": "Devis 2026-001 envoyé",
      "user": {
        "id": "uuid-user-1",
        "name": "Marc Dupont"
      },
      "contact": {
        "id": "uuid-contact-1",
        "name": "Jean Martin"
      },
      "metadata": {
        "subject": "Devis pour vidange moteur",
        "quote_id": "uuid-quote-1"
      },
      "created_at": "2026-01-01T10:00:00.000Z"
    },
    {
      "id": "uuid-activity-2",
      "type": "CALL_MADE",
      "description": "Appel téléphonique - 5 minutes",
      "user": {
        "id": "uuid-user-1",
        "name": "Marc Dupont"
      },
      "contact": {
        "id": "uuid-contact-1",
        "name": "Jean Martin"
      },
      "metadata": {
        "duration": 300
      },
      "created_at": "2026-01-01T14:30:00.000Z"
    }
  ]
}
```

### POST /api/activities

Log a manual activity.

**Request:**
```http
POST /api/activities
Content-Type: application/json
Authorization: Session-Cookie

{
  "type": "MEETING",
  "description": "Rendez-vous au garage pour diagnostic",
  "contact_id": "uuid-contact-1",
  "metadata": {
    "duration": 30,
    "location": "Garage"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-activity-3",
    "type": "MEETING",
    "description": "Rendez-vous au garage pour diagnostic",
    "user_id": "uuid-user-1",
    "contact_id": "uuid-contact-1",
    "metadata": {
      "duration": 30,
      "location": "Garage"
    },
    "created_at": "2026-01-01T15:00:00.000Z"
  }
}
```

## AI Agents

### POST /api/ai/assistant

Interact with conversational AI assistant.

**Request:**
```http
POST /api/ai/assistant
Content-Type: application/json
Authorization: Session-Cookie

{
  "message": "Montre-moi tous les devis en attente depuis plus de 7 jours"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reply": "J'ai trouvé 3 devis en attente depuis plus de 7 jours:\n\n1. Devis 2025-042 - Jean Martin - 450€ - En attente depuis 12 jours\n2. Devis 2025-038 - Sophie Dubois - 680€ - En attente depuis 9 jours\n3. Devis 2025-035 - Paul Lefèvre - 320€ - En attente depuis 8 jours\n\nVoulez-vous que je vous aide à envoyer des relances ?",
    "actions": [
      {
        "type": "send_followup",
        "label": "Envoyer relances automatiques",
        "quote_ids": ["uuid-quote-2", "uuid-quote-3", "uuid-quote-4"]
      }
    ],
    "tokens_used": {
      "input": 250,
      "output": 120
    }
  }
}
```

**Error (429 Too Many Requests):**
```json
{
  "success": false,
  "error": "AI quota exceeded",
  "details": {
    "plan": "FREE",
    "limit": 10,
    "used": 10,
    "reset_at": "2026-02-01T00:00:00.000Z"
  }
}
```

### POST /api/ai/analyze

Analyze pipeline data and generate insights.

**Request:**
```http
POST /api/ai/analyze
Content-Type: application/json
Authorization: Session-Cookie

{
  "analysis_type": "pipeline",
  "date_range": {
    "from": "2025-12-01",
    "to": "2026-01-01"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "type": "stalled_deals",
        "severity": "HIGH",
        "message": "5 devis d'une valeur de 2,450€ sont bloqués depuis plus de 14 jours",
        "count": 5,
        "value": 2450.00
      },
      {
        "type": "conversion_rate",
        "severity": "MEDIUM",
        "message": "Taux de conversion devis→facture à 28% (vs objectif 35%)",
        "current": 0.28,
        "target": 0.35
      },
      {
        "type": "revenue_trend",
        "severity": "LOW",
        "message": "Chiffre d'affaires en hausse de 12% vs mois précédent",
        "change": 0.12
      }
    ],
    "recommendations": [
      {
        "action": "send_followup",
        "priority": "HIGH",
        "message": "Relancer les 5 devis bloqués",
        "targets": ["uuid-quote-x", "uuid-quote-y"]
      },
      {
        "action": "review_pricing",
        "priority": "MEDIUM",
        "message": "Analyser les devis rejetés pour ajuster la tarification"
      }
    ]
  }
}
```

### POST /api/ai/generate

Generate content (emails, SMS).

**Request:**
```http
POST /api/ai/generate
Content-Type: application/json
Authorization: Session-Cookie

{
  "type": "email",
  "template": "quote_followup",
  "context": {
    "contact_name": "Jean Martin",
    "quote_number": "2026-001",
    "quote_total": 360.00,
    "days_pending": 7
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subject": "Suivi de votre devis 2026-001",
    "body": "Bonjour Jean,\n\nJ'espère que vous allez bien.\n\nJe me permets de revenir vers vous concernant le devis 2026-001 d'un montant de 360,00€ que nous vous avons transmis il y a 7 jours.\n\nAvez-vous eu l'occasion de le consulter ? N'hésitez pas si vous avez des questions ou souhaitez des ajustements.\n\nCordialement,\nMarc Dupont\nGarage Dupont",
    "tokens_used": {
      "input": 180,
      "output": 95
    }
  }
}
```

## Communication

### POST /api/communications/email

Send email to contact.

**Request:**
```http
POST /api/communications/email
Content-Type: application/json
Authorization: Session-Cookie

{
  "to": "jean.martin@example.fr",
  "subject": "Devis pour vidange moteur",
  "body": "Bonjour Jean,\n\nVeuillez trouver ci-joint...",
  "contact_id": "uuid-contact-1",
  "attachments": [
    {
      "filename": "devis-2026-001.pdf",
      "url": "https://storage.visioncrm.app/quotes/uuid-quote-1.pdf"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message_id": "resend-msg-xxx",
    "status": "sent",
    "activity_id": "uuid-activity-x"
  }
}
```

### POST /api/communications/whatsapp

Send WhatsApp message.

**Request:**
```http
POST /api/communications/whatsapp
Content-Type: application/json
Authorization: Session-Cookie

{
  "to": "+33612345678",
  "message": "Bonjour Jean, votre véhicule est prêt ! Vous pouvez passer le récupérer. Cordialement, Garage Dupont",
  "contact_id": "uuid-contact-1"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message_id": "twilio-msg-xxx",
    "status": "sent",
    "activity_id": "uuid-activity-y"
  }
}
```

## Reporting

### GET /api/reports/revenue

Get revenue report.

**Query Parameters:**
- `from_date` (ISO date, required)
- `to_date` (ISO date, required)
- `group_by` (string: day|week|month)

**Request:**
```http
GET /api/reports/revenue?from_date=2025-12-01&to_date=2026-01-01&group_by=week
Authorization: Session-Cookie
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_revenue": 15450.00,
      "invoices_paid": 42,
      "average_invoice": 367.86
    },
    "breakdown": [
      {
        "period": "2025-W49",
        "revenue": 3200.00,
        "invoices": 8
      },
      {
        "period": "2025-W50",
        "revenue": 4150.00,
        "invoices": 11
      },
      {
        "period": "2025-W51",
        "revenue": 3800.00,
        "invoices": 10
      },
      {
        "period": "2025-W52",
        "revenue": 4300.00,
        "invoices": 13
      }
    ]
  }
}
```

### GET /api/reports/pipeline

Get pipeline metrics.

**Request:**
```http
GET /api/reports/pipeline
Authorization: Session-Cookie
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "status": "DRAFT",
        "count": 3,
        "total_value": 980.00
      },
      {
        "status": "SENT",
        "count": 12,
        "total_value": 5640.00
      },
      {
        "status": "ACCEPTED",
        "count": 5,
        "total_value": 2150.00
      }
    ],
    "conversion_rate": 0.32,
    "average_deal_size": 425.00,
    "total_pipeline_value": 8770.00
  }
}
```

## Webhooks (Stripe)

### POST /api/webhooks/stripe

Handle Stripe webhook events.

**Request:**
```http
POST /api/webhooks/stripe
Content-Type: application/json
Stripe-Signature: t=xxx,v1=xxx

{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "customer": "cus_xxx",
      "subscription": "sub_xxx"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "received": true
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { /* Optional additional info */ }
}
```

**Common HTTP Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

**Limits:**
- API calls: 100 requests/minute per IP
- AI calls: Based on plan (see Authentication section)

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1735736400
```

---

**Last Updated:** 2026-01-01  
**Version:** 1.0
