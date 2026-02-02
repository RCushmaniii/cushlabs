# Chatbot Widget Implementation Guide

## Overview

This document covers the complete implementation process for embedding third-party chatbot widgets, based on lessons learned from the NY English Teacher chatbot integration.

## Architecture

### Widget Type: Iframe-Based Third-Party Widget

- **Source**: External chatbot service (ny-ai-chatbot.vercel.app)
- **Integration Method**: Dynamic iframe creation with custom launch button
- **Communication**: PostMessage API for iframe-to-parent communication
- **State Management**: Client-side JavaScript tracking open/closed states

## Required Components

### 1. Launch Button

```javascript
// Required ID: nyenglish-chat-button
const button = document.createElement("button");
button.id = "nyenglish-chat-button";
button.innerHTML = "🎓"; // Customizable emoji/icon
button.style.cssText = `
  display:flex;
  opacity:0;
  position:fixed;
  align-items:center;
  justify-content:center;
  width:60px;
  height:60px;
  border-radius:50%;
  background:#1c4992; // Brand color
  color:white;
  border:none;
  font-size:24px;
  cursor:pointer;
  box-shadow:0 4px 12px rgba(0,0,0,0.15);
  transition:opacity 200ms,transform 200ms;
  transform:translateY(10px);
  z-index:2147483647;
  bottom:20px;
  right:20px;
`;
```

### 2. Iframe Container

```javascript
// Required ID: nyenglish-chat-iframe
const iframe = document.createElement("iframe");
iframe.id = "nyenglish-chat-iframe";
iframe.src = chatUrl + "?lang=en&placeholder=Type your message...";
iframe.style.cssText = `
  display:none;
  opacity:0;
  position:fixed;
  border:none;
  z-index:2147483647;
  box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);
  transition:opacity 200ms,transform 200ms;
  transform:translateY(10px);
`;
```

### 3. Welcome Message (Optional)

```javascript
// Required ID: nyenglish-chat-welcome
const welcome = document.createElement("div");
welcome.id = "nyenglish-chat-welcome";
welcome.textContent = "Need help? I'm here to assist!";
```

## Implementation Checklist

### ✅ Pre-Implementation Requirements

- [ ] Chatbot service URL and configuration
- [ ] Brand colors and styling requirements
- [ ] Mobile vs desktop positioning strategy
- [ ] Accessibility requirements (ARIA labels, keyboard navigation)

### ✅ Core Implementation Steps

1. **Create DOM Elements**

   - [ ] Launch button with proper ID and styling
   - [ ] Iframe with chatbot URL
   - [ ] Optional welcome message

2. **Set Up Event Handlers**

   - [ ] Button click handler for opening widget
   - [ ] PostMessage listener for close events
   - [ ] Fade in/out animations

3. **State Management**

   - [ ] Track open/closed state
   - [ ] Handle button visibility changes
   - [ ] Manage welcome message display

4. **Responsive Design**
   - [ ] Mobile: Full viewport (100vw x 100vh)
   - [ ] Desktop: Fixed size (400px x 600px)
   - [ ] Proper positioning relative to other elements

## Common Pitfalls & Solutions

### ❌ Missing DOM Elements

**Problem**: Button/iframe not found during setup
**Solution**: Verify element creation before setting up event handlers

```javascript
// BAD: Assumes element exists
const button = document.getElementById(buttonId);

// GOOD: Create element first
const button = document.createElement("button");
button.id = buttonId;
// ... setup properties
document.body.appendChild(button);
```

### ❌ Incorrect Message Passing

**Problem**: Close button in iframe not triggering parent close
**Solution**: Set up PostMessage listener with proper origin checking

```javascript
window.addEventListener("message", (event) => {
  if (event.origin.includes("your-chat-domain.com")) {
    if (event.data === "close-chat") {
      closeChat();
    }
  }
});
```

### ❌ State Management Issues

**Problem**: Widget can't be reopened after closing
**Solution**: Ensure proper state variable updates and button visibility

```javascript
let isOpen = false;

const closeChat = () => {
  if (isOpen) {
    fadeOut(iframe);
    fadeIn(button); // Make button visible again
    isOpen = false;
  }
};
```

## Customization Capabilities

### ✅ Customizable (Client-Side)

- **Button Appearance**: Color, size, icon, positioning
- **Animation**: Fade in/out timing and effects
- **Mobile Layout**: Full viewport vs fixed size
- **Welcome Message**: Text, styling, timing

### ⚠️ Limited Customization (Widget-Side)

- **Chat Interface**: Colors, fonts, layout (via widget admin)
- **Functionality**: Features, responses, AI behavior
- **Branding**: Logo, company info (via widget settings)

### ❌ Not Customizable

- **Core Widget Architecture**: Iframe structure, message format
- **Close Button Behavior**: Built-in widget functionality
- **PostMessage Protocol**: Communication format

## Debugging Strategy

### 1. Start with DOM Inspection

```javascript
console.log(
  "Button exists:",
  !!document.getElementById("nyenglish-chat-button")
);
console.log(
  "Iframe exists:",
  !!document.getElementById("nyenglish-chat-iframe")
);
```

### 2. Verify Event Handlers

```javascript
button.onclick = () => console.log("Button clicked!");
```

### 3. Check Message Passing

```javascript
window.addEventListener("message", (event) => {
  console.log("Received message:", event.data);
});
```

### 4. Validate State Changes

```javascript
console.log("Current state:", isOpen);
```

## Performance Considerations

- **Lazy Loading**: Load widget only when needed
- **Animation Optimization**: Use CSS transitions instead of JavaScript
- **Memory Management**: Clean up event listeners when appropriate
- **Network Optimization**: Cache widget assets when possible

## Accessibility Requirements

- **Keyboard Navigation**: Tab order, Enter/Space activation
- **Screen Reader Support**: ARIA labels, role attributes
- **Focus Management**: Proper focus handling when opening/closing
- **High Contrast**: Ensure visibility for users with low vision

## Testing Checklist

### Functional Testing

- [ ] Button appears on page load
- [ ] Button click opens widget
- [ ] Widget close button closes widget
- [ ] Button reappears after closing
- [ ] Multiple open/close cycles work
- [ ] Mobile responsive layout works
- [ ] Desktop layout works correctly

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announcements work
- [ ] Focus management is correct
- [ ] High contrast mode works

### Cross-Browser Testing

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

## Maintenance Notes

- **Widget Updates**: Monitor for changes in PostMessage protocol
- **Browser Compatibility**: Test new browser versions
- **Performance**: Monitor load times and user experience
- **Security**: Regular origin validation checks

## Contact Information

- **Widget Provider**: Chat service documentation/support
- **Implementation Questions**: Development team
- **Design Changes**: UI/UX team

---

**Version**: 1.0  
**Last Updated**: 2025-12-20  
**Based On**: NY English Teacher chatbot implementation lessons learned
