export function initLandingSection() {
    const landingSection = document.getElementById("section-02-landing");
    const landingOpeningScene = document.getElementById("landing-opening-scene");
    const landingTransitionStage = document.getElementById("landing-transition-stage");
    const landingPageStage = document.getElementById("landing-page-stage");
    const landingTextLine1a = document.getElementById("landing-text-line-1a");
    const landingTextLine1b = document.getElementById("landing-text-line-1b");
    const landingCatHitbox = document.getElementById("landing-cat-hitbox");
    const landingPageTitle = document.getElementById("landing-page-title");
    const landingPageSubtitle = document.getElementById("landing-page-subtitle");
    const landingAboutButton = document.getElementById("landing-about-button");
    const landingHoverCursor = document.getElementById("landing-hover-cursor");
    const landingExitOverlay = document.getElementById("landing-exit-overlay");
    const landingBackgroundImage = landingSection ? landingSection.querySelector(".landing-background img") : null;
    const landingPageImage = document.getElementById("landing-page-image");
  
    if (!landingSection || !landingOpeningScene || !landingTransitionStage || !landingPageStage || !landingTextLine1a || !landingTextLine1b || !landingCatHitbox || !landingPageTitle || !landingPageSubtitle || !landingAboutButton || !landingHoverCursor || !landingExitOverlay || !landingBackgroundImage || !landingPageImage) {
      return;
    }
  
    const LANDING_TRANSITION_FRAMES = [
      "./assets/landing/landing-transition-set-2-1.png",
      "./assets/landing/landing-transition-set-2-2.png",
      "./assets/landing/landing-transition-set-2-3.png",
      "./assets/landing/landing-transition-set-2-4.png",
      "./assets/landing/landing-transition-set-2-5.png",
      "./assets/landing/landing-transition-set-2-6.png"
    ];
    const LANDING_FRAME_SEQUENCE_MS = 125;
    const LANDING_FIRST_FRAME_HOLD_MS = 300;
    const LANDING_CROSSFADE_MS = 160;
    const OPENING_FADE_OUT_MS = 240;
    const EXIT_DARKEN_MS = 220;
  
    let introSentenceDone = false;
    let landingIsVisible = false;
    let isLandingTransitionPlaying = false;
    let landingUiHasPlayed = false;
    let landingPageIsEnterReady = false;
    let isLeavingLandingPage = false;
  
    let transitionLayerA = null;
    let transitionLayerB = null;
    let transitionImageA = null;
    let transitionImageB = null;
    let activeTransitionLayer = 0;
  
    function sleep(ms) {
      return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
      });
    }
  
    function getTypedLayer(element, selector) {
      return element.querySelector(selector);
    }
  
    function setTypingText(element, selector, count) {
      const fullText = element.dataset.text || "";
      const typedLayer = getTypedLayer(element, selector);
  
      if (!typedLayer) return;
      typedLayer.textContent = fullText.slice(0, count);
    }
  
    async function typeElement(element, selector, speed) {
      const fullText = element.dataset.text || "";
      const typedLayer = getTypedLayer(element, selector);
  
      if (!typedLayer) return;
  
      typedLayer.textContent = "";
  
      for (let i = 1; i <= fullText.length; i += 1) {
        setTypingText(element, selector, i);
        await sleep(speed);
      }
    }
  
    async function runOpeningSentenceSequence() {
      if (introSentenceDone) return;
  
      await typeElement(landingTextLine1a, ".landing-text-typed", 42);
      await sleep(120);
      landingCatHitbox.classList.add("is-visible");
      await sleep(180);
      await typeElement(landingTextLine1b, ".landing-text-typed", 42);
      introSentenceDone = true;
    }
  
    async function runLandingPageUiSequence() {
      if (landingUiHasPlayed) return;
  
      landingUiHasPlayed = true;
      await sleep(240);
      await typeElement(landingPageTitle, ".landing-page-text-typed", 36);
      await sleep(140);
      await typeElement(landingPageSubtitle, ".landing-page-text-typed", 22);
      await sleep(140);
      landingAboutButton.classList.add("is-visible");
      landingPageIsEnterReady = true;
      landingPageStage.classList.add("is-enter-ready");
    }
  
    function preloadLandingAssets() {
      const preloadSources = [landingBackgroundImage.src, landingPageImage.src].concat(LANDING_TRANSITION_FRAMES);
      preloadSources.forEach(function (src) {
        const image = new Image();
        image.src = src;
      });
    }
  
    async function revealLandingSection() {
      if (landingIsVisible) return;
  
      landingIsVisible = true;
      landingSection.classList.add("is-visible");
      await sleep(500);
      runOpeningSentenceSequence();
    }
  
    function ensureTransitionLayers() {
      if (transitionLayerA && transitionLayerB) return;
  
      transitionLayerA = document.createElement("div");
      transitionLayerA.className = "landing-transition-layer is-visible";
      transitionImageA = document.createElement("img");
      transitionImageA.alt = "";
      transitionLayerA.appendChild(transitionImageA);
  
      transitionLayerB = document.createElement("div");
      transitionLayerB.className = "landing-transition-layer";
      transitionImageB = document.createElement("img");
      transitionImageB.alt = "";
      transitionLayerB.appendChild(transitionImageB);
  
      landingTransitionStage.appendChild(transitionLayerA);
      landingTransitionStage.appendChild(transitionLayerB);
      activeTransitionLayer = 0;
    }
  
    function showTransitionStage() {
      ensureTransitionLayers();
      landingTransitionStage.classList.add("is-visible");
    }
  
    function hideTransitionStage() {
      landingTransitionStage.classList.remove("is-visible");
    }
  
    function getTransitionLayers() {
      if (activeTransitionLayer === 0) {
        return {
          currentLayer: transitionLayerA,
          currentImage: transitionImageA,
          nextLayer: transitionLayerB,
          nextImage: transitionImageB
        };
      }
  
      return {
        currentLayer: transitionLayerB,
        currentImage: transitionImageB,
        nextLayer: transitionLayerA,
        nextImage: transitionImageA
      };
    }
  
    async function waitForImage(imageElement) {
      await new Promise(function (resolve) {
        if (imageElement.complete) {
          resolve();
          return;
        }
  
        imageElement.onload = function () {
          resolve();
        };
  
        imageElement.onerror = function () {
          resolve();
        };
      });
    }
  
    async function crossfadeToFrame(framePath) {
      const layers = getTransitionLayers();
      layers.nextImage.src = framePath;
      await waitForImage(layers.nextImage);
      layers.nextLayer.classList.add("is-visible");
      await sleep(LANDING_CROSSFADE_MS);
      layers.currentLayer.classList.remove("is-visible");
      activeTransitionLayer = activeTransitionLayer === 0 ? 1 : 0;
    }
  
    async function playLandingTransition(framePaths) {
      showTransitionStage();
      transitionImageA.src = framePaths[0];
      await waitForImage(transitionImageA);
      transitionLayerA.classList.add("is-visible");
      transitionLayerB.classList.remove("is-visible");
      activeTransitionLayer = 0;
      await sleep(LANDING_FIRST_FRAME_HOLD_MS);
  
      for (let i = 1; i < framePaths.length; i += 1) {
        await crossfadeToFrame(framePaths[i]);
        await sleep(Math.max(LANDING_FRAME_SEQUENCE_MS - LANDING_CROSSFADE_MS, 20));
      }
    }
  
    function getLocalPosition(event) {
      const rect = landingPageStage.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  
    function moveHoverCursor(event) {
      const pos = getLocalPosition(event);
      const cursorSize = landingHoverCursor.offsetWidth || 96;
      landingHoverCursor.style.transform = `translate3d(${pos.x - cursorSize / 2}px, ${pos.y - cursorSize / 2}px, 0)`;
    }
  
    function showHoverCursor() {
      landingHoverCursor.classList.add("is-visible");
    }
  
    function hideHoverCursor() {
      landingHoverCursor.classList.remove("is-visible");
    }
  
    async function handleLandingPageEnter() {
      if (!landingPageIsEnterReady || isLeavingLandingPage) return;
  
      isLeavingLandingPage = true;
      landingPageStage.classList.remove("is-enter-ready");
      hideHoverCursor();
      landingExitOverlay.classList.add("is-visible");
      await sleep(EXIT_DARKEN_MS);
      document.dispatchEvent(new CustomEvent("showBrokenPhotoSection"));
      await new Promise(function (resolve) {
        requestAnimationFrame(function () {
          requestAnimationFrame(resolve);
        });
      });
      landingSection.classList.add("is-complete");
      landingExitOverlay.classList.remove("is-visible");
    }
  
    async function handleLandingCatClick() {
      if (!landingIsVisible || !introSentenceDone || !landingCatHitbox.classList.contains("is-visible") || isLandingTransitionPlaying) return;
  
      isLandingTransitionPlaying = true;
      landingOpeningScene.classList.add("is-fading");
      await sleep(OPENING_FADE_OUT_MS);
      landingOpeningScene.classList.add("is-hidden");
      await playLandingTransition(LANDING_TRANSITION_FRAMES);
      landingPageStage.classList.add("is-visible");
      await new Promise(function (resolve) {
        requestAnimationFrame(function () {
          requestAnimationFrame(resolve);
        });
      });
      hideTransitionStage();
      runLandingPageUiSequence();
      landingSection.dispatchEvent(new CustomEvent("landingPageReady", { bubbles: true }));
      isLandingTransitionPlaying = false;
    }
  
    document.addEventListener("showLandingSection", function () {
      revealLandingSection();
    });
  
    landingCatHitbox.addEventListener("click", handleLandingCatClick);
  
    landingPageStage.addEventListener("mousemove", function (event) {
      if (!landingPageIsEnterReady || isLeavingLandingPage) return;
      moveHoverCursor(event);
      showHoverCursor();
    });
  
    landingPageStage.addEventListener("mouseleave", function () {
      hideHoverCursor();
    });
  
    landingPageStage.addEventListener("click", function () {
      handleLandingPageEnter();
    });
  
    preloadLandingAssets();
  }