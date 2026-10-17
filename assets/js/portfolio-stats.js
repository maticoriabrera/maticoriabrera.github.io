/**
 * Portfolio statistics for the project portfolio page.
 *
 * Loads project metadata, calculates appearance-based distributions for
 * languages and technologies, and renders the results as statistic cards.
 * Uses the optional global getText() translation function and refreshes
 * displayed labels when the document dispatches a "languagechange" event.
 *
 * Required HTML containers: #portfolio-language-stats and
 * #portfolio-technology-stats.
 * Data source: assets/data/portfolio.json.
 */

// CACHED PROJECT DATA
let portfolioStatsProjects = null;

// TRANSLATION SUPPORT

/**
 * Gets a translated label when the global translation helper is available.
 * Otherwise, returns the translation key unchanged.
 *
 * @param {string} key - Translation key to resolve.
 * @returns {string} The translated label or the original key.
 */
function statsText(key) {
  if (typeof getText === "function") return getText(key);
  return key;
}

// FREQUENCY AND PERCENTAGE CALCULATION

/**
 * @typedef {Object} PortfolioStatsDistributionItem
 * @property {string} name - Language or technology name.
 * @property {number} count - Number of non-empty appearances.
 * @property {number} percent - Share of appearances, expressed as a percentage.
 */

/**
 * Counts non-empty entries and returns their percentage distribution.
 * Items are sorted by descending count, with alphabetical order breaking ties.
 * Percentages are rounded to one decimal place. For non-empty distributions,
 * the final item receives the rounding remainder so the total is 100%.
 *
 * Each appearance is counted separately; this is not a unique-project count.
 *
 * @param {string[]} entries - Language or technology entries to count.
 * @returns {PortfolioStatsDistributionItem[]} Ordered frequency distribution.
 */
function percentDistribution(entries) {
  const counts = {};
  entries.forEach(value => { if (value) counts[value] = (counts[value] || 0) + 1; });
  const total = Object.values(counts).reduce((a,b) => a+b, 0);
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
  let used = 0;
  return sorted.map(([name,count], idx) => {
    let percent;
    if (idx === sorted.length - 1) percent = +(100 - used).toFixed(1);
    else { percent = +((count/total)*100).toFixed(1); used += percent; }
    return {name,count,percent};
  });
}

// STATISTIC CARD MARKUP

/**
 * Builds the HTML markup for a single language or technology statistic card.
 * The item name and translated label are inserted as HTML, so their sources
 * must be trusted or sanitized before this function is called.
 *
 * @param {PortfolioStatsDistributionItem} item - Distribution entry to display.
 * @param {string} suffixLabel - Label displayed after the entry count.
 * @returns {string} HTML markup for the statistic card.
 */
function statCard(item, suffixLabel) {
  return `<article class="skill-stat-card portfolio-stat-card">
    <div class="skill-stat-ring" style="--percent:${item.percent}">
      <div class="skill-stat-inner">
        <span class="skill-stat-percent">${item.percent.toFixed(1)}%</span>
        <span class="skill-stat-hours">${item.count} ${suffixLabel}</span>
      </div>
    </div>
    <h3 class="skill-stat-name">${item.name}</h3>
  </article>`;
}

// STATISTICS RENDERING

/**
 * @typedef {Object} PortfolioStatsProject
 * @property {string[]} [languages] - Languages listed for the project.
 * @property {string[]} [technologies] - Technologies listed for the project.
 */

/**
 * Renders language and technology distributions in their respective grids.
 * Excludes "SCSS" from the language distribution only. Each array entry
 * contributes one appearance, including repeated entries across projects.
 * If no technologies are present, displays a placeholder in that grid.
 *
 * @param {PortfolioStatsProject[]} projects - Project records to aggregate.
 * @returns {void}
 */
function renderPortfolioStats(projects) {
  const languageGrid = document.getElementById("portfolio-language-stats");
  const technologyGrid = document.getElementById("portfolio-technology-stats");
  if (!languageGrid || !technologyGrid) return;

  const languages = percentDistribution(projects.flatMap(p => p.languages || []).filter(language => language !== "SCSS"));
  const technologies = percentDistribution(projects.flatMap(p => p.technologies || []));
  const projectsLabel = statsText("portfolio_stats_projects_short");
  const appearancesLabel = statsText("portfolio_stats_appearances_short");

  languageGrid.innerHTML = languages.map(item => statCard(item, projectsLabel)).join("");
  technologyGrid.innerHTML = technologies.length
    ? technologies.map(item => statCard(item, appearancesLabel)).join("")
    : `<p class="item-p">-</p>`;
}

// DATA LOADING AND ERROR HANDLING

/**
 * Loads portfolio project data, caches it, and renders the statistics.
 * HTTP, network, and JSON parsing errors are logged to the console;
 * no replacement error message is inserted into the page.
 *
 * @returns {Promise<void>} Resolves after loading and rendering, or after
 * handling a loading error.
 */
async function loadPortfolioStats() {
  try {
    const response = await fetch("assets/data/portfolio.json");
    if (!response.ok) throw new Error("Could not load portfolio.json");
    portfolioStatsProjects = await response.json();
    renderPortfolioStats(portfolioStatsProjects);
  } catch (error) {
    console.error(error);
  }
}

// LANGUAGE CHANGE HANDLER

// Re-render translated labels from cached projects without another fetch.
document.addEventListener("languagechange", () => {
  if (portfolioStatsProjects) renderPortfolioStats(portfolioStatsProjects);
});

// INITIALIZATION

// Start loading project statistics when this script is executed.
loadPortfolioStats();
