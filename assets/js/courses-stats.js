document.addEventListener("DOMContentLoaded", () => {
  loadCoursesStats();
});

let cachedCoursesStats = null;

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

function parseCourseSkills(skillValue) {
  if (!skillValue || typeof skillValue !== "string") {
    return [];
  }

  return skillValue
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

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

document.addEventListener("languagechange", () => {
  if (cachedCoursesStats) {
    renderCoursesStats(cachedCoursesStats);
  }
});
