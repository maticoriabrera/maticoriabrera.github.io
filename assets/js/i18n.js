const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["en", "es", "it"];
const I18N_FILE_PATH = "assets/data/i18n.json";

window.currentLanguage = DEFAULT_LANGUAGE;
window.i18nData = null;

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

function getLanguageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return normalizeLanguage(params.get("lang"));
}

function getText(key, language = window.currentLanguage) {
  return (
    window.i18nData?.[language]?.texts?.[key] ??
    window.i18nData?.en?.texts?.[key] ??
    key
  );
}

window.getText = getText;

function getAttributeText(key, language = window.currentLanguage) {
  return (
    window.i18nData?.[language]?.attributes?.[key] ??
    window.i18nData?.[language]?.texts?.[key] ??
    window.i18nData?.en?.attributes?.[key] ??
    window.i18nData?.en?.texts?.[key] ??
    key
  );
}

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

function initLanguageSelector() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      setLanguage(button.dataset.lang);
    });
  });
}

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

document.addEventListener("DOMContentLoaded", initI18n);
