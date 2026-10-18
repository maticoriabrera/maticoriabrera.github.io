/**
 * SPOTIFY PLAYLIST MODAL
 *
 * Manages opening and closing the Spotify playlist modal, including keyboard
 * dismissal, accessible visibility state, and focus restoration.
 *
 * Requires the trigger, modal, close button, and playlist iframe to exist in
 * the page. The iframe is defined in HTML and must provide its playlist URL
 * through the data-src attribute; its src is assigned only when opened.
 */
(() => {
  // DOM REFERENCES AND INITIALIZATION
  const openButton = document.getElementById('openSpotifyModal');
  const modal = document.getElementById('spotifyModal');
  const closeButton = document.getElementById('closeSpotifyModal');
  const frame = document.getElementById('spotifyPlaylistFrame');

  // Do not register handlers when the required modal elements are missing.
  if (!openButton || !modal || !closeButton || !frame) return;

  // MODAL STATE
  let lastFocusedElement = null;

  // SPOTIFY PLAYER LIFECYCLE

  /**
   * Assigns the iframe source on demand, without reloading an active player.
   *
   * @returns {void}
   */
  const loadPlayer = () => {
    if (!frame.getAttribute('src')) {
      frame.setAttribute('src', frame.dataset.src);
    }
  };

  /**
   * Removes the iframe source to stop playback when the modal closes.
   * The iframe element itself remains in the DOM.
   *
   * @returns {void}
   */
  const unloadPlayer = () => {
    // Unloading the iframe stops Spotify if audio was playing.
    frame.removeAttribute('src');
  };

  // MODAL VISIBILITY AND FOCUS

  /**
   * Opens the modal, loads the playlist, and moves focus to the close button.
   * Saves the previously focused element for restoration when closing.
   *
   * @returns {void}
   */
  const openModal = () => {
    lastFocusedElement = document.activeElement;
    loadPlayer();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('spotify-modal-open');
    closeButton.focus();
  };

  /**
   * Closes an open modal, unloads the playlist, and restores keyboard focus.
   * Uses the open button as a fallback if focus cannot be restored.
   *
   * @returns {void}
   */
  const closeModal = () => {
    if (!modal.classList.contains('is-open')) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('spotify-modal-open');
    unloadPlayer();

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    } else {
      openButton.focus();
    }
  };

  // EVENT HANDLERS
  openButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);

  // Only a direct click on the backdrop dismisses the modal.
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  // Escape dismisses the modal only while it is open.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();
