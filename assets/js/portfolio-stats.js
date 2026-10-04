let portfolioStatsProjects = null;

function statsText(key) {
  if (typeof getText === "function") return getText(key);
  return key;
}

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

document.addEventListener("languagechange", () => {
  if (portfolioStatsProjects) renderPortfolioStats(portfolioStatsProjects);
});

loadPortfolioStats();
