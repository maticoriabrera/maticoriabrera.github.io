(() => {
  const openButton = document.getElementById('openSpotifyModal');
  const modal = document.getElementById('spotifyModal');
  const closeButton = document.getElementById('closeSpotifyModal');
  const frame = document.getElementById('spotifyPlaylistFrame');

  if (!openButton || !modal || !closeButton || !frame) return;

  let lastFocusedElement = null;

  const loadPlayer = () => {
    if (!frame.getAttribute('src')) {
      frame.setAttribute('src', frame.dataset.src);
    }
  };

  const unloadPlayer = () => {
    // Unloading the iframe stops Spotify if audio was playing.
    frame.removeAttribute('src');
  };

  const openModal = () => {
    lastFocusedElement = document.activeElement;
    loadPlayer();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('spotify-modal-open');
    closeButton.focus();
  };

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

  openButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();
