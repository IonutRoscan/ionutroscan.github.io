// ADD YOUR PROJECTS HERE. One object per project:
//   id                  -> used in the URL (#furina) so a project can be linked directly
//   title, description  -> text under the artwork
//   tags                -> small line under the description
//   image               -> cover icon in /assets ('' = use the CSS artwork named in `artwork`;
//                          if the file is missing the CSS artwork is used automatically)
//   details             -> paragraph shown in the project panel
//   facts               -> [label, value] rows in the panel
//   links               -> buttons in the panel ([] = none)
//   tools (optional)    -> small companion tools shown under the links
//   previews (optional) -> screenshots in /assets: [{src, caption}]. Missing files are skipped.
//   install (optional)  -> adds a collapsible HOW TO INSTALL guide:
//                          {folder, after, note}
const chromiumInstall = install => [
  "Open the GitHub page (the **GITHUB** button above), click **Code → Download ZIP**, and extract it somewhere you plan to keep it. The browser loads the extension from that folder, so don't delete it afterwards.",
  'Open `brave://extensions` or `chrome://extensions`.',
  'Turn **Developer mode** ON (top right).',
  `Click **Load unpacked** and select the extracted ${install.folder} folder (the one containing \`manifest.json\`).`,
  install.after
]

const projects = [
  {
    id: 'furina',
    title: 'FURINA',
    description: 'CLANK CHAT ATELIER',
    tags: ['CHROMIUM', 'FIREFOX', 'JAVASCRIPT'],
    image: 'assets/furina-icon.png',
    artwork: 'art-main',
    details:
      'A client-side extension for ClankWorld that adds chat theming, roleplay immersion tools, Director notes and continuity tracking, sound effects and scene presentation. Plain JavaScript with no build step, minimal permissions, and an interface translated into nine languages.',
    facts: [
      ['PLATFORM', 'CHROMIUM · FIREFOX'],
      ['LICENSE', 'MIT'],
      ['STATUS', 'OPEN SOURCE']
    ],
    previews: [
      {
        src: 'assets/furina-preview-example.png',
        caption: 'A Clank chat customized with Furina'
      },
      {
        src: 'assets/furina-panel-full-preview.png',
        caption: 'The full Furina workspace panel'
      },
      {
        src: 'assets/furina-panel-essentials-preview.png',
        caption: 'The Essentials view of the panel'
      },
      {
        src: 'assets/furina-scenenavigation-preview.png',
        caption: 'Scene navigation'
      }
    ],
    install: {
      folder: 'Furina',
      after:
        "Open a chat on clank.world. Furina's launcher appears on supported chat routes.",
      note: 'On Firefox, install from the Firefox add-on page instead.'
    },
    links: [
      {
        label: 'GITHUB',
        url: 'https://github.com/IonutRoscan/Furina-Clank-Chat-Atelier'
      },
      {label: 'WEBSITE', url: 'https://ionutroscan.github.io/furina/'},
      {
        label: 'FIREFOX ADD-ON',
        url: 'https://addons.mozilla.org/en-US/firefox/addon/furina-clank-chat-atelier/'
      }
    ]
  },
  {
    id: 'daedalus',
    title: 'DAEDALUS',
    description: 'CLANK CHARACTER FORGE',
    tags: ['CHROMIUM', 'JAVASCRIPT'],
    image: 'assets/daedalus-icon.png',
    artwork: 'art-blue',
    details:
      'A local character-creation workspace for ClankWorld. Build characters in persistent projects with autosave and backups, use the guided creator or structured prompt builders, choose what a roleplay should track with RP Systems and a state-display designer, and plan whole worlds in The Labyrinth with relationships, a timeline, a plot board and exportable world-bible documents. Nothing reaches Clank until you apply it, and everything stays in your browser.',
    facts: [
      ['PLATFORM', 'CHROMIUM'],
      ['LICENSE', 'MIT'],
      ['STATUS', 'OPEN SOURCE']
    ],
    previews: [
      {
        src: 'assets/daedalus_preview_1.png',
        caption: 'Daedalus character-creation workspace'
      },
      {
        src: 'assets/daedalus_preview_2.png',
        caption: 'Structured creator tools inside Daedalus'
      },
      {
        src: 'assets/daedalus_preview_3.png',
        caption: 'Daedalus project and roleplay tooling'
      }
    ],
    install: {
      folder: 'Daedalus',
      after:
        'Open `https://www.clank.world/create`. The Daedalus launcher appears on the character creation page.'
    },
    links: [
      {
        label: 'GITHUB',
        url: 'https://github.com/IonutRoscan/Daedalus-Clank-Character-Forge'
      }
    ]
  },
  {
    id: 'grimoire',
    title: 'GRIMOIRE',
    description: 'LOREBOOK IMPORTER',
    tags: ['CHROMIUM', 'JAVASCRIPT'],
    image: 'assets/grimoire-icon.png',
    artwork: 'art-red',
    details:
      'Imports TXT, Markdown and supported JSON lorebooks into ClankWorld through a parchment-style grimoire interface. Preview entries, review conversion notes and recover drafts before filling a lorebook. Everything runs locally, and no drafts leave your browser.',
    facts: [
      ['PLATFORM', 'CHROMIUM'],
      ['LICENSE', 'MIT'],
      ['STATUS', 'OPEN SOURCE']
    ],
    previews: [
      {src: 'assets/grimoire-preview.png', caption: "Grimoire's Menu"}
    ],
    install: {
      folder: 'clank-lorebook-importer',
      after:
        'Open your Lorebook on clank.world. The Grimoire panel appears at the bottom right.'
    },
    links: [
      {
        label: 'GITHUB',
        url: 'https://github.com/IonutRoscan/Grimoire-ClankWorld'
      }
    ]
  },
  {
    id: 'obelisk',
    title: 'OBELISK',
    description: 'CLANK LAYOUT BUILDER',
    tags: ['CHROMIUM', 'HTML / CSS'],
    image: 'assets/obelisk-icon.png',
    artwork: 'art-blue',
    details:
      'A visual panel for ClankWorld creators that generates the HTML and CSS for character "Edit about" pages, so layouts can be designed by eye instead of written by hand.',
    facts: [
      ['PLATFORM', 'CHROMIUM'],
      ['LICENSE', 'MIT'],
      ['STATUS', 'OPEN SOURCE']
    ],
    previews: [
      {
        src: 'assets/obelisk-preview-1.png',
        caption: 'Obelisk 2.0 creator workspace'
      },
      {
        src: 'assets/obelisk-preview-2.png',
        caption: 'Obelisk Studio Mode'
      }
    ],
    install: {
      folder: 'clank-layout-builder',
      after:
        'Open any Character Edit page on clank.world. Obelisk appears there.'
    },
    links: [
      {
        label: 'GITHUB',
        url: 'https://github.com/IonutRoscan/Obelisk-Clank-Layout-Builder'
      }
    ],
    tools: [
      {
        label: 'PHOTO PLANE VIEWER',
        url: 'https://github.com/IonutRoscan/photo-plane-viewer'
      },
      {
        label: 'STELE SHADER ENGINE',
        url: 'https://github.com/IonutRoscan/stele-shader-engine'
      }
    ]
  },
  {
    id: 'halation',
    title: 'HALATION',
    description: 'YOUTUBE AMBIENT LIGHT',
    tags: ['CHROMIUM', 'JAVASCRIPT'],
    image: 'assets/halation-icon.png',
    artwork: 'art-main',
    details:
      "Recreates YouTube's ambient-light glow in Chromium browsers, spilling the colours of the video onto the page around the player.",
    facts: [
      ['PLATFORM', 'CHROMIUM'],
      ['LICENSE', 'MIT'],
      ['STATUS', 'OPEN SOURCE']
    ],
    previews: [
      {
        src: 'assets/halation-preview.png',
        caption: 'Halation ambient light on YouTube'
      }
    ],
    links: [{label: 'GITHUB', url: 'https://github.com/IonutRoscan/Halation'}]
  },
  {
    id: 'queen-of-chaos',
    title: 'QUEEN OF CHAOS',
    description: 'GAME IN DEVELOPMENT',
    tags: ['GODOT', '3D ACTION RPG'],
    image: '', // swap in 'assets/queen-of-chaos-icon.png' when you have one
    artwork: 'art-qoc',
    details:
      'A third-person action RPG and platformer with a PS1-style look. You play Fria, the self-proclaimed Queen of Chaos, fighting through a fallen modern world where a phenomenon called Memory makes people forget how to function. Fast parkour movement, a scythe built around combo chains, and a pistol used to stun rather than kill. Early development.',
    facts: [
      ['GENRE', 'ACTION RPG / PLATFORMER'],
      ['ENGINE', 'GODOT'],
      ['PLATFORM', 'PC'],
      ['STATUS', 'EARLY DEVELOPMENT']
    ],
    links: []
  }
]

