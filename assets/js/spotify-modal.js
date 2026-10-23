/**
 * SPOTIFY PLAYLIST MODAL
 *
 * Manages opening and closing the Spotify playlist dialog, including keyboard
 * dismissal, accessible visibility state, and focus restoration to the trigger.
 *
 * The initial HTML contains only an empty player container. Spotify's iframe
 * is created after the visitor clicks Music, and is removed on close to stop
 * playback. No iframe or Spotify resource is loaded during initial page load.
 */
(() => {
  // DOM REFERENCES AND INITIALIZATION
  const openButton = document.getElementById('openSpotifyModal');
  const modal = document.getElementById('spotifyModal');
  const closeButton = document.getElementById('closeSpotifyModal');
  const playerContainer = document.getElementById('spotifyPlaylistContainer');

  // Do not register handlers if the modal or playlist URL is unavailable.
  if (!openButton || !modal || !closeButton || !playerContainer?.dataset.src) return;

  // SPOTIFY PLAYER LIFECYCLE

  /**
   * Builds and attaches a new Spotify iframe only after the dialog is opened.
   * The official embed permission attributes are kept intact: removing them
   * solely to silence browser messages may affect playback capabilities.
   *
   * @returns {void}
   */
  const loadPlayer = () => {
    // Prevent duplicate players if an open event is received more than once.
    if (playerContainer.querySelector('iframe')) return;

    const frame = document.createElement('iframe');
    frame.id = 'spotifyPlaylistFrame';
    frame.setAttribute('data-testid', 'embed-iframe');
    frame.title = 'Rock Argentino - Spotify playlist';
    frame.setAttribute('width', '100%');
    frame.setAttribute('height', '352');
    frame.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
    frame.setAttribute('loading', 'lazy');
    frame.setAttribute('frameborder', '0');
    frame.src = playerContainer.dataset.src;

    // The browser encounters the iframe and its permissions only now.
    playerContainer.appendChild(frame);
  };

  /**
   * Removes the entire iframe (rather than merely removing its src) to stop
   * playback and release the embedded document when the dialog closes.
   *
   * @returns {void}
   */
  const unloadPlayer = () => {
    playerContainer.replaceChildren();
  };

  // MODAL VISIBILITY AND FOCUS

  /**
   * Opens the modal, creates the player on demand, and focuses the close button.
   * Focus will return to the Music button when the dialog closes.
   *
   * @returns {void}
   */
  const openModal = () => {
    if (modal.classList.contains('is-open')) return;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('spotify-modal-open');
    loadPlayer();

    // Wait until the CSS visibility transition has made the dialog focusable.
    // Calling focus() in this same event can fail while visibility is hidden.
    requestAnimationFrame(() => {
      if (modal.classList.contains('is-open')) closeButton.focus();
    });
  };

  /**
   * Closes the modal, removes the player, and restores keyboard focus before
   * hiding the dialog from assistive technology.
   *
   * @returns {void}
   */
  const closeModal = () => {
    if (!modal.classList.contains('is-open')) return;

    unloadPlayer();
    document.body.classList.remove('spotify-modal-open');

    // Restore focus outside the dialog before applying aria-hidden="true".
    openButton.focus();

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
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
