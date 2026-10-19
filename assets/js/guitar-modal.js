/**
 * GUITAR VIDEO MODAL
 *
 * Controls the guitar video dialog, including on-demand media loading,
 * explicit user-initiated playback, keyboard and backdrop dismissal,
 * and keyboard-focus restoration.
 *
 * Requires the trigger, modal, close button, and video elements in the page.
 * The video URL is provided by the video's data-src attribute. The HTML
 * preload attribute controls the browser's media-prefetching preference.
 */
(() => {
  // DOM REFERENCES AND INITIALIZATION
  const openLink = document.getElementById('openGuitarVideo');
  const modal = document.getElementById('guitarVideoModal');
  const closeButton = document.getElementById('closeGuitarVideo');
  const video = document.getElementById('guitarVideo');

  // Skip initialization if the expected markup is not present.
  if (!openLink || !modal || !closeButton || !video) return;

  // MODAL STATE
  let lastFocusedElement = null;

  // VIDEO RESOURCE LIFECYCLE

  /**
   * Assigns the video source when the dialog is first opened and calls load().
   * Loading is skipped if a source is already assigned. Does not start playback.
   *
   * @returns {void}
   */
  const loadVideo = () => {
    if (!video.getAttribute('src')) {
      video.setAttribute('src', video.dataset.src);
      // Now that the user explicitly opened the modal, load only the
      // metadata/initial bytes. Playback still starts only after pressing Play.
      video.load();
    }
  };

  /**
   * Stops playback, attempts to rewind, and removes the media source.
   * Calls load() again to reset the video element after unloading the source.
   * A failed currentTime assignment does not interrupt cleanup.
   *
   * @returns {void}
   */
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

  // MODAL VISIBILITY AND FOCUS

  /**
   * Prevents navigation from the trigger link and displays the dialog.
   * Saves the previously focused element, initializes the video source,
   * and moves keyboard focus to the close button without starting playback.
   *
   * @param {MouseEvent} event - Click event on the guitar video link.
   * @returns {void}
   */
  const openModal = (event) => {
    event.preventDefault();

    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('video-modal-open');
    loadVideo();

    // Intentionally no video.play(): the visitor chooses when to start.
    closeButton.focus();
  };

  /**
   * Closes the dialog only when it is open, unloading the video and
   * restoring focus before hiding the dialog. If the saved element cannot
   * receive focus, the trigger link is used instead.
   *
   * @returns {void}
   */
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

  // EVENT HANDLERS
  openLink.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);

  // Only a click directly on the backdrop closes the dialog.
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  // Escape closes the dialog only while it is visible.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
})();
