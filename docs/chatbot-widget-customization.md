# Chatbot Widget Customization Guide

## Overview

This document covers the customization capabilities and limitations for third-party chatbot widgets, specifically focusing on what can be modified client-side versus what requires changes in the chatbot service itself.

## Customization Categories

### ✅ Client-Side Customizations (Full Control)

#### Button Styling

```javascript
// Colors and Branding
button.style.background = "#1c4992"; // Brand color
button.style.color = "white"; // Text color
button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"; // Shadow

// Size and Position
button.style.width = "60px";
button.style.height = "60px";
button.style.bottom = "20px";
button.style.right = "20px";

// Icon/Content
button.innerHTML = "🎓"; // Emoji or text
button.style.fontSize = "24px";

// Animation
button.style.transition = "opacity 200ms, transform 200ms";
```

#### Animation Behavior

```javascript
// Fade timing
const fadeInDuration = 200; // milliseconds
const fadeOutDuration = 200;

// Animation effects
button.style.transform = "translateY(10px)"; // Slide up effect
iframe.style.transform = "translateY(10px)";
```

#### Mobile vs Desktop Layout

```javascript
const isMobile = window.matchMedia("(max-width: 475px)").matches;

if (isMobile) {
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.borderRadius = "0";
} else {
  iframe.style.width = "400px";
  iframe.style.height = "600px";
  iframe.style.borderRadius = "20px";
}
```

#### Welcome Message

```javascript
welcome.textContent = "Need help? I'm here to assist!";
welcome.style.background = "#fff";
welcome.style.color = "#000";
welcome.style.fontSize = "0.9rem";
```

### ⚠️ Widget-Side Customizations (Limited Control)

#### Chat Interface Styling

**Access Method**: Widget admin panel or configuration
**Customizable**:

- Color scheme and themes
- Font choices and sizes
- Avatar and branding elements
- Message bubble styling

**Example Configuration** (via widget admin):

```json
{
  "theme": {
    "primaryColor": "#1c4992",
    "secondaryColor": "#f8f9fa",
    "fontFamily": "Inter, sans-serif",
    "avatar": "https://example.com/logo.png"
  }
}
```

#### Behavioral Settings

**Access Method**: Widget configuration
**Customizable**:

- Auto-open behavior
- Sound effects
- Typing indicators
- Response timing

#### Content Customization

**Access Method**: Chatbot training/admin
**Customizable**:

- Welcome messages
- Response templates
- Knowledge base content
- Conversation flows

### ❌ Non-Customizable (Fixed Architecture)

#### Core Widget Structure

- Iframe architecture cannot be changed
- PostMessage protocol is fixed
- DOM element IDs are required
- Basic widget lifecycle is predetermined

#### Security Constraints

- Origin validation is mandatory
- Cross-origin policies apply
- CSP restrictions may limit some customizations

#### Browser Compatibility

- Must work across all major browsers
- Limited to standard web APIs
- Cannot use browser-specific features

## Implementation Examples

### Custom Brand Implementation

```javascript
function createCustomBrandedWidget(config) {
  // Custom button with brand colors
  const button = document.createElement("button");
  button.id = "brand-chat-button";
  button.innerHTML = config.brandIcon || "💬";
  button.style.cssText = `
    background: ${config.brandColor || "#007bff"};
    color: ${config.textColor || "white"};
    border-radius: ${config.borderRadius || "50%"};
    font-size: ${config.iconSize || "24px"};
    width: ${config.buttonSize || "60px"};
    height: ${config.buttonSize || "60px"};
  `;

  // Custom positioning
  button.style.bottom = config.bottomOffset || "20px";
  button.style.right = config.rightOffset || "20px";

  // Custom animations
  if (config.enableAnimations) {
    button.style.transition = `all ${config.animationSpeed || "200ms"} ease`;
  }

  return button;
}
```

### Multi-Language Support

