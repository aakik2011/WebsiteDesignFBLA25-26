// MathFlow - Shared JavaScript functionality

// ============================================
// Theme Management
// ============================================
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const storedTheme = localStorage.getItem('mf_theme') || 'light';
  setTheme(storedTheme);

  if (themeToggle && !themeToggle.dataset.mfInited) {
    themeToggle.dataset.mfInited = '1';
    themeToggle.addEventListener('click', () => {
      const next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }
}

function setTheme(t) {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  body.setAttribute('data-theme', t);

  if (t === 'dark') {
    body.classList.add('dark');
    document.documentElement.classList.add('dark');
    if (themeIcon) {
      themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />';
    }
    if (themeToggle) themeToggle.setAttribute('aria-pressed', 'true');
  } else {
    body.classList.remove('dark');
    document.documentElement.classList.remove('dark');
    if (themeIcon) {
      themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.66-10.66h-1M4.34 12.34h-1M18.36 18.36l-.7-.7M6.34 6.34l-.7-.7M18.36 5.64l-.7.7M6.34 17.66l-.7.7M12 8a4 4 0 100 8 4 4 0 000-8z" />';
    }
    if (themeToggle) themeToggle.setAttribute('aria-pressed', 'false');
  }
  localStorage.setItem('mf_theme', t);
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'success', duration = 3000) {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto-remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenuBtn = document.getElementById('closeMobileMenu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('open');
    });
  }

  if (closeMenuBtn && mobileMenu) {
    closeMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  }

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu) {
      mobileMenu.classList.remove('open');
    }
  });
}

// ============================================
// Notification Badge
// ============================================
function updateNotificationBadge(count) {
  const badge = document.getElementById('notifBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

// ============================================
// User State Management
// ============================================
const userState = {
  name: localStorage.getItem('mf_userName') || 'Alex',
  email: localStorage.getItem('mf_userEmail') || 'alex@mathflow.edu',
  notifications: JSON.parse(localStorage.getItem('mf_notifications') || '[]'),
  registeredSessions: new Set(JSON.parse(localStorage.getItem('mf_registered') || '[]')),
  completedLessons: JSON.parse(localStorage.getItem('mf_completedLessons') || '[]'),
  savedResources: JSON.parse(localStorage.getItem('mf_savedResources') || '[]'),
  progress: JSON.parse(localStorage.getItem('mf_progress') || '{"algebra": 75, "geometry": 45, "precalc": 30}')
};

function saveUserState() {
  localStorage.setItem('mf_userName', userState.name);
  localStorage.setItem('mf_userEmail', userState.email);
  localStorage.setItem('mf_notifications', JSON.stringify(userState.notifications));
  localStorage.setItem('mf_registered', JSON.stringify(Array.from(userState.registeredSessions)));
  localStorage.setItem('mf_completedLessons', JSON.stringify(userState.completedLessons));
  localStorage.setItem('mf_savedResources', JSON.stringify(userState.savedResources));
  localStorage.setItem('mf_progress', JSON.stringify(userState.progress));
}

// ============================================
// Date/Time Utilities
// ============================================
function formatDate(date, options = {}) {
  const defaultOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  };
  return new Date(date).toLocaleString(undefined, { ...defaultOptions, ...options });
}

function addDays(days, baseDate = new Date()) {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
}

function isToday(date) {
  const today = new Date();
  const check = new Date(date);
  return today.toDateString() === check.toDateString();
}

function getRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diff = target - now;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (diff < 0) return 'Past';
  if (minutes < 60) return `In ${minutes}m`;
  if (hours < 24) return `In ${hours}h`;
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

// ============================================
// Session Management
// ============================================
function getUpcomingSessions() {
  return JSON.parse(localStorage.getItem('mf_sessions') || '[]')
    .filter(s => new Date(s.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function registerForSession(sessionId) {
  userState.registeredSessions.add(sessionId);
  saveUserState();
  showToast('Successfully registered for session!');
}

function unregisterFromSession(sessionId) {
  userState.registeredSessions.delete(sessionId);
  saveUserState();
  showToast('Unregistered from session', 'info');
}

function isRegisteredForSession(sessionId) {
  return userState.registeredSessions.has(sessionId);
}

// ============================================
// Progress Tracking
// ============================================
function updateProgress(subject, percent) {
  userState.progress[subject] = Math.min(100, Math.max(0, percent));
  saveUserState();
}

function getOverallProgress() {
  const values = Object.values(userState.progress);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function markLessonComplete(lessonId) {
  if (!userState.completedLessons.includes(lessonId)) {
    userState.completedLessons.push(lessonId);
    saveUserState();
    showToast('Lesson completed!');
  }
}

// ============================================
// Search Functionality
// ============================================
function initSearch() {
  const searchInput = document.getElementById('globalSearch');
  const searchResults = document.getElementById('searchResults');

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', debounce((e) => {
      const query = e.target.value.toLowerCase().trim();
      if (query.length < 2) {
        searchResults.classList.add('hidden');
        return;
      }

      // Search through available content
      const results = performSearch(query);
      displaySearchResults(results, searchResults);
    }, 300));

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
      }
    });
  }
}

function performSearch(query) {
  // This would typically search through your data
  const searchableItems = [
    { title: 'Algebra Basics', type: 'lesson', url: 'learn.html#algebra' },
    { title: 'Geometry Fundamentals', type: 'lesson', url: 'learn.html#geometry' },
    { title: 'Pre-Calculus Introduction', type: 'lesson', url: 'learn.html#precalc' },
    { title: 'Study Schedule', type: 'page', url: 'schedule.html' },
    { title: 'Learning Resources', type: 'page', url: 'resources.html' },
    { title: 'Community Forum', type: 'page', url: 'community.html' }
  ];

  return searchableItems.filter(item =>
    item.title.toLowerCase().includes(query)
  );
}

