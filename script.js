/* =================================================================
||
||  SCRIPT.JS - AI DYNAMIC CONTENT HUB
||  Author: Gemini
||  Version: 1.0
||  Date: 2023-10-27
||
||  TABLE OF CONTENTS
||  -----------------
||  1.  GLOBAL VARIABLES & CONFIGURATION
||  2.  UTILITY FUNCTIONS
||  3.  LOADING SCREEN & INITIALIZATION
||  4.  NAVIGATION & CONTENT SWITCHING
||  5.  DYNAMIC CONTENT MANAGEMENT (Media & CSS Art)
||  6.  AI TEXT STREAM ANIMATION
||  7.  PARTICLE SYSTEM (JS Controlled for extra dynamism)
||  8.  AI DASHBOARD INTERACTIVITY
||  9.  SVG MORPHING ANIMATION
||  10. FULLSCREEN & UTILITY UI
||  11. EVENT LISTENERS
||
================================================================= */

/* =================================================================
||  1. GLOBAL VARIABLES & CONFIGURATION
================================================================= */

const config = {
    autoChangeDuration: 15000, // 15 seconds for automatic content change
    aiTextStreamSpeed: 70, // Milliseconds per character for AI text typing
    aiTextStreamInterval: 8000, // Interval to change AI stream message
    particleCount: 50, // Number of additional JS-controlled particles
    particleAnimationDuration: 20000, // Milliseconds for particle animation cycle
    initialCategory: 'home',
    mediaBasePath: 'media/', // Base path for all media files
};

const dom = {
    loadingOverlay: document.getElementById('loading-overlay'),
    mainWrapper: document.getElementById('main-wrapper'),
    navButtons: document.querySelectorAll('.nav-button'),
    contentSections: document.querySelectorAll('.content-section'),
    mainVideoPlayer: document.getElementById('main-video-player'),
    mainImageDisplayer: document.getElementById('main-image-displayer'),
    cssArtDisplayer: document.getElementById('css-art-displayer'),
    aiTextStreamElement: document.querySelector('.data-stream'),
    particleCanvas: document.getElementById('particle-canvas'), // For JS-generated particles if needed
    liveClock: document.getElementById('live-clock'),
    systemStatus: document.getElementById('system-status'),
    currentCategoryDisplay: document.getElementById('current-category-display'),
    toggleFullscreenButton: document.getElementById('toggle-fullscreen'),
    morphingSvg: document.getElementById('morphing-svg'),
    shape1: document.getElementById('shape1'),
    shape2: document.getElementById('shape2'),
    aiDashboardBarChart: document.querySelector('#ai-content .bar-chart'),
    aiDashboardNodes: document.querySelectorAll('#ai-content .node'),
    aiDashboardLinks: document.querySelectorAll('#ai-content .link'),
};

let currentCategory = config.initialCategory;
let currentContentIndex = 0;
let autoChangeInterval;
let aiTextStreamIntervalId;
let aiTextStreamMessages = [
    "प्रोसेसिंग डेटा मैट्रिक्स...",
    "न्यूरल नेटवर्क सक्रिय हो रहा है...",
    "पैटर्न विश्लेषण चल रहा है...",
    "कंटेंट जनरेशन एल्गोरिथम निष्पादित हो रहा है...",
    "उपयोगकर्ता इंटरैक्शन का पता लगाया जा रहा है...",
    "डेटा इंटीग्रिटी की जाँच की जा रही है...",
    "सिंथेटिक इंटेलिजेंस अनुकूलन...",
    "प्रतिक्रिया प्रोटोकॉल तैयार...",
    "ज्ञान आधार अपडेट किया जा रहा है...",
    "भविष्यवाणी मॉडल चल रहा है..."
];
let mediaContent = {}; // Will be populated from data.js
let animationFrames = {}; // To store requestAnimationFrame IDs

/* =================================================================
||  2. UTILITY FUNCTIONS
================================================================= */

/**
 * Helper to get a random item from an array.
 * @param {Array} arr
 * @returns {*} Random item from the array.
 */
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Sets a CSS variable on the document root.
 * @param {string} varName - Name of the CSS variable (e.g., '--theme-bg-primary')
 * @param {string} value - Value to set (e.g., '#000000')
 */
function setCssVariable(varName, value) {
    document.documentElement.style.setProperty(varName, value);
}

/**
 * Typewriter effect for AI text stream.
 * @param {HTMLElement} element - The DOM element to type into.
 * @param {string} text - The text to type.
 * @param {number} speed - Typing speed in ms per character.
 */
function typeWriterEffect(element, text, speed) {
    let i = 0;
    element.textContent = ''; // Clear previous text
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            animationFrames.typewriter = requestAnimationFrame(() => type());
        } else {
            // Optional: cursor blink after typing
            element.style.setProperty('--pseudo-content', `'▋'`);
        }
    }
    cancelAnimationFrame(animationFrames.typewriter); // Cancel previous animation
    type();
}


