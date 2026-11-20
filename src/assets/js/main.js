(() => {
  const d = document;

  // Sticky header shadow
  const header = d.querySelector('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav
  const toggle = d.querySelector('[data-nav-toggle]');
  const nav = d.querySelector('[data-nav]');
  if (toggle && nav) {
    const set = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      d.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (m) => m.matches && set(false));
  }

  // Reveal on scroll
  const items = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && items.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  // Footer year
  d.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Enrollment form
  const form = d.querySelector('[data-enroll-form]');
  if (!form) return;
  const status = form.querySelector('[data-status]');
  const btn = form.querySelector('button[type="submit"]');
  const cfg = window.GMS || {};

  const show = (type, msg) => { status.className = `form-status ${type}`; status.textContent = msg; status.focus(); };

  const toText = (fd) => {
    const get = (k) => fd.getAll(k).filter(Boolean).join(', ') || '—';
    return [
      `Parent/guardian: ${get('parent_name')}`,
      `Email: ${get('email')}`,
      `Phone: ${get('phone')}`,
      `Child's first name: ${get('child_name')}`,
      `Grade: ${get('grade')}`,
      `Subjects: ${get('subjects')}`,
      `Format: ${get('format')}`,
      `Preferred days: ${get('days')}`,
      '',
      'Notes:',
      get('message'),
    ].join('\n');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    if (fd.get('company')) return; // honeypot

    if (!cfg.endpoint) {
      const subject = `Enrollment inquiry — ${fd.get('child_name') || 'new scholar'} (${fd.get('grade') || 'grade'})`;
      window.location.href = `mailto:${cfg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(toText(fd))}`;
      show('ok', 'Your email app should open with your inquiry filled in — just press send. If it didn\'t open, please call or email us directly.');
      return;
    }

    btn.disabled = true;
    const label = btn.innerHTML;
    btn.textContent = 'Sending…';
    try {
      fd.append('_subject', `Enrollment inquiry — ${fd.get('child_name') || 'new scholar'}`);
      const res = await fetch(cfg.endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      show('ok', 'Thank you! Your inquiry has been received. Mrs. Bonnick will contact you about scheduling and availability.');
    } catch (err) {
      show('err', `Sorry, something went wrong sending your inquiry. Please call ${'(770) 648-3356'} or email ${cfg.email}.`);
    } finally {
      btn.disabled = false;
      btn.innerHTML = label;
    }
  });
})();
