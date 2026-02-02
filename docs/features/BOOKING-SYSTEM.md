# Self-Scheduling Booking System Documentation

**Last Updated:** October 27, 2025  
**Status:** ✅ Production Ready  
**Purpose:** Automated calendar booking with Google Calendar integration  
**Technology Stack:** Cloudflare Workers, Google Calendar API, Cal.com widget

---

## Overview

The NY English Teacher booking system provides a seamless, automated appointment scheduling experience that:

- **Eliminates** back-and-forth email scheduling
- **Syncs** with Google Calendar in real-time
- **Prevents** double-booking across multiple calendars
- **Generates** Google Meet links automatically
- **Respects** business hours and preparation time
- **Supports** bilingual booking (English/Spanish)

---

## System Architecture

### **Frontend: Cal.com Widget**

**Pages:** `/en/book/` and `/es/book/`

**Features:**

- Embedded calendar interface
- Date picker with availability
- Time slot selection
- Contact form integration
- Mobile-responsive design
- Bilingual support

### **Backend: Cloudflare Worker**

**File:** `cloudflare-worker.js` (root directory)

**Purpose:**

- Serves as API middleware between Cal.com and Google Calendar
- Handles availability queries
- Creates calendar events
- Manages timezone conversions

### **Integration: Google Calendar API**

- OAuth 2.0 authentication
- FreeBusy API for availability
- Events API for booking creation
- Automatic Meet link generation
- Email notifications to both parties

---

## User Journey

### **Step 1: Access Booking Page**

- User clicks CTA from quiz report, homepage, or service pages
- Lands on `/en/book/` or `/es/book/`
- Sees embedded Cal.com calendar widget

### **Step 2: Select Date**

- Calendar displays current month
- Available dates highlighted
- Past dates and Sundays disabled
- Hover states show availability

### **Step 3: Choose Time Slot**

- Available 30-minute slots displayed
- Filtered by:
  - Business hours
  - Existing calendar events
  - 3.5-hour preparation buffer
- Timezone displayed: `(GMT-06:00) Hora Central - Ciudad de México`

### **Step 4: Enter Details**

- Name (required)
- Email (required)
- Additional notes (optional)
- Language preference auto-detected

### **Step 5: Confirmation**

- Google Calendar event created
- Meet link generated
- Email invitations sent to both parties
- Confirmation page displayed

---

## Technical Implementation

### **Cloudflare Worker API**

#### **Endpoints:**

**1. GET `/slots/:date`**

```javascript
// Request
GET https://api.nyenglishteacher.com/slots/2025-10-28?lang=en

// Response
{
  "ok": true,
  "slots": ["16:00", "16:30", "17:00", "17:30", "19:00", "19:30"]
}
```

**2. POST `/book`**

```javascript
// Request
POST https://api.nyenglishteacher.com/book
{
  "name": "John Doe",
  "email": "john@example.com",
  "date": "2025-10-28",
  "time": "17:00",
  "lang": "en"
}

// Response
{
  "ok": true,
  "eventId": "abc123xyz",
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "message": "Your consultation is confirmed."
}
```

**3. GET `/debug`**

```javascript
// Response
{
  "ok": true,
  "env_check": {
    "has_google_client_id": true,
    "has_google_client_secret": true,
    "has_google_refresh_token": true,
    "has_calendar_id": true,
    "calendar_id": "rcush...",
    "timezone": "America/Mexico_City (default)",
    "weekday_morning": "09:00-14:00 (default)",
    "weekday_afternoon": "16:00-20:00 (default)",
    "saturday_hours": "09:00-13:00 (default)"
  }
}
```

---

## Business Rules

### **Business Hours**

**Monday - Friday:**

- **Morning Block:** 9:00 AM - 2:00 PM
- **Lunch Break:** 2:00 PM - 4:00 PM (blocked)
- **Afternoon Block:** 4:00 PM - 8:00 PM

**Saturday:**

