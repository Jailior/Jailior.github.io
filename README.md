# My Personal Website

## [Click here](https://jailior.github.io/) to view it!

A single static page served by GitHub Pages. There is no build step.

- `index.html` holds all the content: intro, News, Education, Experience, Teaching, and Projects.
- `assets/css/style.css` holds the styles, including dark mode and the mobile layout.
- The theme follows the visitor's system setting until they use the toggle in the top-right corner; their choice is saved in `localStorage`.
- `images/` holds the photo, favicon, and project thumbnails (`images/thumbs/`, shown at 160×120).

To add a news item, add an `<li>` at the top of the `.news` list. To add a project, copy one of the `.project` blocks in `#projects` and point it at a new thumbnail.
