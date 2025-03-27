# Vibcast Website

A static website for the Vibcast podcast, built with HTML, CSS, and JavaScript. This site is designed to be hosted on GitHub Pages.

## Features

- Responsive design that works on mobile, tablet, and desktop
- Modern, clean UI with Bootstrap 5
- Newsletter signup form
- Episode listings
- About page with team information

## Development

This is a simple static website that can be developed locally and deployed to GitHub Pages.

### Local Development

To preview the site locally, you can use any simple HTTP server. For example, with Python:

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Then visit `http://localhost:8000` in your browser.

### Deployment

To deploy to GitHub Pages:

1. Push this repository to GitHub
2. Go to the repository settings
3. Under "GitHub Pages", select the branch you want to deploy from (usually `main` or `master`)
4. The site will be available at `https://yourusername.github.io/repository-name/`

## Structure

- `index.html` - Home page with hero section, features, latest episodes, and signup form
- `episodes.html` - List of podcast episodes
- `about.html` - Information about the podcast and hosts
- `css/style.css` - Custom styles
- `js/main.js` - JavaScript functionality

## License

MIT