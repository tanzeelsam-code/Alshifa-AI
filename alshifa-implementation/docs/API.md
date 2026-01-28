# Alshifa AI Medical Assistant - API Documentation

Base URL: `http://localhost:3001/api` (development)
Production: `https://api.alshifa-ai.com/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication

#### Register New Patient
```http
POST /auth/register
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "sex": "male|female|other",
  "phoneNumber": "string",
  "preferredLanguage": "en|ur"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "patient": { /* patient object */ },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "patient": { /* patient object */ },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

---

### Patients

#### Get Current Patient Profile
```http
GET /patients/me
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "age": 34,
    "sex": "string",
    "phoneNumber": "string",
    "medicalHistory": {
      "conditions": [],
      "medications": [],
      "allergies": []
    }
  }
}
```

#### Update Patient Profile
```http
PUT /patients/me
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "heightCm": 175,
  "weightKg": 70.5
}
```

**Response:** `200 OK`

#### Get Patient Medical History
```http
GET /patients/me/medical-history
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conditions": [
      {
        "id": "uuid",
        "conditionName": "Hypertension",
        "diagnosisDate": "2020-01-15",
        "isActive": true
      }
    ],
    "medications": [
      {
        "id": "uuid",
        "medicationName": "Lisinopril",
        "dosage": "10mg",
        "frequency": "once daily",
        "isActive": true
      }
    ],
    "allergies": [
      {
        "id": "uuid",
        "allergen": "Penicillin",
        "reaction": "rash",
        "severity": "moderate"
      }
    ]
  }
}
```

---

### Visits

#### Create New Visit
```http
POST /visits
```

**Request Body:**
```json
{
  "visitReason": "pain|follow-up|new-symptom|medication|general|express",
  "chiefComplaint": "string",
  "emergencyTriageResult": {
    "flags": ["chest-pain", "difficulty-breathing"],
    "timestamp": "ISO_8601_timestamp"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "visit": {
      "id": "uuid",
      "visitDate": "ISO_8601_timestamp",
      "visitReason": "pain",
      "status": "in-progress"
    }
  }
}
```

#### Add Symptoms to Visit
```http
POST /visits/:visitId/symptoms
```

**Request Body:**
```json
{
  "symptomType": "pain",
  "bodyLocation": "head",
  "bodySubzone": "frontal",
  "bodyView": "front",
  "onset": "suddenly|gradually|after-trauma",
  "duration": "today|this-week|this-month|longer",
  "intensity": 7,
  "quality": ["throbbing", "sharp"],
  "radiation": ["jaw", "left-arm"],
  "associatedSymptoms": ["nausea", "photophobia"],
  "additionalDetails": {
    /* location-specific questions */
  }
}
```

**Response:** `201 Created`

#### Get Visit Details
```http
GET /visits/:visitId
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "visit": {
      "id": "uuid",
      "visitDate": "ISO_8601_timestamp",
      "visitReason": "pain",
      "chiefComplaint": "string",
      "urgencyLevel": "urgent",
      "status": "completed",
      "symptoms": [/* array of symptoms */],
      "clinicalDecision": {/* AI analysis */}
    }
  }
}
```

---

### Clinical Decision Support

#### Analyze Symptoms
```http
POST /clinical/analyze
```

**Request Body:**
```json
{
  "patientId": "uuid",
  "visitId": "uuid",
  "symptoms": {
    "pain": {
      "location": "chest",
      "intensity": 8,
      "onset": "suddenly",
      "duration": "today",
      "quality": ["crushing", "pressure"],
      "radiation": ["left-arm", "jaw"],
      "associated": ["shortness-of-breath", "sweating"]
    }
  },
  "demographics": {
    "age": 55,
    "sex": "male"
  },
  "medicalHistory": {
    "conditions": ["hypertension", "diabetes"],
    "medications": ["lisinopril", "metformin"],
    "allergies": []
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "urgency": {
      "level": "emergency",
      "score": 95,
      "factors": ["cardiac-pattern-radiation", "crushing-chest-pain"],
      "message": "Immediate medical attention required",
      "timeframe": "NOW - Call Emergency Services"
    },
    "possibleConditions": [
      {
        "condition": "Acute coronary syndrome (URGENT)",
        "probability": "consider",
        "supportingFeatures": ["crushing pain", "radiation to arm/jaw"],
        "contraFeatures": [],
        "urgency": "emergency"
      }
    ],
    "redFlags": [
      {
        "flag": "Cardiac-pattern pain radiation",
        "significance": "May indicate acute coronary syndrome",
        "action": "Emergency cardiac workup required"
      }
    ],
    "recommendations": [
      {
        "priority": 1,
        "recommendation": "Call Emergency Services (911) immediately",
        "rationale": "cardiac-pattern-radiation, crushing-chest-pain",
        "timeframe": "NOW"
      }
    ],
    "nextSteps": [
      {
        "step": "Immediate Emergency Care",
        "description": "Call 911 or go to nearest Emergency Department",
        "priority": "critical"
      }
    ]
  }
}
```

#### Assess Urgency
```http
POST /clinical/urgency
```

**Request Body:** (same as analyze, but returns only urgency assessment)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "urgency": {
      "level": "urgent|semi-urgent|routine|emergency",
      "score": 75,
      "factors": [],
      "message": "string",
      "timeframe": "string"
    }
  }
}
```

---

### Appointments

#### Get Available Appointment Slots
```http
GET /appointments/available
```

**Query Parameters:**
- `date`: YYYY-MM-DD (optional, defaults to today)
- `doctorId`: UUID (optional)
- `specialty`: string (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "slots": [
      {
        "datetime": "ISO_8601_timestamp",
        "doctor": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string",
          "specialties": ["Neurology"],
          "rating": 4.8
        },
        "duration": 30,
        "type": "in-person|video"
      }
    ]
  }
}
```

#### Book Appointment
```http
POST /appointments
```

**Request Body:**
```json
{
  "visitId": "uuid",
  "doctorId": "uuid",
  "appointmentDate": "ISO_8601_timestamp",
  "appointmentType": "in-person|video|phone",
  "duration": 30,
  "notes": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "uuid",
      "appointmentDate": "ISO_8601_timestamp",
      "doctor": {/* doctor details */},
      "appointmentType": "in-person",
      "status": "scheduled"
    }
  }
}
```

#### Cancel Appointment
```http
DELETE /appointments/:appointmentId
```

**Request Body:**
```json
{
  "cancellationReason": "string"
}
```

**Response:** `200 OK`

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Common Error Codes

- `INVALID_INPUT` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVER_ERROR` - Internal server error

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per 15 minutes per user
- **Clinical analysis endpoints**: 10 requests per minute per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

## Webhooks (Future Feature)

Webhooks for real-time notifications:

- `appointment.scheduled`
- `appointment.cancelled`
- `appointment.reminder`
- `visit.completed`
- `emergency.detected`

---

## Versioning

API version is included in the URL:
- Current: `/api/v1/`
- When v2 is released: `/api/v2/`

Old versions are supported for 12 months after deprecation.

---

## Support

For API support:
- Email: api-support@alshifa-ai.com
- Documentation: https://docs.alshifa-ai.com
- Status page: https://status.alshifa-ai.com
