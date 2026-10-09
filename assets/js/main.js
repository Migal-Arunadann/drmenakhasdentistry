/**
 * Dr Menakha's Dentistry - Main Interactivity & Motion Controller
 * Lightweight, vanilla JavaScript, accessible, zero dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initScrollReveals();
  initClinicStatus();
});

/**
 * 1. Header scroll state
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * 2. Mobile drawer navigation
 */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.mobile-drawer-backdrop');
  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // Close on link click
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/**
 * 3. Restrained scroll reveals via IntersectionObserver
 */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) return;

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 4. Real-time clinic open/closed status in IST (Indian Standard Time)
 * Hours: Mon-Sat 5:00 PM - 9:30 PM (17:00 - 21:30), Sunday Closed.
 */
function initClinicStatus() {
  const statusBadges = document.querySelectorAll('[data-clinic-status]');
  const hoursTable = document.querySelector('.hours-table');

  // Compute Indian Standard Time (UTC + 5:30)
  const now = new Date();
  const utcMinutes = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcMinutes + (3600000 * 5.5));

  const dayOfWeek = istTime.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const totalMinutes = (hours * 60) + minutes;

  const openMinutes = (17 * 60);      // 5:00 PM = 1020 mins
  const closeMinutes = (21 * 60) + 30; // 9:30 PM = 1290 mins

  let isOpen = false;
  let statusText = '';

  if (dayOfWeek === 0) {
    // Sunday: Closed
    isOpen = false;
    statusText = 'Closed Today (Sunday) · Opens Monday at 5:00 PM';
  } else {
    // Monday - Saturday
    if (totalMinutes >= openMinutes && totalMinutes < closeMinutes) {
      isOpen = true;
      const remainingMinutes = closeMinutes - totalMinutes;
      const remHours = Math.floor(remainingMinutes / 60);
      const remMins = remainingMinutes % 60;
      const timeRemaining = remHours > 0 ? `${remHours}h ${remMins}m` : `${remMins}m`;
      statusText = `Currently Open · Consultation Hours until 9:30 PM (${timeRemaining} left)`;
    } else if (totalMinutes < openMinutes) {
      isOpen = false;
      const minutesUntilOpen = openMinutes - totalMinutes;
      const waitHours = Math.floor(minutesUntilOpen / 60);
      const waitMins = minutesUntilOpen % 60;
      statusText = `Opens Today at 5:00 PM (${waitHours}h ${waitMins}m)`;
    } else {
      isOpen = false;
      if (dayOfWeek === 6) {
        statusText = 'Closed for the night · Opens Monday at 5:00 PM';
      } else {
        statusText = 'Closed for the night · Opens Tomorrow at 5:00 PM';
      }
    }
  }

  statusBadges.forEach(badge => {
    badge.innerHTML = `
      <span class="status-dot"></span>
      <span class="status-label">${statusText}</span>
    `;
    badge.className = `status-badge ${isOpen ? 'is-open' : 'is-closed'}`;
  });

  // Highlight today in table if present
  if (hoursTable) {
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = daysMap[dayOfWeek];
    const rows = hoursTable.querySelectorAll('tr');
    rows.forEach(row => {
      const dayCell = row.querySelector('.day');
      if (dayCell && dayCell.textContent.trim().toLowerCase() === currentDayName.toLowerCase()) {
        row.classList.add('today');
        const timeCell = row.querySelector('.time');
        if (timeCell && !timeCell.querySelector('.today-indicator')) {
          const tag = document.createElement('span');
          tag.className = 'today-indicator';
          tag.style.cssText = 'font-size: 0.72rem; margin-left: 0.5rem; color: var(--color-gold-600); text-transform: uppercase; font-weight: 700;';
          tag.textContent = '(Today)';
          timeCell.appendChild(tag);
        }
      }
    });
  }
}


