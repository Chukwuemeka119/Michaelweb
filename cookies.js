// ═══════════════════════════════════════════════════
//  MICHAEL WEB™ — Cookie + Firebase Tracking System
//  Drop this script at the bottom of your <body>
// ═══════════════════════════════════════════════════

// Firebase config — same as your POS system
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, get, set, increment, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAF7q176rxAoCFqhH0Djquhu0MphaUMLyQ",
  authDomain: "pos-store-29e58.firebaseapp.com",
  databaseURL: "https://pos-store-29e58-default-rtdb.firebaseio.com",
  projectId: "pos-store-29e58",
  storageBucket: "pos-store-29e58.firebasestorage.app",
  messagingSenderId: "494046387333",
  appId: "1:494046387333:web:44ef67eeac8e40e4f19dec"
};

const app = initializeApp(firebaseConfig, "analytics");
const db  = getDatabase(app);

// ── Wait for DOM ──────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

  // ── HELPERS ────────────────────────────────────
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

  // Generate or retrieve a unique visitor ID stored in a cookie
  function getVisitorId() {
    let id = getCookie('mw_vid');
    if (!id) {
      id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setCookie('mw_vid', id, 365);
    }
    return id;
  }

  const hasConsent = () => getCookie('mw_consent') === 'true';

  // ── INJECT STYLES ──────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #mw-cookie-banner {
      position: fixed; bottom: 24px; left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      width: min(560px, calc(100vw - 32px));
      background: #131508;
      border: 1px solid #2a2e18;
      border-radius: 16px;
      padding: 24px 28px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.6);
      display: flex; flex-direction: column; gap: 16px;
      animation: mw-slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both;
      font-family: 'Barlow', sans-serif;
    }
    #mw-cookie-banner.mw-hide { animation: mw-slide-down 0.3s ease both; }
    @keyframes mw-slide-up {
      from { opacity:0; transform: translateX(-50%) translateY(24px); }
      to   { opacity:1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes mw-slide-down {
      from { opacity:1; transform: translateX(-50%) translateY(0); }
      to   { opacity:0; transform: translateX(-50%) translateY(24px); }
    }
    .mw-cookie-top { display:flex; align-items:flex-start; gap:14px; }
    .mw-cookie-icon { font-size:1.4rem; flex-shrink:0; margin-top:2px; }
    .mw-cookie-title {
      font-family:'Barlow Condensed',sans-serif;
      font-size:1rem; font-weight:800; letter-spacing:0.05em;
      text-transform:uppercase; color:#f0f2e8; margin-bottom:4px;
    }
    .mw-cookie-text { font-size:0.78rem; color:#6a6e52; line-height:1.6; }
    .mw-cookie-text a { color:#d4f500; text-decoration:none; }
    .mw-cookie-btns { display:flex; gap:10px; }
    .mw-btn-accept {
      flex:1; font-family:'Barlow Condensed',sans-serif;
      font-size:0.82rem; font-weight:800; letter-spacing:0.1em;
      text-transform:uppercase; background:#d4f500; color:#000;
      border:none; padding:11px 20px; border-radius:8px; cursor:pointer;
      transition:background 0.2s, transform 0.15s;
    }
    .mw-btn-accept:hover { background:#fff; transform:translateY(-1px); }
    .mw-btn-decline {
      font-family:'Barlow Condensed',sans-serif;
      font-size:0.82rem; font-weight:700; letter-spacing:0.08em;
      text-transform:uppercase; background:transparent; color:#4a4e38;
      border:1px solid #2a2e18; padding:11px 18px; border-radius:8px; cursor:pointer;
      transition:border-color 0.2s, color 0.2s;
    }
    .mw-btn-decline:hover { border-color:#d4f500; color:#d4f500; }

    #mw-welcome-toast {
      position:fixed; top:24px; right:24px; z-index:99998;
      background:#131508; border:1px solid rgba(212,245,0,0.25);
      border-radius:12px; padding:14px 36px 14px 18px;
      display:flex; align-items:center; gap:12px;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
      animation:mw-toast-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
      font-family:'Barlow',sans-serif; max-width:280px;
    }
    #mw-welcome-toast.mw-hide { animation:mw-toast-out 0.3s ease both; }
    @keyframes mw-toast-in  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
    @keyframes mw-toast-out { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(20px)} }
    .mw-toast-icon { font-size:1.2rem; flex-shrink:0; }
    .mw-toast-title {
      font-family:'Barlow Condensed',sans-serif; font-size:0.9rem;
      font-weight:800; text-transform:uppercase; letter-spacing:0.05em;
      color:#d4f500; margin-bottom:2px;
    }
    .mw-toast-sub { font-size:0.72rem; color:#6a6e52; line-height:1.4; }
    .mw-toast-close {
      position:absolute; top:8px; right:10px;
      background:none; border:none; color:#3a3e28;
      font-size:0.8rem; cursor:pointer; line-height:1;
    }
    .mw-toast-close:hover { color:#d4f500; }
  `;
  document.head.appendChild(style);

  // ── BANNER ─────────────────────────────────────
  function showBanner() {
    if (getCookie('mw_consent')) return;
    const banner = document.createElement('div');
    banner.id = 'mw-cookie-banner';
    banner.innerHTML = `
      <div class="mw-cookie-top">
        <div class="mw-cookie-icon">🍪</div>
        <div>
          <div class="mw-cookie-title">This site uses cookies</div>
          <p class="mw-cookie-text">
            Michael Web™ uses cookies to remember your preferences and save your
            contact form so you never lose it. No data is sold or shared.
          </p>
        </div>
      </div>
      <div class="mw-cookie-btns">
        <button class="mw-btn-accept" id="mw-accept-btn">✓ Accept All</button>
        <button class="mw-btn-decline" id="mw-decline-btn">Decline</button>
      </div>`;
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

  // ── FUNCTIONAL ─────────────────────────────────
  function initFunctional() {
    logVisitToFirebase();
    trackSection();
    saveFormData();
  }

  // ── FIREBASE VISIT LOG ─────────────────────────
  async function logVisitToFirebase() {
    const vid     = getVisitorId();
    const now     = new Date();
    const nowStr  = now.toISOString();
    const today   = now.toLocaleDateString('en-GB');

    // Referral source
    let source = 'direct';
    const ref_ = document.referrer;
    if (ref_) {
      if (ref_.includes('google'))                      source = 'google';
      else if (ref_.includes('facebook')||ref_.includes('fb.')) source = 'facebook';
      else if (ref_.includes('whatsapp'))               source = 'whatsapp';
      else if (ref_.includes('twitter')||ref_.includes('x.com')) source = 'twitter';
      else if (ref_.includes('instagram'))              source = 'instagram';
      else { try { source = new URL(ref_).hostname; } catch(e){} }
    }
    const params = new URLSearchParams(location.search);
    if (params.get('utm_source')) source = params.get('utm_source');

    // Check if returning visitor
    const visitorRef = ref(db, `analytics/visitors/${vid}`);
    const snap = await get(visitorRef);
    const isReturning = snap.exists();
    const totalVisits = isReturning ? (snap.val().visits || 0) + 1 : 1;

    // Update visitor record
    await set(visitorRef, {
      vid,
      visits: totalVisits,
      lastSeen: nowStr,
      firstSeen: isReturning ? snap.val().firstSeen : nowStr,
      source,
      referrerUrl: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenW: window.screen.width,
      screenH: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      page: location.pathname,
    });

    // Log this session as a pageview
    push(ref(db, 'analytics/pageviews'), {
      vid,
      timestamp: nowStr,
      source,
      page: location.pathname,
      returning: isReturning,
    });

    // Increment daily counter
    const dayKey = today.replace(/\//g, '-');
    set(ref(db, `analytics/daily/${dayKey}/visits`), increment(1));
    set(ref(db, `analytics/daily/${dayKey}/date`), today);

    // Increment source counter
    set(ref(db, `analytics/sources/${source}`), increment(1));

    // Save referral to cookie for fast reads
    setCookie('mw_referral', source, 30);
    setCookie('mw_visits', totalVisits, 365);
    setCookie('mw_last_visit', today, 365);

    // Show welcome back toast if returning
    if (isReturning) showWelcomeToast(totalVisits, snap.val().lastSeen);
  }

  // ── WELCOME TOAST ──────────────────────────────
  function showWelcomeToast(visitCount, lastSeenISO) {
    const lastDate = lastSeenISO
      ? new Date(lastSeenISO).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })
      : 'recently';

    const toast = document.createElement('div');
    toast.id = 'mw-welcome-toast';
    toast.innerHTML = `
      <button class="mw-toast-close" id="mw-toast-close">✕</button>
      <div class="mw-toast-icon">👋</div>
      <div>
        <div class="mw-toast-title">Welcome back!</div>
        <div class="mw-toast-sub">Visit #${visitCount} · Last seen ${lastDate}</div>
      </div>`;
    document.body.appendChild(toast);

    document.getElementById('mw-toast-close').addEventListener('click', () => {
      toast.classList.add('mw-hide');
      setTimeout(() => toast.remove(), 350);
    });
    setTimeout(() => {
      if (document.getElementById('mw-welcome-toast')) {
        toast.classList.add('mw-hide');
        setTimeout(() => toast.remove(), 350);
      }
    }, 5000);
  }

  // ── SECTION TRACKING ───────────────────────────
  function trackSection() {
    const vid = getVisitorId();
    const sections = document.querySelectorAll('section[id], div[id]');
    if (!sections.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setCookie('mw_last_section', e.target.id, 30);
          // Update in Firebase
          const visitorRef = ref(db, `analytics/visitors/${vid}/lastSection`);
          set(visitorRef, e.target.id);
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => obs.observe(s));
  }

  // ── FORM DATA SAVER ────────────────────────────
  function saveFormData() {
    const vid = getVisitorId();
    const fields = document.querySelectorAll(
      'input[placeholder*="Name"], input[id*="name"], ' +
      'input[type="email"], input[placeholder*="Email"], ' +
      'input[type="tel"], input[placeholder*="Phone"], ' +
      'textarea'
    );

    fields.forEach(field => {
      // Restore saved value from cookie
      const key = getFieldKey(field);
      if (key) {
        const saved = getCookie(key);
        if (saved && !field.value) field.value = saved;
      }

      field.addEventListener('input', () => {
        const k = getFieldKey(field);
        if (k && field.value.trim()) {
          setCookie(k, field.value.trim(), 7);
          // Save partial form to Firebase too
          set(ref(db, `analytics/visitors/${vid}/formData/${k.replace('mw_form_','')}`), field.value.trim());
        }
      });

      // Clear on submit
      const form = field.closest('form');
      if (form) {
        form.addEventListener('submit', () => {
          ['mw_form_name','mw_form_email','mw_form_phone','mw_form_message'].forEach(k => deleteCookie(k));
          set(ref(db, `analytics/visitors/${vid}/formData`), null);
        });
      }
    });
  }

  function getFieldKey(field) {
    const hint = (field.name + field.id + field.placeholder).toLowerCase();
    if (hint.includes('name'))    return 'mw_form_name';
    if (hint.includes('email'))   return 'mw_form_email';
    if (hint.includes('phone') || hint.includes('tel')) return 'mw_form_phone';
    if (field.tagName === 'TEXTAREA' || hint.includes('message')) return 'mw_form_message';
    return null;
  }

  // ── BOOT ───────────────────────────────────────
  if (hasConsent()) {
    initFunctional();
  } else {
    setTimeout(showBanner, 1200);
  }

}); // end DOMContentLoaded
