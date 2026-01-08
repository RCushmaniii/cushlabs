type BookingStrings = {
  noEmbed: string;
  iframeTitle: string;
};

type BookingConfig = {
  url30?: unknown;
  url60?: unknown;
  intakeEndpoint?: unknown;
  contactPath?: unknown;
  bookingStrings?: unknown;
  locale?: unknown;
};

type NormalizedBookingConfig = {
  url30: string;
  url60: string;
  intakeEndpoint: string;
  contactPath: string;
  bookingStrings: BookingStrings;
  locale: string;
};

function readConfigForForm(form: HTMLFormElement): NormalizedBookingConfig {
  const fallback: NormalizedBookingConfig = {
    url30: "",
    url60: "",
    intakeEndpoint: "/api/consultation-intake",
    contactPath: "/contact",
    bookingStrings: { noEmbed: "", iframeTitle: "" },
    locale: "en",
  };

  const cfgEl =
    (form
      .closest("section")
      ?.querySelector("[data-consultation-booking-config]") as HTMLElement | null) ??
    (document.querySelector(
      "[data-consultation-booking-config]"
    ) as HTMLElement | null);

  if (!cfgEl?.textContent) return fallback;

  let raw: BookingConfig;
  try {
    raw = JSON.parse(cfgEl.textContent) as BookingConfig;
  } catch {
    return fallback;
  }

  const bookingStringsRaw = raw.bookingStrings as
    | { noEmbed?: unknown; iframeTitle?: unknown }
    | undefined;

  return {
    url30: typeof raw.url30 === "string" ? raw.url30 : fallback.url30,
    url60: typeof raw.url60 === "string" ? raw.url60 : fallback.url60,
    intakeEndpoint:
      typeof raw.intakeEndpoint === "string"
        ? raw.intakeEndpoint
        : fallback.intakeEndpoint,
    contactPath:
      typeof raw.contactPath === "string" ? raw.contactPath : fallback.contactPath,
    bookingStrings: {
      noEmbed:
        typeof bookingStringsRaw?.noEmbed === "string"
          ? bookingStringsRaw.noEmbed
          : fallback.bookingStrings.noEmbed,
      iframeTitle:
        typeof bookingStringsRaw?.iframeTitle === "string"
          ? bookingStringsRaw.iframeTitle
          : fallback.bookingStrings.iframeTitle,
    },
    locale: typeof raw.locale === "string" ? raw.locale : fallback.locale,
  };
}

