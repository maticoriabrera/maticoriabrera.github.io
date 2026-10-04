const PROJECTS_PER_PAGE = 5;

let portfolioProjects = [];
let filteredPortfolioProjects = [];
let portfolioCurrentPage = 1;

const portfolioContainer = document.getElementById("portfolio-container");
const portfolioPagination = document.getElementById("portfolio-pagination");
const filterInstitution = document.getElementById("filter-institution");
const filterLanguage = document.getElementById("filter-language");
const filterTechnology = document.getElementById("filter-technology");

function portfolioText(key) {
  if (typeof getText === "function") return getText(key);
  return key;
}

function localValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[window.currentLanguage || "en"] || value.en || "-";
  }
  return value || "-";
}

function setPortfolioDefaultOption(selectElement, text) {
  const option = selectElement.querySelector('option[value=""]');
  if (option) option.textContent = text;
}

function updatePortfolioFilterLabels() {
  setPortfolioDefaultOption(filterInstitution, portfolioText("portfolio_filter_all_institutions"));
  setPortfolioDefaultOption(filterLanguage, portfolioText("portfolio_filter_all_languages"));
  setPortfolioDefaultOption(filterTechnology, portfolioText("portfolio_filter_all_technologies"));
}

function portfolioInstitutionLabel(project) {
  return localValue(project.institution_i18n || project.institution);
}

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

function populatePortfolioFilters() {
  const languages = [...new Set(portfolioProjects.flatMap(p => p.languages || []).filter(Boolean))].sort();
  const technologies = [...new Set(portfolioProjects.flatMap(p => p.technologies || []).filter(Boolean))].sort();

  updatePortfolioFilterLabels();
  rebuildInstitutionFilter();

  languages.forEach(value => filterLanguage.add(new Option(value, value)));
  technologies.forEach(value => filterTechnology.add(new Option(value, value)));
}

function addPortfolioFilterEvents() {
  [filterInstitution, filterLanguage, filterTechnology].forEach(el => el.addEventListener("change", applyPortfolioFilters));
}

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

function badges(items, className) {
  if (!items || items.length === 0) return '<span class="portfolio-empty-value">-</span>';
  return items.map(item => `<span class="portfolio-badge ${className}">${item}</span>`).join("");
}

function projectButton(url, icon, labelKey, disabled = false) {
  const label = portfolioText(labelKey);
  if (disabled || !url) {
    return `<span class="portfolio-action is-disabled" aria-disabled="true"><i class="${icon}"></i><span>${label}</span></span>`;
  }
  return `<a class="portfolio-action" href="${url}" target="_blank" rel="noopener noreferrer"><i class="${icon}"></i><span>${label}</span></a>`;
}

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

document.addEventListener("languagechange", () => {
  updatePortfolioFilterLabels();
  rebuildInstitutionFilter();
  renderPortfolioProjects();
  renderPortfolioPagination();
});

loadPortfolio();
