# API Reference

Complete API documentation for the StreetSignal Telegram bot integration.

## Base URL

All API endpoints are relative to your StreetSignal platform base URL:

```
https://yourdomain.com/api/v5/telegram/
```

## Authentication

Admin endpoints require API authentication:

```bash
Authorization: Bearer YOUR_API_TOKEN
```

## Endpoints

### Webhook

#### POST /webhook

Receives updates from Telegram Bot API.

**Authentication**: None (public endpoint)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "John",
      "username": "john_doe",
      "language_code": "en"
    },
    "chat": {
      "id": 123456789,
      "first_name": "John",
      "username": "john_doe",
      "type": "private"
    },
    "date": 1640995200,
    "text": "/start"
  }
}
```

**Response**:
```json
{
  "ok": true
}
```

**Error Response**:
```json
{
  "error": "Unauthorized"
}
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized (invalid webhook signature)
- `500` - Internal server error

---

### Configuration Management

#### GET /config

Get current bot configuration.

**Authentication**: Required (`scope:config`)

**Response**:
```json
{
  "is_enabled": true,
  "webhook_url": "https://yourdomain.com/api/v5/telegram/webhook",
  "default_survey_id": 1,
  "settings": {
    "bot_token": "123456789:ABC...",
    "bot_username": "YourCityBot",
    "welcome_message": "Welcome to StreetSignal!",
    "help_message": "Available commands: /start, /help, /report..."
  }
}
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (insufficient scope)

#### PUT /config

Update bot configuration.

**Authentication**: Required (`scope:config`)

**Request Body**:
```json
{
  "is_enabled": true,
  "webhook_url": "https://yourdomain.com/api/v5/telegram/webhook",
  "default_survey_id": 1,
  "bot_token": "123456789:ABC...",
  "settings": {
    "bot_username": "YourCityBot",
    "welcome_message": "Welcome to StreetSignal!",
    "help_message": "Available commands..."
  }
}
```

**Response**:
```json
{
  "message": "Configuration updated successfully"
}
```

**Validation Errors**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "bot_token": ["The bot token field is required."],
    "webhook_url": ["The webhook url must be a valid URL."]
  }
}
```

**Status Codes**:
- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden

---

### Webhook Setup

#### POST /setup

Setup webhook with Telegram API.

**Authentication**: Required (`scope:config`)

**Request Body**: Empty `{}`

**Response**:
```json
{
  "message": "Webhook setup successfully",
  "webhook_url": "https://yourdomain.com/api/v5/telegram/webhook"
}
```

**Error Response**:
```json
{
  "error": "Bot token not configured"
}
```

**Status Codes**:
- `200` - Success
- `400` - Bot token not configured
- `500` - Webhook setup failed

---

### Statistics

#### GET /stats

Get bot usage statistics.

**Authentication**: Required (`scope:config`)

**Response**:
```json
{
  "total_users": 150,
  "total_conversations": 89,
  "total_submissions": 234,
  "active_conversations": 12,
  "messages_today": 45,
  "total_messages": 1250,
  "surveys_completed": 198,
  "bot_status": "online"
}
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden

---

### User Management

#### GET /users

Get list of Telegram bot users.

**Authentication**: Required (`scope:config`)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by username or name
- `authenticated` (optional): Filter by authentication status (true/false)

**Response**:
```json
{
  "results": [
    {
      "id": 1,
      "telegram_user_id": "123456789",
      "username": "john_doe",
      "first_name": "John",
      "last_name": "Doe",
      "language_code": "en",
      "is_authenticated": true,
      "user_id": 42,
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

**Status Codes**:
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden

#### GET /conversations

Get list of active conversations.

**Authentication**: Required (`scope:config`)

**Query Parameters**:
- `page` (optional): Page number
- `per_page` (optional): Items per page
- `state` (optional): Filter by conversation state

**Response**:
```json
{
  "results": [
    {
      "id": 1,
      "telegram_user_id": "123456789",
      "chat_id": "123456789",
      "state": "collecting_form_data",
      "context": {
        "current_step": "description",
        "survey_id": 1,
        "form_data": {
          "title": "Pothole on Main Street"
        }
      },
      "survey_id": 1,
      "post_id": null,
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 12,
    "total_pages": 1
  }
}
```

---

## Error Handling

### Standard Error Response

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "additional": "context"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `BOT_NOT_CONFIGURED` | 400 | Bot token not set |
| `WEBHOOK_SETUP_FAILED` | 500 | Failed to register webhook |
| `API_CONNECTION_ERROR` | 500 | Cannot connect to StreetSignal API |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

## Rate Limiting

API endpoints are rate limited:

- **Admin endpoints**: 60 requests per minute per API token
- **Webhook endpoint**: 1000 requests per minute (global)

Rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995260
```

## Webhook Security

### IP Whitelisting

The webhook endpoint only accepts requests from Telegram's IP ranges:

- `149.154.160.0/20`
- `91.108.4.0/22`

### Signature Verification

For additional security, implement webhook signature verification:

```php
private function validateWebhookSignature(Request $request): bool
{
    $secret = config('telegram.webhook.secret');
    $signature = $request->header('X-Telegram-Bot-Api-Secret-Token');
    
    return hash_equals($secret, $signature);
}
```

## SDK Examples

### PHP (Laravel)

```php
use Illuminate\Support\Facades\Http;

// Get bot configuration
$response = Http::withToken($apiToken)
    ->get('https://yourdomain.com/api/v5/telegram/config');

$config = $response->json();

// Update configuration
$response = Http::withToken($apiToken)
    ->put('https://yourdomain.com/api/v5/telegram/config', [
        'is_enabled' => true,
        'bot_token' => 'new_token',
        'default_survey_id' => 1
    ]);
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');

// Get statistics
const getStats = async (apiToken) => {
  try {
    const response = await axios.get(
      'https://yourdomain.com/api/v5/telegram/stats',
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response.data);
  }
};
```

### cURL Examples

```bash
# Get configuration
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://yourdomain.com/api/v5/telegram/config

# Update configuration
curl -X PUT \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_enabled": true, "bot_token": "123:ABC"}' \
  https://yourdomain.com/api/v5/telegram/config

# Setup webhook
curl -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://yourdomain.com/api/v5/telegram/setup

# Get users with pagination
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  "https://yourdomain.com/api/v5/telegram/users?page=1&per_page=50"
```

## Testing

### Webhook Testing

Test webhook endpoint with sample Telegram update:

```bash
curl -X POST https://yourdomain.com/api/v5/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 1,
    "message": {
      "message_id": 1,
      "date": 1640995200,
      "chat": {"id": 123, "type": "private"},
      "from": {"id": 123, "is_bot": false, "first_name": "Test"},
      "text": "/start"
    }
  }'
```

### API Testing

Use tools like Postman or Insomnia with the provided examples, or create automated tests:

```php
// Laravel Test Example
public function test_get_bot_configuration()
{
    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $this->apiToken,
    ])->get('/api/v5/telegram/config');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'is_enabled',
                 'webhook_url',
                 'default_survey_id',
                 'settings'
             ]);
}
```

---

**Next**: Check the [Architecture Overview](architecture.md) for system design details or [Database Schema](database-schema.md) for data structure documentation.