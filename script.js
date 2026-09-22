const videos = [...document.querySelectorAll('video')];
videos.forEach(video => {
  video.addEventListener('play', () => {
    videos.forEach(other => { if (other !== video) other.pause(); });
    video.classList.add('is-playing');
  });
  video.addEventListener('pause', () => video.classList.remove('is-playing'));
  video.addEventListener('ended', () => video.classList.remove('is-playing'));
});
document.getElementById('year').textContent = new Date().getFullYear();
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const track = document.getElementById('film-track');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
function updateControls() {
  previous.disabled = track.scrollLeft < 2;
  next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
}
function slide(direction) {
  const card = track.querySelector('.film');
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  track.scrollBy({left: direction * (card.getBoundingClientRect().width + gap), behavior: motion.matches ? 'instant' : 'smooth'});
}
previous.addEventListener('click', () => slide(-1));
next.addEventListener('click', () => slide(1));
track.addEventListener('scroll', updateControls, {passive:true});
track.addEventListener('keydown', event => {
  if (event.target !== track) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); slide(event.key === 'ArrowRight' ? 1 : -1);
  }
});
window.addEventListener('resize', updateControls);
updateControls();
if ('IntersectionObserver' in window && !motion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('in-view'); observer.unobserve(entry.target);}
    });
  }, {threshold:0.08});
  document.querySelectorAll('.section-heading, .about-grid, .values, .price-block, .extras, .footer-top').forEach(element => {
    element.classList.add('reveal-ready'); observer.observe(element);
  });
  motion.addEventListener('change', () => {
    if (motion.matches) document.querySelectorAll('.reveal-ready').forEach(element => element.classList.add('in-view'));
  });
}