// Your GitHub profile (used by the top-right link and the menu).
const profileLinks = {
  github: 'https://github.com/IonutRoscan'
}

const gallery = document.querySelector('.gallery')
const featuredArtwork = document.querySelector('#featured-artwork')
const title = document.querySelector('#project-title')
const description = document.querySelector('#project-description')
const counter = document.querySelector('#project-counter')
const leftArtwork = document.querySelector('.left-artwork')
const rightArtwork = document.querySelector('.right-artwork')
const projectInfo = document.querySelector('.project-info')
const detail = document.querySelector('#detail')
const projectTags = document.querySelector('#project-tags')
const menu = document.querySelector('#menu')
const isOverlayOpen = () =>
  menu.classList.contains('is-open') || detail.classList.contains('is-open')

let activeProject = 0
let isTransitioning = false
let wheelAccumulator = 0
let wheelResetTimer

const transitionDuration = 750

function setArtwork(element, project) {
  const art = element.querySelector('.artwork-art')

  art.className = `artwork-art ${project.imageReady ? 'has-image' : project.artwork}`
  art.style.backgroundImage = project.imageReady
    ? `url("${project.image}")`
    : ''
}

function updateGallery() {
  const previous =
    projects[(activeProject + projects.length - 1) % projects.length]

  const current = projects[activeProject]

  const next = projects[(activeProject + 1) % projects.length]

  title.textContent = current.title
  description.textContent = current.description
  projectTags.textContent = (current.tags || []).join('  ·  ')

  counter.textContent = `${String(activeProject + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`

  setArtwork(featuredArtwork, current)
  setArtwork(leftArtwork, previous)
  setArtwork(rightArtwork, next)

  featuredArtwork.querySelector('.artwork-number').textContent = String(
    activeProject + 1
  ).padStart(2, '0')
}

