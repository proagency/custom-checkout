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
    p.currency.textContent = "₱";
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
  // Generate Embed (full srcdoc)
  // -----------------------------
  ctl.embedBtn.addEventListener("click", () => {
    const cfg = {
      title: ctl.title.value,
      subtitle: ctl.subtitle.value,
      orderTitle: ctl.orderTitle.value,
      orderDesc: ctl.orderDesc.value,
      payType: ctl.payType.value, // ONE_TIME | RECURRING
      interval: ctl.interval.value, // MONTHLY | QUARTERLY | YEARLY
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
      channels: getEnabledChannels(),
      successUrl: (ctl.successUrl.value || "").trim(), // optional fallback
      failedUrl: (ctl.failedUrl.value || "").trim(), // optional fallback
      webhookUrl: (ctl.webhookUrl.value || "").trim(),
    };

    const suffix =
      cfg.payType === "RECURRING"
        ? cfg.interval === "MONTHLY"
          ? "/mo"
          : cfg.interval === "QUARTERLY"
          ? "/quarter"
          : "/yr"
        : "";

    const css = `
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#fff;color:#111}
:root{--brand:${cfg.brand};--brand-contrast:#fff;--accent:${cfg.accent};--border:#e5e7eb;--muted:#6b7280}
.wrap{max-width:600px;margin:20px auto;padding:20px;border:1px solid var(--border);border-radius:16px}
h2{margin:10px 0 6px}.sub{margin:0 0 16px;color:var(--muted);font-size:13px}
label[for]{display:block;margin:12px 0 6px;font-size:14px}
input[type=text],input[type=email],input[type=tel]{width:100%;padding:12px;border:1px solid var(--border);border-radius:10px;font-size:15px}
.phone-wrap{display:flex;align-items:center;gap:8px}
.prefix{padding:12px 10px;border:1px solid var(--border);border-radius:10px;background:#fafafa;font-size:14px;white-space:nowrap}
.hint{color:var(--muted);font-size:12px}
.err{color:#b91c1c;font-size:12px;min-height:16px}
.price{display:flex;justify-content:space-between;align-items:baseline;background:var(--accent);border:1px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:10px}
.price .left{font-size:22px;font-weight:700}.price .note{font-size:12px;color:var(--muted);margin-left:12px}
.order{border:1px dashed var(--border);border-radius:12px;padding:12px;margin:12px 0}
.order .t{font-weight:700;margin-bottom:4px}.order .d{color:var(--muted);font-size:13px}
.toggle{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:var(--accent);border:1px solid var(--border);border-radius:12px;padding:6px;margin:12px 0 6px}
.toggle button{padding:10px 12px;background:transparent;border:none;border-radius:8px;cursor:pointer;font-weight:600}
.toggle button.active{background:var(--brand);color:var(--brand-contrast)}
.channels{display:grid;gap:8px;margin-bottom:12px}
.channel{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:12px}
.channels .empty{color:var(--muted);font-size:13px}
.cta{width:100%;padding:12px 14px;border:none;border-radius:12px;background:var(--brand);color:var(--brand-contrast);font-weight:600;cursor:pointer}
.hide{display:none}
    `.replace(/\s+/g, " ");

    const listHtml = (arr, name) =>
      arr.length
        ? arr
            .map(
              (v) =>
                `<label class="channel"><input type="radio" name="${name}" value="${escapeHtml(
                  v
                )}"><span>${escapeHtml(v)}</span></label>`
            )
            .join("")
        : `<div class="empty">No ${name === "channel-ew" ? "EWALLETS" : "BANK"} enabled</div>`;

    const priceBlock = cfg.priceEnabled
      ? `
      <div class="price">
        <div class="left"><span>${escapeHtml(cfg.currency)}</span><span>${escapeHtml(
          cfg.amount
        )}</span><span>${escapeHtml(suffix)}</span></div>
        ${cfg.priceNote ? `<div class="note">${escapeHtml(cfg.priceNote)}</div>` : ""}
      </div>`
      : "";

    const html = `
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css}</style></head><body>
<form class="wrap" id="form" onsubmit="event.preventDefault();">
  ${priceBlock}
  <div class="order">
    <div class="t">${escapeHtml(cfg.orderTitle)}</div>
    ${cfg.orderDesc ? `<div class="d">${escapeHtml(cfg.orderDesc)}</div>` : ""}
  </div>

  <h2>${escapeHtml(cfg.title)}</h2>
  ${cfg.subtitle ? `<p class="sub">${escapeHtml(cfg.subtitle)}</p>` : ""}

  <label for="name">${escapeHtml(cfg.nameLabel)}</label>
  <input id="name" type="text" placeholder="${escapeHtml(cfg.namePh)}" required pattern=".{2,}">

  <label for="email">${escapeHtml(cfg.emailLabel)}</label>
  <input id="email" type="email" placeholder="${escapeHtml(cfg.emailPh)}" required>

  <label for="phone">${escapeHtml(cfg.phoneLabel)}</label>
  <div class="phone-wrap">
    <span class="prefix">+63</span>
    <input id="phone" type="tel" inputmode="numeric" placeholder="${escapeHtml(
      cfg.phonePh
    )}" required pattern="^9\\d{9}$" maxlength="10">
  </div>
  <div class="hint">Enter 10 digits, starting with 9 (e.g., 9XXXXXXXXX). No +63 needed.</div>
  <div id="err" class="err"></div>

  <div class="toggle" role="tablist" aria-label="Payment Channel Type">
    <button type="button" id="emb-ew" role="tab" aria-selected="false">EWALLETS</button>
    <button type="button" id="emb-bk" role="tab" aria-selected="false">BANK</button>
  </div>

  <div id="emb-ew-panel" class="channels" role="tabpanel" aria-labelledby="emb-ew">
    ${listHtml(cfg.channels.ews, "channel-ew")}
  </div>

  <div id="emb-bk-panel" class="channels hide" role="tabpanel" aria-labelledby="emb-bk">
    ${listHtml(cfg.channels.bks, "channel-bank")}
  </div>

  <button class="cta" id="submitBtn" type="submit">${escapeHtml(cfg.btnText)}</button>
  <p class="sub" style="text-align:center">🔒 Secure checkout</p>
</form>
<script>
(function(){
  var tabE = document.getElementById('emb-ew');
  var tabB = document.getElementById('emb-bk');
  var panelE = document.getElementById('emb-ew-panel');
  var panelB = document.getElementById('emb-bk-panel');
  var form = document.getElementById('form');
  var err = document.getElementById('err');
  var phone = document.getElementById('phone');
  var submitBtn = document.getElementById('submitBtn');

  function setType(t){
    var isE = t === 'EWALLETS';
    tabE.classList.toggle('active', isE);
    tabB.classList.toggle('active', !isE);
    tabE.setAttribute('aria-selected', isE);
    tabB.setAttribute('aria-selected', !isE);
    panelE.classList.toggle('hide', !isE);
    panelB.classList.toggle('hide', isE);
  }
  tabE.addEventListener('click', function(){ setType('EWALLETS'); });
  tabB.addEventListener('click', function(){ setType('BANK'); });
  setType(${JSON.stringify(cfg.defaultType)});

  // Digits only, max 10
  phone.addEventListener('input', function(){
    var v = phone.value.replace(/\\D/g,'').slice(0,10);
    phone.value = v;
  });

  function currentChannel(){
    var isE = !panelE.classList.contains('hide');
    var sel = (isE ? panelE : panelB).querySelector('input[type=radio]:checked');
    return { type: isE ? 'EWALLETS' : 'BANK', method: sel ? sel.value : null };
  }

  function intervalSuffix(){
    var payType = ${JSON.stringify(cfg.payType)};
    var interval = ${JSON.stringify(cfg.interval)};
    if (payType !== 'RECURRING') return '';
    if (interval === 'MONTHLY') return '/mo';
    if (interval === 'QUARTERLY') return '/quarter';
    if (interval === 'YEARLY') return '/yr';
    return '';
  }

  function extractPaymentLink(data){
    try{
      var keys = ['payment_url','checkout_url','url','redirect_url','paymentLink','link'];
      for (var i=0;i<keys.length;i++){
        var k = keys[i];
        if (data && typeof data[k]==='string' && /^https?:\\/\\//.test(data[k])) return data[k];
      }
      function dive(obj){
        if (!obj || typeof obj !== 'object') return null;
        for (var key in obj){
          var val = obj[key];
          if (typeof val === 'string' && /^https?:\\/\\//.test(val) && /(pay|checkout|invoice|link|session|order|redirect)/i.test(key+' '+val)) return val;
          if (typeof val === 'object'){ var found = dive(val); if (found) return found; }
        }
        return null;
      }
      return dive(data);
    }catch(e){ return null; }
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    err.textContent = '';

    if (!form.checkValidity()) {
      if (!/^9\\d{9}$/.test(phone.value.trim())) err.textContent = "Phone: enter 10 digits starting with 9 (e.g., 9XXXXXXXXX).";
      else err.textContent = "Please complete all required fields.";
      return;
    }

    var ch = currentChannel();
    var payload = {
      order: {
        title: ${JSON.stringify(cfg.orderTitle)},
        description: ${JSON.stringify(cfg.orderDesc)},
        paymentType: ${JSON.stringify(cfg.payType)},
        interval: ${JSON.stringify(cfg.interval)},
        currency: ${JSON.stringify(cfg.currency)},
        amount: ${JSON.stringify(cfg.amount)},
        priceNote: ${JSON.stringify(cfg.priceNote)},
        priceSuffix: intervalSuffix()
      },
      form: { title: ${JSON.stringify(cfg.title)}, subtitle: ${JSON.stringify(cfg.subtitle)} },
      customer: {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: { country: 'PH', dial_code: '+63', national: phone.value.trim(), e164: '+63' + phone.value.trim() }
      },
      channel: ch,
      meta: { userAgent: navigator.userAgent, timestamp: new Date().toISOString() }
    };

    var webhook = ${JSON.stringify(cfg.webhookUrl)};
    var successUrl = ${JSON.stringify(cfg.successUrl)};
    var failedUrl  = ${JSON.stringify(cfg.failedUrl)};

    if (!webhook) { err.textContent = 'Webhook URL is missing.'; return; }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing…';
      var res = await fetch(webhook, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload),
        mode: 'cors',
        keepalive: true
      });

      var data = null;
      try { data = await res.json(); } catch(_){}

      var link = data && extractPaymentLink(data);

      if (res.ok && link) { location.href = link; return; }

      // Fallbacks
      if (!res.ok || !link) {
        if (failedUrl) { location.href = failedUrl; return; }
        err.textContent = !res.ok ? 'Payment initialization failed.' : 'No payment link returned by webhook.';
      }
    } catch(e){
      if (failedUrl) { location.href = failedUrl; return; }
      err.textContent = 'Network error. Please try again.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = ${JSON.stringify(cfg.btnText)};
    }
  });
}());
</script>
</body></html>`.trim();

    const iframeHeight = cfg.priceEnabled ? 800 : 730;
    const iframe = `<iframe style="width:100%;max-width:640px;height:${iframeHeight}px;border:0;border-radius:14px;overflow:hidden" srcdoc="${html.replace(/"/g, "&quot;")}"></iframe>`;

    ctl.embedOut.value = iframe;
    ctl.embedOut.focus();
    ctl.embedOut.select();
    try {
      document.execCommand("copy");
    } catch (e) {}
  });
});

