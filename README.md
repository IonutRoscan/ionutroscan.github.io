# DoxowkSpace

Hi, I'm Ionut (doxowk). This is the repo behind my personal hub, **[ionutroscan.github.io](https://ionutroscan.github.io/)**.

I build open-source browser extensions and games in Godot, and under the name LOXXANI I also make music. This site is the one place where all of that lives: a small gallery of the things I've made, with links to the code, install instructions and screenshots, and a way to find my music and get in touch. Everything here is made by me, in the open.

Most of my extensions are for [ClankWorld](https://www.clank.world), and they're the reason this page exists. I wanted a single place where people could see what each tool does, how to install it, and where the source is, instead of hunting through separate repos. The page itself is plain HTML, CSS and JavaScript, with no framework and no build step, so it's easy to change whenever I add something new.

## Projects

Here's what's in the gallery right now. Each project has its own panel on the site with details, screenshots where I have them, and a how-to-install guide for the extensions.

| Project | What it is | Repository |
| --- | --- | --- |
| **Furina** | Clank Chat Atelier: chat theming, roleplay immersion tools, Director notes and continuity tracking for ClankWorld | [GitHub](https://github.com/IonutRoscan/Furina-Clank-Chat-Atelier) |
| **Daedalus** | Clank Character Forge: a local character-creation workspace and story-planning suite for ClankWorld | [GitHub](https://github.com/IonutRoscan/Daedalus-Clank-Character-Forge) |
| **Grimoire** | Lorebook importer for ClankWorld (TXT, Markdown and supported JSON) | [GitHub](https://github.com/IonutRoscan/Grimoire-ClankWorld) |
| **Obelisk** | Clank Layout Builder: a visual builder for character "Edit about" pages | [GitHub](https://github.com/IonutRoscan/Obelisk-Clank-Layout-Builder) |
| **Halation** | YouTube ambient-light glow for Chromium browsers | [GitHub](https://github.com/IonutRoscan/Halation) |
| **Queen of Chaos** | A PS1-style 3D action RPG in Godot (early development) | — |

## Files

```
index.html     page structure
style.css      all styling
script.js      project data and all behaviour
assets/        cover icons and preview screenshots
```

## Adding or editing a project

Everything in the gallery comes from the `projects` array at the top of `script.js`. When I have something new to show, I copy an existing entry and change:

- `id`: used in the URL, so `#daedalus` opens that project's panel directly
- `title`, `description`, `tags`, `details`, `facts`, `links`
- `image`: cover icon in `assets/` (if the file is missing, the CSS artwork named in `artwork` is used instead)
- `previews` (optional): screenshots in `assets/`, as `{src, caption}` entries. Missing files are skipped.
- `install` (optional): adds a collapsible "How to install" guide for Chromium extensions
- `tools` (optional): small companion tools listed under the links

Contact and music links are the `contactLinks` and `musicLinks` arrays further down the same file.

## Running locally

I just open `index.html`, or serve the folder so it behaves like the live site:

```
python -m http.server 8000
```

then visit `http://localhost:8000`.

## Deployment

The site is hosted with GitHub Pages from the `main` branch. When I push to `main`, the live site updates after a minute or two.