- **Morning Only:** 9:00 AM - 1:00 PM

**Sunday:**

- **Closed** (no availability)

### **Preparation Buffer**

- **Minimum advance booking:** 3.5 hours (210 minutes)
- **Purpose:** Ensures adequate time for class preparation
- **Implementation:** Filters out slots less than 3.5 hours from current time

**Example:**

- Current time: 4:00 PM
- Earliest available slot: 7:30 PM (3.5 hours later)

### **Slot Duration**

- **Standard:** 30 minutes per consultation
- **Generation:** Slots created in 30-minute increments
- **Overlap prevention:** Checks both personal and work calendars

---

## Timezone Management

### **Configuration**

- **Primary Timezone:** `America/Mexico_City` (UTC-6)
- **DST Status:** Mexico does not observe DST (since 2022)
- **Offset:** Fixed at `-06:00`

### **Implementation**

**ISO Format with Timezone:**

```javascript
// Convert local time to ISO with timezone
function toISO(dateStr, hhmm, timeZone) {
  const [h, m] = hhmm.split(":").map(Number);
  const date = new Date(`${dateStr}T${pad(h)}:${pad(m)}:00-06:00`);
  return date.toISOString();
}

// Example:
// Input: "2025-10-28", "16:00"
// Output: "2025-10-28T16:00:00-06:00" → "2025-10-28T22:00:00Z" (UTC)
```

**Slot Filtering:**

```javascript
// Create slot with proper timezone
const slotStart = new Date(`${dateStr}T${pad(h)}:${pad(m)}:00-06:00`);
const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

// Check against preparation buffer
if (slotStart < minBookingTime) return false;

// Check for calendar conflicts
return !busy.some((b) => overlaps(slotStart, slotEnd, b.start, b.end));
```

---

## Calendar Integration

### **Dual Calendar Checking**

**Purpose:** Prevents double-booking across personal and work calendars

**Implementation:**

```javascript
const personalCalendar = "rcushmaniii@gmail.com";
const workCalendar = env.GOOGLE_CALENDAR_ID;

const freeBusy = await fetchJSON(
  "https://www.googleapis.com/calendar/v3/freeBusy",
  {
    method: "POST",
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: personalCalendar }, { id: workCalendar }],
    }),
  },
);

// Combine busy times from both calendars
const personalBusy = freeBusy?.calendars?.[personalCalendar]?.busy || [];
const workBusy = freeBusy?.calendars?.[workCalendar]?.busy || [];
const allBusy = [...personalBusy, ...workBusy];
```

### **Event Creation**

**Features:**

- Automatic Google Meet link generation
- Email invitations to both parties
- Reminders (24 hours and 1 hour before)
- Bilingual event descriptions

**Example Event:**

```javascript
{
  summary: "Consultation: John Doe",
  description: "Free business English consultation\nName: John Doe\nEmail: john@example.com",
  start: {
    dateTime: "2025-10-28T17:00:00",
    timeZone: "America/Mexico_City"
  },
  end: {
    dateTime: "2025-10-28T17:30:00",
    timeZone: "America/Mexico_City"
  },
  attendees: [
    { email: "john@example.com" },
    { email: "rcushmaniii@gmail.com", organizer: true }
  ],
  conferenceData: {
    createRequest: {
      requestId: "booking-1234567890-abc123",
      conferenceSolutionKey: { type: "hangoutsMeet" }
    }
  },
  reminders: {
    useDefault: false,
    overrides: [
      { method: "email", minutes: 1440 },  // 24 hours
      { method: "email", minutes: 60 }     // 1 hour
    ]
  }
}
```

---

## Environment Configuration

### **Required Variables**

**Google OAuth:**

- `GOOGLE_CLIENT_ID` - OAuth 2.0 client ID
- `GOOGLE_CLIENT_SECRET` - OAuth 2.0 client secret
- `GOOGLE_REFRESH_TOKEN` - Refresh token for API access

**Calendar:**

