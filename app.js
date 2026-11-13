/**
 * Youthinity - Interactive Application Engine
 * Handles cohort filtering, salary calculator, FAQ accordion, modals, and metric counters
 */

function initApp() {
  initMobileMenu();
  initCohortFilter();
  initSalaryCalculator();
  initFaqAccordion();
  initMetricCounters();
  initModals();
  initLucide();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Re-initialize Lucide icons safely
function initLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 1. Mobile Menu with ARIA and Escape Handling
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  if (!menuBtn || !mobileMenu) return;

  function toggleMenu(show) {
    const isExpanded = show ?? (mobileMenu.getAttribute('aria-hidden') === 'true');
    mobileMenu.setAttribute('aria-hidden', !isExpanded);
    menuBtn.setAttribute('aria-expanded', isExpanded);
    if (isExpanded) {
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  menuBtn.addEventListener('click', () => toggleMenu(true));
  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleMenu(false));
  }

  // Close on navigation link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      toggleMenu(false);
      menuBtn.focus();
    }
  });
}

// 2. Cohort Filtering
function initCohortFilter() {
  const filterBtns = document.querySelectorAll('.cohort-filter-btn');
  const cards = document.querySelectorAll('.cohort-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-filter');

      // Update button active state
      filterBtns.forEach(b => {
        b.classList.remove('bg-orange-500', 'text-white', 'border-orange-500');
        b.classList.add('text-slate-400', 'border-white/10');
      });
      btn.classList.add('bg-orange-500', 'text-white', 'border-orange-500');
      btn.classList.remove('text-slate-400', 'border-white/10');

      // Filter cards
      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });
}

// 3. Interactive Career & Salary Pathway Calculator
function initSalaryCalculator() {
  const yearSelect = document.getElementById('calc-year');
  const trackSelect = document.getElementById('calc-track');
  const goalSelect = document.getElementById('calc-goal');

  const resultLpa = document.getElementById('calc-result-lpa');
  const resultDuration = document.getElementById('calc-result-duration');
  const resultHiring = document.getElementById('calc-result-hiring');
  const resultRecommended = document.getElementById('calc-result-recommended');

  if (!yearSelect || !trackSelect || !goalSelect) return;

  const pathways = {
    tech: {
      lpa: "₹8.5 - ₹18.0 LPA",
      duration: "12 Weeks (Part-time)",
      hiring: "Razorpay, Zomato, CRED, Swiggy",
      course: "Full-Stack AI Engineering & System Design"
    },
    design: {
      lpa: "₹7.0 - ₹14.5 LPA",
      duration: "8 Weeks (Hands-on)",
      hiring: "Schbang, Paytm, Unacademy, Meesho",
      course: "Product Design (UI/UX) & Design Systems"
    },
    finance: {
      lpa: "₹9.0 - ₹19.5 LPA",
      duration: "10 Weeks (Cohort)",
      hiring: "Deloitte, EY, PwC, D.E. Shaw, KPMG",
      course: "Financial Modeling & Valuation Masterclass"
    },
    marketing: {
      lpa: "₹6.5 - ₹13.0 LPA",
      duration: "6 Weeks (Live Projects)",
      hiring: "Dentsu, Ogilvy, Boat, Mamaearth",
      course: "Performance Marketing & Brand Growth Engine"
    },
    speaking: {
      lpa: "₹7.5 - ₹15.0 LPA",
      duration: "6 Weeks (Intensive)",
      hiring: "BCG, McKinsey (Analyst), Top Startups",
      course: "Executive Presence, Case Prep & Public Speaking"
    }
  };

  function updateCalculation() {
    const track = trackSelect.value;
    const data = pathways[track] || pathways.tech;

    if (resultLpa) resultLpa.innerText = data.lpa;
    if (resultDuration) resultDuration.innerText = data.duration;
    if (resultHiring) resultHiring.innerText = data.hiring;
    if (resultRecommended) resultRecommended.innerText = data.course;
  }

  yearSelect.addEventListener('change', updateCalculation);
  trackSelect.addEventListener('change', updateCalculation);
  goalSelect.addEventListener('change', updateCalculation);
}

// 4. FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const button = item.querySelector('.faq-button');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (!button || !content) return;

    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach(other => {
        const otherBtn = other.querySelector('.faq-button');
        const otherContent = other.querySelector('.faq-content');
        const otherIcon = other.querySelector('.faq-icon');
        if (otherBtn && otherContent) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherContent.classList.add('hidden');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle current
      if (!isExpanded) {
        button.setAttribute('aria-expanded', 'true');
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

// 5. Metric Counters on Scroll
function initMetricCounters() {
  const counters = document.querySelectorAll('.metric-counter');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const prefix = counter.getAttribute('data-prefix') || '';
          const suffix = counter.getAttribute('data-suffix') || '';
          const isDecimal = target % 1 !== 0;
          let current = 0;
          const step = target / 40;

          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            counter.innerText = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
          }, 30);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsSection = document.getElementById('impact-metrics');
  if (metricsSection) {
    observer.observe(metricsSection);
  }
}

// 6. Modal Engine & Notifications
function initModals() {
  const applyModal = document.getElementById('apply-modal');
  const modalClose = document.getElementById('modal-close');
  const applyBtns = document.querySelectorAll('.trigger-apply-modal');
  const form = document.getElementById('apply-form');
  const toast = document.getElementById('toast');

  function openModal(courseTitle = "General Student Community") {
    if (!applyModal) return;
    const input = document.getElementById('modal-course-input');
    if (input) input.value = courseTitle;
    applyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!applyModal) return;
    applyModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  applyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const course = btn.getAttribute('data-course-name') || "Youthinity Fellowship 2026";
      openModal(course);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (applyModal) {
    applyModal.addEventListener('click', (e) => {
      if (e.target === applyModal) closeModal();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('student-name').value;
      closeModal();
      showToast(`🎉 Congratulations ${name}! Your application is submitted. Our student mentor will reach out on WhatsApp within 2 hours.`);
      form.reset();
    });
  }

  // Newsletter / Community footer form
  const communityForm = document.getElementById('community-signup-form');
  if (communityForm) {
    communityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = communityForm.querySelector('input[type="email"]').value;
      showToast(`✅ Welcome to Youthinity! We just sent the Discord & WhatsApp community invite link to ${email}.`);
      communityForm.reset();
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.innerText = message;
  toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
  }, 4800);
}
