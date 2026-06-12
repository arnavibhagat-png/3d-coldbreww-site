// Velvet Drip - Immersive 3D Scroll-Driven Animation & Physics Engine

document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const TOTAL_FRAMES = 240;
    const IMAGES = [];
    let loadedCount = 0;
    
    // Smooth lerp state
    let targetFrame = 1;
    let currentFrame = 1;
    const lerpSpeed = 0.08; // Fluid inertia coefficient for organic liquid motion
    
    // Elements
    const preloader = document.getElementById('preloader');
    const loaderBar = document.getElementById('loader-bar');
    const loadPercentage = document.getElementById('load-percentage');
    
    const canvas = document.getElementById('animation-canvas');
    const ctx = canvas.getContext('2d');
    const sections = document.querySelectorAll('.scroll-section');
    
    // Setup Canvas viewport size
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(dpr, dpr);
        
        // Immediate redraw on resize
        renderFrame(Math.round(currentFrame));
    }
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        update3DEffects();
    });
    
    // Cover image positioning (object-fit: cover equivalent inside canvas)
    function drawImageCover(ctx, img) {
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        if (imgWidth === 0 || imgHeight === 0) return;
        
        const imgRatio = imgWidth / imgHeight;
        const canvasRatio = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgRatio > canvasRatio) {
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imgRatio;
            drawX = (canvasWidth - drawWidth) / 2;
            drawY = 0;
        } else {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgRatio;
            drawX = 0;
            drawY = (canvasHeight - drawHeight) / 2;
        }
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
    
    // Render the frame onto canvas
    function renderFrame(index) {
        // Clamp bounds
        const frameIdx = Math.min(TOTAL_FRAMES, Math.max(1, index));
        const img = IMAGES[frameIdx - 1];
        if (img && img.complete) {
            drawImageCover(ctx, img);
        }
    }
    
    // Preload all coffee splash frame images
    function preloadImages() {
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            const paddedIndex = String(i).padStart(3, '0');
            img.src = `ezgif-frame-${paddedIndex}.jpg`;
            
            img.onload = () => {
                loadedCount++;
                const percentage = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
                loaderBar.style.width = `${percentage}%`;
                loadPercentage.textContent = `${percentage}%`;
                
                if (loadedCount === TOTAL_FRAMES) {
                    onPreloadComplete();
                }
            };
            
            img.onerror = () => {
                // If an image fails to load, continue loading cycle
                loadedCount++;
                if (loadedCount === TOTAL_FRAMES) {
                    onPreloadComplete();
                }
            };
            
            IMAGES.push(img);
        }
    }
    
    // Triggered once all 240 images are loaded into cache
    function onPreloadComplete() {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            resizeCanvas();
            updateScrollTarget();
            
            // Launch the smooth frame scrubbing loop
            requestAnimationFrame(lerpLoop);
        }, 600);
    }
    
    // Compute scroll ratio and update target frame
    function updateScrollTarget() {
        const scrollY = window.scrollY;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
        
        if (maxScrollY <= 0) return;
        
        const scrollPercent = Math.min(1, Math.max(0, scrollY / maxScrollY));
        
        // Interpolate to find matching frame target
        targetFrame = Math.floor(scrollPercent * (TOTAL_FRAMES - 1)) + 1;
    }
    
    // Perform smooth math interpolation for 3D physics / frame rendering
    function lerpLoop() {
        // Core Lerp formula for fluid momentum
        const diff = targetFrame - currentFrame;
        
        if (Math.abs(diff) > 0.05) {
            currentFrame += diff * lerpSpeed;
            renderFrame(Math.round(currentFrame));
        }
        
        update3DEffects();
        requestAnimationFrame(lerpLoop);
    }
    
    // Apply 3D perspective transforms to section overlays based on viewport positioning
    function update3DEffects() {
        const viewportHeight = window.innerHeight;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionHeight = rect.height;
            
            // Calculate center of section relative to center of viewport
            const sectionCenter = rect.top + sectionHeight / 2;
            const viewportCenter = viewportHeight / 2;
            
            // Normalized offset: -1.0 (scrolled past top) to 1.0 (approaching from bottom)
            const normalizedOffset = (sectionCenter - viewportCenter) / (viewportCenter + sectionHeight / 2);
            
            const content = section.querySelector('.section-content-3d');
            if (content) {
                // If section is out of screen, make it invisible/inert
                if (rect.bottom < 0 || rect.top > viewportHeight) {
                    content.style.setProperty('--scroll-opacity', '0');
                    return;
                }
                
                // Fade out as it scrolls out of the center
                const opacity = Math.max(0, Math.min(1, 1 - Math.abs(normalizedOffset) * 1.6));
                
                // 3D Translations: Recedes in Z-space, moves in Y, tilts in X
                const translateY = normalizedOffset * 100;
                const translateZ = -Math.abs(normalizedOffset) * 250;
                const rotateX = normalizedOffset * 12;
                
                content.style.setProperty('--scroll-opacity', opacity);
                content.style.setProperty('--scroll-translate-y', `${translateY}px`);
                content.style.setProperty('--scroll-translate-z', `${translateZ}px`);
                content.style.setProperty('--scroll-rotate-x', `${rotateX}deg`);
            }
        });
    }
    
    // Scroll event listener
    window.addEventListener('scroll', () => {
        updateScrollTarget();
    });
    
    // Order Reservation Form Submission Handler
    const reserveForm = document.getElementById('reserve-form');
    const successCard = document.getElementById('form-success-message');
    const successUserName = document.getElementById('success-user-name');
    const successQty = document.getElementById('success-qty');
    const successSlot = document.getElementById('success-slot');
    const successEmail = document.getElementById('success-email');
    const formResetBtn = document.getElementById('form-reset-btn');
    
    if (reserveForm) {
        reserveForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email-address').value;
            const qtySelect = document.getElementById('quantity');
            const qtyText = qtySelect.options[qtySelect.selectedIndex].text.split(' - ')[0];
            const slotSelect = document.getElementById('delivery-slot');
            const slotText = slotSelect.options[slotSelect.selectedIndex].text;
            
            successUserName.textContent = fullName;
            successQty.textContent = qtyText;
            successSlot.textContent = slotText;
            successEmail.textContent = email;
            
            reserveForm.classList.add('hidden');
            successCard.classList.remove('hidden');
        });
    }
    
    if (formResetBtn) {
        formResetBtn.addEventListener('click', () => {
            reserveForm.reset();
            successCard.classList.add('hidden');
            reserveForm.classList.remove('hidden');
        });
    }
    
    // Start Preloading Process
    preloadImages();
});