function initForm(form: HTMLFormElement) {
  const cfg = readConfigForForm(form);

  const panels = Array.from(form.querySelectorAll("[data-flow-panel]"));
  const indicators = Array.from(
    form.closest("section")?.querySelectorAll("[data-flow-step-indicator]") ?? []
  );
  const progressEl = form
    .closest("section")
    ?.querySelector("[data-flow-progress]");

  function getPanel(step: number) {
    return panels.find((p) => p.getAttribute("data-step") === String(step));
  }

  function setActiveStep(step: number) {
    for (const p of panels) {
      const isActive = p.getAttribute("data-step") === String(step);
      p.toggleAttribute("hidden", !isActive);
    }

    for (const el of indicators) {
      const elStep = el.getAttribute("data-step");
      const isActive = elStep === String(step);
      el.classList.toggle("opacity-70", !isActive);
      el.classList.toggle("border-cush-orange", isActive);
    }

    if (progressEl && progressEl instanceof HTMLElement) {
      progressEl.textContent = `${step} / 4`;
    }

    const panel = getPanel(step);
    if (panel) {
      const focusable = panel.querySelector(
        'input, textarea, button, [href], select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable instanceof HTMLElement) {
        focusable.focus();
      }
    }
  }

  function getDuration() {
    const checked = form.querySelector('input[name="duration"]:checked');
    if (checked && checked instanceof HTMLInputElement) return checked.value;
    return null;
  }

  function stepFromEl(el: HTMLElement) {
    const panel = el.closest("[data-flow-panel]");
    if (!panel) return 1;
    const stepAttr = panel.getAttribute("data-step");
    const step = stepAttr ? Number(stepAttr) : 1;
    return Number.isFinite(step) ? step : 1;
  }

  const bookingContainer = form.querySelector("[data-booking-container]");
  const openNewTab = form.querySelector("[data-open-new-tab]");

  function renderBooking() {
    if (!bookingContainer) return;
    const duration = getDuration();
    const bookingUrl =
      duration === "60" ? cfg.url60 : duration === "30" ? cfg.url30 : "";

    if (openNewTab && openNewTab instanceof HTMLAnchorElement) {
      openNewTab.href = bookingUrl || cfg.contactPath;
    }

    if (!bookingUrl) {
      bookingContainer.innerHTML = `
        <div class="p-6 md:p-8">
          <div class="rounded-xl border border-border bg-base/40 p-5">
            <p class="text-muted">${cfg.bookingStrings.noEmbed}</p>
          </div>
        </div>
      `;
      return;
    }

    bookingContainer.innerHTML = `
      <div class="bg-base">
        <iframe
          src="${bookingUrl}"
          title="${cfg.bookingStrings.iframeTitle}"
          loading="lazy"
          class="w-full h-[760px] border-0"
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
    `;
  }

  async function postIntake() {
    const duration = getDuration();
    if (!duration) return;

    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const phone = form.querySelector("#phone");
    const notes = form.querySelector("#notes");

    const payload = {
      duration,
      name: name instanceof HTMLInputElement ? name.value : "",
      email: email instanceof HTMLInputElement ? email.value : "",
      phone: phone instanceof HTMLInputElement ? phone.value : "",
      notes: notes instanceof HTMLTextAreaElement ? notes.value : "",
      locale: cfg.locale,
    };

    try {
      await fetch(cfg.intakeEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // no-op
    }
  }

  const durationRadios = Array.from(
    form.querySelectorAll("[data-duration-radio]")
  );
  const step1NextEl = getPanel(1)?.querySelector("[data-flow-next]");

  function syncStep1Next() {
    if (!step1NextEl || !(step1NextEl instanceof HTMLButtonElement)) return;
    step1NextEl.disabled = !getDuration();
  }

  for (const r of durationRadios) {
    if (!(r instanceof HTMLInputElement)) continue;
    r.addEventListener("change", () => {
      syncStep1Next();
      renderBooking();
    });
  }

  const nextButtons = Array.from(form.querySelectorAll("[data-flow-next]"));
  for (const btn of nextButtons) {
    if (!(btn instanceof HTMLButtonElement)) continue;
    btn.addEventListener("click", async () => {
      const current = stepFromEl(btn);

      const panel = getPanel(current);
      if (panel && panel instanceof HTMLFieldSetElement) {
        const requiredInputs = Array.from(panel.querySelectorAll("input[required]"));
        for (const input of requiredInputs) {
          if (input instanceof HTMLInputElement && !input.reportValidity()) {
            return;
          }
        }
      }

      const next = Math.min(4, current + 1);
      if (next === 4) {
        await postIntake();
        renderBooking();
      }
      setActiveStep(next);
    });
  }

  const backButtons = Array.from(form.querySelectorAll("[data-flow-back]"));
  for (const btn of backButtons) {
    if (!(btn instanceof HTMLButtonElement)) continue;
    btn.addEventListener("click", () => {
      const current = stepFromEl(btn);
      const prev = Math.max(1, current - 1);
      setActiveStep(prev);
    });
  }

  syncStep1Next();
  renderBooking();
  setActiveStep(1);
}

export function initBookingFlow() {
  const forms = Array.from(
    document.querySelectorAll("[data-consultation-flow]")
  ).filter((el): el is HTMLFormElement => el instanceof HTMLFormElement);

  for (const form of forms) {
    initForm(form);
  }
}
