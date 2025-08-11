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

// ------- minimal embed runtime -------
(function () {
  function extractPaymentLink(data){
    try{
      const keys = ['payment_url','checkout_url','url','redirect_url','paymentLink','link'];
      for (const k of keys) if (data && typeof data[k]==='string' && /^https?:\/\//.test(data[k])) return data[k];
      function dive(o){
        if (!o || typeof o!=='object') return null;
        for (const k in o){
          const v = o[k];
          if (typeof v==='string' && /^https?:\/\//.test(v) && /(pay|checkout|invoice|link|session|order|redirect)/i.test(k+' '+v)) return v;
          if (typeof v==='object'){ const f = dive(v); if (f) return f; }
        }
        return null;
      }
      return dive(data);
    }catch(_){ return null; }
  }

  window.renderCheckout = function renderCheckout(cfg, { mount = '#xilbee-root' } = {}) {
    const root = document.querySelector(mount);
    if (!root) return console.error('[checkout] mount not found', mount);

    // brand colors
    document.documentElement.style.setProperty('--brand', cfg.brand || '#111827');
    document.documentElement.style.setProperty('--accent', cfg.accent || '#f3f4f6');

    const suffix =
      cfg.payType === 'RECURRING'
        ? (cfg.interval === 'MONTHLY' ? '/mo' : cfg.interval === 'QUARTERLY' ? '/quarter' : '/yr')
        : '';

    const priceBlock = cfg.priceEnabled ? `
      <div class="price-header price">
        <div class="price-left left"><span>${cfg.currency || '₱'}</span><span>${cfg.amount || ''}</span><span>${suffix}</span></div>
        ${cfg.priceNote ? `<div class="price-note note">${cfg.priceNote}</div>` : ''}
      </div>` : '';

    const channelsEW = (cfg.channels?.ews || []).map(v =>
      `<label class="channel"><input type="radio" name="channel-ew" value="${v}"><span>${v}</span></label>`
    ).join('') || `<div class="empty">No EWALLETS enabled</div>`;

    const channelsBK = (cfg.channels?.bks || []).map(v =>
      `<label class="channel"><input type="radio" name="channel-bank" value="${v}"><span>${v}</span></label>`
    ).join('') || `<div class="empty">No BANK enabled</div>`;

    root.innerHTML = `
      <div class="card checkout">
        ${priceBlock}
        <div class="order">
          <div class="order-title t">${cfg.orderTitle || ''}</div>
          ${cfg.orderDesc ? `<div class="order-desc d">${cfg.orderDesc}</div>` : ''}
        </div>

        <h2>${cfg.title || 'Checkout'}</h2>
        ${cfg.subtitle ? `<p class="subtle sub">${cfg.subtitle}</p>` : ''}

        <label class="form-field" for="name"><span>${cfg.nameLabel || 'Full Name'}</span>
          <input id="name" type="text" placeholder="${cfg.namePh || ''}" required pattern=".{2,}">
        </label>

        <label class="form-field" for="email"><span>${cfg.emailLabel || 'Email'}</span>
          <input id="email" type="email" placeholder="${cfg.emailPh || ''}" required>
        </label>

        <label class="form-field" for="phone"><span>${cfg.phoneLabel || 'Phone Number'}</span>
          <div class="phone-wrap">
            <span class="prefix">+63</span>
            <input id="phone" type="tel" inputmode="numeric" placeholder="${cfg.phonePh || '9XXXXXXXXX'}" required pattern="^9\\d{9}$" maxlength="10">
          </div>
          <small class="hint">Enter 10 digits, starting with 9 (e.g., 9XXXXXXXXX). No +63 needed.</small>
        </label>
        <div id="err" class="err"></div>

        <div class="toggle" role="tablist" aria-label="Payment Channel Type">
          <button type="button" id="emb-ew" role="tab">EWALLETS</button>
          <button type="button" id="emb-bk" role="tab">BANK</button>
        </div>

        <div id="emb-ew-panel" class="channels">${channelsEW}</div>
        <div id="emb-bk-panel" class="channels hide">${channelsBK}</div>

        <button class="cta" id="submitBtn" type="button">${cfg.btnText || 'Complete Purchase'}</button>
        <p class="sub" style="text-align:center">🔒 Secure checkout</p>
      </div>
    `;

    // toggle logic
    const tabE = root.querySelector('#emb-ew');
    const tabB = root.querySelector('#emb-bk');
    const panelE = root.querySelector('#emb-ew-panel');
    const panelB = root.querySelector('#emb-bk-panel');
    function setType(t){
      const isE = t === 'EWALLETS';
      tabE.classList.toggle('active', isE);
      tabB.classList.toggle('active', !isE);
      panelE.classList.toggle('hide', !isE);
      panelB.classList.toggle('hide', isE);
    }
    tabE.addEventListener('click', () => setType('EWALLETS'));
    tabB.addEventListener('click', () => setType('BANK'));
    setType(cfg.defaultType === 'BANK' ? 'BANK' : 'EWALLETS');

    // phone digits only
    const phone = root.querySelector('#phone');
    phone.addEventListener('input', () => {
      phone.value = phone.value.replace(/\D/g,'').slice(0,10);
    });

    // submit
    const btn = root.querySelector('#submitBtn');
    const err = root.querySelector('#err');
    btn.addEventListener('click', async () => {
      err.textContent = '';
      const name = root.querySelector('#name').value.trim();
      const email = root.querySelector('#email').value.trim();
      const phoneVal = phone.value.trim();
      if (!/.{2,}/.test(name)) return err.textContent = 'Please enter your full name.';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err.textContent = 'Please enter a valid email address.';
      if (!/^9\d{9}$/.test(phoneVal)) return err.textContent = 'Phone: enter 10 digits starting with 9.';

      const isE = !panelE.classList.contains('hide');
      const sel = (isE ? panelE : panelB).querySelector('input[type=radio]:checked');
      const channel = { type: isE ? 'EWALLETS' : 'BANK', method: sel ? sel.value : null };

      if (!cfg.webhookUrl) { err.textContent = 'Webhook URL is missing.'; return; }

      const payload = {
        order: {
          title: cfg.orderTitle || '',
          description: cfg.orderDesc || '',
          paymentType: cfg.payType || 'ONE_TIME',
          interval: cfg.interval || 'MONTHLY',
          currency: cfg.currency || '₱',
          amount: cfg.amount || '',
          priceNote: cfg.priceNote || '',
          priceSuffix: cfg.payType === 'RECURRING'
            ? (cfg.interval === 'MONTHLY' ? '/mo' : cfg.interval === 'QUARTERLY' ? '/quarter' : '/yr')
            : ''
        },
        form: { title: cfg.title || '', subtitle: cfg.subtitle || '' },
        customer: {
          name, email,
          phone: { country:'PH', dial_code:'+63', national: phoneVal, e164: '+63'+phoneVal }
        },
        channel,
        meta: { userAgent: navigator.userAgent, timestamp: new Date().toISOString() }
      };

      btn.disabled = true; const original = btn.textContent; btn.textContent = 'Processing…';
      try{
        const res = await fetch(cfg.webhookUrl, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload),
          mode:'cors',
          keepalive:true
        });
        let data = null; try { data = await res.json(); } catch(_){}
        const link = data && extractPaymentLink(data);
        if (res.ok && link) { location.href = link; return; }
        if (!res.ok || !link) {
          if (cfg.failedUrl) { location.href = cfg.failedUrl; return; }
          err.textContent = !res.ok ? 'Payment initialization failed.' : 'No payment link returned by webhook.';
        }
      } catch(e){
        if (cfg.failedUrl) { location.href = cfg.failedUrl; return; }
        err.textContent = 'Network error. Please try again.';
      } finally {
        btn.disabled = false; btn.textContent = original;
      }
    });
  };
})();


