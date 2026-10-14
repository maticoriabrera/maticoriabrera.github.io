/**
 * @fileoverview Internationalization for the CV, courses, and portfolio pages.
 *
 * Loads translation data, updates localized HTML and attributes, preserves the
 * selected language in navigation links, and notifies dependent scripts when
 * the language changes. Exposes window.getText and window.setLanguage.
 *
 * Translation resources are loaded from assets/data/i18n.json. The page must
 * provide the corresponding data-* attributes for translatable elements.
 */

// CONFIGURATION AND GLOBAL STATE

/**
 * Shape of each language entry as used by this script.
 * Optional properties are read only when needed by their corresponding UI.
 *
 * @typedef {Object} LanguageResources
 * @property {{lang?: string}} [meta] - HTML document language metadata.
 * @property {Object<string, string>} [texts] - Translated element content.
 * @property {Object<string, string>} [attributes] - Translated attribute values.
 * @property {{href: string, download: string}} [cv_pdf] - Localized CV download.
 */
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["en", "es", "it"];
const I18N_FILE_PATH = "assets/data/i18n.json";

// Shared state is accessible to scripts that render dynamic page content.
window.currentLanguage = DEFAULT_LANGUAGE;
window.i18nData = null;

// LANGUAGE RESOLUTION

/**
 * Normalizes a language code and rejects unsupported values.
 * Unsupported, missing, or non-string values fall back to English.
 *
 * @param {*} language - Language value to validate.
 * @returns {string} A supported lowercase language code.
 */
function normalizeLanguage(language) {
  if (!language || typeof language !== "string") {
    return DEFAULT_LANGUAGE;
  }

  const normalizedLanguage = language.trim().toLowerCase();

  if (!SUPPORTED_LANGUAGES.includes(normalizedLanguage)) {
    return DEFAULT_LANGUAGE;
  }

  return normalizedLanguage;
}

/**
 * Resolves the initial language from the URL's lang query parameter.
 *
 * @returns {string} The requested supported language, or the default.
 */
function getLanguageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return normalizeLanguage(params.get("lang"));
}

// TRANSLATION LOOKUPS

/**
 * Retrieves translated content, falling back to English and then to the key.
 * Used directly by other scripts through window.getText.
 *
 * @param {string} key - Translation key in the texts collection.
 * @param {string} [language=window.currentLanguage] - Requested language.
 * @returns {string} Localized content or the unresolved key.
 */
function getText(key, language = window.currentLanguage) {
  return (
    window.i18nData?.[language]?.texts?.[key] ??
    window.i18nData?.en?.texts?.[key] ??
    key
  );
}

window.getText = getText;

/**
 * Retrieves an attribute translation using the configured fallback order:
 * requested attributes, requested texts, English attributes, English texts,
 * and finally the untranslated key.
 *
 * @param {string} key - Translation key for an element attribute.
 * @param {string} [language=window.currentLanguage] - Requested language.
 * @returns {string} Localized attribute value or the unresolved key.
 */
function getAttributeText(key, language = window.currentLanguage) {
  return (
    window.i18nData?.[language]?.attributes?.[key] ??
    window.i18nData?.[language]?.texts?.[key] ??
    window.i18nData?.en?.attributes?.[key] ??
    window.i18nData?.en?.texts?.[key] ??
    key
  );
}

// LANGUAGE-AWARE URLS AND NAVIGATION

/**
 * Creates a relative page URL with the selected language in its query string.
 * The default language omits the lang parameter. Other query parameters and
 * fragments are retained from the supplied URL.
 *
 * @param {string} pageUrl - Destination page URL.
 * @param {string} language - Selected language code.
 * @returns {string} Relative file name with query string and fragment.
 */
function buildLanguageUrl(pageUrl, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const url = new URL(pageUrl, window.location.href);

  if (normalizedLanguage === DEFAULT_LANGUAGE) {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", normalizedLanguage);
  }

  return `${url.pathname.split("/").pop() || "index.html"}${url.search}${url.hash}`;
}

/**
 * Reflects the selected language in the address bar without navigating or
 * adding a new browser history entry.
 *
 * @param {string} language - Selected language code.
 * @returns {void}
 */
function updateCurrentUrlLanguage(language) {
  const normalizedLanguage = normalizeLanguage(language);
  const url = new URL(window.location.href);

  if (normalizedLanguage === DEFAULT_LANGUAGE) {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", normalizedLanguage);
  }

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Updates links marked with data-preserve-lang to retain the selected language.
 * Caches a base href without its original query string to avoid accumulating
 * previous language parameters across repeated updates.
 *
 * @param {string} language - Selected language code.
 * @returns {void}
 */
function updateInternalLanguageLinks(language) {
  document.querySelectorAll("[data-preserve-lang]").forEach((link) => {
    const baseHref = link.dataset.baseHref || link.getAttribute("href");

    if (!baseHref) {
      return;
    }

    link.dataset.baseHref = baseHref.split("?")[0];
    link.href = buildLanguageUrl(link.dataset.baseHref, language);
  });
}

// HTML CONTENT TRANSLATION

/**
 * Updates the document language and HTML content of translatable elements.
 * Both data-i18n and data-i18n-html use innerHTML, so translation values
 * must come from trusted, maintained translation resources.
 *
 * @param {string} language - Language to apply to the page.
 * @returns {void}
 */
function applyTextTranslations(language) {
  document.documentElement.lang = window.i18nData?.[language]?.meta?.lang || language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.innerHTML = getText(key, language);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const key = element.dataset.i18nHtml;
    element.innerHTML = getText(key, language);
  });
}

