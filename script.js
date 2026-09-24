document.addEventListener('DOMContentLoaded', () => {
  const logoToggle = document.getElementById('logo-toggle');
  const secHome = document.getElementById('sec-home');
  const secWorks = document.getElementById('sec-works');
  const secFeed = document.getElementById('sec-feed');
  const secFlicker = document.getElementById('sec-flicker');

  // Track active section state ('home', 'works', 'feed', or 'flicker')
  let currentSection = 'home';

  // --- FEED SLIDESHOW ENGINE ---
  const feedImgElement = document.getElementById('feed-slideshow-img');
  let feedIntervalId = null;
  let lastFeedImage = '';
  let feedImagePool = [];

  const changeFeedImage = () => {
    if (!window.FEED_IMAGES || window.FEED_IMAGES.length === 0) return;
    
    // If the pool is empty, refill it with all images
    if (feedImagePool.length === 0) {
      feedImagePool = [...window.FEED_IMAGES];
    }
    
    let availableImages = feedImagePool;
    // To prevent showing the same image twice in a row during refilling
    if (availableImages.length > 1 && lastFeedImage) {
      availableImages = availableImages.filter(img => img !== lastFeedImage);
    }
    
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const selectedImage = availableImages[randomIndex];
    
    // Remove the selected image from the active pool
    feedImagePool = feedImagePool.filter(img => img !== selectedImage);
    lastFeedImage = selectedImage;
    
    if (feedImgElement) {
      feedImgElement.src = selectedImage;
    }
  };

  const startFeedSlideshow = () => {
    stopFeedSlideshow();
    // Initialize pool if empty
    if (feedImagePool.length === 0) {
      feedImagePool = [...window.FEED_IMAGES];
    }
    changeFeedImage(); // Instant initial change
    feedIntervalId = setInterval(changeFeedImage, 30000);
  };

  const stopFeedSlideshow = () => {
    if (feedIntervalId) {
      clearInterval(feedIntervalId);
      feedIntervalId = null;
    }
  };

  if (feedImgElement) {
    feedImgElement.addEventListener('dblclick', () => {
      startFeedSlideshow(); // Change image immediately and reset 30s interval
    });
  }

  // --- FIRE ANIMATION ENGINE ---
  const fireImgElement = document.getElementById('fire-frame');
  let fireIntervalId = null;
  let currentFireFrame = 1;
  const totalFireFrames = 16;

  const animateFire = () => {
    currentFireFrame = (currentFireFrame % totalFireFrames) + 1;
    const frameNum = String(currentFireFrame).padStart(2, '0');
    if (fireImgElement) {
      fireImgElement.src = `assets/fire/fire_${frameNum}.png`;
    }
  };

  const startFireAnimation = () => {
    if (!fireIntervalId) {
      fireIntervalId = setInterval(animateFire, 90); // ~11fps smooth loop
    }
  };

  const stopFireAnimation = () => {
    if (fireIntervalId) {
      clearInterval(fireIntervalId);
      fireIntervalId = null;
    }
  };

  // --- FLICKER PERFORMANCE ENGINE ---
  const flickerImgElement = document.getElementById('flicker-img');
  let flickerTimeoutId = null;
  let currentFlickerIndex = 0;
  const flickerImages = [
    'assets/fire_performance/01.webp',
    'assets/fire_performance/02.webp',
    'assets/fire_performance/03.webp'
  ];

  const doFlicker = () => {
    if (!flickerImgElement) return;
    
    let nextIndex = Math.floor(Math.random() * flickerImages.length);
    if (flickerImages.length > 1 && nextIndex === currentFlickerIndex) {
      nextIndex = (currentFlickerIndex + 1) % flickerImages.length;
    }
    currentFlickerIndex = nextIndex;
    flickerImgElement.src = flickerImages[currentFlickerIndex];

    const nextInterval = Math.floor(Math.random() * 150) + 100;
    flickerTimeoutId = setTimeout(doFlicker, nextInterval);
  };

  const startFlickerAnimation = () => {
    stopFlickerAnimation();
    doFlicker();
  };

  const stopFlickerAnimation = () => {
    if (flickerTimeoutId) {
      clearTimeout(flickerTimeoutId);
      flickerTimeoutId = null;
    }
  };

  if (secFlicker) {
    secFlicker.addEventListener('click', () => {
      switchSection('feed');
    });
  }

  const onSectionChanged = (newSection) => {
    if (newSection === 'feed') {
      startFeedSlideshow();
      startFireAnimation();
      stopFlickerAnimation();
    } else if (newSection === 'flicker') {
      stopFeedSlideshow();
      stopFireAnimation();
      startFlickerAnimation();
    } else {
      stopFeedSlideshow();
      stopFireAnimation();
      stopFlickerAnimation();
    }
  };

  const switchSection = (target) => {
    if (target === currentSection) return;

    let activeSec;
    if (currentSection === 'home') activeSec = secHome;
    else if (currentSection === 'works') activeSec = secWorks;
    else if (currentSection === 'feed') activeSec = secFeed;
    else if (currentSection === 'flicker') activeSec = secFlicker;

    let targetSec;
    if (target === 'home') targetSec = secHome;
    else if (target === 'works') targetSec = secWorks;
    else if (target === 'feed') targetSec = secFeed;
    else if (target === 'flicker') targetSec = secFlicker;

    const oldSection = currentSection;
    currentSection = target;

    // Toggle body classes for active sections
    if (target === 'works') {
      document.body.classList.add('works-active');
    } else {
      document.body.classList.remove('works-active');
    }

    if (target === 'feed') {
      document.body.classList.add('feed-active');
    } else {
      document.body.classList.remove('feed-active');
    }

    if (target === 'flicker') {
      document.body.classList.add('flicker-active');
    } else {
      document.body.classList.remove('flicker-active');
    }

    onSectionChanged(target);

    // Instant switch for feed and flicker, smooth transition for others
    const isInstant = (target === 'feed' || target === 'flicker' || oldSection === 'feed' || oldSection === 'flicker');

    if (isInstant) {
      activeSec.style.opacity = '0';
      activeSec.classList.remove('active');
      activeSec.style.display = 'none';

      targetSec.style.display = 'block';
      targetSec.classList.add('active');
      targetSec.style.opacity = '1';
    } else {
      // Smooth transition
      activeSec.style.opacity = '0';
      activeSec.style.transform = 'translateY(15px)';

      setTimeout(() => {
        activeSec.classList.remove('active');
        activeSec.style.display = 'none';

        targetSec.style.display = 'block';
        targetSec.offsetHeight; // Force reflow

        targetSec.classList.add('active');
        
        setTimeout(() => {
          targetSec.style.opacity = '1';
          targetSec.style.transform = 'translateY(0)';
        }, 50);
      }, 400); // Wait for fade-out
    }

    // Update URL hash
    if (target === 'home') {
      window.location.hash = '';
    } else if (target === 'works') {
      window.location.hash = 'works';
    } else if (target === 'feed') {
      window.location.hash = 'feed';
    } else if (target === 'flicker') {
      window.location.hash = 'flicker';
    }
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
    const hideAllExcept = (activeSectionElement) => {
      [secHome, secWorks, secFeed, secFlicker].forEach(sec => {
        if (sec && sec !== activeSectionElement) {
          sec.classList.remove('active');
          sec.style.display = 'none';
          sec.style.opacity = '0';
        }
      });
    };

    if (hash === 'works') {
      hideAllExcept(secWorks);
      secWorks.style.display = 'block';
      secWorks.classList.add('active');
      secWorks.style.opacity = '1';
      secWorks.style.transform = 'translateY(0)';
      currentSection = 'works';
      document.body.classList.add('works-active');
      document.body.classList.remove('feed-active');
      document.body.classList.remove('flicker-active');
      onSectionChanged('works');
    } else if (hash === 'feed') {
      hideAllExcept(secFeed);
      secFeed.style.display = 'block';
      secFeed.classList.add('active');
      secFeed.style.opacity = '1';
      currentSection = 'feed';
      document.body.classList.remove('works-active');
      document.body.classList.add('feed-active');
      document.body.classList.remove('flicker-active');
      onSectionChanged('feed');
    } else if (hash === 'flicker') {
      hideAllExcept(secFlicker);
      secFlicker.style.display = 'block';
      secFlicker.classList.add('active');
      secFlicker.style.opacity = '1';
      currentSection = 'flicker';
      document.body.classList.remove('works-active');
      document.body.classList.remove('feed-active');
      document.body.classList.add('flicker-active');
      onSectionChanged('flicker');
    } else {
      hideAllExcept(secHome);
      secHome.style.display = 'block';
      secHome.classList.add('active');
      secHome.style.opacity = '1';
      secHome.style.transform = 'translateY(0)';
      currentSection = 'home';
      document.body.classList.remove('works-active');
      document.body.classList.remove('feed-active');
      document.body.classList.remove('flicker-active');
      onSectionChanged('home');
    }
  };

  handleHash();

  // Handle browser back/forward buttons
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash === 'works' && currentSection !== 'works') {
      switchSection('works');
    } else if (hash === 'feed' && currentSection !== 'feed') {
      switchSection('feed');
    } else if (hash === 'flicker' && currentSection !== 'flicker') {
      switchSection('flicker');
    } else if (hash !== 'works' && hash !== 'feed' && hash !== 'flicker' && currentSection !== 'home') {
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

  // --- TEXT BLOCK MASK ANIMATION ENGINE (Fully compatible with iOS/Safari) ---
  const animateMask = (paragraph, targetPercent, duration = 3500) => {
    const startPercent = parseFloat(paragraph.style.getPropertyValue('--mask-percent') || '75');
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutCubic: f(t) = 1 - (1-t)^3
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startPercent + (targetPercent - startPercent) * ease;
      
      paragraph.style.setProperty('--mask-percent', `${current}%`);

      if (progress < 1) {
        paragraph.dataset.animId = requestAnimationFrame(update);
      } else {
        delete paragraph.dataset.animId;
      }
    };

    if (paragraph.dataset.animId) {
      cancelAnimationFrame(parseInt(paragraph.dataset.animId));
    }
    paragraph.dataset.animId = requestAnimationFrame(update);
  };

  // --- LOGO MASK ANIMATION ---
  const logoEl = document.querySelector('.logo');
  if (logoEl) {
    logoEl.style.setProperty('--mask-percent', '75%');
    logoEl.addEventListener('mouseenter', () => animateMask(logoEl, 0, 3500));
    logoEl.addEventListener('mouseleave', () => animateMask(logoEl, 75, 2000));
  }

  const textBlocks = document.querySelectorAll('.text-block');
  textBlocks.forEach(block => {
    const p = block.querySelector('p');
    if (!p) return;
    
    // Set initial custom property value
    p.style.setProperty('--mask-percent', '75%');

    const triggerReveal = () => {
      animateMask(p, 0, 3500); // Reveal over 3.5s
    };

    const triggerHide = () => {
      animateMask(p, 75, 2000); // Re-hide over 2s
    };

    // Desktop hover support
    block.addEventListener('mouseenter', triggerReveal);
    block.addEventListener('mouseleave', triggerHide);

    // Mobile tap / toggle support
    block.addEventListener('click', () => {
      const isRevealed = block.classList.toggle('revealed');
      if (isRevealed) {
        triggerReveal();
      } else {
        triggerHide();
      }
    });
  });

  // --- DRAGGABLE HOME IMAGES ENGINE ---
  const draggableImages = document.querySelectorAll('.grid-img-wrapper');
  
  let wasOverlapping = false;
  let lastBloodSpawnTime = 0;
  const checkCollision = () => {
    if (draggableImages.length < 2) return;
    const el1 = draggableImages[0];
    const el2 = draggableImages[1];
    
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    
    const overlap = !(rect1.right < rect2.left || 
                      rect1.left > rect2.right || 
                      rect1.bottom < rect2.top || 
                      rect1.top > rect2.bottom);
                      
    if (overlap) {
      const now = performance.now();
      if (!wasOverlapping || (now - lastBloodSpawnTime > 80)) {
        wasOverlapping = true;
        lastBloodSpawnTime = now;
        
        const x = Math.max(rect1.left, rect2.left);
        const y = Math.max(rect1.top, rect2.top);
        const w = Math.min(rect1.right, rect2.right) - x;
        const h = Math.min(rect1.bottom, rect2.bottom) - y;
        
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        
        // Add random scatter offsets for messier bleeding
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        
        spawnBlood(centerX + offsetX, centerY + offsetY);
      }
    } else {
      wasOverlapping = false;
    }
  };

  function spawnBlood(x, y) {
    const blood = document.createElement('div');
    blood.className = 'blood-effect';
    blood.style.left = `${x}px`;
    blood.style.top = `${y}px`;
    blood.style.opacity = '1';
    document.body.appendChild(blood);

    blood.style.backgroundImage = `url('assets/blood%20assets1.png')`;

    const spawnTime = performance.now();
    const totalLifespan = 6000; // Droplets last 6 seconds
    const frameDuration = 75;   // Fast fluid animation (75ms per frame)

    let currentY = y;
    let velocityY = 0.8;
    const gravity = 0.03;       // Natural gravity fall curve

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - spawnTime;

      if (elapsed >= totalLifespan) {
        clearInterval(interval);
        blood.remove();
        return;
      }

      // 1. Apply smooth gravity physics (every 30ms)
      currentY += velocityY;
      velocityY += gravity;
      blood.style.top = `${currentY}px`;

      // 2. Play frame animation at natural speed and loop it
      const frame = (Math.floor(elapsed / frameDuration) % 9) + 1;
      blood.style.backgroundImage = `url('assets/blood%20assets${frame}.png')`;

      // 3. Smoothly fade out
      const progress = elapsed / totalLifespan;
      blood.style.opacity = `${1 - progress}`;
    }, 30); // Update at ~33fps for smooth motion
  }

  draggableImages.forEach(wrapper => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    wrapper.style.cursor = 'grab';

    const onStart = (clientX, clientY) => {
      isDragging = true;
      startX = clientX;
      startY = clientY;
      wrapper.style.cursor = 'grabbing';
      wrapper.dataset.origTransition = wrapper.style.transition;
      wrapper.style.transition = 'none';
      wrapper.style.zIndex = '1000';
    };

    const onMove = (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      const newX = currentX + dx;
      const newY = currentY + dy;
      wrapper.style.transform = `translate(${newX}px, ${newY}px)`;
      checkCollision();
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      wrapper.style.cursor = 'grab';
      wrapper.style.zIndex = '';
      wrapper.style.transition = wrapper.dataset.origTransition || '';
      
      const transform = wrapper.style.transform;
      const match = transform.match(/translate\(([^px]+)px,\s*([^px]+)px\)/);
      if (match) {
        currentX = parseFloat(match[1]);
        currentY = parseFloat(match[2]);
      }
    };

    wrapper.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onStart(e.clientX, e.clientY);
      
      const mouseMoveHandler = (moveEvt) => {
        onMove(moveEvt.clientX, moveEvt.clientY);
      };
      
      const mouseUpHandler = () => {
        onEnd();
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };
      
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    });

    wrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      onStart(e.touches[0].clientX, e.touches[0].clientY);
    });

    wrapper.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    wrapper.addEventListener('touchend', onEnd);
  });

  // --- CUSTOM ANIMATED CURSOR FOLLOWER ---
  const evilCursor = document.createElement('div');
  evilCursor.id = 'evil-cursor';
  evilCursor.className = 'evil-cursor';
  document.body.appendChild(evilCursor);

  const targetMedia = document.querySelectorAll('.home-grid .grid-img-wrapper, .home-grid .grid-video-wrapper, .logo, .home-grid .text-block');
  targetMedia.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (document.body.classList.contains('works-active')) return;
      evilCursor.style.display = 'block';
    });
    el.addEventListener('mouseleave', () => {
      evilCursor.style.display = 'none';
    });
    el.addEventListener('mousemove', (e) => {
      if (document.body.classList.contains('works-active')) {
        evilCursor.style.display = 'none';
        return;
      }
      evilCursor.style.left = `${e.clientX}px`;
      evilCursor.style.top = `${e.clientY}px`;
    });
  });

  // --- MULTIPLYING LOADING SCREEN ENGINE ---
  (function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingContainer = document.getElementById('loading-container');
    if (!loadingScreen || !loadingContainer) return;

    // 1. Preload 24 animation frames
    const totalFrames = 24;
    const framePaths = [];
    for (let i = 1; i <= totalFrames; i++) {
      framePaths.push(`assets/loading/image.psd-${i}.webp`);
      const img = new Image();
      img.src = framePaths[i - 1];
    }

    // 2. Play 24-frame animation loop (70ms per frame)
    let currentFrameIdx = 0;
    const frameInterval = setInterval(() => {
      currentFrameIdx = (currentFrameIdx + 1) % totalFrames;
      const activeImgs = loadingContainer.querySelectorAll('.loading-frame-img');
      activeImgs.forEach(img => {
        img.src = framePaths[currentFrameIdx];
      });
    }, 70);

    // 3. Grid Setup & Distance Ring Grouping
    const itemSize = 65; // Smaller size for dense grid
    const cols = Math.ceil(window.innerWidth / itemSize);
    const rows = Math.ceil(window.innerHeight / itemSize);

    loadingContainer.style.gridTemplateColumns = `repeat(${cols}, ${itemSize}px)`;
    loadingContainer.style.gridTemplateRows = `repeat(${rows}, ${itemSize}px)`;

    const centerR = Math.floor(rows / 2);
    const centerC = Math.floor(cols / 2);

    // Group grid cells by diagonal distance ring level from center
    const distMap = new Map();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dist = Math.abs(r - centerR) + Math.abs(c - centerC);
        if (!distMap.has(dist)) distMap.set(dist, []);
        distMap.get(dist).push({ r, c });
      }
    }

    const maxDist = Math.max(...distMap.keys());
    let currentLevel = 0;

    function renderLevel(level) {
      if (distMap.has(level)) {
        const cells = distMap.get(level);
        cells.forEach(cell => {
          const img = document.createElement('img');
          img.className = 'loading-frame-img';
          img.style.gridRow = cell.r + 1;
          img.style.gridColumn = cell.c + 1;
          img.src = framePaths[currentFrameIdx];
          loadingContainer.appendChild(img);
        });
      }
    }

    // STRICTLY START WITH ONLY 1 CENTERED INSTANCE (Level 0)
    renderLevel(0);

    // 4. Track Website Media Assets
    const pageImages = Array.from(document.querySelectorAll('img:not(.loading-frame-img)'));
    const pageVideos = Array.from(document.querySelectorAll('video'));
    const bg1 = new Image(); bg1.src = 'assets/background.webp';
    const bg2 = new Image(); bg2.src = 'assets/background2.webp';

    const totalAssetsList = [...pageImages, ...pageVideos, bg1, bg2];
    const totalAssetsCount = Math.max(1, totalAssetsList.length);
    let loadedAssetsCount = 0;
    let pageLoaded = false;
    let multiplicationFinished = false;
    let hideTriggered = false;

    function checkAssetsReady() {
      if (loadedAssetsCount >= totalAssetsCount) {
        pageLoaded = true;
        tryHideLoadingScreen();
      }
    }

    totalAssetsList.forEach(asset => {
      if (asset instanceof HTMLImageElement) {
        if (asset.complete && asset.naturalWidth > 0) {
          loadedAssetsCount++;
        } else {
          asset.addEventListener('load', () => { loadedAssetsCount++; checkAssetsReady(); });
          asset.addEventListener('error', () => { loadedAssetsCount++; checkAssetsReady(); });
        }
      } else if (asset instanceof HTMLVideoElement) {
        if (asset.readyState >= 3) {
          loadedAssetsCount++;
        } else {
          asset.addEventListener('canplaythrough', () => { loadedAssetsCount++; checkAssetsReady(); });
          asset.addEventListener('error', () => { loadedAssetsCount++; checkAssetsReady(); });
        }
      }
    });
    checkAssetsReady();

    // 5. Progressive Diagonal Growth (1 level every 45ms)
    const growthInterval = setInterval(() => {
      currentLevel++;
      if (currentLevel <= maxDist) {
        renderLevel(currentLevel);
      } else {
        clearInterval(growthInterval);
        multiplicationFinished = true;
        tryHideLoadingScreen();
      }
    }, 45);

    function tryHideLoadingScreen() {
      if (multiplicationFinished && pageLoaded && !hideTriggered) {
        hideTriggered = true;
        setTimeout(() => {
          loadingScreen.style.opacity = '0';
          setTimeout(() => {
            clearInterval(frameInterval);
            loadingScreen.style.display = 'none';
          }, 900);
        }, 400);
      }
    }

    // Safety fallback: reveal after max 5 seconds
    setTimeout(() => {
      pageLoaded = true;
      multiplicationFinished = true;
      tryHideLoadingScreen();
    }, 5000);
  })();
});
