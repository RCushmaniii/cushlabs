# Outreach Playbook — Beauty Salons & Spas (es-MX)

> Cold-outreach assets for the salon beachhead. All copy is Mexican Professional Spanish (es-MX).
> Landing page: **https://www.cushlabs.ai/salones/** (send every prospect here).
> Strategy context: `docs/strategy/MEXICO-GTM-STRATEGY.md`.

---

## The one rule

**Lead with the conversational gap, not reminders.** Booksy/Fresha already give salons free reminders. What they CANNOT do is answer a clienta's DM at 9pm and book her. That's the whole pitch: _"contesto los mensajes que se te escapan."_

---

## Cold DM — opener (Instagram / Facebook)

Pick one; rotate to avoid pattern-matching. Warm, respectful, short. First touch uses light "usted/su"; warms to "tú" once they reply.

**A — the missed-message angle (default)**

> Hola 👋 Vi su salón y se ve precioso el trabajo que hacen. Una pregunta rápida: ¿alcanzan a contestar todos los mensajes que les llegan por Instagram y Facebook? A muchos salones se les escapan citas porque los mensajes llegan cuando están atendiendo. Armé un asistente con IA que contesta al instante y agenda por usted. ¿Le muestro cómo funciona? Sin compromiso 🙂

**B — the after-hours angle**

> Hola 👋 Me encantó su trabajo. ¿Le ha pasado que una clienta escribe a las 10 de la noche preguntando precios y, para cuando contesta, ya reservó en otro lado? Tengo algo que contesta esos mensajes al instante, 24/7, y le avisa cuando alguien está lista para reservar. ¿Le interesa verlo?

**C — the time-saver angle**

> Hola 👋 Pregunta honesta: ¿cuántas veces al día contesta lo mismo — precios, horarios, "¿tienen espacio?" — por Instagram? Hay forma de que eso se conteste solo, con la voz de su salón, y usted solo atienda a las clientas listas para agendar. Le paso el link si quiere verlo.

---

## Follow-ups (space 2–3 days apart; max 2)

**Follow-up 1**

> Hola de nuevo 🙂 Le dejo aquí el link por si quiere echarle un ojo cuando tenga un momento: https://www.cushlabs.ai/salones/ — son 2 semanas de prueba gratis, sin contratos.

**Follow-up 2 (final, soft close)**

> Sé que anda ocupada — solo le confirmo que la prueba gratis sigue disponible. Si en algún momento quiere que su salón conteste mensajes 24/7, aquí estoy. ¡Le deseo mucho éxito! 🙌

---

## Objection bank (quick replies)

| Si dice…                               | Responde…                                                                                                                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Ya uso Booksy / una app de citas"     | "¡Perfecto, no la quita! Esa app manda recordatorios, pero no contesta los mensajes de sus clientas en Instagram o Facebook. Eso es justo lo que yo hago. Se complementan."        |
| "Está muy caro / no tengo presupuesto" | "Le entiendo. Son $1,990 al mes, todo incluido — y con una sola clienta al mes que no se le escape ya se pagó. Por eso le ofrezco 2 semanas gratis: lo prueba sin arriesgar nada." |
| "No le sé a la tecnología"             | "No se preocupe, yo lo configuro y lo cuido todo. Usted solo atiende a las clientas que le lleguen listas para agendar."                                                           |
| "¿Suena a robot?"                      | "Para nada — habla con la voz de su salón, en español, natural y cálido. Si quiere le mando un ejemplo."                                                                           |
| "Déjame pensarlo"                      | "¡Claro! Le dejo el link para cuando guste: https://www.cushlabs.ai/salones/ La prueba gratis está disponible cuando decida."                                                      |
| "¿Cómo te pago?"                       | "Por SPEI u OXXO, lo que le sea más fácil, y le doy factura sin costo extra."                                                                                                      |

---

## WhatsApp prefilled message (already wired into the landing page)

The landing CTA opens WhatsApp with:

> "Hola, vi la página de Recepción Digital y quiero mi diagnóstico gratis para mi salón."

When they arrive, run the **qualification flow** (see strategy doc §7B): página activa → mensajes sin contestar → ¿ya usan app de citas? → reseñas → sitio web → pago.

---

## Go-live checklist (before the first paying client)

- [ ] **Meta app approval finished** (Cloud API direct) — the gate to going live on Messenger/IG/WhatsApp.
- [ ] **`PUBLIC_WHATSAPP_NUMBER` confirmed** in the cushlabs env (landing CTA falls back to +52 33 1559 0572 if unset).
- [ ] **Client intake:** their FB/IG page access + a list of services & prices (the only things needed to train the assistant).
- [ ] **WhatsApp utility templates** drafted + submitted for approval (appointment reminders).
- [ ] **Payment:** SPEI account + OXXO reference ready; CFDI invoicing set up.
- [ ] **First case study:** capture before/after (response time, citas recovered) from client #1 for social proof.

---

## Measurement (so we know what's working)

Track per outreach batch: DMs sent → replies → landing visits (Ahrefs/Vercel on `/salones/`) → diagnósticos → trials → paid. The reply rate on the opener IS the manual-tail validation the desk research couldn't give us.