// HTML ATTRIBUTE TRANSLATION

/**
 * Applies translated attributes to elements marked for localization.
 * Supports data-i18n-attr (comma-separated attribute:key pairs), as well as
 * data-i18n-aria-label and data-i18n-alt used by existing pages.
 *
 * @param {string} language - Language to apply to element attributes.
 * @returns {void}
 */
function applyAttributeTranslations(language) {
  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const instructions = element.dataset.i18nAttr
      .split(",")
      .map((instruction) => instruction.trim())
      .filter(Boolean);

    instructions.forEach((instruction) => {
      const [attributeName, translationKey] = instruction
        .split(":")
        .map((part) => part.trim());

      if (!attributeName || !translationKey) {
        return;
      }

      element.setAttribute(attributeName, getAttributeText(translationKey, language));
    });
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", getAttributeText(element.dataset.i18nAriaLabel, language));
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.setAttribute("alt", getAttributeText(element.dataset.i18nAlt, language));
  });
}

// LOCALIZED CV DOWNLOAD

/**
 * Updates CV download links using the selected language's PDF configuration.
 * Falls back to the English PDF and leaves links unchanged if none is defined.
 *
 * @param {string} language - Selected language code.
 * @returns {void}
 */
function updateCvDownload(language) {
  const cvLinks = document.querySelectorAll("#download-cv, [data-cv-download]");
  const cvPdf = window.i18nData?.[language]?.cv_pdf || window.i18nData?.en?.cv_pdf;

  if (!cvPdf) {
    return;
  }

  cvLinks.forEach((cvLink) => {
    cvLink.href = cvPdf.href;
    cvLink.download = cvPdf.download;
  });
}

// LANGUAGE SELECTOR STATE

/**
 * Marks the active language control for styling and accessibility.
 * Uses is-active and aria-current to reflect the current selection.
 *
 * @param {string} language - Selected language code.
 * @returns {void}
 */
function updateLanguageButtons(language) {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    const isActive = button.dataset.lang === language;

    button.classList.toggle("is-active", isActive);

    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

// LANGUAGE CHANGE COORDINATION

/**
 * Applies all language-dependent page updates and announces the change.
 * No changes are made when resources for the selected language are unavailable.
 * Dispatches a languagechange event after updating the page; listeners can
 * use event.detail.language and event.detail.texts to refresh dynamic content.
 *
 * @param {string} language - Language requested by the user or page URL.
 * @param {{updateUrl?: boolean}} [options] - URL update configuration.
 * @returns {void}
 */
function setLanguage(language, options = {}) {
  const normalizedLanguage = normalizeLanguage(language);

  if (!window.i18nData?.[normalizedLanguage]) {
    return;
  }

  window.currentLanguage = normalizedLanguage;

  applyTextTranslations(normalizedLanguage);
  applyAttributeTranslations(normalizedLanguage);
  updateCvDownload(normalizedLanguage);
  updateLanguageButtons(normalizedLanguage);
  updateInternalLanguageLinks(normalizedLanguage);

  if (options.updateUrl !== false) {
    updateCurrentUrlLanguage(normalizedLanguage);
  }

  document.dispatchEvent(new CustomEvent("languagechange", {
    detail: {
      language: normalizedLanguage,
      texts: window.i18nData[normalizedLanguage].texts,
    },
  }));
}

window.setLanguage = setLanguage;

// INITIALIZATION AND EVENT BINDINGS

/**
 * Binds language controls to setLanguage and suppresses link navigation.
 *
 * @returns {void}
 */
function initLanguageSelector() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      setLanguage(button.dataset.lang);
    });
  });
}

/**
 * Loads translation resources, binds the selector, and applies the URL language.
 * On failure, reports the error and still binds language controls, but no
 * translation can be applied until compatible resources are available.
 *
 * @returns {Promise<void>} Resolves when initialization has finished.
 */
async function initI18n() {
  try {
    const response = await fetch(I18N_FILE_PATH);

    if (!response.ok) {
      throw new Error("Could not load i18n.json");
    }

    window.i18nData = await response.json();
    initLanguageSelector();
    setLanguage(getLanguageFromUrl(), { updateUrl: false });
  } catch (error) {
    console.error("Language system could not be initialized:", error);
    initLanguageSelector();
  }
}

// STARTUP

// Delay initialization until the document's HTML elements are available.
document.addEventListener("DOMContentLoaded", initI18n);