/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* =================================================================
||  3. LOADING SCREEN & INITIALIZATION
================================================================= */

/**
 * Hides the loading overlay once the page is ready.
 */
function hideLoadingOverlay() {
    dom.loadingOverlay.classList.add('hidden');
    // Allow time for fade out then remove from DOM or set display none
    setTimeout(() => {
        dom.loadingOverlay.style.display = 'none';
        dom.mainWrapper.style.opacity = '1'; // Fade in main content
    }, 800);
}

/**
 * Initializes the application after DOM and essential data are loaded.
 */
function initializeApp() {
    // Load media content from global `contentData` variable
    if (typeof contentData !== 'undefined') {
        mediaContent = contentData.categories;
        console.log("Media content loaded:", mediaContent);
    } else {
        console.error("Error: contentData is not defined. Ensure data.js is loaded correctly.");
        dom.systemStatus.textContent = 'सिस्टम त्रुटि: डेटा लोड नहीं हुआ';
        return;
    }

    setupEventListeners();
    updateLiveClock();
    startAutoContentChange();
    startAiTextStream();
    switchCategory(currentCategory); // Display initial category content
    hideLoadingOverlay();
    
    // Initial content load for the first active section
    loadContentForCategory(currentCategory);
}

// Ensure the DOM is fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeApp);


/* =================================================================
||  4. NAVIGATION & CONTENT SWITCHING
================================================================= */

/**
 * Switches the active content section.
 * @param {string} categoryName - The data-category value of the section to activate.
 */
function switchCategory(categoryName) {
    if (currentCategory === categoryName) return; // Already on this category

    // Deactivate current section
    dom.contentSections.forEach(section => {
        if (section.id === `${currentCategory}-content`) {
            section.classList.remove('active');
        }
    });

    // Deactivate current nav button
    dom.navButtons.forEach(button => {
        if (button.dataset.category === currentCategory) {
            button.classList.remove('active');
        }
    });

    currentCategory = categoryName;
    currentContentIndex = 0; // Reset index for new category

    // Activate new section
    dom.contentSections.forEach(section => {
        if (section.id === `${categoryName}-content`) {
            section.classList.add('active');
        }
    });

    // Activate new nav button
    dom.navButtons.forEach(button => {
        if (button.dataset.category === categoryName) {
            button.classList.add('active');
        }
    });

    dom.currentCategoryDisplay.textContent = `वर्तमान श्रेणी: ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}`;
    loadContentForCategory(categoryName);
    startAutoContentChange(); // Restart auto change for new category
    console.log(`Switched to category: ${categoryName}`);
}

/* =================================================================
||  5. DYNAMIC CONTENT MANAGEMENT (Media & CSS Art)
================================================================= */

/**
 * Loads and displays content for the current category and index.
 * It intelligently handles video, image, or CSS art.
 * @param {string} category - The active category.
 */
function loadContentForCategory(category) {
    const categoryContent = mediaContent[category];

    if (!categoryContent || categoryContent.length === 0) {
        console.warn(`No media content defined for category: ${category}. Displaying CSS art/placeholder.`);
        displayCssArtPlaceholder();
        return;
    }

    const item = categoryContent[currentContentIndex];

    dom.mainVideoPlayer.style.display = 'none';
    dom.mainImageDisplayer.style.display = 'none';
    dom.cssArtDisplayer.style.display = 'none';
    dom.mainVideoPlayer.pause();

    if (item.type === 'video') {
        dom.mainVideoPlayer.src = config.mediaBasePath + item.src;
        dom.mainVideoPlayer.style.display = 'block';
        dom.mainVideoPlayer.play();
        dom.cssArtDisplayer.innerHTML = ''; // Clear any existing CSS art
    } else if (item.type === 'image') {
        dom.mainImageDisplayer.src = config.mediaBasePath + item.src;
        dom.mainImageDisplayer.style.display = 'block';
        dom.cssArtDisplayer.innerHTML = '';
    } else if (item.type === 'css-art') {
        displayCssArt(item.name); // Dynamically load/generate CSS art
    } else {
        console.warn(`Unknown content type: ${item.type}. Displaying CSS art/placeholder.`);
        displayCssArtPlaceholder();
    }
}

/**
 * Rotates to the next piece of content in the current category.
 */
function showNextContent() {
    const categoryContent = mediaContent[currentCategory];
    if (categoryContent && categoryContent.length > 0) {
        currentContentIndex = (currentContentIndex + 1) % categoryContent.length;
        loadContentForCategory(currentCategory);
    } else {
        // If no media, keep displaying CSS art/placeholder
        displayCssArtPlaceholder();
    }
}

