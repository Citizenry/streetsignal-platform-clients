# Environment Setup

Configure your server environment for the StreetSignal Telegram bot integration.

## Backend Environment Configuration

### Required Environment Variables

Add these variables to your `.env` file:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/v5/telegram/webhook
TELEGRAM_WEBHOOK_SECRET=your_random_secret_key_here
TELEGRAM_SERVICE_TOKEN=your_service_api_token

# Optional Telegram Settings
TELEGRAM_RATE_LIMIT_MESSAGES=10
TELEGRAM_RATE_LIMIT_REPORTS=5
TELEGRAM_RATE_LIMIT_REPORTS_DAILY=20
TELEGRAM_SESSION_TIMEOUT=30
TELEGRAM_SESSION_CLEANUP_INTERVAL=24
TELEGRAM_MAX_FILE_SIZE=10
TELEGRAM_STORAGE_DISK=public
TELEGRAM_ANONYMOUS_ENABLED=true
TELEGRAM_REQUIRE_LOCATION=false
TELEGRAM_AUTO_DELETE_TEMP=true
TELEGRAM_SEND_TYPING=true
TELEGRAM_MAX_MESSAGE_LENGTH=4096

# Logging Configuration
TELEGRAM_LOGGING_ENABLED=true
TELEGRAM_LOG_LEVEL=info
TELEGRAM_LOG_USER_MESSAGES=false
TELEGRAM_LOG_API_CALLS=true

# Development Settings (set to false in production)
TELEGRAM_DEBUG_MODE=false
TELEGRAM_MOCK_API=false
```

### Environment Variable Descriptions

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | ✅ | Bot token from BotFather | - |
| `TELEGRAM_WEBHOOK_URL` | ✅ | HTTPS webhook endpoint | - |
| `TELEGRAM_WEBHOOK_SECRET` | ✅ | Secret for webhook verification | - |
| `TELEGRAM_SERVICE_TOKEN` | ✅ | API token for anonymous submissions | - |
| `TELEGRAM_RATE_LIMIT_MESSAGES` | ❌ | Messages per minute per user | 10 |
| `TELEGRAM_RATE_LIMIT_REPORTS` | ❌ | Reports per hour per user | 5 |
| `TELEGRAM_SESSION_TIMEOUT` | ❌ | Session timeout in minutes | 30 |
| `TELEGRAM_MAX_FILE_SIZE` | ❌ | Max file size in MB | 10 |

## Frontend Environment Configuration

### Angular Environment Files

Update your Angular environment files:

**`apps/web-mzima-client/src/environments/environment.ts`**:
```typescript
export const environment = {
  production: false,
  backend_url: 'https://yourdomain.com/',
  api_v5: 'api/v5/',
  // ... other settings
};
```

**`apps/web-mzima-client/src/environments/environment.prod.ts`**:
```typescript
export const environment = {
  production: true,
  backend_url: 'https://yourdomain.com/',
  api_v5: 'api/v5/',
  // ... other settings
};
```

## SSL Certificate Configuration

### Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Commercial Certificate

If using a commercial certificate, ensure:
- Certificate includes your domain
- Intermediate certificates are properly chained
- Private key is secure and accessible to web server

## Web Server Configuration

### Nginx Configuration

Create `/etc/nginx/sites-available/streetsignal-telegram`:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    root /var/www/streetsignal/public;
    index index.php;
    
    # Telegram Webhook Endpoint
    location /api/v5/telegram/webhook {
        try_files $uri $uri/ /index.php?$query_string;
        
        # Rate limiting for webhook
        limit_req zone=webhook burst=10 nodelay;
        
        # Only allow Telegram IPs (optional)
        allow 149.154.160.0/20;
        allow 91.108.4.0/22;
        deny all;
    }
    
    # General Laravel configuration
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Rate limiting zone
http {
    limit_req_zone $binary_remote_addr zone=webhook:10m rate=10r/m;
}
```

### Apache Configuration

Create virtual host configuration:

```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /var/www/streetsignal/public
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/cert.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem
    SSLCertificateChainFile /etc/letsencrypt/live/yourdomain.com/chain.pem
    
    # Security Headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    
    # Telegram Webhook Protection
    <Location "/api/v5/telegram/webhook">
        Require ip 149.154.160.0/20
        Require ip 91.108.4.0/22
    </Location>
    
    <Directory /var/www/streetsignal/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## PHP Configuration

### Required PHP Extensions

Ensure these extensions are installed:

```bash
# Ubuntu/Debian
sudo apt install php8.0-curl php8.0-json php8.0-mbstring php8.0-xml php8.0-zip

# CentOS/RHEL
sudo yum install php-curl php-json php-mbstring php-xml php-zip
```

### PHP Settings

Update `/etc/php/8.0/fpm/php.ini`:

```ini
# File Upload Settings
upload_max_filesize = 10M
post_max_size = 12M
max_file_uploads = 20

# Memory and Execution
memory_limit = 256M
max_execution_time = 60

# Security
expose_php = Off
allow_url_fopen = Off
allow_url_include = Off
```

## Database Configuration

### MySQL Configuration

```sql
-- Create database and user
CREATE DATABASE streetsignal_telegram;
CREATE USER 'telegram_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON streetsignal_telegram.* TO 'telegram_user'@'localhost';
FLUSH PRIVILEGES;
```

### PostgreSQL Configuration

```sql
-- Create database and user
CREATE DATABASE streetsignal_telegram;
CREATE USER telegram_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE streetsignal_telegram TO telegram_user;
```

## Redis Configuration (Optional but Recommended)

### Install Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis
```

### Configure Redis for Sessions

Update `.env`:

```bash
SESSION_DRIVER=redis
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

## Firewall Configuration

### UFW (Ubuntu)

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### iptables

```bash
# Allow HTTPS traffic
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
```

## Verification Steps

### Test Environment Configuration

```bash
# 1. Check PHP configuration
php -m | grep -E "(curl|json|mbstring)"

# 2. Test SSL certificate
curl -I https://yourdomain.com

# 3. Verify webhook endpoint accessibility
curl -X POST https://yourdomain.com/api/v5/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 4. Check database connection
php artisan tinker
>>> DB::connection()->getPdo()

# 5. Test Redis connection (if configured)
>>> Redis::ping()
```

### Environment Validation Checklist

- [ ] All required environment variables set
- [ ] SSL certificate valid and accessible
- [ ] Webhook URL responds to POST requests
- [ ] Database connection working
- [ ] Redis connection working (if configured)
- [ ] PHP extensions installed
- [ ] File upload permissions correct
- [ ] Firewall configured properly

## Troubleshooting

### Common Issues

**SSL Certificate Issues**
```bash
# Check certificate validity
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

**Permission Issues**
```bash
# Fix Laravel permissions
sudo chown -R www-data:www-data /var/www/streetsignal
sudo chmod -R 755 /var/www/streetsignal
sudo chmod -R 775 /var/www/streetsignal/storage
sudo chmod -R 775 /var/www/streetsignal/bootstrap/cache
```

**Environment Variable Issues**
```bash
# Clear configuration cache
php artisan config:clear
php artisan cache:clear
```

---

**Next Step**: Continue with [Database Setup](database-setup.md) to configure your database for the Telegram bot.