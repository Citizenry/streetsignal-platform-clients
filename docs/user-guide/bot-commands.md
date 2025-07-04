# Bot Commands Reference

Complete reference for all StreetSignal Telegram bot commands with examples and explanations.

## Basic Commands

### `/start`
Initialize your interaction with the bot and see the welcome message.

**Usage**: `/start`

**Example Response**:
```
👋 Welcome to StreetSignal!

I can help you submit reports about issues in your community.

Use /help to see available commands or /report to start submitting a report.
```

### `/help`
Display all available commands and their descriptions.

**Usage**: `/help`

**Example Response**:
```
🤖 StreetSignal Bot Commands:

/start - Start using the bot
/help - Show this help message
/report - Submit a new report
/link - Link your StreetSignal account
/unlink - Unlink your account
/status - Check your account status
/myreports - View your recent reports
/cancel - Cancel current operation

You can also send me photos, locations, or text messages to start a report.
```

## Report Commands

### `/report`
Start the guided report submission process.

**Usage**: `/report`

**What happens**:
1. Bot asks you to select a report type
2. Guides you through required fields
3. Allows photo and location uploads
4. Confirms submission

**Example Flow**:
```
User: /report

Bot: 📝 Let's submit a new report!

Please select the type of issue you want to report:
🚧 Road & Infrastructure
🌳 Parks & Environment  
🚦 Traffic & Transportation
🏢 Buildings & Property
🗑️ Waste & Sanitation
```

### `/cancel`
Cancel any ongoing operation or conversation.

**Usage**: `/cancel`

**Example Response**:
```
❌ Operation cancelled. You can start a new report with /report or use /help to see other commands.
```

## Account Management Commands

### `/link`
Link your StreetSignal account to the bot for enhanced features.

**Usage**: `/link`

**What happens**:
1. Bot generates a unique linking code
2. Provides a web link to complete authentication
3. Confirms successful linking

**Example Flow**:
```
User: /link

Bot: 🔗 Link Your StreetSignal Account

To link your account, please visit this URL and log in:
https://yourdomain.com/telegram/auth?token=abc123

This link will expire in 10 minutes.
```

### `/unlink`
Disconnect your StreetSignal account from the bot.

**Usage**: `/unlink`

**Example Response**:
```
🔓 Your StreetSignal account has been unlinked.

You can still submit anonymous reports or link a different account using /link.
```

### `/status`
Check your current account linking status.

**Usage**: `/status`

**Example Responses**:

**When linked**:
```
✅ Account Status: Linked to StreetSignal account
📧 Email: user@example.com
📊 Reports submitted: 5
```

**When not linked**:
```
❌ Account Status: Not linked to StreetSignal account

Use /link to connect your account for additional features.
```

## Information Commands

### `/myreports`
View your recent report submissions (requires linked account).

**Usage**: `/myreports`

**Example Response**:
```
📊 Your Recent Reports:

🚧 Pothole on Main Street
   Status: Under Review
   Submitted: 2 days ago

🌳 Broken park bench
   Status: Completed
   Submitted: 1 week ago

Use /link to connect your account if you don't see your reports.
```

## Interactive Features

### Photo Uploads
Send photos directly to start a report or add them to an ongoing report.

**Usage**: Send any photo to the bot

**Example Response**:
```
📸 Photo received! 

Would you like to:
🆕 Start a new report with this photo
➕ Add this photo to your current report
❌ Cancel
```

### Location Sharing
Share your location to automatically add it to reports.

**Usage**: Use Telegram's location sharing feature

**Example Response**:
```
📍 Location received!

I've added this location to your report:
📍 123 Main Street, Your City

Continue with your report or use /cancel to stop.
```

### Text Messages
Send regular text messages during report submission to provide descriptions.

**Example Flow**:
```
Bot: Please describe the issue you're reporting:

User: There's a large pothole that's damaging cars

Bot: ✅ Description added: "There's a large pothole that's damaging cars"

Would you like to add a photo? You can:
📸 Send a photo
📍 Share location  
✅ Submit report
❌ Cancel
```

## Command Shortcuts

### Quick Report Types
Some bots may support quick commands for common report types:

- `/pothole` - Quick pothole report
- `/streetlight` - Report broken streetlight
- `/graffiti` - Report graffiti or vandalism
- `/dumping` - Report illegal dumping

*Note: Availability depends on your local configuration*

## Error Messages

### Rate Limiting
```
⏰ You're sending messages too quickly. Please wait a moment and try again.
```

### Maintenance Mode
```
🔧 The bot is currently under maintenance. Please try again later.
```

### Authentication Required
```
🔒 You need to link your StreetSignal account to use this feature. Use /link to get started.
```

### Invalid Command
```
❓ I don't understand that command. Type /help to see available commands.
```

## Tips for Using Commands

### Best Practices
- **Start with `/start`** if you're new to the bot
- **Use `/help`** anytime you're unsure what to do
- **Send `/cancel`** to stop any ongoing process
- **Link your account** with `/link` for the best experience

### Command Timing
- Commands work anytime, even during report submission
- Use `/cancel` to stop and start over if needed
- The bot remembers your progress during report submission

### Getting Stuck?
If the bot stops responding or seems stuck:
1. Send `/cancel` to reset
2. Send `/start` to restart
3. Contact your local administrators if problems persist

## Accessibility Features

- **Voice Messages**: Send voice messages for descriptions
- **Simple Language**: Bot uses clear, simple language
- **Step-by-Step**: Guided process with clear instructions
- **Flexible Input**: Accept various input formats

---

**Need more help?** Send `/help` to the bot anytime or check the [Report Submission Guide](report-submission.md) for detailed walkthroughs.