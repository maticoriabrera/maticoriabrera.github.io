(() => {
  const openLink = document.getElementById('openGuitarVideo');
  const modal = document.getElementById('guitarVideoModal');
  const closeButton = document.getElementById('closeGuitarVideo');
  const video = document.getElementById('guitarVideo');

  if (!openLink || !modal || !closeButton || !video) return;

  let lastFocusedElement = null;

  const loadVideo = () => {
    if (!video.getAttribute('src')) {
      video.setAttribute('src', video.dataset.src);
      // Now that the user explicitly opened the modal, load only the
      // metadata/initial bytes. Playback still starts only after pressing Play.
      video.load();
    }
  };

  const unloadVideo = () => {
    video.pause();

    try {
      video.currentTime = 0;
    } catch (_) {
      // currentTime can be unavailable if metadata never finished loading.
    }

    video.removeAttribute('src');
    video.load();
  };

  const openModal = (event) => {
    event.preventDefault();

    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('video-modal-open');
    loadVideo();

    // Intentionally no video.play(): the visitor chooses when to start.
    closeButton.focus();
  };

  const closeModal = () => {
    if (modal.hidden) return;

    unloadVideo();
    document.body.classList.remove('video-modal-open');

    // Move focus outside the dialog before hiding it. This prevents the
    // aria-hidden/retained-focus warning seen in Chromium-based browsers.
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    } else {
      openLink.focus();
    }

    modal.hidden = true;
  };

  openLink.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
})();
