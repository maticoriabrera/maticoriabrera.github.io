/**
 * @file Manages course data loading, localized content, filters, and pagination.
 *
 * Data source: assets/data/courses.json.
 * Required DOM elements: #courses-container, #courses-pagination,
 * #filter-organization, #filter-skill, and #filter-year.
 * Optional localization integrations: global getText() and window.currentLanguage.
 * The module also listens for the document-level "languagechange" event.
 */

// CONFIGURATION AND STATE

const COURSES_PER_PAGE = 10;

let courses = [];
let filteredCourses = [];
let currentPage = 1;

// DOM REFERENCES

const coursesContainer = document.getElementById("courses-container");
const coursesPagination = document.getElementById("courses-pagination");

const filterOrganization = document.getElementById("filter-organization");
const filterSkill = document.getElementById("filter-skill");
const filterYear = document.getElementById("filter-year");

// COURSE DATA CONTRACT

/**
 * Describes the course properties consumed by this module.
 * This file does not validate the incoming JSON against this structure.
 *
 * @typedef {Object} Course
 * @property {number|string} number - Identifier displayed with a minimum width of three digits.
 * @property {string} title - Default course title.
 * @property {string} [title_es] - Optional Spanish title.
 * @property {string} [title_it] - Optional Italian title.
 * @property {string} organization - Issuing organization and organization filter value.
 * @property {string} date - Date text; the first four characters are used as the year.
 * @property {string} [instructor] - Optional instructor displayed when present.
 * @property {string|number} duration - Duration displayed as supplied by the data source.
 * @property {string} skill - Comma-separated list of skill names.
 * @property {string} thumbnail - Certificate thumbnail image URL or path.
 */

// INTERNATIONALIZATION

/**
 * Gets a localized UI label through the global translation function when available.
 * Uses built-in English labels only when getText() is unavailable; unknown
 * fallback keys are returned unchanged.
 *
 * @param {string} key - Translation key to resolve.
 * @returns {string} The resolved label or the original key.
 */
function getCourseText(key) {
  if (typeof getText === "function") {
    return getText(key);
  }

  const fallback = {
    course_organization_label: "Issuing organization",
    course_date_label: "Date",
    course_instructor_label: "Instructor",
    course_duration_label: "Duration",
    course_skill_label: "Skill",
    courses_empty: "No courses found with the selected filters.",
    courses_error: "Courses could not be loaded.",
    certificate_thumbnail_alt: "Certificate thumbnail",
    filter_all_organizations: "All organizations",
    filter_all_skills: "All skills",
    filter_all_years: "All years",
  };

  return fallback[key] || key;
}

/**
 * Returns the title for the currently selected language.
 * Spanish and Italian titles fall back to the default title when absent.
 *
 * @param {Course} course - Course whose title is requested.
 * @returns {string} The title selected for the active language.
 */
function getCourseTitle(course) {
  const language = window.currentLanguage || "en";

  if (language === "es") {
    return course.title_es || course.title;
  }

  if (language === "it") {
    return course.title_it || course.title;
  }

  return course.title;
}

// DATA LOADING

/**
 * Fetches the course dataset and initializes the filters, results, and pagination.
 * On failure, displays a localized error message and logs the error.
 *
 * @returns {Promise<void>} A promise for the loading and initialization process.
 */
async function loadCourses() {
  try {
    const response = await fetch("assets/data/courses.json");

    if (!response.ok) {
      throw new Error("Could not load courses.json");
    }

    courses = await response.json();
    filteredCourses = [...courses];

    populateFilters();
    addFilterEvents();
    renderCourses();
    renderPagination();
  } catch (error) {
    coursesContainer.innerHTML = `
      <section class="block">
        <div class="card-main">
          <p class="item-p">${getCourseText("courses_error")}</p>
        </div>
      </section>
    `;

    console.error(error);
  }
}

// FILTER MANAGEMENT

/**
 * Updates the label of a select element's empty-value option, if present.
 *
 * @param {HTMLSelectElement} selectElement - Filter whose default label is updated.
 * @param {string} text - Replacement label.
 * @returns {void}
 */
function setDefaultOption(selectElement, text) {
  const option = selectElement.querySelector('option[value=""]');

  if (option) {
    option.textContent = text;
  }
}

// Keep the unselected filter labels consistent with the current language.
function updateFilterDefaultOptions() {
  setDefaultOption(filterOrganization, getCourseText("filter_all_organizations"));
  setDefaultOption(filterSkill, getCourseText("filter_all_skills"));
  setDefaultOption(filterYear, getCourseText("filter_all_years"));
}