/* ===== EMBED ENTRY POINT =====
   Called by the embed (inside the iframe) to render the checkout.
   It expects:
     - cfg: the config from the builder (titles, colors, channels, price, webhook urls, etc.)
     - opts.mount: a CSS selector where to render the form (e.g. "#xilbee-root")
*/
window.renderCheckout = function renderCheckout(cfg, opts = {}) {
  const mountSel = opts.mount || "#xilbee-root";
  const root = document.querySelector(mountSel);
  if (!root) return console.error("[checkout] mount point not found:", mountSel);

  // TODO: Insert the same runtime you already use in the srcdoc embed:
  // - build the form DOM into `root`
  // - apply cfg (titles, labels, colors, channels, price, payment type)
  // - validate phone ^9\d{9}$
  // - on submit: POST cfg + buyer data to cfg.webhookUrl, await JSON, pick payment link, redirect
  // You already have this code working — move it into functions and call them here.

  // Example stub (replace with your current runtime):
  root.innerHTML = `
    <div class="card checkout">
      <h2>${(cfg.title || "Checkout").replace(/[<>&"]/g, "")}</h2>
      <p class="subtle">${(cfg.subtitle || "Secure payment • SSL encrypted").replace(/[<>&"]/g, "")}</p>
      <!-- ... render inputs & channels based on cfg ... -->
      <button id="cta" class="cta">${(cfg.btnText || "Complete Purchase").replace(/[<>&"]/g, "")}</button>
      <div id="err" class="err"></div>
    </div>
  `;

  // wire up your existing submit handler here...
  // submit -> fetch(cfg.webhookUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
  // -> response.json() -> find payment link -> location.href = link
};
