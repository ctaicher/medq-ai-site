(() => {
  'use strict';
  const signals = {
    questions: { label: 'From your answers', title: 'Turn a missed question into a clear next step.', copy: 'Your answer choices help identify the specific concepts that need reinforcement. Related questions, reading, and videos give you a focused way forward.' },
    presentations: { label: 'From your presentations', title: 'Make feedback part of your learning path.', copy: 'Succinct feedback from resident–attending presentations helps surface recurring learning needs. Those insights connect to your profile and individualized education.' },
    bedside: { label: 'From bedside learning', title: 'Let clinical questions shape what comes next.', copy: 'Bedside Clinical Assist connects learning signals from clinical reasoning to your knowledge profile, helping guide the questions, articles, and videos you explore next.' }
  };
  document.querySelectorAll('[data-signal]').forEach(button => {
    button.addEventListener('click', () => {
      const signal = signals[button.dataset.signal];
      document.querySelectorAll('[data-signal]').forEach(item => {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      document.getElementById('signal-label').textContent = signal.label;
      document.getElementById('signal-title').textContent = signal.title;
      document.getElementById('signal-copy').textContent = signal.copy;
    });
  });
  const track = document.getElementById('video-track');
  const preview = document.getElementById('video-preview');
  const motion = document.getElementById('video-motion');
  const count = document.getElementById('video-count');
  const dots = [...document.querySelectorAll('[data-slide]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, paused = reducedMotion.matches, visible = false, timer;
  function render() {
    track.style.transform = `translateY(-${current * 100}%)`;
    count.textContent = `0${current + 1} / 03`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === current);
      dot.setAttribute('aria-pressed', String(index === current));
    });
    [...track.children].forEach((slide, index) => slide.setAttribute('aria-hidden', String(index !== current)));
  }
  function syncTimer() {
    window.clearInterval(timer);
    motion.textContent = paused ? 'Play preview' : 'Pause preview';
    motion.setAttribute('aria-pressed', String(paused));
    if (!paused && visible && !document.hidden) timer = window.setInterval(() => { current = (current + 1) % 3; render(); }, 4800);
  }
  function select(index, manual = true) {
    current = (index + 3) % 3;
    if (manual) paused = true;
    render(); syncTimer();
  }
  document.getElementById('video-prev').addEventListener('click', () => select(current - 1));
  document.getElementById('video-next').addEventListener('click', () => select(current + 1));
  motion.addEventListener('click', () => { paused = !paused; syncTimer(); });
  dots.forEach(dot => dot.addEventListener('click', () => select(Number(dot.dataset.slide))));
  preview.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); select(current + (event.key === 'ArrowDown' ? 1 : -1));
    }
  });
  let startY;
  preview.addEventListener('pointerdown', event => { startY = event.clientY; });
  preview.addEventListener('pointerup', event => {
    if (startY !== undefined && Math.abs(event.clientY - startY) > 35) select(current + (event.clientY < startY ? 1 : -1));
    startY = undefined;
  });
  preview.addEventListener('pointercancel', () => { startY = undefined; });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncTimer(); }, { threshold: .3 }).observe(preview);
  else visible = true;
  document.addEventListener('visibilitychange', syncTimer);
  reducedMotion.addEventListener('change', event => { if (event.matches) { paused = true; syncTimer(); } });
  render(); syncTimer();
})();