- `CALENDAR_ID` (or `GOOGLE_CALENDAR_ID`) - Target calendar ID

### **Optional Variables**

**Business Hours:**

- `WEEKDAY_MORNING_HOURS` - Default: `"09:00-14:00"`
- `WEEKDAY_AFTERNOON_HOURS` - Default: `"16:00-20:00"`
- `SATURDAY_HOURS` - Default: `"09:00-13:00"`

**System:**

- `TIMEZONE` - Default: `"America/Mexico_City"`
- `ALLOWED_ORIGINS` - CORS configuration (comma-separated)
- `CONTACT_WEBHOOK_URL` - Optional webhook for contact form

---

## Security & Privacy

### **Data Handling**

- **Client-side:** Minimal data collection (name, email only)
- **Server-side:** No data storage (stateless API)
- **Google Calendar:** Data stored per Google's privacy policy
- **HTTPS:** All API calls encrypted in transit

### **CORS Configuration**

```javascript
const allowedOrigins = [
  "https://www.nyenglishteacher.com",
  "https://nyenglishteacher.com",
];

// Only allow requests from whitelisted domains
const allowOrigin = allowed.includes(origin) ? origin : "";
```

### **OAuth Security**

- Refresh token stored as environment variable (not in code)
- Access tokens generated on-demand
- Short-lived access tokens (1 hour expiry)
- No client-side token exposure

---

## Error Handling

### **Common Errors**

**1. Invalid Date Format**

```javascript
// Error: "Invalid date format. Use YYYY-MM-DD"
// Solution: Ensure date is in correct format
```

**2. Missing Required Fields**

```javascript
// Error: "Missing required fields: name, email, date, time"
// Solution: Validate form data before submission
```

**3. OAuth Error**

```javascript
// Error: "OAuth error: invalid_grant"
// Solution: Regenerate refresh token
```

**4. Calendar API Error**

```javascript
// Error: "Calendar API returned 403"
// Solution: Check calendar permissions and API quotas
```

### **Graceful Degradation**

- If API fails, display error message with contact email
- Retry logic for transient failures
- Fallback to manual booking instructions

---

## Performance Optimization

### **Caching Strategy**

- **Availability queries:** No caching (real-time data required)
- **OAuth tokens:** Cache for 50 minutes (expires at 60 minutes)
- **Static assets:** CDN caching via Cloudflare

### **Response Times**

- **Slot availability:** <500ms average
- **Booking creation:** <1000ms average
- **OAuth token refresh:** <300ms average

### **Rate Limiting**

- Google Calendar API: 1,000,000 queries/day
- Cloudflare Workers: 100,000 requests/day (free tier)
- Current usage: ~500-1000 requests/day

---

## Monitoring & Analytics

### **Key Metrics**

**1. Booking Funnel:**

- Booking page views
- Date selections
- Time slot selections
- Form submissions
- Confirmed bookings

**2. Technical Metrics:**

- API response times
- Error rates
- OAuth failures
- Calendar sync delays

**3. Business Metrics:**

- Bookings per day/week/month
- Peak booking times
- No-show rate
- Conversion rate (page view → booking)

### **Logging**

```javascript
console.log("📅 FreeBusy response:", JSON.stringify(freeBusy, null, 2));
console.log("🔒 Personal busy:", personalBusy);
console.log("🔒 Work busy:", workBusy);
console.log("🔒 All busy times:", allBusy);
```

---

## Maintenance & Troubleshooting

### **Regular Maintenance**

**Weekly:**

- [ ] Monitor error logs
- [ ] Check booking completion rate
- [ ] Verify calendar sync

**Monthly:**

- [ ] Review OAuth token status
- [ ] Analyze booking patterns
- [ ] Update business hours if needed

**Quarterly:**

- [ ] Audit API usage and costs
- [ ] Review and update documentation
- [ ] Test full booking flow

### **Common Issues**

**Issue 1: Slots not showing**

