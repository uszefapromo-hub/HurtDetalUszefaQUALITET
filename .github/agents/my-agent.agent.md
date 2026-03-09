name: fix-github-pages-paths

description: Agent that fixes paths in HTML, CSS and JS so GitHub Pages works correctly.

---

This agent should edit files in the repository and fix paths for GitHub Pages.

Repository:
uszefapromo-hub/HurtDetalUszefaQUALITET

Branch:
main

Rules:

In HTML and JS change:
"/css/" -> "css/"
"/js/" -> "js/"
"/assets/" -> "assets/"

In CSS change:
url("/assets/") -> url("../assets/")

In JS change:
fetch("/assets/") -> fetch("assets/")

Do not create new folders.
Do not change file names.
Do not create SPA.
Do not create backend.
Do not move files.

Edit existing files and save changes directly in the repository.

After editing:
- commit changes
- keep branch main
- show list of changed files