function displaySearchResults(results, container) {
  if (results.length === 0) {
    container.innerHTML = '<div class="p-4 text-gray-500">No results found</div>';
  } else {
    container.innerHTML = results.map(r => `
      <a href="${r.url}" class="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 list-item-interactive">
        <div class="font-medium">${r.title}</div>
        <div class="text-xs text-gray-500 capitalize">${r.type}</div>
      </a>
    `).join('');
  }
  container.classList.remove('hidden');
}

// ============================================
// Activity Logging
// ============================================
const ACTIVITY_ICONS = {
  time:      { emoji: '⏱', color: 'primary' },
  session:   { emoji: '📚', color: 'accent' },
  points:    { emoji: '⭐', color: 'warning' },
  streak:    { emoji: '🔥', color: 'warning' },
  lesson:    { emoji: '✅', color: 'success' },
  resource:  { emoji: '📄', color: 'secondary' },
  community: { emoji: '💬', color: 'primary' },
  profile:   { emoji: '👤', color: 'secondary' },
  music:     { emoji: '🎵', color: 'accent' },
  default:   { emoji: '📌', color: 'primary' }
};

function logActivity(type, text) {
  const MAX_ITEMS = 30;
  const existing = JSON.parse(localStorage.getItem('mf_activity') || '[]');
  const entry = {
    id: Date.now(),
    type: type || 'default',
    text,
    timestamp: new Date().toISOString()
  };
  const updated = [entry, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem('mf_activity', JSON.stringify(updated));
  // Dispatch event for same-tab listeners
  window.dispatchEvent(new CustomEvent('mf_activity_updated', { detail: updated }));
}

function getActivityMeta(type) {
  return ACTIVITY_ICONS[type] || ACTIVITY_ICONS.default;
}

function timeAgo(isoString) {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

// ============================================
// Utility Functions
// ============================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// Animation Helpers
// ============================================
function animateProgressBar(element, targetPercent, duration = 800) {
  element.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  element.style.width = targetPercent + '%';
}

function animateProgressRing(circle, percent, circumference) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

function animateCounter(element, target, duration = 1000) {
  const start = parseInt(element.textContent) || 0;
  const increment = (target - start) / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current);
    }
  }, 16);
}

// ============================================
// Mobile Navigation (hamburger dropdown)
// ============================================
function injectMobileNav() {
  const header = document.querySelector('header');
  if (!header) return;

  const desktopNav = header.querySelector('nav[aria-label="Primary"]');
  if (!desktopNav) return;

  // Collect links from the desktop nav
  const links = [...desktopNav.querySelectorAll('a')].map(a => ({
    href: a.getAttribute('href'),
    text: a.textContent.trim(),
    active: a.classList.contains('text-primary') || a.classList.contains('bg-gray-100') || a.classList.contains('bg-gray-800')
  }));
  if (links.length === 0) return;

  // Find the flex row and its right-side container
  const flexRow = header.querySelector('.flex.h-16');
  if (!flexRow) return;
  const rightDiv = flexRow.lastElementChild;

  // Create hamburger button
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.id = 'mobileMenuBtn';
  hamburger.className = 'md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition';
  hamburger.setAttribute('aria-label', 'Toggle navigation menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
  </svg>`;
  rightDiv.insertBefore(hamburger, rightDiv.firstChild);

  // Create dropdown appended inside the inner container (below the flex row)
  const innerContainer = header.querySelector('.max-w-7xl');
  if (!innerContainer) return;

  const mobileMenu = document.createElement('div');
  mobileMenu.id = 'mobileDropdown';
  mobileMenu.className = 'md:hidden border-t border-gray-100 dark:border-gray-800 pb-2 pt-1';
  mobileMenu.style.display = 'none';
  mobileMenu.innerHTML = `<nav class="px-1 space-y-0.5" aria-label="Mobile navigation">
    ${links.map(link => `
      <a href="${link.href}" class="block px-4 py-2.5 text-sm font-medium rounded-lg transition ${link.active ? 'bg-gray-100 dark:bg-gray-800 text-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary'}">
        ${link.text}
      </a>`).join('')}
  </nav>`;
  innerContainer.appendChild(mobileMenu);

  // Toggle
  let open = false;
  const svgPath = hamburger.querySelector('path');

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    open = !open;
    mobileMenu.style.display = open ? 'block' : 'none';
    hamburger.setAttribute('aria-expanded', open.toString());
    svgPath.setAttribute('d', open
      ? 'M6 18L18 6M6 6l12 12'
      : 'M4 6h16M4 12h16M4 18h16');
  });

  // Close on outside click
  document.addEventListener('click', () => {
    if (open) {
      open = false;
      mobileMenu.style.display = 'none';
      hamburger.setAttribute('aria-expanded', 'false');
      svgPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    }
  });
}

// ============================================
// Navigation Highlight
// ============================================
function highlightCurrentNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-primary');
    }
  });
}

// ============================================
// Initialize on DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initSearch();
  highlightCurrentNav();
  injectMobileNav();

  // Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Initialize student name display
  const nameEl = document.getElementById('studentName');
  if (nameEl) {
    nameEl.textContent = userState.name;
  }
});
