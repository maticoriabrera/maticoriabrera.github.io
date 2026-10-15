/**
 * @fileoverview Loads, filters, and displays the project portfolio.
 *
 * Projects are ordered by descending project number, displayed five per page,
 * and rendered with localized metadata, filter controls, and action links.
 *
 * Dependencies: the portfolio page's DOM elements, assets/data/portfolio.json,
 * and the optional getText() and window.currentLanguage globals supplied by the
 * internationalization system. The required DOM must exist when this script runs.
 *
 * Project values are inserted into HTML templates; the JSON data is expected to
 * come from a trusted source.
 */

// CONFIGURATION AND STATE
const PROJECTS_PER_PAGE = 5;

let portfolioProjects = [];
let filteredPortfolioProjects = [];
let portfolioCurrentPage = 1;

// DOM REFERENCES
const portfolioContainer = document.getElementById("portfolio-container");
const portfolioPagination = document.getElementById("portfolio-pagination");
const filterInstitution = document.getElementById("filter-institution");
const filterLanguage = document.getElementById("filter-language");
const filterTechnology = document.getElementById("filter-technology");

// PROJECT DATA CONTRACT

/**
 * Language-keyed text. The renderer looks up the current language, then English.
 *
 * @typedef {Object<string, string>} PortfolioLocalizedValue
 */

/**
 * Represents a project entry as consumed by this file.
 * Some metadata fields support either a plain string or a language-keyed object.
 *
 * @typedef {Object} PortfolioProject
 * @property {number} number - Project number used for ordering and display.
 * @property {string} [name] - Display name; falls back to the repository name.
 * @property {string} [repo] - Repository name used as a display fallback.
 * @property {string} [institution] - Stable institution value used by the filter.
 * @property {string|PortfolioLocalizedValue} [institution_i18n] - Localized institution label.
 * @property {string|PortfolioLocalizedValue} [description] - Project description.
 * @property {string|PortfolioLocalizedValue} [created] - Creation date or label.
 * @property {string|PortfolioLocalizedValue} [updated] - Last update date or label.
 * @property {string|PortfolioLocalizedValue} [status] - Project status.
 * @property {string[]} [languages] - Programming languages used by the project.
 * @property {string[]} [technologies] - Technologies used by the project.
 * @property {string} [image] - Project image URL.
 * @property {string} [repository] - Repository URL.
 * @property {string} [readme] - README URL, when available.
 * @property {string} [demo] - Live demo URL, when available.
 */

// LOCALIZATION HELPERS

/**
 * Gets a translated interface label, or returns its key if getText is unavailable.
 *
 * @param {string} key - Translation key.
 * @returns {string} The translated label or the original key.
 */
function portfolioText(key) {
  if (typeof getText === "function") return getText(key);
  return key;
}

/**
 * Resolves a value for the active language, then English, then a dash.
 * Plain values are returned without a language lookup.
 *
 * @param {string|PortfolioLocalizedValue|null|undefined} value - Project metadata value.
 * @returns {string} The available localized or plain value, or "-".
 */
function localValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[window.currentLanguage || "en"] || value.en || "-";
  }
  return value || "-";
}

// FILTER LABELS AND OPTIONS

/**
 * Replaces the label of a filter's empty-value option, if present.
 *
 * @param {HTMLSelectElement} selectElement - Filter select element.
 * @param {string} text - Text to display for the default option.
 * @returns {void}
 */
function setPortfolioDefaultOption(selectElement, text) {
  const option = selectElement.querySelector('option[value=""]');
  if (option) option.textContent = text;
}

/**
 * Refreshes the default labels of all three portfolio filters.
 *
 * @returns {void}
 */
function updatePortfolioFilterLabels() {
  setPortfolioDefaultOption(filterInstitution, portfolioText("portfolio_filter_all_institutions"));
  setPortfolioDefaultOption(filterLanguage, portfolioText("portfolio_filter_all_languages"));
  setPortfolioDefaultOption(filterTechnology, portfolioText("portfolio_filter_all_technologies"));
}

/**
 * Gets the localized institution label without changing its stable filter value.
 *
 * @param {PortfolioProject} project - Project containing institution metadata.
 * @returns {string} The localized institution label or a fallback value.
 */
function portfolioInstitutionLabel(project) {
  return localValue(project.institution_i18n || project.institution);
}

/**
 * Rebuilds institution options sorted by their current-language display labels.
 * Deduplicates by stable institution value and preserves the current selection
 * when that value still exists after rebuilding.
 *
 * @returns {void}
 */
