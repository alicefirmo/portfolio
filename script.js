document.addEventListener('DOMContentLoaded', () => {
  const logoToggle = document.getElementById('logo-toggle');
  const secHome = document.getElementById('sec-home');
  const secWorks = document.getElementById('sec-works');

  // Track active section state ('home' or 'works')
  let currentSection = 'home';

  const switchSection = (target) => {
    if (target === currentSection) return;

    const activeSec = currentSection === 'home' ? secHome : secWorks;
    const targetSec = target === 'home' ? secHome : secWorks;

    currentSection = target;

    // Toggle body class for inverted colors
    if (target === 'works') {
      document.body.classList.add('works-active');
    } else {
      document.body.classList.remove('works-active');
    }

    // Smooth transition
    activeSec.style.opacity = '0';
    activeSec.style.transform = 'translateY(15px)';

    setTimeout(() => {
      activeSec.classList.remove('active');
      activeSec.style.display = 'none';

      targetSec.style.display = 'block';
      // Force reflow
      targetSec.offsetHeight;

      targetSec.classList.add('active');
      
      setTimeout(() => {
        targetSec.style.opacity = '1';
        targetSec.style.transform = 'translateY(0)';
      }, 50);
    }, 400); // Wait for fade-out

    // Update URL hash
    window.location.hash = target === 'home' ? '' : 'works';
  };

  // Logo toggle click event
  if (logoToggle) {
    logoToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentSection === 'home') {
        switchSection('works');
      } else {
        switchSection('home');
      }
    });
  }

  // Handle URL hash routing on initial load
  const handleHash = () => {
    const hash = window.location.hash.substring(1);
    if (hash === 'works') {
      secHome.classList.remove('active');
      secHome.style.display = 'none';
      secHome.style.opacity = '0';

      secWorks.style.display = 'block';
      secWorks.classList.add('active');
      secWorks.style.opacity = '1';
      secWorks.style.transform = 'translateY(0)';
      currentSection = 'works';
      document.body.classList.add('works-active');
    } else {
      secWorks.classList.remove('active');
      secWorks.style.display = 'none';
      secWorks.style.opacity = '0';

      secHome.style.display = 'block';
      secHome.classList.add('active');
      secHome.style.opacity = '1';
      secHome.style.transform = 'translateY(0)';
      currentSection = 'home';
      document.body.classList.remove('works-active');
    }
  };

  handleHash();

  // Handle browser back/forward buttons
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash === 'works' && currentSection !== 'works') {
      switchSection('works');
    } else if (hash !== 'works' && currentSection !== 'home') {
      switchSection('home');
    }
  });

  // --- AUDIO CONTROLLER (Autoplay with gesture fallback) ---
  let audioTracks = [];
  let currentTrackIndex = 0;
  let currentAudio = null;
  let started = false;

  const playNextTrack = () => {
    if (audioTracks.length === 0) return Promise.reject('No tracks');
    
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.onended = null;
    }
    
    const trackName = audioTracks[currentTrackIndex];
    currentAudio = new Audio(`audio/${trackName}`);
    currentAudio.volume = 0.5;
    
    currentAudio.onended = () => {
      currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
      playNextTrack();
    };

    return currentAudio.play();
  };

  const initAudioEngine = () => {
    if (audioTracks.length === 0 || started) return;

    const startAudio = () => {
      if (started) return;
      
      playNextTrack()
        .then(() => {
          started = true;
          // Clean up the listeners only when playback successfully starts
          document.removeEventListener('click', startAudio);
          document.removeEventListener('keydown', startAudio);
          document.removeEventListener('touchstart', startAudio);
          document.removeEventListener('mouseover', startAudio);
        })
        .catch(err => {
          // If browser blocked it (like on mouseover), we keep listeners active for click/touch
          console.log('Playback attempt blocked, waiting for click/touch...');
        });
    };

    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
    document.addEventListener('touchstart', startAudio);
    document.addEventListener('mouseover', startAudio);
  };

  // Load audio tracks from window global variable (avoids CORS issues on file://)
  const data = window.AUDIO_TRACKS;
  if (Array.isArray(data) && data.length > 0) {
    audioTracks = data;
    initAudioEngine();
  }

  // --- SLIDESHOW CONTROLLER & NAVIGATION ---
  const navigateSlideshow = (slideshow, direction = 'next') => {
    const slides = slideshow.querySelectorAll('.slide');
    if (slides.length <= 1) return null;
    
    let activeIndex = -1;
    slides.forEach((slide, index) => {
      if (slide.classList.contains('active')) {
        activeIndex = index;
      }
    });
    
    if (activeIndex !== -1) {
      slides[activeIndex].classList.remove('active');
      let targetIndex = 0;
      if (direction === 'next') {
        targetIndex = (activeIndex + 1) % slides.length;
      } else {
        targetIndex = (activeIndex - 1 + slides.length) % slides.length;
      }
      slides[targetIndex].classList.add('active');
      
      const originalImg = slides[targetIndex].querySelector('.original-img');
      return originalImg ? originalImg.src : slides[targetIndex].querySelector('img').src;
    }
    return null;
  };

  const slideshows = document.querySelectorAll('.work-item.slideshow');
  slideshows.forEach(slideshow => {
    slideshow.addEventListener('click', () => {
      navigateSlideshow(slideshow, 'next');
    });
  });

  // --- FULLSCREEN LIGHTBOX CONTROLLER ---
  const overlay = document.getElementById('fullscreen-overlay');
  const overlayImg = document.getElementById('overlay-img');
  let currentOpenItem = null;

  // Zoom and Pan States (using LERP for smooth glide inertia)
  let zoomScale = 1;
  let targetPanX = 0;
  let targetPanY = 0;
  let currentPanX = 0;
  let currentPanY = 0;
  let animFrameId = null;

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // Touch zoom state (pinch to zoom)
  let initialTouchDist = 0;
  let startScale = 1;

  const updateImageTransform = (instant = false) => {
    if (!overlayImg) return;
    if (instant) {
      overlayImg.classList.add('no-transition');
    } else {
      overlayImg.classList.remove('no-transition');
    }

    if (zoomScale > 1) {
      overlayImg.classList.add('zoomed');
    } else {
      overlayImg.classList.remove('zoomed');
    }

    overlayImg.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${zoomScale})`;
  };

  const startAnimationLoop = () => {
    if (animFrameId) return;

    const tick = () => {
      const dx = targetPanX - currentPanX;
      const dy = targetPanY - currentPanY;

      // Soft linear interpolation (lerp)
      currentPanX += dx * 0.08;
      currentPanY += dy * 0.08;

      updateImageTransform(true);

      // Check if we are close enough to snap and stop the loop
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        animFrameId = requestAnimationFrame(tick);
      } else {
        currentPanX = targetPanX;
        currentPanY = targetPanY;
        updateImageTransform(true);
        animFrameId = null;
      }
    };

    animFrameId = requestAnimationFrame(tick);
  };

  const resetZoom = () => {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    zoomScale = 1;
    targetPanX = 0;
    targetPanY = 0;
    currentPanX = 0;
    currentPanY = 0;
    updateImageTransform(false); // Animate back smoothly using CSS transition
  };

  const openOverlay = (item, imgSrc) => {
    if (!overlay || !overlayImg) return;
    currentOpenItem = item;
    overlayImg.src = imgSrc;
    
    if (item.classList.contains('slideshow')) {
      overlay.classList.add('has-slides');
    } else {
      overlay.classList.remove('has-slides');
    }
    
    resetZoom();

    overlay.classList.add('active');
    document.body.classList.add('fullscreen-open');
  };

  const closeOverlay = () => {
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.classList.remove('has-slides');
    document.body.classList.remove('fullscreen-open');
    currentOpenItem = null;
    resetZoom();
  };

  // Double click on work items to open
  const workItems = document.querySelectorAll('.work-item');
  workItems.forEach(item => {
    item.addEventListener('dblclick', (e) => {
      const activeSlide = item.querySelector('.slide.active');
      let imgSrc = '';
      if (activeSlide) {
        const originalImg = activeSlide.querySelector('.original-img');
        imgSrc = originalImg ? originalImg.src : activeSlide.querySelector('img').src;
      } else {
        const originalImg = item.querySelector('.original-img');
        imgSrc = originalImg ? originalImg.src : item.querySelector('img').src;
      }
      
      if (imgSrc) {
        openOverlay(item, imgSrc);
      }
    });
  });

  // --- Zoom & Pan Event Listeners ---
  if (overlayImg) {
    const handleMousePan = (clientX, clientY) => {
      if (zoomScale <= 1) {
        targetPanX = 0;
        targetPanY = 0;
        return;
      }
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const imgWidth = overlayImg.offsetWidth;
      const imgHeight = overlayImg.offsetHeight;
      
      const scaledWidth = imgWidth * zoomScale;
      const scaledHeight = imgHeight * zoomScale;
      
      const maxPanX = Math.max(0, scaledWidth - viewportWidth);
      const maxPanY = Math.max(0, scaledHeight - viewportHeight);
      
      const pctX = (clientX / viewportWidth) - 0.5;
      const pctY = (clientY / viewportHeight) - 0.5;
      
      targetPanX = -pctX * maxPanX;
      targetPanY = -pctY * maxPanY;

      startAnimationLoop();
    };

    // Scroll Wheel to Zoom
    overlayImg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomStep = 0.15;
      
      if (e.deltaY < 0) {
        zoomScale = Math.min(zoomScale + zoomStep, 4);
      } else {
        zoomScale = Math.max(zoomScale - zoomStep, 1);
      }

      handleMousePan(e.clientX, e.clientY);
      updateImageTransform(true);
    }, { passive: false });

    // Double click on the image resets it
    overlayImg.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      resetZoom();
    });

    // Hover mouse movement to Pan
    window.addEventListener('mousemove', (e) => {
      if (zoomScale <= 1 || !overlay.classList.contains('active')) return;
      handleMousePan(e.clientX, e.clientY);
    });

    // Touch support (Mobile Panning & Pinch-to-zoom)
    const getTouchDist = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    overlayImg.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        if (zoomScale > 1) {
          isDragging = true;
          startX = e.touches[0].clientX - targetPanX;
          startY = e.touches[0].clientY - targetPanY;
        }
      } else if (e.touches.length === 2) {
        isDragging = false;
        initialTouchDist = getTouchDist(e.touches);
        startScale = zoomScale;
      }
    });

    overlayImg.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && isDragging && zoomScale > 1) {
        e.preventDefault();
        targetPanX = e.touches[0].clientX - startX;
        targetPanY = e.touches[0].clientY - startY;
        startAnimationLoop();
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getTouchDist(e.touches);
        const factor = dist / initialTouchDist;
        zoomScale = Math.max(1, Math.min(startScale * factor, 4));
        if (zoomScale === 1) {
          targetPanX = 0;
          targetPanY = 0;
        }
        startAnimationLoop();
      }
    }, { passive: false });

    overlayImg.addEventListener('touchend', (e) => {
      isDragging = false;
      if (e.touches.length === 1 && zoomScale > 1) {
        startX = e.touches[0].clientX - targetPanX;
        startY = e.touches[0].clientY - targetPanY;
        isDragging = true;
      }
    });

    // Click on overlayImg to cycle slide (only when fit to screen)
    overlayImg.addEventListener('click', (e) => {
      if (zoomScale > 1) return;
      if (currentOpenItem && currentOpenItem.classList.contains('slideshow')) {
        e.stopPropagation();
        const nextSrc = navigateSlideshow(currentOpenItem, 'next');
        if (nextSrc) {
          overlayImg.src = nextSrc;
        }
      }
    });
  }

  // Close overlay on click outside the image (overlay backdrop)
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('overlay-content')) {
        closeOverlay();
      }
    });
  }

  // Handle keys: Escape to close, Left/Right arrow to navigate slides
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOverlay();
    }
    
    if (currentOpenItem && currentOpenItem.classList.contains('slideshow')) {
      if (zoomScale > 1) return; // Ignore arrows if zoomed in
      if (e.key === 'ArrowRight') {
        const nextSrc = navigateSlideshow(currentOpenItem, 'next');
        if (nextSrc) {
          overlayImg.src = nextSrc;
        }
      } else if (e.key === 'ArrowLeft') {
        const prevSrc = navigateSlideshow(currentOpenItem, 'prev');
        if (prevSrc) {
          overlayImg.src = prevSrc;
        }
      }
    }
  });
});
