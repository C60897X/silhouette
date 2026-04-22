export function initP3AccompanySection() {
  const p3AccompanySection = document.getElementById("section-06-p3-accompany");
  const p3AccompanyStage = document.getElementById("p3-accompany-stage");
  const p3AccompanyImage = document.getElementById("p3-accompany-image");
  const p3TimeHit = document.getElementById("p3-time-hit");

  if (!p3AccompanySection || !p3AccompanyStage || !p3AccompanyImage || !p3TimeHit) {
    return;
  }

  const SCENE_3PM_SRC = "./assets/p3-accompany/3pm-scene.png";
  const SCENE_4PM_SRC = "./assets/p3-accompany/4pm-scene.png";
  const SCENE_5PM_1_SRC = "./assets/p3-accompany/5pm-scene-1.png";
  const SCENE_5PM_2_SRC = "./assets/p3-accompany/5pm-scene-2.png";
  const SCENE_5PM_3_SRC = "./assets/p3-accompany/5pm-scene-3.png";
  const SCENE_5PM_4_SRC = "./assets/p3-accompany/5pm-scene-4.png";
  const PHOTO_PIECE_SRC = "./assets/p3-accompany/photo-piece.png";
  const INTERIOR_FILTER_SRC = "./assets/shared/memory-pieces-interior-filter.png";

  let currentStep = 0;
  let isAnimating = false;
  let clockIndicator = null;
  let photoPieceImage = null;
  let filterImage = null;
  let hoverCursor = null;

  function sleep(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function preloadAssets() {
    const sources = [
      SCENE_3PM_SRC,
      SCENE_4PM_SRC,
      SCENE_5PM_1_SRC,
      SCENE_5PM_2_SRC,
      SCENE_5PM_3_SRC,
      SCENE_5PM_4_SRC,
      PHOTO_PIECE_SRC,
      INTERIOR_FILTER_SRC,
      "./assets/shared/objects/mouse-icon-paw-dark-32.png"
    ];

    for (let i = 0; i < sources.length; i += 1) {
      const image = new Image();
      image.src = sources[i];
    }
  }

  function preventImageDrag(event) {
    event.preventDefault();
  }

  function getImageBox() {
    if (!p3AccompanyImage.complete || !p3AccompanyImage.naturalWidth || !p3AccompanyImage.naturalHeight) {
      return null;
    }

    const stageWidth = p3AccompanyStage.clientWidth;
    const stageHeight = p3AccompanyStage.clientHeight;
    const renderedWidth = stageWidth;
    const renderedHeight = renderedWidth * (p3AccompanyImage.naturalHeight / p3AccompanyImage.naturalWidth);

    let imageTop = 0;

    if (renderedHeight > stageHeight) {
      p3AccompanyStage.classList.add("is-tall-image");
      imageTop = 0;
    } else {
      p3AccompanyStage.classList.remove("is-tall-image");
      imageTop = (stageHeight - renderedHeight) / 2;
    }

    return {
      left: 0,
      top: imageTop,
      width: renderedWidth,
      height: renderedHeight
    };
  }

  function getBackgroundScale() {
    const imageBox = getImageBox();

    if (!imageBox || !p3AccompanyImage.naturalWidth) {
      return 1;
    }

    return imageBox.width / p3AccompanyImage.naturalWidth;
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

  function updateTimeHitSize() {
    const scale = getBackgroundScale();
  
    p3TimeHit.style.width = `${190 * scale}px`;
    p3TimeHit.style.height = `${130 * scale}px`;
  }

  function updatePhotoPieceSize() {
    if (!photoPieceImage || !photoPieceImage.complete || !photoPieceImage.naturalWidth) {
      return;
    }

    const scale = getBackgroundScale();
    photoPieceImage.style.width = `${photoPieceImage.naturalWidth * scale * 0.92}px`;
    photoPieceImage.style.height = "auto";
  }

  function updateFilterLayout() {
    const filter = ensureFilterImage();
    const imageBox = getImageBox();

    if (!filter || !imageBox) {
      return;
    }

    filter.style.left = `${imageBox.left}px`;
    filter.style.top = imageBox.height > p3AccompanyStage.clientHeight ? "0px" : "50%";
    filter.style.width = `${imageBox.width}px`;
    filter.style.height = "auto";
  }

  function updateInteractivePositions() {
    updateTimeHitSize();
    updatePhotoPieceSize();
    setElementPositionFromImageBox(p3TimeHit, 0.76, 0.39);
    setElementPositionFromImageBox(photoPieceImage, 0.60, 0.58);
  }

  function updateLayoutForCurrentImage() {
    getImageBox();
    updateFilterLayout();
    updateInteractivePositions();
  }

  function ensureHoverCursor() {
    if (hoverCursor) return hoverCursor;

    hoverCursor = document.createElement("div");
    hoverCursor.className = "p3-hover-cursor";

    const img = document.createElement("img");
    img.src = "./assets/shared/objects/mouse-icon-paw-dark-32.png";
    img.alt = "";

    hoverCursor.appendChild(img);
    p3AccompanySection.appendChild(hoverCursor);

    return hoverCursor;
  }

  function moveCursor(event) {
    const rect = p3AccompanySection.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ensureHoverCursor().style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
  }

  function showCursor() {
    ensureHoverCursor().classList.add("is-visible");
    p3AccompanySection.classList.add("is-interactive");
  }

  function hideCursor() {
    if (hoverCursor) {
      hoverCursor.classList.remove("is-visible");
    }
    p3AccompanySection.classList.remove("is-interactive");
  }

  function ensureFilterImage() {
    if (filterImage) {
      return filterImage;
    }

    filterImage = document.createElement("img");
    filterImage.className = "p3-accompany-filter";
    filterImage.src = INTERIOR_FILTER_SRC;
    filterImage.alt = "";
    filterImage.addEventListener("dragstart", preventImageDrag);

    p3AccompanyImage.parentNode.appendChild(filterImage);

    return filterImage;
  }

  function ensureClockIndicator() {
    if (clockIndicator) {
      return clockIndicator;
    }

    clockIndicator = document.createElement("div");
    clockIndicator.id = "p3-clock-indicator";
    clockIndicator.className = "ui-indicator p3-clock-indicator";
    clockIndicator.textContent = "Use clock to advance time";
    p3AccompanyImage.parentNode.appendChild(clockIndicator);

    return clockIndicator;
  }

  function showClockIndicator(text) {
    const indicator = ensureClockIndicator();
    indicator.textContent = text;
    indicator.classList.add("is-visible");
  }

  function hideClockIndicator() {
    if (clockIndicator) {
      clockIndicator.classList.remove("is-visible");
    }
  }

  function ensurePhotoPieceImage() {
    if (photoPieceImage) {
      return photoPieceImage;
    }

    photoPieceImage = document.createElement("img");
    photoPieceImage.className = "p3-photo-piece";
    photoPieceImage.src = PHOTO_PIECE_SRC;
    photoPieceImage.alt = "Photo piece";

    p3AccompanyImage.parentNode.appendChild(photoPieceImage);

    photoPieceImage.addEventListener("dragstart", preventImageDrag);
    photoPieceImage.addEventListener("load", updatePhotoPieceSize);

    photoPieceImage.addEventListener("mouseenter", function () {
      showClockIndicator("Retrieve the photo piece");
      showCursor();
    });

    photoPieceImage.addEventListener("mouseleave", function () {
      hideClockIndicator();
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

      p3AccompanySection.classList.add("is-complete");
    });

    return photoPieceImage;
  }

  function showTimeHit() {
    updateInteractivePositions();
    p3TimeHit.classList.remove("is-hidden");
    p3TimeHit.classList.add("is-visible");
  }

  function hideTimeHit() {
    p3TimeHit.classList.remove("is-visible");
    p3TimeHit.classList.add("is-hidden");
  }

  async function setScene(src) {
    p3AccompanyImage.src = src;

    await new Promise(function (resolve) {
      if (p3AccompanyImage.complete) {
        resolve();
        return;
      }

      p3AccompanyImage.addEventListener("load", resolve, { once: true });
    });

    updateLayoutForCurrentImage();
  }

  async function playFivePmAnimation() {
    if (isAnimating) {
      return;
    }

    isAnimating = true;

    hideTimeHit();
    hideClockIndicator();
    hideCursor();

    await setScene(SCENE_5PM_1_SRC);
    await sleep(650);

    await setScene(SCENE_5PM_2_SRC);
    await sleep(650);

    await setScene(SCENE_5PM_3_SRC);
    await sleep(650);

    await setScene(SCENE_5PM_4_SRC);
    await sleep(550);

    const piece = ensurePhotoPieceImage();
    updateInteractivePositions();
    piece.classList.add("is-visible");
  }

  async function handleTimeClick() {
    if (isAnimating) {
      return;
    }

    if (currentStep === 0) {
      currentStep = 1;
      await setScene(SCENE_4PM_SRC);
      showTimeHit();
      return;
    }

    if (currentStep === 1) {
      currentStep = 2;
      await playFivePmAnimation();
    }
  }

  async function resetSection() {
    currentStep = 0;
    isAnimating = false;
    hideCursor();

    await setScene(SCENE_3PM_SRC);

    showTimeHit();
    showClockIndicator("Use clock to advance time");

    if (photoPieceImage) {
      photoPieceImage.classList.remove("is-visible");
    }
  }

  async function revealP3AccompanySection() {
    ensureFilterImage();
    await resetSection();
    p3AccompanySection.classList.remove("is-complete");
    p3AccompanySection.classList.add("is-visible");
  }

  p3AccompanyImage.addEventListener("dragstart", preventImageDrag);
  p3TimeHit.addEventListener("click", handleTimeClick);
  p3TimeHit.addEventListener("mouseenter", function (event) {
    showCursor();
    moveCursor(event);
  });
  p3TimeHit.addEventListener("mouseleave", hideCursor);
  p3TimeHit.addEventListener("mousemove", moveCursor);

  document.addEventListener("showP3AccompanySection", function () {
    revealP3AccompanySection();
  });

  window.addEventListener("resize", function () {
    updateLayoutForCurrentImage();
  });

  preloadAssets();
}