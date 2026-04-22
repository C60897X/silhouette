export function initP2CombingSection() {
  const p2CombingSection = document.getElementById("section-05-p2-combing");
  const p2CombingStage = document.getElementById("p2-combing-stage");
  const p2CombingImage = document.getElementById("p2-combing-image");
  const p2DragZone = document.getElementById("p2-drag-zone");

  if (!p2CombingSection || !p2CombingStage || !p2CombingImage || !p2DragZone) {
    return;
  }

  const BEFORE_COMB_SRC = "./assets/p2-combing/before-comb-cat.png";
  const COMBING_CAT_SRC = "./assets/p2-combing/combing-cat.png";
  const COMB_SRC = "./assets/p2-combing/comb.png";
  const PHOTO_PIECE_SRC = "./assets/p2-combing/photo-piece.png";
  const SCENE_FILTER_SRC = "./assets/shared/memory-pieces-interior-filter.png";

  let isVisible = false;
  let interactionStarted = false;
  let interactionComplete = false;
  let isDragging = false;
  let dragDistance = 0;
  let lastPointerX = 0;
  let dragIndicator = null;
  let combImage = null;
  let darkenOverlay = null;
  let photoPieceImage = null;
  let sceneFilterImage = null;
  let combAnimationFrame = null;
  let hoverCursor = null;
  let hoverCursorImage = null;

  function sleep(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function preloadAssets() {
    const sources = [
      p2CombingImage.src,
      p2DragZone.src,
      COMB_SRC,
      COMBING_CAT_SRC,
      PHOTO_PIECE_SRC,
      SCENE_FILTER_SRC,
      "./assets/shared/objects/mouse-icon-paw-dark-32.png",
      "./assets/shared/objects/mouse-icon-paw-dark-drag.png"
    ];

    sources.forEach(function (src) {
      const image = new Image();
      image.src = src;
    });
  }

  function preventImageDrag(event) {
    event.preventDefault();
  }

  function getImageBox() {
    if (!p2CombingImage.complete || !p2CombingImage.naturalWidth || !p2CombingImage.naturalHeight) {
      return null;
    }

    const stageWidth = p2CombingStage.clientWidth;
    const stageHeight = p2CombingStage.clientHeight;
    const renderedWidth = stageWidth;
    const renderedHeight = renderedWidth * (p2CombingImage.naturalHeight / p2CombingImage.naturalWidth);

    let imageTop = 0;
    let imageBottomGap = 0;

    if (renderedHeight > stageHeight) {
      p2CombingStage.classList.add("is-tall-image");
      imageTop = 0;
      imageBottomGap = 0;
    } else {
      p2CombingStage.classList.remove("is-tall-image");
      imageTop = (stageHeight - renderedHeight) / 2;
      imageBottomGap = imageTop;
    }

    p2CombingStage.style.setProperty("--scene-top-gap", `${imageTop}px`);
    p2CombingStage.style.setProperty("--scene-bottom-gap", `${imageBottomGap}px`);

    return {
      left: 0,
      top: imageTop,
      width: renderedWidth,
      height: renderedHeight
    };
  }

  function getBackgroundScale() {
    const imageBox = getImageBox();

    if (!imageBox || !p2CombingImage.naturalWidth) {
      return 1;
    }

    return imageBox.width / p2CombingImage.naturalWidth;
  }

  function setElementPositionFromImageBox(element, leftPercent, topPercent) {
    const imageBox = getImageBox();

    if (!imageBox || !element) {
      return;
    }

    const x = imageBox.left + (imageBox.width * leftPercent);
    const y = imageBox.top + (imageBox.height * topPercent);

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  function ensureHoverCursor() {
    if (hoverCursor) {
      return hoverCursor;
    }

    hoverCursor = document.createElement("div");
    hoverCursor.className = "p2-hover-cursor";

    hoverCursorImage = document.createElement("img");
    hoverCursorImage.src = "./assets/shared/objects/mouse-icon-paw-dark-32.png";
    hoverCursorImage.alt = "";

    hoverCursor.appendChild(hoverCursorImage);
    p2CombingSection.appendChild(hoverCursor);

    return hoverCursor;
  }

  function moveCursor(event) {
    const rect = p2CombingSection.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ensureHoverCursor().style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
  }

  function setDragCursorIcon() {
    ensureHoverCursor();
    hoverCursorImage.src = "./assets/shared/objects/mouse-icon-paw-dark-drag.png";
  }

  function setClickCursorIcon() {
    ensureHoverCursor();
    hoverCursorImage.src = "./assets/shared/objects/mouse-icon-paw-dark-32.png";
  }

  function showCursor() {
    ensureHoverCursor().classList.add("is-visible");
    p2CombingSection.classList.add("is-interactive");
  }

  function hideCursor() {
    if (hoverCursor) {
      hoverCursor.classList.remove("is-visible");
    }
    p2CombingSection.classList.remove("is-interactive");
  }

  function ensureSceneFilterImage() {
    if (sceneFilterImage) {
      return sceneFilterImage;
    }

    sceneFilterImage = document.createElement("img");
    sceneFilterImage.className = "p2-scene-filter";
    sceneFilterImage.src = SCENE_FILTER_SRC;
    sceneFilterImage.alt = "";
    sceneFilterImage.addEventListener("dragstart", preventImageDrag);

    p2CombingImage.parentNode.appendChild(sceneFilterImage);

    return sceneFilterImage;
  }

  function updateSceneFilterLayout() {
    const filter = ensureSceneFilterImage();
    const imageBox = getImageBox();

    if (!filter || !imageBox) {
      return;
    }

    filter.style.left = `${imageBox.left}px`;
    filter.style.top = imageBox.height > p2CombingStage.clientHeight ? "0px" : "50%";
    filter.style.width = `${imageBox.width}px`;
    filter.style.height = "auto";
  }

  function updateOverlaySizes() {
    const scale = getBackgroundScale();

    if (p2DragZone.complete && p2DragZone.naturalWidth) {
      p2DragZone.style.width = `${p2DragZone.naturalWidth * scale * 0.9}px`;
      p2DragZone.style.height = "auto";
    }

    if (combImage && combImage.complete && combImage.naturalWidth) {
      combImage.style.width = `${combImage.naturalWidth * scale * 0.8}px`;
      combImage.style.height = "auto";
    }

    if (photoPieceImage && photoPieceImage.complete && photoPieceImage.naturalWidth) {
      photoPieceImage.style.width = `${photoPieceImage.naturalWidth * scale * 0.9}px`;
      photoPieceImage.style.height = "auto";
    }
  }

  function updateStaticOverlayPositions() {
    updateOverlaySizes();
    setElementPositionFromImageBox(p2DragZone, 0.58, 0.33);
    setElementPositionFromImageBox(photoPieceImage, 0.20, 0.86);
  }

  function updateLayoutForCurrentImage() {
    getImageBox();
    updateSceneFilterLayout();
    updateStaticOverlayPositions();
  }

  function ensureDragIndicator() {
    if (dragIndicator) return dragIndicator;
    dragIndicator = document.createElement("div");
    dragIndicator.id = "p2-drag-indicator";
    dragIndicator.className = "ui-indicator p2-drag-indicator";
    dragIndicator.textContent = "Drag to pet";
    p2CombingImage.parentNode.appendChild(dragIndicator);
    return dragIndicator;
  }

  function updateIndicatorText(text) {
    const indicator = ensureDragIndicator();
    indicator.textContent = text;
    return indicator;
  }

  function ensureCombImage() {
    if (combImage) return combImage;
    combImage = document.createElement("img");
    combImage.id = "p2-comb";
    combImage.className = "p2-comb";
    combImage.src = COMB_SRC;
    combImage.alt = "Comb";
    p2CombingImage.parentNode.appendChild(combImage);
    combImage.addEventListener("dragstart", preventImageDrag);
    combImage.addEventListener("load", updateOverlaySizes);
    return combImage;
  }

  function ensureDarkenOverlay() {
    if (darkenOverlay) return darkenOverlay;
    darkenOverlay = document.createElement("div");
    darkenOverlay.className = "p2-darken-overlay";
    p2CombingImage.parentNode.appendChild(darkenOverlay);
    return darkenOverlay;
  }

  function ensurePhotoPieceImage() {
    if (photoPieceImage) return photoPieceImage;

    photoPieceImage = document.createElement("img");
    photoPieceImage.className = "p2-photo-piece";
    photoPieceImage.src = PHOTO_PIECE_SRC;
    photoPieceImage.alt = "Photo piece";
    p2CombingImage.parentNode.appendChild(photoPieceImage);

    photoPieceImage.addEventListener("dragstart", preventImageDrag);
    photoPieceImage.addEventListener("load", updateOverlaySizes);

    photoPieceImage.addEventListener("mouseenter", function (event) {
      const indicator = updateIndicatorText("Retrieve the photo piece");
      indicator.classList.add("is-visible");
      setClickCursorIcon();
      moveCursor(event);
      showCursor();
    });

    photoPieceImage.addEventListener("mouseleave", function () {
      if (dragIndicator) {
        dragIndicator.classList.remove("is-visible");
      }
      hideCursor();
    });

    photoPieceImage.addEventListener("mousemove", moveCursor);

    photoPieceImage.addEventListener("click", async function () {
      hideCursor();
      document.dispatchEvent(new Event("returnToBrokenPhotoHub"));

      await new Promise(function (resolve) {
        requestAnimationFrame(function () {
          requestAnimationFrame(resolve);
        });
      });

      p2CombingSection.classList.add("is-complete");
    });

    return photoPieceImage;
  }

  async function showInteractionUi() {
    if (interactionStarted) return;
    interactionStarted = true;
    await sleep(450);
    updateStaticOverlayPositions();
    p2DragZone.classList.add("is-visible");
    updateIndicatorText("Drag to pet").classList.add("is-visible");
  }

  function stopCombAnimation() {
    if (combAnimationFrame) {
      cancelAnimationFrame(combAnimationFrame);
      combAnimationFrame = null;
    }
  }

  function setCombPosition(leftPercent, topPercent) {
    const comb = ensureCombImage();
    updateOverlaySizes();
    setElementPositionFromImageBox(comb, leftPercent, topPercent);
  }

  async function animateCombPath() {
    const keyframes = [
      { progress: 0.0, left: 0.46, top: 0.49 },
      { progress: 0.12, left: 0.56, top: 0.59 },
      { progress: 0.22, left: 0.61, top: 0.56 },
      { progress: 0.34, left: 0.71, top: 0.63 },
      { progress: 0.52, left: 0.46, top: 0.49 },
      { progress: 0.66, left: 0.56, top: 0.59 },
      { progress: 0.76, left: 0.61, top: 0.56 },
      { progress: 1.0, left: 0.71, top: 0.63 }
    ];

    const duration = 3400;
    const startTime = performance.now();

    return new Promise(function (resolve) {
      function step(now) {
        const elapsed = now - startTime;
        let progress = elapsed / duration;

        if (progress > 1) {
          progress = 1;
        }

        let currentFrame = keyframes[0];
        let nextFrame = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i += 1) {
          if (progress >= keyframes[i].progress && progress <= keyframes[i + 1].progress) {
            currentFrame = keyframes[i];
            nextFrame = keyframes[i + 1];
            break;
          }
        }

        const localRange = nextFrame.progress - currentFrame.progress;
        let localProgress = 0;

        if (localRange > 0) {
          localProgress = (progress - currentFrame.progress) / localRange;
        }

        const left = currentFrame.left + ((nextFrame.left - currentFrame.left) * localProgress);
        const top = currentFrame.top + ((nextFrame.top - currentFrame.top) * localProgress);

        setCombPosition(left, top);

        if (progress < 1) {
          combAnimationFrame = requestAnimationFrame(step);
        } else {
          combAnimationFrame = null;
          resolve();
        }
      }

      combAnimationFrame = requestAnimationFrame(step);
    });
  }

  async function completeDragInteraction() {
    if (interactionComplete) return;

    interactionComplete = true;
    isDragging = false;
    hideCursor();
    p2DragZone.classList.add("is-hidden");

    if (dragIndicator) {
      dragIndicator.classList.remove("is-visible");
    }

    p2CombingImage.src = COMBING_CAT_SRC;

    await new Promise(function (resolve) {
      if (p2CombingImage.complete) {
        resolve();
        return;
      }

      p2CombingImage.addEventListener("load", resolve, { once: true });
    });

    updateLayoutForCurrentImage();

    const comb = ensureCombImage();
    comb.classList.remove("is-hidden");
    comb.classList.add("is-visible");
    setCombPosition(0.46, 0.49);

    await sleep(120);
    await animateCombPath();

    comb.classList.add("is-hidden");

    ensureDarkenOverlay().classList.add("is-visible");

    const piece = ensurePhotoPieceImage();
    updateStaticOverlayPositions();
    piece.classList.add("is-visible");
  }

  function handlePointerDown(event) {
    if (interactionComplete) return;
    isDragging = true;
    lastPointerX = event.clientX;
  }

  function handlePointerMove(event) {
    if (!isDragging || interactionComplete) return;

    const deltaX = event.clientX - lastPointerX;
    lastPointerX = event.clientX;

    if (deltaX > 0) {
      dragDistance += deltaX;
    }

    if (dragDistance >= 100) {
      completeDragInteraction();
    }
  }

  function handlePointerUp() {
    isDragging = false;
  }

  function resetP2CombingUI() {
    stopCombAnimation();
    hideCursor();

    if (dragIndicator) {
      dragIndicator.classList.remove("is-visible");
    }

    if (combImage) {
      combImage.classList.remove("is-visible");
      combImage.classList.remove("is-hidden");
    }

    if (darkenOverlay) {
      darkenOverlay.classList.remove("is-visible");
    }

    if (photoPieceImage) {
      photoPieceImage.classList.remove("is-visible");
    }

    p2DragZone.classList.remove("is-hidden");
    p2DragZone.classList.remove("is-visible");
  }

  function revealP2CombingSection() {
    resetP2CombingUI();
    isVisible = true;
    interactionStarted = false;
    interactionComplete = false;
    isDragging = false;
    dragDistance = 0;
    p2CombingImage.src = BEFORE_COMB_SRC;

    if (p2CombingImage.complete) {
      updateLayoutForCurrentImage();
    } else {
      p2CombingImage.addEventListener("load", updateLayoutForCurrentImage, { once: true });
    }

    ensureSceneFilterImage();

    p2CombingSection.classList.remove("is-complete");
    p2CombingSection.classList.add("is-visible");
    showInteractionUi();
  }

  p2CombingImage.addEventListener("dragstart", preventImageDrag);

  p2DragZone.addEventListener("dragstart", preventImageDrag);
  p2DragZone.addEventListener("pointerdown", handlePointerDown);
  p2DragZone.addEventListener("mouseenter", function (event) {
    if (interactionComplete) return;
    setDragCursorIcon();
    moveCursor(event);
    showCursor();
  });
  p2DragZone.addEventListener("mouseleave", function () {
    hideCursor();
  });
  p2DragZone.addEventListener("mousemove", moveCursor);

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);

  document.addEventListener("showP2CombingSection", function () {
    revealP2CombingSection();
  });

  document.addEventListener("replayLandingFromHome", function () {
    resetP2CombingUI();
  });

  window.addEventListener("resize", function () {
    updateLayoutForCurrentImage();
  });

  preloadAssets();
}