const slideEasing = 'cubic-bezier(0.22, 1, 0.36, 1)'
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

function centerOf(rect) {
  return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2}
}

// Slides `element` so its box lands exactly on `target` (position + size).
// Uses composite: 'add' so the element's own CSS transform (the side
// artworks are positioned with one) is kept underneath the animation.
function moveTo(element, from, target) {
  const a = centerOf(from)
  const b = centerOf(target)
  const scale = target.width / from.width

  return element.animate(
    [
      {transform: 'translate(0px, 0px) scale(1)'},
      {transform: `translate(${b.x - a.x}px, ${b.y - a.y}px) scale(${scale})`}
    ],
    {
      duration: transitionDuration,
      easing: slideEasing,
      fill: 'forwards',
      composite: 'add'
    }
  )
}

function fadeTo(element, props) {
  return element.animate([props], {
    duration: transitionDuration,
    easing: slideEasing,
    fill: 'forwards'
  })
}

// Only use a cover icon once it has actually loaded; otherwise keep the CSS artwork.
projects.forEach(project => {
  if (!project.image) return

  const probe = new Image()
  probe.onload = () => {
    project.imageReady = true
    if (!isTransitioning) updateGallery()
  }
  probe.src = project.image
})

function showProject(direction) {
  if (isTransitioning || direction === 0) return

  const step = direction > 0 ? 1 : -1
  const nextIndex = (activeProject + step + projects.length) % projects.length

  if (reducedMotion.matches) {
    activeProject = nextIndex
    updateGallery()
    return
  }

  isTransitioning = true
  gallery.classList.add('is-transitioning')
  projectInfo.classList.add('is-changing')

  // Freeze the idle float where it is so nothing jumps when the slide starts.
  const floatValue = getComputedStyle(featuredArtwork).translate
  const floatY =
    floatValue && floatValue !== 'none'
      ? parseFloat(floatValue.split(' ')[1]) || 0
      : 0

  featuredArtwork.style.animation = 'none'
  featuredArtwork.style.translate = `0px ${floatY}px`

  // Measure every slot BEFORE animating anything.
  const mainRect = featuredArtwork.getBoundingClientRect()
  const leftRect = leftArtwork.getBoundingClientRect()
  const rightRect = rightArtwork.getBoundingClientRect()

  // Where the main artwork sits at rest (no float offset).
  const mainRest = new DOMRect(
    mainRect.left,
    mainRect.top - floatY,
    mainRect.width,
    mainRect.height
  )

  // Direction-dependent roles.
  const incoming = step > 0 ? rightArtwork : leftArtwork // becomes the main one
  const incomingRect = step > 0 ? rightRect : leftRect
  const outgoing = step > 0 ? leftArtwork : rightArtwork // slides off-screen
  const outgoingRect = step > 0 ? leftRect : rightRect
  const mainDestination = step > 0 ? leftRect : rightRect // main -> side slot

  const offscreenRect = new DOMRect(
    outgoingRect.left + (step > 0 ? -1 : 1) * outgoingRect.width * 1.1,
    outgoingRect.top,
    outgoingRect.width * 0.85,
    outgoingRect.height
  )

  incoming.style.zIndex = '2'

  const animations = [
    moveTo(featuredArtwork, mainRect, mainDestination),
    fadeTo(featuredArtwork, {opacity: 0.48, filter: 'brightness(0.72)'}),

    moveTo(incoming, incomingRect, mainRest),
    fadeTo(incoming, {opacity: 1, filter: 'brightness(1)'}),

    moveTo(outgoing, outgoingRect, offscreenRect),
    fadeTo(outgoing, {opacity: 0})
  ]

  Promise.all(animations.map(animation => animation.finished))
    .then(() => {
      const artworks = [featuredArtwork, leftArtwork, rightArtwork]

      // The animations ended exactly on the new resting layout, so swap the
      // content and drop all temporary state in the same frame: no visible jump.
      artworks.forEach(element => {
        element.style.transition = 'none'
      })

      activeProject = nextIndex
      updateGallery()

      animations.forEach(animation => animation.cancel())

      featuredArtwork.style.animation = ''
      featuredArtwork.style.translate = ''
      incoming.style.zIndex = ''

      void gallery.offsetWidth // commit the reset before re-enabling transitions

      artworks.forEach(element => {
        element.style.transition = ''
      })

      // The far side slot just received a brand-new project: fade it in.
      const arrived = step > 0 ? rightArtwork : leftArtwork
      arrived.animate(
        [{opacity: 0}, {opacity: getComputedStyle(arrived).opacity}],
        {duration: 450, easing: 'ease-out'}
      )

      projectInfo.classList.remove('is-changing')
      gallery.classList.remove('is-transitioning')
      isTransitioning = false
    })
    .catch(() => {
      // Animation was interrupted (e.g. tab torn down): just recover cleanly.
      animations.forEach(animation => animation.cancel())
      featuredArtwork.style.animation = ''
      featuredArtwork.style.translate = ''
      incoming.style.zIndex = ''
      projectInfo.classList.remove('is-changing')
      gallery.classList.remove('is-transitioning')
      isTransitioning = false
    })
}

