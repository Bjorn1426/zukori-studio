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
  document.querySelectorAll('.section-heading, .brand-grid .project, .studio-intro, .founder-grid, .price-block, .extras, .footer-top').forEach(element => {
    element.classList.add('reveal-ready'); observer.observe(element);
  });
  motion.addEventListener('change', () => {
    if (motion.matches) document.querySelectorAll('.reveal-ready').forEach(element => element.classList.add('in-view'));
  });
}

const dialog = document.getElementById('project-dialog');
const fullProject = document.getElementById('full-project');
const dialogTitle = document.getElementById('dialog-title');
document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    dialog.dataset.logo = '';
    dialog.dataset.brand = button.dataset.brand || '';
    const scene = dialog.querySelector('.dialog-image');
    const brandTint = {cabs:'linear-gradient(135deg,rgba(133,12,29,.88),rgba(175,36,48,.62))', 'tasty-trails':'linear-gradient(135deg,rgba(167,62,9,.82),rgba(238,117,31,.55))'};
    const tint = brandTint[button.dataset.brand] || 'linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.15))';
    scene.style.backgroundImage = button.dataset.brand ? `${tint}, url("${button.querySelector('.brand-background').getAttribute('src')}")` : ''; 
    fullProject.src = button.dataset.image;
    fullProject.alt = button.dataset.title;
    dialogTitle.textContent = button.dataset.title;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  });
});
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
// Keep the portfolio navigation in sync without taking over page scrolling.
if ('IntersectionObserver' in window) {
  const categoryLinks = [...document.querySelectorAll('.work-index a')];
  const categoryObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      categoryLinks.forEach(link => {
        const active = link.hash === '#' + entry.target.id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin: '-15% 0px -65% 0px', threshold: 0});
  document.querySelectorAll('#brands, #posters, #films').forEach(section => categoryObserver.observe(section));
}
// Auto advance the graphics gallery while it is visible and not being used.
const posterTrack = document.getElementById('poster-track');
const posterSlides = [...posterTrack.querySelectorAll('.project')];
const posterRegion = document.querySelector('.poster-slideshow');
const posterToggle = document.getElementById('poster-toggle');
const dotGroup = document.querySelector('.poster-dots');
let posterIndex = 0;
let posterPaused = motion.matches;
let posterVisible = !('IntersectionObserver' in window);
let posterHover = false;
let posterFocus = false;
let posterLastAction = Date.now();
const posterDots = posterSlides.map((item, i) => {
  item.setAttribute('role', 'group');
  item.setAttribute('aria-roledescription', 'slide');
  const title = item.querySelector('h3').textContent;
  item.setAttribute('aria-label', title);
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', 'Show ' + title);
  dot.addEventListener('click', () => showPoster(i));
  dotGroup.appendChild(dot);
  return dot;
});
function posterPosition(i) {
  return posterSlides[i].getBoundingClientRect().left - posterTrack.getBoundingClientRect().left + posterTrack.scrollLeft;
}
function syncPoster() {
  let nearest = 0;
  posterSlides.forEach((item, i) => {
    if (Math.abs(posterPosition(i) - posterTrack.scrollLeft) < Math.abs(posterPosition(nearest) - posterTrack.scrollLeft)) nearest = i;
  });
  posterIndex = nearest;
  posterDots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === posterIndex)));
}
function showPoster(index) {
  posterIndex = (index + posterSlides.length) % posterSlides.length;
  posterLastAction = Date.now();
  posterTrack.scrollTo({left: posterPosition(posterIndex), behavior: motion.matches ? 'instant' : 'smooth'});
}
function syncPosterToggle() {
  posterToggle.textContent = posterPaused ? 'Play slideshow' : 'Pause slideshow';
  posterToggle.setAttribute('aria-pressed', String(posterPaused));
}
posterToggle.addEventListener('click', () => {
  posterPaused = !posterPaused;
  posterLastAction = Date.now();
  syncPosterToggle();
});
document.getElementById('poster-prev').addEventListener('click', () => showPoster(posterIndex - 1));
document.getElementById('poster-next').addEventListener('click', () => showPoster(posterIndex + 1));
posterTrack.addEventListener('scroll', () => {syncPoster(); posterLastAction = Date.now();}, {passive:true});
posterTrack.addEventListener('pointerdown', () => {posterLastAction = Date.now();}, {passive:true});
posterTrack.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); showPoster(posterIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
posterRegion.addEventListener('mouseenter', () => {posterHover = true;});
posterRegion.addEventListener('mouseleave', () => {posterHover = false; posterLastAction = Date.now();});
posterRegion.addEventListener('focusin', () => {posterFocus = true;});
posterRegion.addEventListener('focusout', event => {posterFocus = posterRegion.contains(event.relatedTarget); posterLastAction = Date.now();});
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    posterVisible = entries[0].isIntersecting;
    posterLastAction = Date.now();
  }, {threshold:0.2}).observe(posterRegion);
}
motion.addEventListener('change', () => {
  if (motion.matches) {posterPaused = true; syncPosterToggle();}
});
document.addEventListener('visibilitychange', () => {posterLastAction = Date.now();});
window.addEventListener('resize', () => {
  posterTrack.scrollTo({left: posterPosition(posterIndex), behavior:'instant'});
  syncPoster();
});
setInterval(() => {
  if (!posterPaused && posterVisible && !posterHover && !posterFocus && !document.hidden && !dialog.open && Date.now() - posterLastAction >= 4500) showPoster(posterIndex + 1);
}, 250);
syncPoster();
syncPosterToggle();
