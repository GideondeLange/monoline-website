import '../css/style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Swup from 'swup'
import SwupPreloadPlugin from '@swup/preload-plugin'
import SwupBodyClassPlugin from '@swup/body-class-plugin'

gsap.registerPlugin(ScrollTrigger)

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

  // ── Hero parallax
  const heroImg = document.querySelector('.hero-photo-col img')
  if (heroImg) {
    const onScroll = () => {
      heroImg.style.transform = `translateY(${window.scrollY * 0.28}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
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

  // ── .reveal-group  (stagger children — cards, steps, stats)
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

  // ── Cinematic sections — parallax scroll on full-bleed images
  gsap.utils.toArray('.cinematic-single img, .cinematic-pair-item img').forEach(img => {
    gsap.fromTo(img,
      { y: '0%' },
      {
        y: '-14%',
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.cinematic-single, .cinematic-pair-item'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      }
    )
  })

  // ── Cinematic sections — fade in on scroll
  gsap.utils.toArray('.cinematic-single, .cinematic-pair-item').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        delay: i * 0.12,
      }
    )
  })

  // ── Masonry gallery — each item animates as it enters the viewport
  gsap.utils.toArray('.gallery-masonry-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, y: 32, scale: 0.98 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 94%', once: true },
      }
    )
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
