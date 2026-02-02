# Google Calendar API Setup Guide

## 📋 Prerequisites

You already have in your `.env`:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

## 🚀 Get Your Refresh Token

### Step 1: Run the Auth Script

```bash
npm run google:auth
```

### Step 2: Follow the Instructions

The script will:

1. Print an authorization URL
2. Open it in your browser
3. Ask you to sign in with your Google account
4. Ask for calendar permissions
5. Redirect you to `http://localhost:4321/api/auth/callback`

### Step 3: Copy the Code

After authorization, you'll be redirected to a URL like:

```
http://localhost:4321/api/auth/callback?code=4/0AanRRrtXXXXXXXXXXXXX&scope=https://www.googleapis.com/auth/calendar
```

Copy the `code` parameter value (everything after `code=` and before `&scope`)

### Step 4: Paste the Code

Paste it into the terminal when prompted.

### Step 5: Save the Tokens

The script will output:

```
GOOGLE_REFRESH_TOKEN="1//XXXXXXXXXXXXXXXXXX"
GOOGLE_ACCESS_TOKEN="ya29.XXXXXXXXXXXXXXXXXX"
```

Add the `GOOGLE_REFRESH_TOKEN` to your `.env` file.

## ✅ Verification

The script will automatically test the connection and list your calendars.

## 🔐 Security Notes

- **Never commit** your `.env` file to git
- The refresh token **never expires** (unless you revoke it)
- The access token expires in 1 hour but is auto-refreshed
- Keep your `GOOGLE_CLIENT_SECRET` and `GOOGLE_REFRESH_TOKEN` secure

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error

Make sure your `GOOGLE_REDIRECT_URI` in `.env` matches exactly what's configured in Google Cloud Console:

```
http://localhost:4321/api/auth/callback
```

### "invalid_grant" Error

Your authorization code expired. Run `npm run google:auth` again and complete the flow faster.

### "Access Not Configured" Error

Enable the Google Calendar API in your Google Cloud Console:

1. Go to https://console.cloud.google.com
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for "Google Calendar API"
5. Click "Enable"

## 📚 Next Steps

Once you have your refresh token, you're ready to:

1. Create the booking API endpoint
2. Test calendar event creation
3. Add email confirmation