document.querySelector('#previous-button').addEventListener('click', () => {
  showProject(-1)
})

document.querySelector('#next-button').addEventListener('click', () => {
  showProject(1)
})

document.querySelector('#gallery-indicator').addEventListener('click', () => {
  showProject(1)
})

leftArtwork.addEventListener('click', () => {
  showProject(-1)
})

rightArtwork.addEventListener('click', () => {
  showProject(1)
})

featuredArtwork.addEventListener('click', () => {
  openDetail()
})

document.querySelector('#project-details').addEventListener('click', () => {
  openDetail()
})

document.querySelector('#detail-close').addEventListener('click', () => {
  closeDetail()
})

function makeLink(label, url) {
  const link = document.createElement('a')
  link.className = 'explore-link'
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener'
  link.textContent = `${label} ↗`
  return link
}

// Turns `code` and **bold** markers in a string into real elements (no innerHTML).
function richText(text) {
  const fragment = document.createDocumentFragment()

  text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).forEach(part => {
    if (!part) return

    if (part.startsWith('`')) {
      const code = document.createElement('code')
      code.textContent = part.slice(1, -1)
      fragment.append(code)
    } else if (part.startsWith('**')) {
      const strong = document.createElement('strong')
      strong.textContent = part.slice(2, -2)
      fragment.append(strong)
    } else {
      fragment.append(part)
    }
  })

  return fragment
}

