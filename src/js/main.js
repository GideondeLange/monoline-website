import '../css/style.css'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Swup from 'swup'
import SwupPreloadPlugin from '@swup/preload-plugin'
import SwupBodyClassPlugin from '@swup/body-class-plugin'

gsap.registerPlugin(ScrollTrigger)

/* ── THREE.JS SCENE (init once, never re-created) ─────────── */
const canvas = document.getElementById('bg-canvas')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene  = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 150)
camera.position.z = 35

// Particle field — olive green, muted orange, deep blue tones
const COUNT = 1200
const positions = new Float32Array(COUNT * 3)
const colors    = new Float32Array(COUNT * 3)
const sizes     = new Float32Array(COUNT)

const palette = [
  new THREE.Color(0x7fa232), // olive green
  new THREE.Color(0x5a7520), // darker olive
  new THREE.Color(0xf97316), // brand orange
  new THREE.Color(0x3a5f8a), // navy blue
  new THREE.Color(0x243a52), // dark navy
]

for (let i = 0; i < COUNT; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 100
  positions[i * 3 + 1] = (Math.random() - 0.5) * 100
  positions[i * 3 + 2] = (Math.random() - 0.5) * 100
  const c = palette[Math.floor(Math.random() * palette.length)]
  colors[i * 3]     = c.r
  colors[i * 3 + 1] = c.g
  colors[i * 3 + 2] = c.b
  sizes[i] = Math.random() * 0.8 + 0.1
}

const geo = new THREE.BufferGeometry()
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

const mat = new THREE.PointsMaterial({
  size: 0.2,
  sizeAttenuation: true,
  vertexColors: true,
  transparent: true,
  opacity: 0.65,
})

const particles = new THREE.Points(geo, mat)
scene.add(particles)

// Mouse parallax
let mouseX = 0, mouseY = 0
window.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.6
  mouseY = (e.clientY / window.innerHeight - 0.5) * 0.6
})

// Scroll zoom
let scrollProgress = 0
window.addEventListener('scroll', () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight
  scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0
})

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// Animate
;(function animate() {
  requestAnimationFrame(animate)
  particles.rotation.y += 0.00045
  particles.rotation.x += 0.00018
  camera.position.x += (mouseX - camera.position.x) * 0.025
  camera.position.y += (-mouseY - camera.position.y) * 0.025
  camera.position.z = 35 - scrollProgress * 10
  renderer.render(scene, camera)
}())

/* ── CONTENT INIT (called on load + every Swup page replace) ── */
function initContent() {
  // ── Active nav link
  const rawPath = window.location.pathname.replace(/\/$/, '') || '/'
  document.querySelectorAll('.nav-list a').forEach(a => {
    a.classList.remove('active')
    const href = (a.getAttribute('href') || '/').replace(/\/$/, '') || '/'
    if (href === rawPath) a.classList.add('active')
  })

  // ── Kill previous ScrollTriggers
  ScrollTrigger.getAll().forEach(t => t.kill())

  // ── Header scroll state
  const header = document.querySelector('header')
  if (header) {
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 20)
    }
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
  }

  // ── Hamburger menu
  const navToggle = document.getElementById('navToggle')
  const navList   = document.getElementById('navList')
  if (navToggle && navList) {
    // Clone to remove stale listeners
    const fresh = navToggle.cloneNode(true)
    navToggle.replaceWith(fresh)
    fresh.addEventListener('click', () => {
      fresh.classList.toggle('is-open')
      navList.classList.toggle('is-open')
    })
    navList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        fresh.classList.remove('is-open')
        navList.classList.remove('is-open')
      })
    })
  }

  // ── Hero entrance animation
  const heroLabel = document.querySelector('.hero .section-label')
  const heroBadge = document.querySelector('.hero-badge')
  const heroTitle = document.querySelector('.hero-title')
  const heroSub   = document.querySelector('.hero-sub')
  const heroBtns  = document.querySelector('.hero-btns')

  if (heroTitle) {
    gsap.set([heroBadge, heroLabel, heroTitle, heroSub, heroBtns].filter(Boolean), {
      opacity: 0, y: 0,
    })
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    if (heroBadge) tl.fromTo(heroBadge, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, 0.15)
    if (heroLabel) tl.fromTo(heroLabel, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, 0.25)
    tl.fromTo(heroTitle, { opacity: 0, y: 52 }, { opacity: 1, y: 0, duration: 1.0 }, 0.4)
    if (heroSub)   tl.fromTo(heroSub,  { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.75 }, 0.78)
    if (heroBtns)  tl.fromTo(heroBtns, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65 }, 1.0)
  }

  // ── .reveal  (single elements, fade-up on scroll)
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 44 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    )
  })

  // ── .reveal-group  (stagger children)
  gsap.utils.toArray('.reveal-group').forEach(group => {
    const items = group.querySelectorAll('.glass-card, .process-step, .stat-item')
    if (!items.length) return
    gsap.fromTo(items,
      { opacity: 0, y: 44 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.11,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      }
    )
  })

  // ── Stats count-up
  document.querySelectorAll('.stat-number[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10)
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          { val: 0 },
          { val: target, duration: 1.6, ease: 'power2.out',
            onUpdate() { el.textContent = Math.round(this.targets()[0].val) + (el.dataset.suffix || '') },
          }
        )
      },
    })
  })

  // ── Contact form async submit
  const form   = document.getElementById('contactForm')
  const status = document.getElementById('formStatus')
  if (form && status) {
    form.addEventListener('submit', async e => {
      e.preventDefault()
      const btn = form.querySelector('[type="submit"]')
      const orig = btn.textContent
      btn.textContent = 'Sending…'
      btn.disabled = true
      status.className = 'form-status'
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        })
        if (res.ok) {
          form.reset()
          status.textContent = '✓ Message sent! We\'ll be in touch soon.'
          status.className = 'form-status success'
        } else {
          throw new Error('server')
        }
      } catch {
        status.textContent = '✕ Something went wrong. Please call us directly on +27 79 914 3050.'
        status.className = 'form-status error'
      } finally {
        btn.textContent = orig
        btn.disabled = false
      }
    })
  }

  ScrollTrigger.refresh()
}

/* ── SWUP PAGE TRANSITIONS ─────────────────────────────────── */
const swup = new Swup({
  containers: ['#swup'],
  plugins: [
    new SwupPreloadPlugin(),
    new SwupBodyClassPlugin(),
  ],
  animateHistoryBrowsing: true,
})

// First load
initContent()

// After each page swap
swup.hooks.on('content:replace', () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  initContent()
})

// Kill triggers before leave animation
swup.hooks.on('visit:start', () => {
  ScrollTrigger.getAll().forEach(t => t.kill())
})
