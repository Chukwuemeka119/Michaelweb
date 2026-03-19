// ═══════════════════════════════════════════════════
//  MICHAEL WEB™ — Cookie System
//  Drop this script at the bottom of your <body>
//  and add the CSS to your <head>
// ═══════════════════════════════════════════════════

(function () {
  // ── HELPERS ──────────────────────────────────────
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  }

  const hasConsent = () => getCookie('mw_consent') === 'true';

  // ── INJECT STYLES ─────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* ── COOKIE BANNER ── */
    #mw-cookie-banner {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      width: min(560px, calc(100vw - 32px));
      background: #131508;
      border: 1px solid #2a2e18;
      border-radius: 16px;
      padding: 24px 28px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,245,0,0.06);
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: mw-slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both;
      font-family: 'Barlow', 'DM Mono', monospace, sans-serif;
    }
    #mw-cookie-banner.mw-hide {
      animation: mw-slide-down 0.3s ease both;
    }
    @keyframes mw-slide-up {
      from { opacity:0; transform: translateX(-50%) translateY(24px); }
      to   { opacity:1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes mw-slide-down {
      from { opacity:1; transform: translateX(-50%) translateY(0); }
      to   { opacity:0; transform: translateX(-50%) translateY(24px); }
    }
    .mw-cookie-top {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .mw-cookie-icon {
      font-size: 1.4rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .mw-cookie-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #f0f2e8;
      margin-bottom: 4px;
    }
    .mw-cookie-text {
      font-size: 0.78rem;
      color: #6a6e52;
      line-height: 1.6;
    }
    .mw-cookie-text a {
      color: #d4f500;
      text-decoration: none;
    }
    .mw-cookie-btns {
      display: flex;
      gap: 10px;
    }
    .mw-btn-accept {
      flex: 1;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: #d4f500;
      color: #000;
      border: none;
      padding: 11px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .mw-btn-accept:hover { background: #fff; transform: translateY(-1px); }
    .mw-btn-decline {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: transparent;
      color: #4a4e38;
      border: 1px solid #2a2e18;
      padding: 11px 18px;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;
    }
    .mw-btn-decline:hover { border-color: #d4f500; color: #d4f500; }

    /* ── WELCOME BACK TOAST ── */
    #mw-welcome-toast {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 99998;
      background: #131508;
      border: 1px solid rgba(212,245,0,0.25);
      border-radius: 12px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      animation: mw-toast-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
      font-family: 'Barlow', sans-serif;
      max-width: 280px;
    }
    #mw-welcome-toast.mw-hide {
      animation: mw-toast-out 0.3s ease both;
    }
    @keyframes mw-toast-in {
      from { opacity:0; transform: translateX(20px); }
      to   { opacity:1; transform: translateX(0); }
    }
    @keyframes mw-toast-out {
      from { opacity:1; transform: translateX(0); }
      to   { opacity:0; transform: translateX(20px); }
    }
    .mw-toast-icon { font-size: 1.2rem; flex-shrink: 0; }
    .mw-toast-body {}
    .mw-toast-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.9rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #d4f500;
      margin-bottom: 2px;
    }
    .mw-toast-sub { font-size: 0.72rem; color: #6a6e52; line-height: 1.4; }
    .mw-toast-close {
      position: absolute;
      top: 8px; right: 10px;
      background: none; border: none;
      color: #3a3e28; font-size: 0.8rem;
      cursor: pointer; line-height: 1;
    }
    .mw-toast-close:hover { color: #d4f500; }
  `;
  document.head.appendChild(style);

  // ── BANNER ────────────────────────────────────────
  function showBanner() {
    if (getCookie('mw_consent')) return; // already decided

    const banner = document.createElement('div');
    banner.id = 'mw-cookie-banner';
    banner.innerHTML = `
      <div class="mw-cookie-top">
        <div class="mw-cookie-icon">🍪</div>
        <div>
          <div class="mw-cookie-title">This site uses cookies</div>
          <p class="mw-cookie-text">
            Michael Web™ uses cookies to remember your preferences, track your last visited section,
            and save your contact form data so you never lose it. No data is sold or shared.
          </p>
        </div>
      </div>
      <div class="mw-cookie-btns">
        <button class="mw-btn-accept" id="mw-accept-btn">✓ Accept All</button>
        <button class="mw-btn-decline" id="mw-decline-btn">Decline</button>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('mw-accept-btn').addEventListener('click', () => {
      setCookie('mw_consent', 'true', 365);
      hideBanner();
      initFunctional();
    });

    document.getElementById('mw-decline-btn').addEventListener('click', () => {
      setCookie('mw_consent', 'false', 30);
      hideBanner();
    });
  }

  function hideBanner() {
    const b = document.getElementById('mw-cookie-banner');
    if (!b) return;
    b.classList.add('mw-hide');
    setTimeout(() => b.remove(), 350);
  }

  // ── FUNCTIONAL COOKIES ────────────────────────────
  function initFunctional() {
    trackVisit();
    trackSection();
    saveFormData();
    trackReferral();
  }

  // 1. VISIT TRACKING — "Welcome back!" toast
  function trackVisit() {
    const visits = parseInt(getCookie('mw_visits') || '0', 10);
    const lastName = getCookie('mw_last_visit');
    const now = new Date();
    const nowStr = now.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

    setCookie('mw_visits', visits + 1, 365);
    setCookie('mw_last_visit', nowStr, 365);

    if (visits >= 1) {
      // Returning visitor — show welcome back toast
      showWelcomeToast(visits + 1, lastName);
    }
  }

  function showWelcomeToast(visitCount, lastVisit) {
    const toast = document.createElement('div');
    toast.id = 'mw-welcome-toast';
    toast.style.position = 'fixed';
    toast.innerHTML = `
      <button class="mw-toast-close" id="mw-toast-close">✕</button>
      <div class="mw-toast-icon">👋</div>
      <div class="mw-toast-body">
        <div class="mw-toast-title">Welcome back!</div>
        <div class="mw-toast-sub">Visit #${visitCount} · Last seen ${lastVisit || 'recently'}</div>
      </div>
    `;
    document.body.appendChild(toast);

    document.getElementById('mw-toast-close').addEventListener('click', () => {
      toast.classList.add('mw-hide');
      setTimeout(() => toast.remove(), 350);
    });

    // Auto-dismiss after 5s
    setTimeout(() => {
      if (document.getElementById('mw-welcome-toast')) {
        toast.classList.add('mw-hide');
        setTimeout(() => toast.remove(), 350);
      }
    }, 5000);
  }

  // 2. SECTION TRACKING — remember last section visited
  function trackSection() {
    // Restore scroll to last section if on same page
    const lastSection = getCookie('mw_last_section');
    if (lastSection) {
      // Don't auto-scroll — just remember for UX analytics
    }

    // Track as user scrolls
    const sections = document.querySelectorAll('section[id], div[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setCookie('mw_last_section', entry.target.id, 30);
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => observer.observe(s));
  }

  // 3. CONTACT FORM — save & restore data
  function saveFormData() {
    // Find common form field names
    const fieldSelectors = [
      'input[name="name"], input[placeholder*="Name"], input[id*="name"]',
      'input[name="email"], input[placeholder*="Email"], input[type="email"]',
      'input[name="phone"], input[placeholder*="Phone"], input[type="tel"]',
      'textarea[name="message"], textarea[placeholder*="Message"], textarea[id*="message"]'
    ];

    const cookieKeys = ['mw_form_name', 'mw_form_email', 'mw_form_phone', 'mw_form_message'];

    // Flatten selectors to find fields
    const allSelectors = fieldSelectors.join(', ');
    const fields = document.querySelectorAll(allSelectors);

    fields.forEach(field => {
      // Restore saved value
      const key = getFieldKey(field);
      if (key) {
        const saved = getCookie(key);
        if (saved && !field.value) field.value = saved;
      }

      // Save on input
      field.addEventListener('input', () => {
        const k = getFieldKey(field);
        if (k && field.value.trim()) setCookie(k, field.value.trim(), 7);
      });

      // Clear on successful form submit
      const form = field.closest('form');
      if (form) {
        form.addEventListener('submit', () => {
          cookieKeys.forEach(k => deleteCookie(k));
        });
      }
    });
  }

  function getFieldKey(field) {
    const type = field.type || field.tagName.toLowerCase();
    const hint = (field.name + field.id + field.placeholder).toLowerCase();
    if (hint.includes('name')) return 'mw_form_name';
    if (hint.includes('email')) return 'mw_form_email';
    if (hint.includes('phone') || hint.includes('tel')) return 'mw_form_phone';
    if (type === 'textarea' || hint.includes('message')) return 'mw_form_message';
    return null;
  }

  // 4. REFERRAL TRACKING — how they found you
  function trackReferral() {
    if (getCookie('mw_referral')) return; // already tracked this session
    const ref = document.referrer;
    let source = 'direct';
    if (ref) {
      if (ref.includes('google')) source = 'google';
      else if (ref.includes('facebook') || ref.includes('fb.')) source = 'facebook';
      else if (ref.includes('whatsapp')) source = 'whatsapp';
      else if (ref.includes('twitter') || ref.includes('x.com')) source = 'twitter';
      else if (ref.includes('instagram')) source = 'instagram';
      else source = new URL(ref).hostname;
    } else if (location.search.includes('utm_source')) {
      const params = new URLSearchParams(location.search);
      source = params.get('utm_source') || source;
    }
    setCookie('mw_referral', source, 30);
    setCookie('mw_referral_url', ref || 'direct', 30);
  }

  // ── BOOT ─────────────────────────────────────────
  // If already consented, run functional immediately
  if (hasConsent()) {
    initFunctional();
  } else {
    // Small delay so banner doesn't flash before page loads
    setTimeout(showBanner, 1200);
  }

})();