function fillInstall(project) {
  const box = document.querySelector('#detail-install')
  const note = document.querySelector('#detail-install-note')

  box.hidden = !project.install
  box.open = false
  if (!project.install) return

  document.querySelector('#detail-install-steps').replaceChildren(
    ...chromiumInstall(project.install).map(step => {
      const item = document.createElement('li')
      item.append(richText(step))
      return item
    })
  )

  note.textContent = project.install.note || ''
  note.hidden = !project.install.note
}

// Screenshots. Each thumbnail is dropped again if its file doesn't exist.
const previewSection = document.querySelector('#detail-previews')
const previewRow = document.querySelector('#detail-previews-row')

function fillPreviews(project) {
  const items = project.previews || []

  previewSection.hidden = items.length === 0

  previewRow.replaceChildren(
    ...items.map(item => {
      const button = document.createElement('button')
      const image = document.createElement('img')
      const caption = document.createElement('span')

      button.type = 'button'
      button.className = 'preview-thumb'
      button.dataset.src = item.src
      button.dataset.caption = item.caption || ''
      button.setAttribute('aria-label', `Enlarge: ${item.caption || 'preview'}`)

      image.alt = item.caption || ''
      image.loading = 'lazy'
      image.decoding = 'async'
      image.addEventListener('error', () => {
        button.remove()
        previewSection.hidden = previewRow.children.length === 0
      })
      image.src = item.src

      caption.textContent = item.caption || ''

      button.append(image, caption)
      button.addEventListener('click', () => {
        openLightbox([...previewRow.children].indexOf(button))
      })
      return button
    })
  )
}

// Lightbox for the screenshots
const lightbox = document.querySelector('#lightbox')
const lightboxImage = document.querySelector('#lightbox-image')
const lightboxCaption = document.querySelector('#lightbox-caption')
let lightboxIndex = 0

function lightboxItems() {
  return [...previewRow.children].map(button => ({
    src: button.dataset.src,
    caption: button.dataset.caption
  }))
}