function rebuildInstitutionFilter() {
  const selectedValue = filterInstitution.value;
  while (filterInstitution.options.length > 1) filterInstitution.remove(1);

  const institutions = new Map();
  portfolioProjects.forEach(project => {
    const value = project.institution;
    if (!value || value === "-") return;
    if (!institutions.has(value)) institutions.set(value, portfolioInstitutionLabel(project));
  });

  [...institutions.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .forEach(([value, label]) => filterInstitution.add(new Option(label, value)));

  if ([...filterInstitution.options].some(option => option.value === selectedValue)) {
    filterInstitution.value = selectedValue;
  }
}

/**
 * Initializes the institution, language, and technology filter options.
 * Languages and technologies are unique values sorted alphabetically.
 *
 * @returns {void}
 */
function populatePortfolioFilters() {
  const languages = [...new Set(portfolioProjects.flatMap(p => p.languages || []).filter(Boolean))].sort();
  const technologies = [...new Set(portfolioProjects.flatMap(p => p.technologies || []).filter(Boolean))].sort();

  updatePortfolioFilterLabels();
  rebuildInstitutionFilter();

  languages.forEach(value => filterLanguage.add(new Option(value, value)));
  technologies.forEach(value => filterTechnology.add(new Option(value, value)));
}

// FILTER EVENTS AND MATCHING

/**
 * Registers change handlers for the three portfolio filters.
 *
 * @returns {void}
 */
function addPortfolioFilterEvents() {
  [filterInstitution, filterLanguage, filterTechnology].forEach(el => el.addEventListener("change", applyPortfolioFilters));
}

/**
 * Keeps projects matching all selected filters and resets pagination to page one.
 * Empty filter values impose no restriction on that attribute.
 *
 * @returns {void}
 */
function applyPortfolioFilters() {
  const institution = filterInstitution.value;
  const language = filterLanguage.value;
  const technology = filterTechnology.value;

  filteredPortfolioProjects = portfolioProjects.filter(project => {
    const institutionMatch = !institution || project.institution === institution;
    const languageMatch = !language || (project.languages || []).includes(language);
    const technologyMatch = !technology || (project.technologies || []).includes(technology);
    return institutionMatch && languageMatch && technologyMatch;
  });

  portfolioCurrentPage = 1;
  renderPortfolioProjects();
  renderPortfolioPagination();
}

// PORTFOLIO MARKUP HELPERS

/**
 * Creates badge markup for a project's languages or technologies.
 * Returns a dash placeholder when the list is empty or missing.
 *
 * @param {string[]|null|undefined} items - Values to display as badges.
 * @param {string} className - Additional CSS class for each badge.
 * @returns {string} HTML markup for the badges or the empty-state placeholder.
 */
function badges(items, className) {
  if (!items || items.length === 0) return '<span class="portfolio-empty-value">-</span>';
  return items.map(item => `<span class="portfolio-badge ${className}">${item}</span>`).join("");
}

/**
 * Creates an external-link action or a non-clickable disabled placeholder.
 * Missing URLs are treated as disabled even if disabled is false.
 *
 * @param {string|null|undefined} url - Destination URL.
 * @param {string} icon - Font Awesome classes for the action icon.
 * @param {string} labelKey - Translation key for the action label.
 * @param {boolean} [disabled=false] - Whether to disable the action explicitly.
 * @returns {string} HTML markup for the action.
 */
function projectButton(url, icon, labelKey, disabled = false) {
  const label = portfolioText(labelKey);
  if (disabled || !url) {
    return `<span class="portfolio-action is-disabled" aria-disabled="true"><i class="${icon}"></i><span>${label}</span></span>`;
  }
  return `<a class="portfolio-action" href="${url}" target="_blank" rel="noopener noreferrer"><i class="${icon}"></i><span>${label}</span></a>`;
}

// PROJECT RENDERING

/**
 * Renders the current page of filtered projects and their detail cards.
 * Uses the project image placeholder when an image URL is unavailable and
 * displays a localized message when there are no matching projects.
 *
 * @returns {void}
 */
function renderPortfolioProjects() {
  const start = (portfolioCurrentPage - 1) * PROJECTS_PER_PAGE;
  const visible = filteredPortfolioProjects.slice(start, start + PROJECTS_PER_PAGE);

  if (visible.length === 0) {
    portfolioContainer.innerHTML = `<section class="block"><div class="card-main"><p class="item-p">${portfolioText("portfolio_empty")}</p></div></section>`;
    return;
  }

  portfolioContainer.innerHTML = visible.map(project => `
    <section class="block">
      <div class="card-main portfolio-card-shell">
        <div class="card-top portfolio-card">
          <article class="item portfolio-project">
            <div class="portfolio-project__body">
              <h4 class="item-h portfolio-project-title">#${String(project.number).padStart(2, "0")} - ${project.name || project.repo}</h4>
              <p class="portfolio-description">${localValue(project.description)}</p>

              <dl class="portfolio-details">
                <div class="portfolio-detail-row"><dt>${portfolioText("portfolio_created_label")}</dt><dd>${localValue(project.created)}</dd></div>
                <div class="portfolio-detail-row"><dt>${portfolioText("portfolio_updated_label")}</dt><dd>${localValue(project.updated)}</dd></div>
                <div class="portfolio-detail-row"><dt>${portfolioText("portfolio_institution_label")}</dt><dd>${portfolioInstitutionLabel(project)}</dd></div>
                <div class="portfolio-detail-row"><dt>${portfolioText("portfolio_language_label")}</dt><dd class="portfolio-badges">${badges(project.languages, "is-language")}</dd></div>
                <div class="portfolio-detail-row"><dt>${portfolioText("portfolio_technology_label")}</dt><dd class="portfolio-badges">${badges(project.technologies, "is-technology")}</dd></div>
                <div class="portfolio-detail-row"><dt>${portfolioText("portfolio_status_label")}</dt><dd>${localValue(project.status)}</dd></div>
              </dl>
            </div>

            <div class="portfolio-media">
              <img src="${project.image || "assets/img/portfolio/project-placeholder.jpg"}" alt="${portfolioText("portfolio_image_alt")} - ${project.name || project.repo}">
            </div>

            <div class="portfolio-actions">
              ${projectButton(project.repository, "fa-brands fa-github", "portfolio_repository_button")}
              ${projectButton(project.readme, "fa-brands fa-readme", "portfolio_readme_button", !project.readme)}
              ${projectButton(project.demo, "fa-solid fa-arrow-up-right-from-square", "portfolio_view_button", !project.demo)}
            </div>
          </article>
        </div>
      </div>
    </section>
  `).join("");
}

// PAGINATION

/**
 * Rebuilds page buttons for the filtered project count.
 * Hides pagination when only one page is needed. Selecting a page re-renders
 * the content and scrolls to the filter section when it exists.
 *
 * @returns {void}
 */
function renderPortfolioPagination() {
  const totalPages = Math.ceil(filteredPortfolioProjects.length / PROJECTS_PER_PAGE);
  portfolioPagination.innerHTML = "";
  if (totalPages <= 1) return;

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = page;
    button.className = "page-btn" + (page === portfolioCurrentPage ? " is-active" : "");
    button.addEventListener("click", () => {
      portfolioCurrentPage = page;
      renderPortfolioProjects();
      renderPortfolioPagination();
      document.querySelector(".portfolio-filters")?.scrollIntoView({behavior:"smooth", block:"start"});
    });
    portfolioPagination.appendChild(button);
  }
}

