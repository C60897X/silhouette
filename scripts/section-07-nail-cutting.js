export function initP4NailCuttingSection() {
    const p4Section = document.getElementById("section-07-nail-cutting");
    const p4Stage = document.getElementById("p4-nail-cutting-stage");
    const p4Image = document.getElementById("p4-nail-cutting-image");
    const p4DragHit = document.getElementById("p4-drag-hit");
  
    if (!p4Section || !p4Stage || !p4Image || !p4DragHit) {
      return;
    }
  
    const BEFORE_SRC = "./assets/p4-nails/nail-cutting-before.png";
    const BEFORE_TRANSITION_1_SRC = "./assets/p4-nails/nail-cutting-before-transition-1.png";
    const BEFORE_TRANSITION_2_SRC = "./assets/p4-nails/nail-cutting-before-transition-2.png";
    const NAIL_1_SRC = "./assets/p4-nails/nail-cutting-1.png";
    const NAIL_2_SRC = "./assets/p4-nails/nail-cutting-2.png";
    const NAIL_3_SRC = "./assets/p4-nails/nail-cutting-3.png";
    const NAIL_4_SRC = "./assets/p4-nails/nail-cutting-4.png";
    const AFTER_SRC = "./assets/p4-nails/nail-cutting-after.png";
    const PHOTO_PIECE_SRC = "./assets/p4-nails/photo-piece.png";
    const INTERIOR_FILTER_SRC = "./assets/shared/memory-pieces-interior-filter.png";
  
    let dragIndicator = null;
    let hoverCursor = null;
    let hoverCursorImage = null;
    let photoPieceImage = null;
    let filterImage = null;
    let isDragging = false;
    let interactionComplete = false;
    let lastPointerX = 0;
    let dragDistance = 0;
  
    function sleep(ms) {
      return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
      });
    }
  
    function preloadAssets() {
      const sources = [
        BEFORE_SRC,
        BEFORE_TRANSITION_1_SRC,
        BEFORE_TRANSITION_2_SRC,
        NAIL_1_SRC,
        NAIL_2_SRC,
        NAIL_3_SRC,
        NAIL_4_SRC,
        AFTER_SRC,
        PHOTO_PIECE_SRC,
        INTERIOR_FILTER_SRC,
        "./assets/shared/objects/mouse-icon-paw-dark-32.png",
        "./assets/shared/objects/mouse-icon-paw-dark-drag.png"
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
      if (!p4Image.complete || !p4Image.naturalWidth || !p4Image.naturalHeight) {
        return null;
      }
  
      const stageWidth = p4Stage.clientWidth;
      const stageHeight = p4Stage.clientHeight;
      const renderedWidth = stageWidth;
      const renderedHeight = renderedWidth * (p4Image.naturalHeight / p4Image.naturalWidth);
  
      let imageTop = 0;
  
      if (renderedHeight > stageHeight) {
        p4Stage.classList.add("is-tall-image");
        imageTop = 0;
      } else {
        p4Stage.classList.remove("is-tall-image");
        imageTop = (stageHeight - renderedHeight) / 2;
      }
  
      return {
        left: 0,
        top: imageTop,
        width: renderedWidth,
        height: renderedHeight
      };
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
  
    function updateInteractivePositions() {
      setElementPositionFromImageBox(p4DragHit, 0.505, 0.68);
      setElementPositionFromImageBox(photoPieceImage, 0.70, 0.75);
    }
  
    function ensureHoverCursor() {
      if (hoverCursor) {
        return hoverCursor;
      }
  
      hoverCursor = document.createElement("div");
      hoverCursor.className = "p4-hover-cursor";
  
      hoverCursorImage = document.createElement("img");
      hoverCursorImage.src = "./assets/shared/objects/mouse-icon-paw-dark-drag.png";
      hoverCursorImage.alt = "";
  
      hoverCursor.appendChild(hoverCursorImage);
      p4Section.appendChild(hoverCursor);
  
      return hoverCursor;
    }
  
    function moveCursor(event) {
      const rect = p4Section.getBoundingClientRect();
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
      p4Section.classList.add("is-interactive");
    }
  
    function hideCursor() {
      if (hoverCursor) {
        hoverCursor.classList.remove("is-visible");
      }
      p4Section.classList.remove("is-interactive");
    }
  
    function ensureDragIndicator() {
      if (dragIndicator) return dragIndicator;
  
      dragIndicator = document.createElement("div");
      dragIndicator.id = "p4-drag-indicator";
      dragIndicator.className = "ui-indicator p4-drag-indicator";
      dragIndicator.textContent = "Drag to cut nails";
      p4Image.parentNode.appendChild(dragIndicator);
  
      return dragIndicator;
    }
  
    function showDragIndicator() {
      ensureDragIndicator().classList.add("is-visible");
    }
  
    function hideDragIndicator() {
      if (dragIndicator) {
        dragIndicator.classList.remove("is-visible");
      }
    }
  
    function ensureFilterImage() {
      if (filterImage) {
        return filterImage;
      }
  
      filterImage = document.createElement("img");
      filterImage.className = "p4-scene-filter";
      filterImage.src = INTERIOR_FILTER_SRC;
      filterImage.alt = "";
      filterImage.addEventListener("dragstart", preventImageDrag);
  
      p4Image.parentNode.appendChild(filterImage);
  
      return filterImage;
    }
  
    function updateFilterLayout() {
      const filter = ensureFilterImage();
      const imageBox = getImageBox();
  
      if (!filter || !imageBox) {
        return;
      }
  
      filter.style.left = `${imageBox.left}px`;
      filter.style.top = imageBox.height > p4Stage.clientHeight ? "0px" : "50%";
      filter.style.width = `${imageBox.width}px`;
      filter.style.height = "auto";
    }
  
    function ensurePhotoPieceImage() {
      if (photoPieceImage) {
        return photoPieceImage;
      }
  
      photoPieceImage = document.createElement("img");
      photoPieceImage.className = "p4-photo-piece";
      photoPieceImage.src = PHOTO_PIECE_SRC;
      photoPieceImage.alt = "Photo piece";
  
      p4Image.parentNode.appendChild(photoPieceImage);
  
      photoPieceImage.addEventListener("dragstart", preventImageDrag);
  
      photoPieceImage.addEventListener("mouseenter", function (event) {
        setClickCursorIcon();
        moveCursor(event);
        showCursor();
      });
  
      photoPieceImage.addEventListener("mouseleave", function () {
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
  
        p4Section.classList.add("is-complete");
      });
  
      return photoPieceImage;
    }
  
    async function setScene(src) {
      p4Image.src = src;
  
      await new Promise(function (resolve) {
        if (p4Image.complete) {
          resolve();
          return;
        }
  
        p4Image.addEventListener("load", resolve, { once: true });
      });
  
      updateLayoutForCurrentImage();
    }
  
    function updateLayoutForCurrentImage() {
      updateFilterLayout();
      updateInteractivePositions();
    }
  
    async function playCuttingSequence() {
      await setScene(BEFORE_TRANSITION_1_SRC);
      await sleep(280);
  
      await setScene(BEFORE_TRANSITION_2_SRC);
      await sleep(280);
  
      await setScene(NAIL_1_SRC);
      await sleep(340);
  
      await setScene(NAIL_2_SRC);
      await sleep(340);
  
      await setScene(NAIL_3_SRC);
      await sleep(340);
  
      await setScene(NAIL_4_SRC);
      await sleep(340);
  
      await setScene(AFTER_SRC);
    }
  
    async function completeInteraction() {
      if (interactionComplete) return;
  
      interactionComplete = true;
      isDragging = false;
      hideDragIndicator();
      hideCursor();
      p4DragHit.classList.add("is-hidden");
  
      await playCuttingSequence();
  
      const piece = ensurePhotoPieceImage();
      updateInteractivePositions();
      piece.classList.add("is-visible");
    }
  
    function handlePointerDown(event) {
      if (interactionComplete) return;
      isDragging = true;
      lastPointerX = event.clientX;
      dragDistance = 0;
    }
  
    function handlePointerMove(event) {
      if (!isDragging || interactionComplete) return;
  
      const deltaX = event.clientX - lastPointerX;
      lastPointerX = event.clientX;
  
      if (deltaX > 0) {
        dragDistance += deltaX;
      }
  
      if (dragDistance >= 60) {
        completeInteraction();
      }
    }
  
    function handlePointerUp() {
      isDragging = false;
    }
  
    async function resetSection() {
      isDragging = false;
      interactionComplete = false;
      dragDistance = 0;
      hideCursor();
      hideDragIndicator();
  
      await setScene(BEFORE_SRC);
  
      ensureFilterImage();
      updateLayoutForCurrentImage();
  
      p4DragHit.classList.remove("is-hidden");
      p4DragHit.classList.add("is-visible");
  
      if (photoPieceImage) {
        photoPieceImage.classList.remove("is-visible");
      }
  
      showDragIndicator();
    }
  
    async function revealP4NailCuttingSection() {
      await resetSection();
      p4Section.classList.remove("is-complete");
      p4Section.classList.add("is-visible");
    }
  
    p4Image.addEventListener("dragstart", preventImageDrag);
    p4DragHit.addEventListener("dragstart", preventImageDrag);
    p4DragHit.addEventListener("pointerdown", handlePointerDown);
  
    p4DragHit.addEventListener("mouseenter", function (event) {
      setDragCursorIcon();
      moveCursor(event);
      showCursor();
    });
  
    p4DragHit.addEventListener("mouseleave", function () {
      hideCursor();
    });
  
    p4DragHit.addEventListener("mousemove", moveCursor);
  
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  
    document.addEventListener("showP4NailCuttingSection", function () {
      revealP4NailCuttingSection();
    });
  
    window.addEventListener("resize", function () {
      updateLayoutForCurrentImage();
    });
  
    preloadAssets();
  }