function showLightboxImage() {
  const items = lightboxItems()
  if (items.length === 0) return closeLightbox()

  lightboxIndex = (lightboxIndex + items.length) % items.length
  lightboxImage.src = items[lightboxIndex].src
  lightboxImage.alt = items[lightboxIndex].caption
  lightboxCaption.textContent = `${items[lightboxIndex].caption}  ·  ${lightboxIndex + 1} / ${items.length}`

  const single = items.length < 2
  document.querySelector('#lightbox-prev').style.visibility = single
    ? 'hidden'
    : ''
  document.querySelector('#lightbox-next').style.visibility = single
    ? 'hidden'
    : ''
}

function openLightbox(index) {
  lightboxIndex = Math.max(index, 0)
  showLightboxImage()
  lightbox.classList.add('is-open')
  lightbox.setAttribute('aria-hidden', 'false')
}

function closeLightbox() {
  lightbox.classList.remove('is-open')
  lightbox.setAttribute('aria-hidden', 'true')
}

function stepLightbox(direction) {
  lightboxIndex += direction
  showLightboxImage()
}

document
  .querySelector('#lightbox-close')
  .addEventListener('click', closeLightbox)
document.querySelector('#lightbox-prev').addEventListener('click', () => {
  stepLightbox(-1)
})
document.querySelector('#lightbox-next').addEventListener('click', () => {
  stepLightbox(1)
})

// Clicking the dark backdrop (not the image or buttons) closes it.
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox()
})

function fillDetail(project) {
  document.querySelector('#detail-kicker').textContent =
    `${String(projects.indexOf(project) + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`
  document.querySelector('#detail-title').textContent =
    `${project.title} · ${project.description}`
  document.querySelector('#detail-text').textContent = project.details

  setArtwork(detail.querySelector('.detail-art'), project)

  const facts = document.querySelector('#detail-facts')
  facts.replaceChildren(
    ...project.facts.flatMap(([label, value]) => {
      const term = document.createElement('dt')
      const definition = document.createElement('dd')
      term.textContent = label
      definition.textContent = value
      return [term, definition]
    })
  )

  const links = project.links.map(item => makeLink(item.label, item.url))

  document.querySelector('#detail-links').replaceChildren(...links)

  fillInstall(project)
  fillPreviews(project)

  const tools = project.tools || []
  document.querySelector('#detail-tools').hidden = tools.length === 0
  document.querySelector('#detail-tools-label').textContent =
    `USED BY ${project.title}`
  document
    .querySelector('#detail-tools-links')
    .replaceChildren(...tools.map(item => makeLink(item.label, item.url)))
}

function setDetail(open) {
  if (!open) closeLightbox()
  detail.classList.toggle('is-open', open)
  detail.setAttribute('aria-hidden', String(!open))
  if (open) detail.scrollTop = 0
}

function setHash(hash) {
  try {
    history.pushState(null, '', hash || location.pathname + location.search)
  } catch {
    // Some environments (e.g. file://) block this; the panel still works.
  }
}

function openDetail() {
  if (isTransitioning) return

  const project = projects[activeProject]
  fillDetail(project)
  setDetail(true)
  setHash(`#${project.id}`)
}

function closeDetail() {
  setDetail(false)
  if (location.hash) setHash('')
}

// Deep links (#halation) and the browser back button.
function syncFromHash() {
  const index = projects.findIndex(
    project => `#${project.id}` === location.hash
  )

  if (index === -1) {
    setDetail(false)
    return
  }

  if (index !== activeProject && !isTransitioning) {
    activeProject = index
    updateGallery()
  }

  fillDetail(projects[index])
  setDetail(true)
}

window.addEventListener('popstate', syncFromHash)

// Contact links. The email is assembled here so it isn't sitting in the HTML as plain text.
const contactLinks = [
  {label: 'EMAIL', href: `mailto:${['loxxbeats', 'gmail.com'].join('@')}`},
  {label: 'INSTAGRAM', href: 'https://www.instagram.com/ionutroscan'},
  {label: 'REDDIT', href: 'https://www.reddit.com/user/doxowk'},
  {label: 'DISCORD @LOXXANI', copy: '@LOXXANI'} // no profile URL: click copies the handle
]