// DATA LOADING AND ERROR HANDLING

/**
 * Fetches the project dataset, orders it newest first by project number,
 * initializes the filters, and displays the first page.
 * A failed request or invalid JSON displays a localized error message.
 *
 * @returns {Promise<void>} Resolves after rendering or handling a load error.
 */
async function loadPortfolio() {
  try {
    const response = await fetch("assets/data/portfolio.json");
    if (!response.ok) throw new Error("Could not load portfolio.json");
    const raw = await response.json();
    portfolioProjects = raw.slice().sort((a,b) => b.number - a.number);
    filteredPortfolioProjects = [...portfolioProjects];
    populatePortfolioFilters();
    addPortfolioFilterEvents();
    renderPortfolioProjects();
    renderPortfolioPagination();
  } catch (error) {
    console.error(error);
    portfolioContainer.innerHTML = `<section class="block"><div class="card-main"><p class="item-p">${portfolioText("portfolio_error")}</p></div></section>`;
  }
}

// LANGUAGE CHANGE HANDLING

// Refresh translated labels and cards while retaining the active filters and page.
document.addEventListener("languagechange", () => {
  updatePortfolioFilterLabels();
  rebuildInstitutionFilter();
  renderPortfolioProjects();
  renderPortfolioPagination();
});

// INITIALIZATION

// Start loading after the page's required portfolio elements have been parsed.
loadPortfolio();