/**
 * Populates filter options from distinct organizations, skills, and years.
 * Organization and skill values are sorted alphabetically; years are descending.
 * Skill values are split on commas and trimmed before deduplication.
 *
 * @returns {void}
 */
function populateFilters() {
  const organizations = [...new Set(courses.map(course => course.organization).filter(Boolean))].sort();

  const skills = [...new Set(
    courses
      .flatMap(course => course.skill.split(",").map(skill => skill.trim()))
      .filter(Boolean)
  )].sort();

  const years = [...new Set(
    courses
      .map(course => course.date ? course.date.substring(0, 4) : "")
      .filter(Boolean)
  )].sort((a, b) => b - a);

  updateFilterDefaultOptions();

  organizations.forEach(organization => {
    const option = document.createElement("option");
    option.value = organization;
    option.textContent = organization;
    filterOrganization.appendChild(option);
  });

  skills.forEach(skill => {
    const option = document.createElement("option");
    option.value = skill;
    option.textContent = skill;
    filterSkill.appendChild(option);
  });

  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    filterYear.appendChild(option);
  });
}

// Reapply all active filters whenever a filter selection changes.
function addFilterEvents() {
  filterOrganization.addEventListener("change", applyFilters);
  filterSkill.addEventListener("change", applyFilters);
  filterYear.addEventListener("change", applyFilters);
}

/**
 * Applies the selected organization, skill, and year filters together.
 * Resets pagination to the first page and refreshes the displayed results.
 *
 * @returns {void}
 */
function applyFilters() {
  const selectedOrganization = filterOrganization.value;
  const selectedSkill = filterSkill.value;
  const selectedYear = filterYear.value;

  filteredCourses = courses.filter(course => {
    const matchesOrganization =
      selectedOrganization === "" || course.organization === selectedOrganization;

    const courseSkills = course.skill
      .split(",")
      .map(skill => skill.trim());

    const matchesSkill =
      selectedSkill === "" || courseSkills.includes(selectedSkill);

    const courseYear = course.date ? course.date.substring(0, 4) : "";

    const matchesYear =
      selectedYear === "" || courseYear === selectedYear;

    return matchesOrganization && matchesSkill && matchesYear;
  });

  currentPage = 1;
  renderCourses();
  renderPagination();
}

// COURSE RENDERING

/**
 * Renders the current page of filtered courses into the course container.
 * Displays a localized empty-state message when no courses are visible.
 *
 * @returns {void}
 */
function renderCourses() {
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const visibleCourses = filteredCourses.slice(startIndex, endIndex);

  if (visibleCourses.length === 0) {
    coursesContainer.innerHTML = `
      <section class="block">
        <div class="card-main">
          <p class="item-p">${getCourseText("courses_empty")}</p>
        </div>
      </section>
    `;
    return;
  }

  coursesContainer.innerHTML = visibleCourses.map(course => {
    const title = getCourseTitle(course);

    return `
      <section class="block">
        <div class="card-main">
          <div class="card-top">
            <article class="item item-course">

              <div class="item-course__body">
                <h4 class="item-h">#${String(course.number).padStart(3, "0")} - ${title}</h4>
                <div class="item-meta">${getCourseText("course_organization_label")}: ${course.organization}</div>
                <p class="item-p">
                  ${getCourseText("course_date_label")}: ${course.date}
                  <br>
                  ${course.instructor ? `${getCourseText("course_instructor_label")}: ${course.instructor}<br>` : ""}
                  ${getCourseText("course_duration_label")}: ${course.duration}
                  <br>
                  ${getCourseText("course_skill_label")}: ${course.skill}
                </p>
              </div>

              <div class="item-course__thumb">
                <img src="${course.thumbnail}" alt="${getCourseText("certificate_thumbnail_alt")} - ${title}">
              </div>

            </article>
          </div>
        </div>
      </section>
    `;
  }).join("");
}

// PAGINATION

/**
 * Rebuilds page buttons for the filtered course list.
 * Omits pagination when fewer than two pages are needed, and attaches
 * click handlers that update the current page and rerender the view.
 *
 * @returns {void}
 */
function renderPagination() {
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);

  coursesPagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.textContent = page;
    button.classList.add("page-btn");

    if (page === currentPage) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      currentPage = page;
      renderCourses();
      renderPagination();
    });

    coursesPagination.appendChild(button);
  }
}

// EVENT HANDLERS

// Refresh translated filter labels and visible course content after a language change.
document.addEventListener("languagechange", () => {
  updateFilterDefaultOptions();
  renderCourses();
  renderPagination();
});

// INITIALIZATION

loadCourses();