const musicLinks = [
  {label: 'SOUNDCLOUD', href: 'https://soundcloud.com/loxxani'},
  {
    label: 'YOUTUBE',
    href: 'https://www.youtube.com/channel/UCHuFWnfmaXFEiR1KZu3UNsg'
  }
]

function renderLinks(selector, items) {
  document.querySelector(selector).replaceChildren(
    ...items.map(item => {
      if (item.href) {
        const link = document.createElement('a')
        link.className = 'explore-link'
        link.href = item.href
        link.textContent = item.label
        if (item.href.startsWith('http')) {
          link.target = '_blank'
          link.rel = 'noopener'
          link.textContent += ' ↗'
        }
        return link
      }

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'explore-link'
      button.textContent = item.label
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(item.copy)
          button.textContent = 'COPIED'
        } catch {
          button.textContent = item.copy
        }
        window.setTimeout(() => {
          button.textContent = item.label
        }, 1600)
      })
      return button
    })
  )
}

renderLinks('#contact-links', contactLinks)
renderLinks('#music-links', musicLinks)

function setMenu(open) {
  menu.classList.toggle('is-open', open)
  menu.setAttribute('aria-hidden', String(!open))
}

document.querySelector('#menu-button').addEventListener('click', () => {
  setMenu(true)
})

document.querySelector('#menu-close').addEventListener('click', () => {
  setMenu(false)
})

menu.querySelectorAll('[data-close]').forEach(item => {
  item.addEventListener('click', () => setMenu(false))
})

document.querySelector('#github-link').href = profileLinks.github
document.querySelector('#menu-github').href = profileLinks.github

// Touch swipe
let touchStartX = null

gallery.addEventListener(
  'touchstart',
  event => {
    touchStartX = event.touches[0].clientX
  },
  {passive: true}
)

gallery.addEventListener('touchend', event => {
  if (touchStartX === null) return

  const distance = event.changedTouches[0].clientX - touchStartX
  touchStartX = null

  if (Math.abs(distance) > 40) showProject(distance < 0 ? 1 : -1)
})

// One gesture = one slide. After a slide starts, wheel events are swallowed
// until the stream goes quiet, so trackpad inertia can't trigger extra slides.
let wheelLocked = false
let wheelUnlockTimer
const wheelQuietTime = 160

function lockWheel() {
  wheelLocked = true
  window.clearTimeout(wheelUnlockTimer)
  wheelUnlockTimer = window.setTimeout(() => {
    wheelLocked = false
  }, wheelQuietTime)
}

document.addEventListener(
  'wheel',
  event => {
    if (isOverlayOpen()) return // let the open panel scroll normally

    event.preventDefault()

    const delta =
      Math.abs(event.deltaY) > Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX

    if (Math.abs(delta) < 1) return

    // Still animating or still coasting: keep extending the lock, do nothing.
    if (wheelLocked || isTransitioning) {
      lockWheel()
      wheelAccumulator = 0
      return
    }

    wheelAccumulator += delta

    window.clearTimeout(wheelResetTimer)

    wheelResetTimer = window.setTimeout(() => {
      wheelAccumulator = 0
    }, 120)

    if (Math.abs(wheelAccumulator) >= 35) {
      const direction = wheelAccumulator > 0 ? 1 : -1
      wheelAccumulator = 0
      lockWheel()
      showProject(direction)
    }
  },
  {passive: false}
)

document.addEventListener('keydown', event => {
  // The lightbox sits on top of everything: it gets the keys first.
  if (lightbox.classList.contains('is-open')) {
    if (event.key === 'Escape') closeLightbox()
    else if (event.key === 'ArrowRight') stepLightbox(1)
    else if (event.key === 'ArrowLeft') stepLightbox(-1)
    return
  }

  if (event.key === 'Escape') {
    setMenu(false)
    closeDetail()
  }

  if (event.repeat || isOverlayOpen()) return

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    showProject(1)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showProject(-1)
  }
})

updateGallery()
syncFromHash()
