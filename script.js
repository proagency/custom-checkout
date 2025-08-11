document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // Short helpers
  // -----------------------------
  const q = (s, el = document) => el.querySelector(s);
  const qa = (s, el = document) => [...el.querySelectorAll(s)];
  const escapeHtml = (str) =>
    (str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  // -----------------------------
  // Builder controls
  // -----------------------------
  const ctl = {
    // Text
    title: q("#ctl-title"),
    subtitle: q("#ctl-subtitle"),

    // Order details & payment type
    orderTitle: q("#ctl-order-title"),
    orderDesc: q("#ctl-order-desc"),
    payType: q("#ctl-pay-type"), // ONE_TIME | RECURRING
    interval: q("#ctl-interval"), // MONTHLY | QUARTERLY | YEARLY

    // Fields text
    nameLabel: q("#ctl-name-label"),
    namePh: q("#ctl-name-ph"),
    emailLabel: q("#ctl-email-label"),
    emailPh: q("#ctl-email-ph"),
    phoneLabel: q("#ctl-phone-label"),
    phonePh: q("#ctl-phone-ph"),
    btnText: q("#ctl-btn-text"),

    // Channels
    channelDefault: q("#ctl-channel-default"),
    ewChecks: qa(".chbox-ew"),
    bkChecks: qa(".chbox-bk"),

    // Brand
    brand: q("#ctl-brand"),
    brandHex: q("#ctl-brand-hex"),
    accent: q("#ctl-accent"),
    accentHex: q("#ctl-accent-hex"),

    // Price
    priceEnabled: q("#ctl-price-enabled"),
    amount: q("#ctl-amount"),
    priceNote: q("#ctl-price-note"),

    // Redirects & Webhook
    successUrl: q("#ctl-success-url"),
    failedUrl: q("#ctl-failed-url"),
    webhookUrl: q("#ctl-webhook-url"),

    // Embed
    embedBtn: q("#gen-embed"),
    embedOut: q("#embed-output"),
  };

  // -----------------------------
  // Preview targets
  // -----------------------------
  const p = {
    // Price header
    priceWrap: q("#p-price"),
    currency: q("#p-currency"),
    amount: q("#p-amount"),
    intervalSuffix: q("#p-interval-suffix"),
    priceNote: q("#p-price-note"),

    // Order summary
    orderTitle: q("#p-order-title"),
    orderDesc: q("#p-order-desc"),

    // Headings
    title: q("#p-title"),
    subtitle: q("#p-subtitle"),

    // Fields
    nameLabel: q("#p-name-label"),
    nameInput: q("#p-name-input"),
    emailLabel: q("#p-email-label"),
    emailInput: q("#p-email-input"),
    phoneLabel: q("#p-phone-label"),
    phoneInput: q("#p-phone-input"),

    // Errors
    errName: q("#err-name"),
    errEmail: q("#err-email"),
    errPhone: q("#err-phone"),

    // Channels UI
    tabE: q("#tab-ewallets"),
    tabB: q("#tab-bank"),
    panelE: q("#panel-ewallets"),
    panelB: q("#panel-bank"),

    // CTA
    btn: q("#p-btn"),
  };

  // -----------------------------
  // Binding utilities
  // -----------------------------
  const bindText = (input, target) => {
    const apply = () => (target.textContent = input.value || "");
    input.addEventListener("input", apply);
    apply();
  };
  const bindPh = (input, target) => {
    const apply = () => (target.placeholder = input.value || "");
    input.addEventListener("input", apply);
    apply();
  };

  // -----------------------------
  // Live bindings (preview)
  // -----------------------------
  bindText(ctl.title, p.title);
  bindText(ctl.subtitle, p.subtitle);

  bindText(ctl.orderTitle, p.orderTitle);
  ctl.orderDesc.addEventListener("input", () => {
    p.orderDesc.textContent = ctl.orderDesc.value || "";
  });
  p.orderDesc.textContent = ctl.orderDesc.value || "";

  bindText(ctl.nameLabel, p.nameLabel);
  bindPh(ctl.namePh, p.nameInput);
  bindText(ctl.emailLabel, p.emailLabel);
  bindPh(ctl.emailPh, p.emailInput);
  bindText(ctl.phoneLabel, p.phoneLabel);
  bindPh(ctl.phonePh, p.phoneInput);
  bindText(ctl.btnText, p.btn);

  // -----------------------------
  // Brand color syncing (color <-> hex)
  // -----------------------------
  const syncHex = (colorEl, hexEl) => {
    const toHex = (v) => (v.startsWith("#") ? v : `#${v.replace(/[^0-9a-f]/gi, "")}`);
    const applyColor = () => {
      hexEl.value = colorEl.value.toLowerCase();
      setBrandVars();
    };
    const applyHex = () => {
      const hx = toHex(hexEl.value).slice(0, 7);
      if (/^#[0-9a-f]{6}$/i.test(hx)) colorEl.value = hx;
      setBrandVars();
    };
    colorEl.addEventListener("input", applyColor);
    hexEl.addEventListener("input", applyHex);
  };
  syncHex(ctl.brand, ctl.brandHex);
  syncHex(ctl.accent, ctl.accentHex);

  function setBrandVars() {
    document.documentElement.style.setProperty("--brand", ctl.brand.value);
    document.documentElement.style.setProperty("--accent", ctl.accent.value);
  }
  setBrandVars();

  // -----------------------------
  // Price header + payment type suffix
  // -----------------------------
  function intervalSuffix() {
    if (ctl.payType.value !== "RECURRING") return "";
    switch (ctl.interval.value) {
      case "MONTHLY":
        return "/mo";
      case "QUARTERLY":
        return "/quarter";
      case "YEARLY":
        return "/yr";
      default:
        return "";
    }
  }

  function renderPrice() {
    p.priceWrap.classList.toggle("is-hidden", !ctl.priceEnabled.checked);
    p.currency.textContent = "₱"; // show peso sign
    p.amount.textContent = String(ctl.amount.value || "").trim();
    p.intervalSuffix.textContent = intervalSuffix();
    p.priceNote.textContent = ctl.priceNote.value || "";
    p.priceNote.classList.toggle("is-hidden", !(ctl.priceNote.value || "").trim());
  }

  // Normalize amount on input: positive, drop trailing ".00"
  const normalizeAmount = () => {
    let val = parseFloat(ctl.amount.value);
    if (isNaN(val) || val < 0) val = 0;
    const fixed = val.toFixed(2);
    ctl.amount.value = fixed.endsWith(".00") ? fixed.slice(0, -3) : fixed;
  };

  ["change", "input"].forEach((evt) => {
    [ctl.priceEnabled, ctl.amount, ctl.priceNote, ctl.payType, ctl.interval].forEach((el) =>
      el.addEventListener(evt, () => {
        if (el === ctl.amount && evt === "input") normalizeAmount();
        renderPrice();
      })
    );
  });
  normalizeAmount();
  renderPrice();

  // -----------------------------
  // Channel Type toggle (preview)
  // -----------------------------
  function setChannelType(type) {
    const isE = type === "EWALLETS";
    p.tabE.classList.toggle("is-active", isE);
    p.tabB.classList.toggle("is-active", !isE);
    p.tabE.setAttribute("aria-selected", String(isE));
    p.tabB.setAttribute("aria-selected", String(!isE));
    p.panelE.classList.toggle("is-hidden", !isE);
    p.panelB.classList.toggle("is-hidden", isE);
  }
  p.tabE.addEventListener("click", () => setChannelType("EWALLETS"));
  p.tabB.addEventListener("click", () => setChannelType("BANK"));

  // -----------------------------
  // Channels from checkboxes
  // -----------------------------
  function getEnabledChannels() {
    const ews = ctl.ewChecks.filter((c) => c.checked).map((c) => c.value);
    const bks = ctl.bkChecks.filter((c) => c.checked).map((c) => c.value);
    return { ews, bks };
  }

  function renderChannels() {
    const { ews, bks } = getEnabledChannels();
    p.panelE.innerHTML = ews.length
      ? ews
          .map(
            (v) =>
              `<label class="channel"><input type="radio" name="channel-ew" value="${escapeHtml(
                v
              )}"><span>${escapeHtml(v)}</span></label>`
          )
          .join("")
      : `<div class="empty">No EWALLETS enabled</div>`;

    p.panelB.innerHTML = bks.length
      ? bks
          .map(
            (v) =>
              `<label class="channel"><input type="radio" name="channel-bank" value="${escapeHtml(
                v
              )}"><span>${escapeHtml(v)}</span></label>`
          )
          .join("")
      : `<div class="empty">No BANK channels enabled</div>`;
  }
  [...ctl.ewChecks, ...ctl.bkChecks].forEach((cb) => cb.addEventListener("change", renderChannels));
  renderChannels();

  // Default channel type
  ctl.channelDefault.addEventListener("change", () => setChannelType(ctl.channelDefault.value));
  setChannelType(ctl.channelDefault.value);

  // -----------------------------
  // Preview validations (demo)
  // -----------------------------
  function validatePreview() {
    let ok = true;
    if (!/.{2,}/.test(p.nameInput.value.trim())) {
      p.errName.textContent = "Please enter your full name.";
      ok = false;
    } else p.errName.textContent = "";

    if (!p.emailInput.value || !p.emailInput.checkValidity()) {
      p.errEmail.textContent = "Please enter a valid email address.";
      ok = false;
    } else p.errEmail.textContent = "";

    if (!/^9\d{9}$/.test(p.phoneInput.value.trim())) {
      p.errPhone.textContent = "Enter 10 digits starting with 9 (e.g., 9XXXXXXXXX).";
      ok = false;
    } else p.errPhone.textContent = "";
    return ok;
  }
  p.btn.addEventListener("click", () => {
    if (validatePreview()) alert("Looks good! (Preview submit)");
  });

  // -----------------------------
  // Generate short embed pointing to hosted checkout.html
  // -----------------------------
  ctl.embedBtn.addEventListener("click", () => {
    const cfg = {
      title: ctl.title.value,
      subtitle: ctl.subtitle.value,
      orderTitle: ctl.orderTitle.value,
      orderDesc: ctl.orderDesc.value,
      payType: ctl.payType.value,           // "ONE_TIME" for MVP
      interval: ctl.interval.value,         // can be shown as recurring invoice label
      nameLabel: ctl.nameLabel.value,
      namePh: ctl.namePh.value,
      emailLabel: ctl.emailLabel.value,
      emailPh: ctl.emailPh.value,
      phoneLabel: ctl.phoneLabel.value,
      phonePh: ctl.phonePh.value,
      btnText: ctl.btnText.value,
      defaultType: ctl.channelDefault.value === "BANK" ? "BANK" : "EWALLETS",
      brand: ctl.brand.value,
      accent: ctl.accent.value,
      priceEnabled: ctl.priceEnabled.checked,
      currency: "₱",
      amount: String(ctl.amount.value || "").trim(),
      priceNote: ctl.priceNote.value,
      channels: (function(){
        const ews = ctl.ewChecks.filter(c => c.checked).map(c => c.value);
        const bks = ctl.bkChecks.filter(c => c.checked).map(c => c.value);
        return { ews, bks };
      })(),
      successUrl: (ctl.successUrl.value || "").trim(),
      failedUrl:  (ctl.failedUrl.value  || "").trim(),
      webhookUrl: (ctl.webhookUrl.value || "").trim()
    };

    // Base64 (Unicode-safe)
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
    const HOSTED_HTML = "https://proagency.github.io/custom-checkout/checkout.html";
    const src = `${HOSTED_HTML}#cfg=${b64}`;

    const iframe = `<iframe
      src="${src}"
      style="width:100%;max-width:640px;height:760px;border:0;border-radius:14px;overflow:hidden"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>`;

    ctl.embedOut.value = iframe;
    ctl.embedOut.focus();
    ctl.embedOut.select();
    try { document.execCommand("copy"); } catch(e) {}
  });
});

// must exist globally for checkout.html to call
window.renderCheckout = function renderCheckout(cfg, { mount = '#xilbee-root' } = {}) {
  // ⬇️ move your existing runtime here (apply cfg, build DOM, validations, submit → webhook → redirect)
  // document.querySelector(mount).innerHTML = ...
};