- **Cause:** Calendar busy times not syncing
- **Solution:** Check FreeBusy API response in debug endpoint

**Issue 2: Wrong timezone**

- **Cause:** Timezone offset mismatch
- **Solution:** Verify `TIMEZONE` environment variable

**Issue 3: Double bookings**

- **Cause:** Race condition or calendar not checked
- **Solution:** Ensure both calendars are queried

**Issue 4: Meet link not generated**

- **Cause:** Conference data not requested
- **Solution:** Check `conferenceDataVersion=1` in API call

---

## Future Enhancements

### **Planned Features**

**1. Buffer Time Configuration**

- Allow different buffer times per service type
- Admin UI for buffer time management

**2. Multi-Duration Slots**

- 30-minute consultations (current)
- 60-minute intensive sessions
- 90-minute workshops

**3. Recurring Appointments**

- Weekly class scheduling
- Package booking (e.g., 10 sessions)
- Subscription management

**4. Payment Integration**

- Stripe integration for paid consultations
- Deposit requirements for no-shows
- Package pricing

**5. Automated Reminders**

- SMS reminders via Twilio
- WhatsApp notifications
- Custom reminder timing

**6. Analytics Dashboard**

- Real-time booking metrics
- Revenue tracking
- Customer insights

---

## Integration Points

### **Quiz Lead Magnet → Booking**

1. User completes quiz
2. Views report with CTAs
3. Clicks "Book Your FREE Strategy Call"
4. Redirected to `/en/book/` or `/es/book/`
5. Selects time and completes booking

### **Service Pages → Booking**

1. User browses service offerings
2. Clicks CTA on service page
3. Lands on booking page
4. Pre-filled service type (future enhancement)

### **Email Campaigns → Booking**

1. User receives nurture email
2. Clicks booking link
3. Direct access to calendar
4. UTM tracking for attribution

---

## Testing Checklist

### **Functional Testing**

- [ ] Slots display correctly for today
- [ ] Slots display correctly for future dates
- [ ] Sundays show no availability
- [ ] Business hours respected
- [ ] 3.5-hour buffer applied
- [ ] Busy times filtered correctly
- [ ] Booking creates calendar event
- [ ] Meet link generated
- [ ] Email invitations sent
- [ ] Bilingual support works

### **Edge Cases**

- [ ] Booking at exactly 3.5 hours from now
- [ ] Booking on last slot of the day
- [ ] Booking on Saturday
- [ ] Multiple bookings in quick succession
- [ ] Booking during existing event

### **Error Scenarios**

- [ ] Invalid date format
- [ ] Missing required fields
- [ ] OAuth token expired
- [ ] Calendar API unavailable
- [ ] Network timeout

---

## Support & Documentation

**Documentation Owner:** Development Team  
**Last Review:** October 27, 2025  
**Next Review:** January 27, 2026

**Related Documentation:**

- `/docs/QUIZ-LEAD-MAGNET-SYSTEM.md` - Quiz to booking funnel
- `/docs/INDEX.md` - Main documentation index
- `cloudflare-worker.js` - Source code with inline comments

**External Resources:**

- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cal.com Documentation](https://cal.com/docs)

For questions or issues, contact the development team or refer to the troubleshooting section above.

---

## Quick Reference

### **API Base URL**

```
https://api.nyenglishteacher.com
```

### **Booking Pages**

```
English: https://www.nyenglishteacher.com/en/book/
Spanish: https://www.nyenglishteacher.com/es/book/
```

### **Debug Endpoint**

```
https://api.nyenglishteacher.com/debug
```

### **Business Hours Summary**

- **Mon-Fri:** 9am-2pm, 4pm-8pm (Mexico City time)
- **Saturday:** 9am-1pm
- **Sunday:** Closed
- **Minimum advance:** 3.5 hours

### **Contact**

- **Email:** rcushmaniii@gmail.com
- **Calendar:** Synced with Google Calendar
- **Timezone:** America/Mexico_City (UTC-6)