/**
 * Starts the automatic content rotation interval.
 */
function startAutoContentChange() {
    clearInterval(autoChangeInterval); // Clear any previous interval
    autoChangeInterval = setInterval(showNextContent, config.autoChangeDuration);
    console.log(`Auto content change started for category '${currentCategory}' every ${config.autoChangeDuration / 1000} seconds.`);
}

/**
 * Displays a generic CSS art placeholder if no media is available or type is unknown.
 */
function displayCssArtPlaceholder() {
    dom.mainVideoPlayer.style.display = 'none';
    dom.mainImageDisplayer.style.display = 'none';
    dom.cssArtDisplayer.style.display = 'block';
    dom.cssArtDisplayer.innerHTML = `
        <div class="css-placeholder-art">
            <div class="cube-grid">
                <div class="cube"></div><div class="cube"></div><div class="cube"></div>
                <div class="cube"></div><div class="cube"></div><div class="cube"></div>
                <div class="cube"></div><div class="cube"></div><div class="cube"></div>
            </div>
            <p class="placeholder-text">डायनामिक कंटेंट जनरेट हो रहा है...</p>
        </div>
    `;
    // Add CSS for .css-placeholder-art and .cube-grid in style.css
}

/**
 * Dynamically generates/loads specific CSS art based on name.
 * @param {string} artName
 */
function displayCssArt(artName) {
    dom.cssArtDisplayer.style.display = 'block';
    dom.cssArtDisplayer.innerHTML = ''; // Clear previous

    if (artName === 'fractal-gradient') {
        dom.cssArtDisplayer.innerHTML = `
            <div class="fractal-gradient-art">
                <div class="gradient-layer layer1"></div>
                <div class="gradient-layer layer2"></div>
                <div class="gradient-layer layer3"></div>
            </div>
        `;
        // Needs corresponding CSS in style.css for .fractal-gradient-art and layers
    } else if (artName === 'cyber-grid') {
        dom.cssArtDisplayer.innerHTML = `
            <div class="cyber-grid-art">
                ${Array(100).fill().map((_, i) => `<div class="grid-line" style="--i:${i};"></div>`).join('')}
            </div>
        `;
        // Needs corresponding CSS in style.css for .cyber-grid-art
    } else {
        displayCssArtPlaceholder(); // Fallback
    }
}


/* =================================================================
||  6. AI TEXT STREAM ANIMATION
================================================================= */

/**
 * Starts the AI text stream animation in the terminal.
 */
function startAiTextStream() {
    if (aiTextStreamIntervalId) clearInterval(aiTextStreamIntervalId);

    const updateStream = () => {
        const message = getRandomItem(aiTextStreamMessages);
        typeWriterEffect(dom.aiTextStreamElement, message, config.aiTextStreamSpeed);
    };

    updateStream(); // Display initial message immediately
    aiTextStreamIntervalId = setInterval(updateStream, config.aiTextStreamInterval);
    console.log(`AI text stream started, changing every ${config.aiTextStreamInterval / 1000} seconds.`);
}


/* =================================================================
||  7. PARTICLE SYSTEM (JS Controlled for extra dynamism)
================================================================= */
/**
 * Creates and animates additional particles using JavaScript for more control.
 * These are separate from the CSS-only particles.
 */
