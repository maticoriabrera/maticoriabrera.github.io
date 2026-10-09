<div align="center">

# Juan Matías Coria Brera

### Personal Website · Online CV · IT Support Portfolio

**Remote IT Support | Technical Support Specialist | Help Desk & Customer Assistance**

[![Website](https://img.shields.io/badge/Visit%20Website-0B69C7?style=for-the-badge&logo=githubpages&logoColor=white)](https://maticoriabrera.github.io/)
[![Portfolio](https://img.shields.io/badge/View%20Portfolio-153B66?style=for-the-badge&logo=github&logoColor=white)](https://maticoriabrera.github.io/portfolio.html)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mati-coria-brera-39614260/)

<br>

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=flat-square&logo=githubpages&logoColor=white)](https://pages.github.com/)
[![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20ES%20%7C%20IT-5BA9E8?style=flat-square)](https://maticoriabrera.github.io/)

<br>

[![Website preview](assets/img/cv_og_en.png)](https://maticoriabrera.github.io/)

*A personal space to explore my professional experience, technical skills, training, projects, and interests.*

</div>

---

## ✨ About This Project

This repository contains the source code for my **personal website and online CV**. The site brings together my background in **IT support and technology consulting**, alongside my continued learning in software development.

More than a traditional résumé, it provides an accessible way to explore my experience, review completed training, and discover projects I have worked on.

> **Explore the live website:** **[maticoriabrera.github.io](https://maticoriabrera.github.io/)**

## 🧭 Explore the Website

| Section | What you will find | Link |
| :--- | :--- | :--- |
| **Professional Profile** | Experience, education, skills, contact information, and personal interests. | [Open CV →](https://maticoriabrera.github.io/) |
| **Courses & Training** | A searchable-by-filter course catalog with certificates and training statistics. | [Explore Courses →](https://maticoriabrera.github.io/courses.html) |
| **Projects & Portfolio** | Project descriptions, technologies, repository links, and portfolio statistics. | [View Projects →](https://maticoriabrera.github.io/portfolio.html) |

## 🚀 Features

- **Three-language interface:** English, Spanish, and Italian.
- **Responsive layout:** designed for desktop and smaller screens.
- **Online CV:** a central overview of professional experience, education, and skills.
- **Downloadable résumés:** PDF versions in English, Spanish, and Italian.
- **Training catalog:** course and certificate records, filters, pagination, and training statistics.
- **Project portfolio:** individual project cards with available repository, README, and live-demo links.
- **Portfolio filters and statistics:** browse projects by institution, language, or technology, and explore visual summaries.
- **Direct connections:** links to professional and social profiles.
- **Shareable pages:** page metadata and Open Graph images for link previews.

## 🛠️ Built With

| Layer | Technologies / approach |
| :--- | :--- |
| **Structure** | HTML5 |
| **Visual design** | CSS3, responsive styles |
| **Interactivity** | Vanilla JavaScript |
| **Content** | JSON data files for translations, courses, and projects |
| **Typography & icons** | Google Fonts (Montserrat & Inter), Font Awesome |
| **Hosting** | GitHub Pages |

The website is a **static front-end project**. It does not require a Django server, database, or package installation to run.

## 🌍 Available Languages

Choose a language from the website interface, or open a version directly:

[![English](https://img.shields.io/badge/English-153B66?style=for-the-badge)](https://maticoriabrera.github.io/)
[![Español](https://img.shields.io/badge/Espa%C3%B1ol-287EB8?style=for-the-badge)](https://maticoriabrera.github.io/index.html?lang=es)
[![Italiano](https://img.shields.io/badge/Italiano-5BA9E8?style=for-the-badge)](https://maticoriabrera.github.io/index.html?lang=it)

Language support is implemented through `assets/js/i18n.js` and `assets/data/i18n.json`.

## 📂 Project Structure

```text
maticoriabrera.github.io/
├── index.html                 # Professional profile and online CV
├── courses.html               # Training and certificates
├── portfolio.html             # Project portfolio
├── assets/
│   ├── css/
│   │   ├── styles-cv.css
│   │   ├── styles-portfolio.css
│   │   └── styles-stats.css
│   ├── data/
│   │   ├── courses.json       # Course records
│   │   ├── i18n.json          # Multilingual content
│   │   └── portfolio.json     # Portfolio project records
│   ├── js/
│   │   ├── i18n.js
│   │   ├── courses.js
│   │   ├── courses-stats.js
│   │   ├── portfolio.js
│   │   ├── portfolio-stats.js
│   │   ├── guitar-modal.js
│   │   └── spotify-modal.js
│   ├── img/                   # Profile, projects, certificates, media
│   ├── pdf/                   # Downloadable CVs
│   └── favicon/               # Site icons and web manifest
├── LICENSE.txt
└── README.md
```

## 💻 Run Locally

Clone the repository:

```bash
git clone https://github.com/maticoriabrera/maticoriabrera.github.io.git
cd maticoriabrera.github.io
```

Because the website loads JSON files using browser `fetch()`, **serve it through a local HTTP server** instead of opening the HTML files directly using `file://`.

For example, if Python is installed:

```bash
python -m http.server 8000
```

Then open **http://localhost:8000/** in your browser.

No additional dependencies need to be installed for the site's own HTML, CSS, or JavaScript files. External fonts, icons, and linked services require internet access.

## 🧩 Content & Maintenance

| To update… | Edit… |
| :--- | :--- |
| Profile and résumé page | `index.html` |
| Course information | `assets/data/courses.json` |
| Project information | `assets/data/portfolio.json` |
| Translations | `assets/data/i18n.json` |
| General visual appearance | `assets/css/styles-cv.css` |
| Portfolio appearance | `assets/css/styles-portfolio.css` |
| Statistics appearance | `assets/css/styles-stats.css` |

The training and project catalogs are populated from their JSON files by JavaScript, so updating those records does not require manually duplicating every card in HTML.

## 📬 Connect

I'm interested in **remote IT support, help desk, technical assistance, and technology consulting**.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mati-coria-brera-39614260/)
[![GitHub](https://img.shields.io/badge/GitHub-Projects-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/maticoriabrera)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:mati.coria.brera@gmail.com)

## 📄 License

This repository includes a [`LICENSE.txt`](LICENSE.txt) file containing the **Creative Commons Attribution 3.0 Unported (CC BY 3.0)** license text. Please review that file for the applicable terms. Third-party assets and services may have their own licenses.

---

<div align="center">

**Thanks for visiting!**

[🌐 Website](https://maticoriabrera.github.io/) · [📚 Courses](https://maticoriabrera.github.io/courses.html) · [💼 Portfolio](https://maticoriabrera.github.io/portfolio.html)

<sub>Designed and maintained by Juan Matías Coria Brera.</sub>

</div>
