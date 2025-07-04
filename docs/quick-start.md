# Quick Start Guide

Get your StreetSignal Telegram bot running in 5 minutes with this streamlined setup guide.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Laravel Platform** - StreetSignal backend running
- [ ] **Angular Frontend** - Platform-client-mzima running
- [ ] **Database Access** - MySQL/PostgreSQL with admin privileges
- [ ] **Domain with SSL** - HTTPS endpoint for webhooks
- [ ] **Telegram Account** - To create the bot

## Step 1: Create Telegram Bot (2 minutes)

1. **Open Telegram** and search for [@BotFather](https://t.me/botfather)
2. **Start conversation** with `/start`
3. **Create new bot** with `/newbot`
4. **Choose bot name**: `YourCity StreetSignal Bot`
5. **Choose username**: `yourcity_streetsignal_bot`
6. **Save the token**: Copy the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Backend Configuration (1 minute)

Add these environment variables to your `.env` file:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/v5/telegram/webhook
TELEGRAM_WEBHOOK_SECRET=your_random_secret_key
TELEGRAM_SERVICE_TOKEN=your_service_api_token
```

## Step 3: Install Dependencies (30 seconds)

```bash
# Navigate to platform directory
cd /path/to/platform

# Install Telegram Bot API package
composer require telegram-bot/api:^2.3
```

## Step 4: Run Database Migrations (30 seconds)

```bash
# Run the Telegram bot migrations
php artisan migrate

# Verify tables were created
php artisan tinker
>>> \DB::table('telegram_bot_config')->count()
```

## Step 5: Configure Web Interface (1 minute)

1. **Open your StreetSignal admin panel**
2. **Navigate to Settings → Telegram**
3. **Enter your bot token**
4. **Enable the bot**
5. **Click "Setup Webhook"**

## Step 6: Test Your Bot (30 seconds)

1. **Find your bot** in Telegram by username
2. **Send `/start`** command
3. **Verify response**: You should receive a welcome message
4. **Test report**: Send `/report` to start a report submission

## Verification Checklist

Confirm everything is working:

- [ ] Bot responds to `/start` command
- [ ] Bot responds to `/help` command  
- [ ] Bot accepts `/report` command and starts form flow
- [ ] Webhook URL is accessible (check admin panel)
- [ ] No errors in Laravel logs

## Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `/start` | Initialize bot interaction |
| `/help` | Show available commands |
| `/report` | Start report submission |
| `/link` | Link StreetSignal account |
| `/status` | Check account status |

## Next Steps

Your bot is now ready! Here's what to do next:

1. **[Configure Settings](admin-guide/configuration.md)** - Customize messages and behavior
2. **[Set Up Surveys](admin-guide/configuration.md#survey-configuration)** - Configure report types
3. **[Monitor Usage](admin-guide/statistics.md)** - Track bot performance
4. **[User Training](user-guide/)** - Share user guides with your community

## Troubleshooting Quick Fixes

**Bot not responding?**
- Check bot token in admin panel
- Verify webhook URL is accessible
- Check Laravel logs for errors

**Webhook setup failed?**
- Ensure domain has valid SSL certificate
- Check firewall allows HTTPS traffic
- Verify webhook URL format

**Commands not working?**
- Confirm migrations ran successfully
- Check database connection
- Verify service token is valid

## Support

Need help? Check the [Troubleshooting Guide](troubleshooting/) or [Common Issues](troubleshooting/common-issues.md).

---

**🎉 Congratulations!** Your Telegram bot is now live and ready to receive reports from your community.