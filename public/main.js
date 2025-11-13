import { sdk } from 'https://esm.sh/@farcaster/miniapp-sdk'

const statusEl = document.getElementById('status')
const form = document.getElementById('confessForm')
const submitBtn = document.getElementById('submitBtn')

async function readyAndInit() {
  try {
    // show skeleton quickly
    statusEl.textContent = 'Initializing...'
    // wait for fonts or critical resources if any (simple)
    if (document?.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
    // Tell Farcaster the app is ready; prevents infinite splash screen
    await sdk.actions.ready()
    statusEl.textContent = 'App ready.'
  } catch (err) {
    console.error('sdk ready failed', err)
    // Ensure we still call ready to avoid blocking; swallow errors
    try { await sdk.actions.ready() } catch (_) {}
    statusEl.textContent = 'App ready (initialization error logged).'
  }
}

readyAndInit()

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  submitBtn.disabled = true
  statusEl.textContent = 'Submitting...'

  const content = document.getElementById('content').value.trim()
  const image = document.getElementById('image').value.trim() || null

  if (!content) {
    statusEl.textContent = 'Please write something.'
    submitBtn.disabled = false
    return
  }
  if (content.length > 1000) {
    statusEl.textContent = 'Content too long.'
    submitBtn.disabled = false
    return
  }

  try {
    const res = await fetch('/api/confessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, image })
    })
    const json = await res.json()
    if (!res.ok) {
      statusEl.textContent = 'Error: ' + (json.error || res.statusText)
    } else {
      try { await sdk.actions.showToast({ message: 'Confession submitted!' }) } catch(e){}
      statusEl.textContent = 'Submitted — may be moderated before publish.'
      form.reset()
    }
  } catch (err) {
    console.error(err)
    statusEl.textContent = 'Network error — try later.'
  } finally {
    submitBtn.disabled = false
  }
})
