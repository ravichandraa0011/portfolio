document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.intro-loader');
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
  window.setTimeout(() => loader?.remove(), 1100);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => header?.classList.toggle('is-sticky', window.scrollY > 30), { passive: true });

  // Give mouse-wheel input a long, gentle glide. Touch scrolling remains native.
  if (window.matchMedia('(pointer: fine)').matches) {
    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;
    let scrollFrame = 0;
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
    const easeScroll = () => {
      currentScroll += (targetScroll - currentScroll) * .075;
      if (Math.abs(targetScroll - currentScroll) < .35) currentScroll = targetScroll;
      window.scrollTo(0, currentScroll);
      scrollFrame = currentScroll === targetScroll ? 0 : requestAnimationFrame(easeScroll);
    };
    window.addEventListener('wheel', (event) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      targetScroll = Math.max(0, Math.min(maxScroll(), targetScroll + event.deltaY * .64));
      if (!scrollFrame) scrollFrame = requestAnimationFrame(easeScroll);
    }, { passive: false });
    window.addEventListener('scroll', () => {
      if (!scrollFrame) targetScroll = currentScroll = window.scrollY;
    }, { passive: true });
  }

  const panels = [...document.querySelectorAll('.motion-panel')].map((panel) => ({
    panel,
    current: panel.classList.contains('hero-panel') ? 1 : 0,
    target: panel.classList.contains('hero-panel') ? 1 : 0,
  }));
  let queued = false;
  let animating = false;
  const measurePanels = () => {
    const height = window.innerHeight;
    panels.forEach((state) => {
      const { panel } = state;
      const box = panel.getBoundingClientRect();
      // Deliberately exaggerated so cards visibly travel from the page
      // towards the viewer, as in the reference recording.
      const enter = Math.max(0, Math.min(1, (height * 1.04 - box.top) / (height * .84)));
      const exit = Math.max(0, Math.min(1, (height * .18 - box.bottom) / (height * .48)));
      state.target = enter * (1 - exit * .7);
    });
    queued = false;
  };
  const animatePanels = () => {
    let needsAnotherFrame = false;
    panels.forEach((state) => {
      state.current += (state.target - state.current) * .045;
      if (Math.abs(state.target - state.current) > .001) needsAnotherFrame = true;
      const scale = .52 + state.current * .48;
      const y = (1 - state.current) * 145;
      state.panel.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      state.panel.style.opacity = .1 + state.current * .9;
    });
    if (needsAnotherFrame) requestAnimationFrame(animatePanels);
    else animating = false;
  };
  const queueMotion = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      measurePanels();
      if (!animating) {
        animating = true;
        requestAnimationFrame(animatePanels);
      }
    });
  };
  window.addEventListener('scroll', queueMotion, { passive: true });
  window.addEventListener('resize', queueMotion, { passive: true });
  queueMotion();
});
