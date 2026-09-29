document.addEventListener('DOMContentLoaded', () => {

  // 1. LIQUID GRADIENT SHIFT LOGIC (AUTO & MANUAL AURA)
  const lightPalettes = [
    { b1: '#c084fc', b2: '#818cf8', b3: '#2dd4bf' }, // Purple / Blue / Cyan
    { b1: '#f472b6', b2: '#fb923c', b3: '#fcd34d' }, // Pink / Orange / Yellow
    { b1: '#34d399', b2: '#3b82f6', b3: '#8b5cf6' }, // Green / Blue / Purple
    { b1: '#f43f5e', b2: '#8b5cf6', b3: '#0ea5e9' }  // Rose / Purple / Sky
  ];

  const darkPalettes = [
    { b1: '#4c1d95', b2: '#3730a3', b3: '#115e59' }, // Deep Purple / Indigo / Teal
    { b1: '#831843', b2: '#7c2d12', b3: '#713f12' }, // Deep Pink / Rust / Bronze
    { b1: '#064e3b', b2: '#1e3a8a', b3: '#4c1d95' }, // Deep Green / Navy / Violet
    { b1: '#881337', b2: '#4c1d95', b3: '#0c4a6e' }  // Deep Rose / Violet / Deep Sky
  ];

  let currentPaletteIndex = 0;
  let autoAuraTimer;

  function shiftLiquidGradient() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const activePalettes = isDark ? darkPalettes : lightPalettes;
    
    currentPaletteIndex = (currentPaletteIndex + 1) % activePalettes.length;
    const newColors = activePalettes[currentPaletteIndex];

    const root = document.documentElement;
    root.style.setProperty('--blob-1', newColors.b1);
    root.style.setProperty('--blob-2', newColors.b2);
    root.style.setProperty('--blob-3', newColors.b3);
  }

  // Auto Aura: Shift colors automatically every 8 seconds
  function startAutoAura() {
    clearInterval(autoAuraTimer);
    autoAuraTimer = setInterval(shiftLiquidGradient, 8000);
  }
  startAutoAura(); // Initialize on load

  // Manual Trigger: Click background empty space
  window.addEventListener('click', (e) => {
    if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.glass-panel')) {
      return; 
    }
    shiftLiquidGradient();
    startAutoAura(); // Reset the timer so it doesn't double-shift immediately
  });

  // Manual Trigger: Aura button
  document.querySelectorAll('.colorShiftBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); 
      shiftLiquidGradient();
      startAutoAura(); // Reset the timer
    });
  });


  // 2. THEME TOGGLE LOGIC
  const themeToggleBtns = document.querySelectorAll('.themeToggleBtn');
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcons('dark');
  }

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        updateThemeIcons('light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcons('dark');
      }
      
      // Reset color index to match new theme cleanly
      currentPaletteIndex = 0;
      const activePalettes = !isDark ? darkPalettes : lightPalettes; 
      document.documentElement.style.setProperty('--blob-1', activePalettes[0].b1);
      document.documentElement.style.setProperty('--blob-2', activePalettes[0].b2);
      document.documentElement.style.setProperty('--blob-3', activePalettes[0].b3);
      startAutoAura(); // Reset the timer
    });
  });

  function updateThemeIcons(theme) {
    themeToggleBtns.forEach(btn => {
      const icon = btn.querySelector('i');
      if(icon) {
        if (theme === 'dark') {
          icon.classList.replace('fa-moon', 'fa-sun');
        } else {
          icon.classList.replace('fa-sun', 'fa-moon');
        }
      }
    });
  }

  // 3. PRINT FUNCTIONALITY
  document.querySelectorAll('.printBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.print();
    });
  });

  // 4. TOP NAVIGATION SMOOTH SCROLLING
  const navLinks = document.querySelectorAll('.desktop-nav-links .nav-link');
  const sections = document.querySelectorAll('section');

  navLinks.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 100, // Account for top fixed nav height
          behavior: 'smooth'
        });
      }
    });
  });

  // Observer to update active navigation state
  const navObserverOptions = {
    root: null,
    rootMargin: '-120px 0px -60% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href').substring(1) === entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(sec => navObserver.observe(sec));

  // 5. SCROLL REVEAL (FADE IN UP)
  const revealElements = document.querySelectorAll('.reveal');
  const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('active');
      observer.unobserve(entry.target); 
    });
  }, revealOptions);

  revealElements.forEach(el => revealOnScroll.observe(el));
  
  // Trigger immediately for the hero section
  setTimeout(() => {
    document.querySelector('.hero-section.reveal')?.classList.add('active');
  }, 100);

  // 6. 3D TILT EFFECT FOR HERO SECTION (Desktop Only)
  const tiltElements = document.querySelectorAll('[data-tilt]');
  
  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 1024) return;
      
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;  
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -1.5; 
      const rotateY = ((x - centerX) / centerX) * 1.5;
      
      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      el.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
    });
    
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.1s ease';
    });
  });
});