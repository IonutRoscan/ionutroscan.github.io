# DoxowkSpace

The personal hub of **Ionut Alexandru Roscan** (doxowk / LOXXANI): a small gallery of open-source browser extensions and games, plus links to my music.

**Live site: [ionutroscan.github.io](https://ionutroscan.github.io/)**

A single static page built with plain HTML, CSS and JavaScript. No framework and no build step.

## Projects

| Project | What it is | Repository |
| --- | --- | --- |
| **Furina** | Clank Chat Atelier: chat theming, roleplay immersion tools, Director notes and continuity tracking for ClankWorld | [GitHub](https://github.com/IonutRoscan/Furina-Clank-Chat-Atelier) |
| **Daedalus** | Clank Character Forge: a local character-creation workspace and story-planning suite for ClankWorld | [GitHub](https://github.com/IonutRoscan/Daedalus-Clank-Character-Forge) |
| **Grimoire** | Lorebook importer for ClankWorld (TXT, Markdown and supported JSON) | [GitHub](https://github.com/IonutRoscan/Grimoire-ClankWorld) |
| **Obelisk** | Clank Layout Builder: a visual builder for character "Edit about" pages | [GitHub](https://github.com/IonutRoscan/Obelisk-Clank-Layout-Builder) |
| **Halation** | YouTube ambient-light glow for Chromium browsers | [GitHub](https://github.com/IonutRoscan/Halation) |
| **Queen of Chaos** | A PS1-style 3D action RPG in Godot (early development) | — |

Each project panel on the site has install instructions and screenshots where available.

## Files

```
index.html     page structure
style.css      all styling
script.js      project data and all behaviour
assets/        cover icons and preview screenshots
```

## Adding or editing a project

Everything shown in the gallery comes from the `projects` array at the top of `script.js`. To add a project, copy an existing entry and change:

- `id`: used in the URL, so `#daedalus` opens that project's panel directly
- `title`, `description`, `tags`, `details`, `facts`, `links`
- `image`: cover icon in `assets/` (if the file is missing, the CSS artwork named in `artwork` is used instead)
- `previews` (optional): screenshots in `assets/`, as `{src, caption}` entries. Missing files are skipped.
- `install` (optional): adds a collapsible "How to install" guide for Chromium extensions
- `tools` (optional): small companion tools listed under the links

Contact and music links are the `contactLinks` and `musicLinks` arrays further down the same file.

## Running locally

Open `index.html` directly, or serve the folder so everything behaves like the live site:

```
python -m http.server 8000
```

then visit `http://localhost:8000`.

## Deployment

Hosted with GitHub Pages from the `main` branch. Pushing to `main` updates the live site after a minute or two.
