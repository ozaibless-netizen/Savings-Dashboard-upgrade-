# 📱 SMS Detection Setup Guide

## Overview

The Savings Dashboard now detects incoming SMS messages directly from your Android device.

### What It Does
- ✅ Parses financial transactions from SMS
- ✅ Auto-approves savings automatically
- ✅ Tracks pending transfers with SMS proof
- ✅ Replaces Macrodroid completely
- ✅ Supports Airtel, TNM, Vodacom, Betpawa

## How It Works

**Android Device SMS** → **Tasker/HTTP Shortcut** → **POST /api/sms/webhook** → **Server parses** → **Firebase stores** → **Auto-approve savings** → **Dashboard updates**

## Setup Steps

### Step 1: Get Webhook URL
After deploying to Render, your webhook URL is:
```
https://your-app.onrender.com/api/sms/webhook
```

### Step 2: Get Your User ID
1. Register/Login to dashboard
2. Check Firebase Console under `users/` folder
3. Copy your user ID

### Step 3: Setup Android (Tasker Recommended)

**Install Tasker from Google Play**

1. Create Task "Forward SMS"
2. Add Action: Net → HTTP Post
3. Configure:
   - **Server**: https://your-app.onrender.com/api/sms/webhook
   - **Timeout**: 10
   - **Content Type**: application/json
   - **Data**:
   ```json
   {
     "userId": "YOUR_USER_ID",
     "message": "%SMSRB",
     "senderName": "%SMSIR",
     "senderId": "%SMSIP",
     "timestamp": %TIMEN
   }
   ```

4. Create Profile: Event → Phone → Received Text
5. Assign to "Forward SMS" task
6. Test with a text message

### Step 4: Test

Send test SMS from another phone:
```
Airtel Money: John has deposited MK 5000. Ref: AB123.456.XYZ
```

Should appear in dashboard within 5 seconds!

## Supported Networks

| Network | Keywords | Example |
|---------|----------|----------|
| **Airtel** | airtel, received mwk, deposited | "Airtel Money: John has deposited MK 5000" |
| **TNM** | tnm, mpamba | "TNM: Payment received MK 2000" |
| **Vodacom** | vodacom, m-pesa | "Vodacom: Transfer received MK 3000" |
| **Betting** | betpawa, premierbet | "Betpawa: Bet placed MK 1000" |
| **Airtime** | airtime, topup | "Airtime: MK 500 topup successful" |

## Auto-Approval Rules

- **Income > 20,000 MK**: Save 25%
- **Income 5,000-20,000 MK**: Save 35%
- **Income 1,000-5,000 MK**: Save 40%
- **Income < 1,000 MK**: Save 50%
- **Minimum to auto-approve**: 100 MK

## Test Webhook

```bash
curl -X POST https://your-app.onrender.com/api/sms/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "message": "Airtel Money: John has deposited MK 5000. Ref: AB123.456.XYZ",
    "senderName": "Airtel",
    "timestamp": 1234567890000
  }'
```

## Troubleshooting

**SMS not received?**
- Check Tasker has SMS permission
- Verify profile is active (green checkmark)
- Test with manual SMS from another phone
- Check device battery optimization

**Webhook not triggered?**
- Verify URL is correct
- Test with curl command above
- Check Render server logs
- Ensure network connection active

**Transaction not parsed?**
- Check SMS format matches bank standard
- Look at server logs for what was received
- Verify amount and keywords present

**Savings not auto-approved?**
- Check if amount > 100 MK
- Verify transaction type is "income"
- Check savings threshold

## API Endpoints

### SMS Webhook
**POST /api/sms/webhook**

Receives SMS from Android device.

Request:
```json
{
  "userId": "user_id",
  "message": "SMS message text",
  "senderName": "Airtel",
  "senderId": "+265123456789",
  "timestamp": 1234567890000
}
```

Response (Success):
```json
{
  "success": true,
  "message": "SMS processed successfully",
  "transaction": {
    "id": "AB123.456.XYZ",
    "type": "income",
    "amount": 5000,
    "saveAmount": 1750,
    "savingsPercent": 35,
    "approved": true
  }
}
```

### Register Phone Number
**POST /api/sms/register-number**

Optionally register your phone number.

Request:
```json
{
  "phoneNumber": "+265123456789"
}
```

### Get Pending Transfers
**GET /api/pending-transfers**

Get all pending transfers ready for processing.

## No Macrodroid Needed!

✅ **Everything is automated**:
- Tasker detects SMS
- Forwards to server
- Server parses and stores
- Automatically approves savings
- Updates dashboard in real-time

No manual approvals needed!
