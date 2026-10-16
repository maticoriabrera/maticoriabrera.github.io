/**
 * @fileoverview Calculates and displays the training-hour distribution by skill.
 *
 * Loads course data from ./assets/data/courses.json after DOMContentLoaded,
 * allocates each course's hours equally among its listed skills, and renders
 * the six highest-ranked skills. Cached results are rendered again when the
 * document emits a "languagechange" event; data is not fetched again.
 *
 * DOM targets: #courses-stats-subtitle and #skills-stats-grid.
 * Localization: uses global getText() when available, otherwise built-in
 * English messages. Incoming course data is expected to be trusted because
 * skill names and translated labels are inserted into HTML templates.
 */

// INITIALIZATION

document.addEventListener("DOMContentLoaded", () => {
  loadCoursesStats();
});

// CACHED STATISTICS

/**
 * Course fields used by the statistics calculations.
 * Input data is not schema-validated by this module.
 *
 * @typedef {Object} CourseStatsInput
 * @property {string} duration - Duration text containing a numeric value.
 * @property {string} skill - Comma-separated skill names; empty values are allowed.
 */

/**
 * Calculated hours and share of all course hours for a single skill.
 *
 * @typedef {Object} SkillHoursStat
 * @property {string} skill - Skill name taken from the course data.
 * @property {number} hours - Allocated training hours for the skill.
 * @property {number} percent - Percentage of total course hours attributed to the skill.
 */

/**
 * Aggregated information used to render the statistics panel.
 *
 * @typedef {Object} CoursesStatsResult
 * @property {number} totalHours - Hours summed across every course.
 * @property {SkillHoursStat[]} topSkills - Highest-ranked skills, up to the requested limit.
 */

let cachedCoursesStats = null;

// LOCALIZATION

/**
 * Resolves a UI translation using the global getText() function when present.
 * Otherwise returns a built-in English message or the unchanged key.
 *
 * @param {string} key - UI translation key.
 * @returns {string} Localized text, English fallback, or unresolved key.
 */
function getStatsText(key) {
  if (typeof getText === "function") {
    return getText(key);
  }

  const fallback = {
    courses_stats_total_label: " total hours courses completed",
    courses_stats_error: "Training statistics could not be loaded.",
  };

  return fallback[key] || key;
}

// DATA LOADING

/**
 * Fetches course data, calculates the six most represented skills by hours,
 * caches the result, and updates the statistics panel.
 * On any loading or processing error, logs it, shows an error label when the
 * subtitle exists, and clears the grid when the grid exists.
 *
 * @returns {Promise<void>} Resolves after loading and rendering or error handling.
 */
async function loadCoursesStats() {
  try {
    const response = await fetch("./assets/data/courses.json");

    if (!response.ok) {
      throw new Error("Could not load courses.json");
    }

    const courses = await response.json();

    cachedCoursesStats = calculateTopSkills(courses, 6);

    renderCoursesStats(cachedCoursesStats);
  } catch (error) {
    console.error("Error loading course statistics:", error);

    const subtitle = document.getElementById("courses-stats-subtitle");
    const grid = document.getElementById("skills-stats-grid");

    if (subtitle) {
      subtitle.textContent = getStatsText("courses_stats_error");
    }

    if (grid) {
      grid.innerHTML = "";
    }
  }
}

// SKILL HOURS AGGREGATION

/**
 * Sums all course hours and assigns each course's hours equally to its listed
 * skills. Courses without skills still contribute to totalHours, so the
 * displayed skill percentages need not add up to 100%. Skills are ranked by
 * allocated hours and only the first `limit` are returned.
 *
 * @param {CourseStatsInput[]} courses - Course records to aggregate.
 * @param {number} limit - Maximum number of ranked skills to include.
 * @returns {CoursesStatsResult} Total hours and ranked skill statistics.
 */
function calculateTopSkills(courses, limit) {
  let totalHours = 0;
  const skillHours = {};

  courses.forEach((course) => {
    const hours = parseCourseHours(course.duration);
    totalHours += hours;

    const skills = parseCourseSkills(course.skill);

    if (skills.length === 0) {
      return;
    }

    const hoursPerSkill = hours / skills.length;

    skills.forEach((skill) => {
      if (!skillHours[skill]) {
        skillHours[skill] = 0;
      }

      skillHours[skill] += hoursPerSkill;
    });
  });

  const topSkills = Object.entries(skillHours)
    .map(([skill, hours]) => {
      return {
        skill: skill,
        hours: hours,
        percent: totalHours > 0 ? (hours / totalHours) * 100 : 0,
      };
    })
    .sort((a, b) => b.hours - a.hours)
    .slice(0, limit);

  return {
    totalHours: totalHours,
    topSkills: topSkills,
  };
}

// DATA PARSING

/**
 * Extracts the first sequence of digits, commas, or periods from duration.
 * Replaces the first comma with a period before numeric conversion. Missing
 * or non-string values and strings without a numeric match return zero.
 * Other malformed numeric strings can produce NaN; no further validation
 * or locale-aware thousands-separator handling is performed.
 *
 * @param {string|undefined|null} duration - Duration text to parse.
 * @returns {number} Extracted hour value, zero, or NaN for malformed numbers.
 */
function parseCourseHours(duration) {
  if (!duration || typeof duration !== "string") {
    return 0;
  }

  const match = duration.match(/[\d,.]+/);

  if (!match) {
    return 0;
  }

  return Number(match[0].replace(",", "."));
}

/**
 * Splits comma-separated skill text, trims surrounding whitespace, and
 * excludes empty names without deduplicating repeated names.
 *
 * @param {string|undefined|null} skillValue - Comma-separated skills.
 * @returns {string[]} Parsed, non-empty skill names.
 */
function parseCourseSkills(skillValue) {
  if (!skillValue || typeof skillValue !== "string") {
    return [];
  }

  return skillValue
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

// STATISTICS RENDERING

/**
 * Rebuilds the summary and top-skill cards from calculated statistics.
 * Does nothing when either required DOM element is missing. Total and per-skill
 * hours are rounded for display, and percentages use one decimal place.
 * The numeric values applied to the CSS custom property and visible labels
 * are derived from the unrounded calculation results.
 *
 * @param {CoursesStatsResult} stats - Previously calculated statistics.
 * @returns {void}
 */
function renderCoursesStats(stats) {
  const subtitle = document.getElementById("courses-stats-subtitle");
  const grid = document.getElementById("skills-stats-grid");

  if (!subtitle || !grid) {
    return;
  }

  subtitle.innerHTML = `
    <span class="courses-stats-total">${Math.round(stats.totalHours).toLocaleString("en-US")} hs</span>
    <span class="courses-stats-label">${getStatsText("courses_stats_total_label")}</span>
  `;

  grid.innerHTML = stats.topSkills
    .map((item) => {
      const percent = item.percent.toFixed(1);
      const hours = Math.round(item.hours);

      return `
        <article class="skill-stat-card">
          <div class="skill-stat-ring" style="--percent: ${percent}">
            <div class="skill-stat-inner">
              <span class="skill-stat-percent">${percent}%</span>
              <span class="skill-stat-hours">${hours} hs</span>
            </div>
          </div>

          <h3 class="skill-stat-name">${item.skill}</h3>
        </article>
      `;
    })
    .join("");
}

// LANGUAGE CHANGE HANDLING

// Re-render labels from cached results without recalculating or refetching data.
document.addEventListener("languagechange", () => {
  if (cachedCoursesStats) {
    renderCoursesStats(cachedCoursesStats);
  }
});