function createJsParticles() {
    for (let i = 0; i < config.particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('js-particle'); // Add specific class
        dom.particleCanvas.appendChild(particle);

        // Random initial positions and sizes
        const size = getRandomInt(3, 10);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${getRandomInt(0, 100)}vw`;
        particle.style.top = `${getRandomInt(0, 100)}vh`;
        particle.style.backgroundColor = `hsl(${getRandomInt(200, 250)}, 70%, 70%)`; // Blueish hue
        particle.style.opacity = '0'; // Will animate in

        // Apply a random animation
        const animDuration = getRandomInt(10, 30); // seconds
        const animDelay = getRandomInt(0, animDuration); // seconds
        const animX = getRandomInt(-500, 500);
        const animY = getRandomInt(-500, 500);
        const animScale = Math.random() * 0.5 + 0.5;

        particle.style.animation = `
            js-particle-move ${animDuration}s linear ${animDelay}s infinite alternate,
            js-particle-fade ${getRandomInt(5, 10)}s ease-in-out ${animDelay}s infinite alternate
        `;

        // Define dynamic keyframes for each particle (this can be resource intensive,
        //  better to define in CSS if patterns are fixed, but for true randomness, JS is needed)
        // For simplicity and performance, we'll rely on pre-defined CSS animations for js-particle-move/fade
        // and just control position/size here.
    }
}

// Ensure you have `js-particle-move` and `js-particle-fade` keyframes in your `style.css`
/*
@keyframes js-particle-move {
    from { transform: translate(var(--start-x), var(--start-y)) scale(var(--start-scale)); }
    to { transform: translate(var(--end-x), var(--end-y)) scale(var(--end-scale)); }
}
@keyframes js-particle-fade {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.7; }
}
*/

// Call this function during initialization
createJsParticles();


/* =================================================================
||  8. AI DASHBOARD INTERACTIVITY
================================================================= */

/**
 * Animates the bar chart in the AI dashboard section.
 */
function animateAiBarChart() {
    dom.aiDashboardBarChart.querySelectorAll('.bar').forEach(bar => {
        const randomHeight = getRandomInt(30, 95); // New random height
        bar.style.height = `${randomHeight}%`;
        // The animation for this height change is handled by CSS transition on 'height'
    });
    // Repeat the animation periodically
    animationFrames.aiBarChart = requestAnimationFrame(() => setTimeout(animateAiBarChart, 2000));
}

/**
 * Adds interactive glow to AI concept map nodes.
 */
function setupAiConceptMapInteractivity() {
    dom.aiDashboardNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            node.style.filter = 'drop-shadow(0 0 8px var(--theme-accent-secondary))';
        });
        node.addEventListener('mouseleave', () => {
            node.style.filter = 'none';
        });
        node.addEventListener('click', () => {
            alert(`AI Concept: ${node.id.replace('node-', '').toUpperCase()}`);
            // In a real app, this would load info into info-card-panel
        });
    });
    // Initial animation for links
    dom.aiDashboardLinks.forEach((link, index) => {
        link.style.animationDelay = `${index * 0.5}s`;
    });
}

/* =================================================================
||  9. SVG MORPHING ANIMATION
================================================================= */
let morphTween; // To store GSAP TweenLite instance

function startSvgMorphing() {
    if (dom.shape1 && dom.shape2) {
        // Hide one shape, show the other, then morph
        dom.shape1.style.display = 'block';
        dom.shape2.style.display = 'none';

        function morphShapes() {
            // GSAP (GreenSock Animation Platform) is ideal for SVG morphing.
            // If GSAP is not included, this will be a placeholder.
            // We'll assume GSAP library is loaded for this to work.
            // <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js"></script>
            // <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/MorphSVGPlugin.min.js"></script>

            if (typeof gsap !== 'undefined' && typeof MorphSVGPlugin !== 'undefined') {
                 gsap.to(dom.shape1, {
                    duration: 2,
                    morphSVG: dom.shape2,
                    ease: "power1.inOut",
                    onComplete: () => {
                        // Swap shapes and morph back
                        gsap.to(dom.shape1, {
                            duration: 2,
                            morphSVG: dom.shape1.getAttribute('d'), // Morph back to original path
                            ease: "power1.inOut",
                            delay: 1, // Pause before morphing back
                            onComplete: morphShapes // Loop
                        });
                    }
                });
            } else {
                console.warn("GSAP or MorphSVGPlugin not loaded. SVG morphing is disabled.");
                // Fallback to simple CSS animation if GSAP not available
                dom.shape1.style.transition = 'transform 2s ease-in-out';
                dom.shape1.style.transform = (dom.shape1.style.transform === 'rotate(0deg)' || dom.shape1.style.transform === '') ? 'rotate(180deg)' : 'rotate(0deg)';
                setTimeout(morphShapes, 3000); // Simple rotation loop
            }
        }
        morphShapes();
    }
}


/* =================================================================
||  10. FULLSCREEN & UTILITY UI
================================================================= */

/**
 * Updates the live clock in the footer.
 */
function updateLiveClock() {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    dom.liveClock.textContent = now.toLocaleTimeString('en-US', options);
    setTimeout(updateLiveClock, 1000); // Update every second
}

/**
 * Toggles fullscreen mode for the document.
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}


/* =================================================================
||  11. EVENT LISTENERS
================================================================= */

/**
 * Sets up all global event listeners.
 */
function setupEventListeners() {
    dom.navButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchCategory(button.dataset.category);
        });
    });

    dom.toggleFullscreenButton.addEventListener('click', toggleFullscreen);

    // If video ends, automatically play next content (only for current video)
    dom.mainVideoPlayer.addEventListener('ended', showNextContent);

    // Initial setup for AI Dashboard (if active)
    setupAiConceptMapInteractivity();
    if (currentCategory === 'ai') {
        animateAiBarChart();
    }
    
    // Initial setup for SVG morphing (if active)
    if (currentCategory === 'art') {
        startSvgMorphing();
    }
}

// Additional checks if JS-controlled particles are meant to be dynamic.
// For now, they rely on CSS animations. If more advanced JS control is desired,
// an animation loop using requestAnimationFrame would be implemented here.

// Call createJsParticles initially, it relies on CSS for movement.
createJsParticles();