```javascript
function createLocalizedWidget(language) {
  const configs = {
    en: {
      welcomeMessage: "Need help? I'm here to assist!",
      placeholder: "Type your message...",
      buttonText: "💬",
    },
    es: {
      welcomeMessage: "¿Necesitas ayuda? ¡Estoy aquí para ayudarte!",
      placeholder: "Escribe tu mensaje...",
      buttonText: "💭",
    },
  };

  return configs[language] || configs.en;
}
```

### Advanced Positioning

```javascript
function calculateWidgetPosition() {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const scrollPosition = {
    x: window.scrollX,
    y: window.scrollY,
  };

  // Smart positioning based on content
  if (viewport.width < 768) {
    return {
      position: "fixed",
      bottom: "10px",
      right: "10px",
    };
  } else {
    return {
      position: "fixed",
      bottom: "80px",
      right: "20px",
    };
  }
}
```

## Best Practices

### 1. Performance Optimization

```javascript
// Lazy load widget only when needed
let widgetLoaded = false;

function loadWidgetOnDemand() {
  if (!widgetLoaded) {
    createWidget();
    widgetLoaded = true;
  }
}

// Debounce resize events
const resizeObserver = new ResizeObserver(debounce(updateWidgetLayout, 100));
```

### 2. Accessibility Compliance

```javascript
// ARIA labels and roles
button.setAttribute("aria-label", "Open chat support");
button.setAttribute("role", "button");
iframe.setAttribute("title", "Customer support chat");

// Keyboard navigation
button.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openChat();
  }
});
```

### 3. Error Handling

```javascript
function safeWidgetOperation(operation, fallback) {
  try {
    return operation();
  } catch (error) {
    console.warn("Widget operation failed:", error);
    return fallback();
  }
}

// Example usage
safeWidgetOperation(
  () => createAdvancedWidget(),
  () => createBasicWidget()
);
```

## Testing Customizations

### Visual Testing

- Screenshot comparison across browsers
- Responsive design testing
- High contrast mode verification
- Zoom level testing (200%, 400%)

### Functional Testing

- Custom event handling verification
- State management validation
- Cross-origin communication testing
- Performance impact measurement

### Accessibility Testing

- Screen reader compatibility
- Keyboard navigation flow
- Focus management verification
- Color contrast validation

## Common Customization Mistakes

### ❌ Overriding Widget Behavior

```javascript
// BAD: Trying to override internal widget functions
iframe.contentWindow.customFunction = () => {}; // Won't work

// GOOD: Use PostMessage to communicate
iframe.contentWindow.postMessage({ type: "custom-action" }, "*");
```

### ❌ Breaking Cross-Origin Security

```javascript
// BAD: Removing origin validation
window.addEventListener("message", handleAllMessages); // Security risk

// GOOD: Validate origins
window.addEventListener("message", (event) => {
  if (event.origin.includes("trusted-domain.com")) {
    handleMessage(event.data);
  }
});
```

### ❌ Hard-Coding Values

```javascript
// BAD: Fixed values
button.style.width = "60px";

// GOOD: Configurable values
button.style.width = config.buttonWidth || "60px";
```

## Maintenance Guidelines

### Regular Reviews

- Monthly: Check for widget service updates
- Quarterly: Review performance metrics
- Annually: Evaluate customization effectiveness

### Monitoring

- Track widget load times
- Monitor user interaction patterns
- Watch for breaking changes in widget API

### Documentation Updates

- Keep customization examples current
- Document any workarounds or special cases
- Maintain version compatibility notes

---

## Quick Reference

| Customization Type | Client-Side | Widget-Side | Notes                 |
| ------------------ | ----------- | ----------- | --------------------- |
| Button Color       | ✅          | ❌          | Full control          |
| Widget Theme       | ❌          | ✅          | Via admin panel       |
| Animations         | ✅          | ⚠️          | Limited overlap       |
| Content            | ❌          | ✅          | Via training          |
| Positioning        | ✅          | ❌          | Full control          |
| Mobile Layout      | ✅          | ⚠️          | Coordinate both sides |

---

**Version**: 1.0  
**Last Updated**: 2025-12-20  
**Based On**: NY English Teacher chatbot customization experience
