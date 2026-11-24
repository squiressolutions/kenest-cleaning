import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 3007

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL      || 'kenestcleaning@gmail.com'
const GMAIL_USER   = process.env.GMAIL_USER        || 'kenestcleaning@gmail.com'
const GMAIL_PASS   = process.env.GMAIL_APP_PASSWORD

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  })
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// ── Debug ─────────────────────────────────────────────────────────────────────
app.get('/api/debug-email', async (req, res) => {
  const status = {
    GMAIL_USER: GMAIL_USER,
    NOTIFY_EMAIL: NOTIFY_EMAIL,
    GMAIL_PASS_SET: !!GMAIL_PASS,
    GMAIL_PASS_LENGTH: GMAIL_PASS ? GMAIL_PASS.length : 0,
  }
  try {
    const t = getTransporter()
    await t.verify()
    status.smtp_verified = true
  } catch (err) {
    status.smtp_verified = false
    status.smtp_error = err.message
  }
  res.json(status)
})

// ── Quote Request ─────────────────────────────────────────────────────────────
app.post('/api/quote', async (req, res) => {
  const {
    name, email, phone, company,
    service, propertyType, sqft, address,
    frequency, startDate, message
  } = req.body

  if (!name || !email || !service) {
    return res.status(400).json({ error: 'Name, email, and service are required.' })
  }

  console.log(`[QUOTE] ${new Date().toISOString()} | ${name} | ${service} | ${email}`)

  const html = `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto;background:#f8f9fa;padding:32px;border-radius:10px;">
      <div style="background:#3ab529;padding:24px;border-radius:8px;margin-bottom:20px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;letter-spacing:1px;">New Quote Request</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Kenest Cleaning Co.</p>
      </div>

      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border:1px solid #e9ecef;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">Client Information</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;width:32%;">Name</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Email</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;"><a href="mailto:${email}" style="color:#3ab529;">${email}</a></td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Phone</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${phone || 'Not provided'}</td></tr>
          <tr><td style="padding:7px 0;color:#999;">Company</td><td style="padding:7px 0;color:#222;">${company || 'Not provided'}</td></tr>
        </table>
      </div>

      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border:1px solid #e9ecef;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">Service Details</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;width:32%;">Service</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;font-weight:600;">${service}</td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Property Type</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${propertyType || 'Not specified'}</td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Square Footage</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${sqft || 'Not specified'}</td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Address / ZIP</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${address || 'Not provided'}</td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Frequency</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${frequency || 'Not specified'}</td></tr>
          <tr><td style="padding:7px 0;color:#999;">Preferred Start</td><td style="padding:7px 0;color:#222;">${startDate || 'Not specified'}</td></tr>
        </table>
      </div>

      ${message ? `
      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border:1px solid #e9ecef;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Additional Notes</h2>
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0;">${message}</p>
      </div>` : ''}

      <div style="text-align:center;margin-top:20px;">
        <a href="mailto:${email}?subject=Re: Your Kenest Cleaning Quote Request&body=Hi ${name},%0A%0AThank you for reaching out to Kenest Cleaning Co.! We've received your quote request for ${service} and will be in touch within 24 hours to schedule your free walkthrough.%0A%0ALooking forward to working with you!%0A%0AKenest Cleaning Co.%0A(314) 325-6533"
          style="display:inline-block;background:#3ab529;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
          Reply to ${name} &rarr;
        </a>
      </div>

      <p style="text-align:center;color:#bbb;font-size:11px;margin-top:24px;letter-spacing:0.5px;">Kenest Cleaning Co. &middot; St. Louis, MO &middot; (314) 325-6533</p>
    </div>
  `

  if (!GMAIL_PASS) {
    console.warn('[QUOTE] No GMAIL_APP_PASSWORD — inquiry logged but email not sent.')
    return res.json({ success: true })
  }

  try {
    const t = getTransporter()
    await t.sendMail({
      from:    `"KENEST Cleaning Co." <${GMAIL_USER}>`,
      to:      NOTIFY_EMAIL,
      replyTo: email,
      subject: `New Quote Request: ${service} — ${name}`,
      html
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    res.json({ success: true })
  }
})

// ── Contact Message ───────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' })
  }

  console.log(`[CONTACT] ${new Date().toISOString()} | ${name} | ${email}`)

  const html = `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto;background:#f8f9fa;padding:32px;border-radius:10px;">
      <div style="background:#3ab529;padding:24px;border-radius:8px;margin-bottom:20px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;letter-spacing:1px;">New Contact Message</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Kenest Cleaning Co.</p>
      </div>

      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border:1px solid #e9ecef;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">Contact Details</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;width:32%;">Name</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Email</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;"><a href="mailto:${email}" style="color:#3ab529;">${email}</a></td></tr>
          <tr><td style="padding:7px 0;color:#999;">Phone</td><td style="padding:7px 0;color:#222;">${phone || 'Not provided'}</td></tr>
        </table>
      </div>

      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border:1px solid #e9ecef;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Message</h2>
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0;">${message}</p>
      </div>

      <div style="text-align:center;margin-top:20px;">
        <a href="mailto:${email}?subject=Re: Your Kenest Cleaning Inquiry&body=Hi ${name},%0A%0AThank you for reaching out to Kenest Cleaning Co.! We received your message and will follow up shortly.%0A%0ALooking forward to working with you!%0A%0AKenest Cleaning Co."
          style="display:inline-block;background:#3ab529;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
          Reply to ${name} &rarr;
        </a>
      </div>

      <p style="text-align:center;color:#bbb;font-size:11px;margin-top:24px;letter-spacing:0.5px;">Kenest Cleaning Co. &middot; St. Louis, MO</p>
    </div>
  `

  if (!GMAIL_PASS) {
    console.warn('[CONTACT] No GMAIL_APP_PASSWORD — message logged but email not sent.')
    return res.json({ success: true })
  }

  try {
    const t = getTransporter()
    await t.sendMail({
      from:    `"Kenest Cleaning Co." <${GMAIL_USER}>`,
      to:      NOTIFY_EMAIL,
      replyTo: email,
      subject: `New Contact Message — ${name}`,
      html
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    res.json({ success: true })
  }
})

// ── Calculator Quote Email ────────────────────────────────────────────────────
app.post('/api/calculator-quote', async (req, res) => {
  const {
    client, phone, notes,
    serviceType, sqft, distance, gasPrice, mpg,
    monthly, perVisit, sqftRate, base, fuel, addons, annualVal, visits, freq, tier,
    bathrooms, breakrooms, offices, trash
  } = req.body

  if (!client) return res.status(400).json({ error: 'Client name is required.' })

  const isPost = serviceType === 'postconstruction'
  const tierLabel = tier !== '—' ? tier : '—'

  const spaceRows = !isPost ? `
    <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;width:40%;">Bathrooms</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${bathrooms} (+$${bathrooms * 20}/visit)</td></tr>
    <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Break Rooms</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${breakrooms} (+$${breakrooms * 30}/visit)</td></tr>
    <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Private Offices</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${offices} (+$${offices * 5}/visit)</td></tr>
    <tr><td style="padding:7px 0;color:#999;">Trash Cans</td><td style="padding:7px 0;color:#222;">${trash} (+$${trash * 1}/visit)</td></tr>
  ` : ''

  const html = `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto;background:#f8f9fa;padding:32px;border-radius:10px;">
      <div style="background:#1a2744;padding:24px;border-radius:8px;margin-bottom:20px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:1px;">CALCULATOR QUOTE</h1>
        <p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:13px;">Kenest Cleaning Co. · Internal</p>
      </div>

      <!-- Client -->
      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border:1px solid #e9ecef;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">Client Info</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;width:40%;">Client / Business</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;font-weight:600;">${client}</td></tr>
          <tr><td style="padding:7px 0;${notes ? 'border-bottom:1px solid #f1f3f5;' : ''}color:#999;">Phone</td><td style="padding:7px 0;${notes ? 'border-bottom:1px solid #f1f3f5;' : ''}color:#222;">${phone || '—'}</td></tr>
          ${notes ? `<tr><td style="padding:7px 0;color:#999;vertical-align:top;">Notes</td><td style="padding:7px 0;color:#222;">${notes}</td></tr>` : ''}
        </table>
      </div>

      <!-- Pricing -->
      <div style="background:#1a2744;border-radius:8px;padding:22px;margin-bottom:14px;text-align:center;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:6px;">${isPost ? 'Total Job Price' : 'Monthly Total'}</div>
        <div style="font-size:48px;font-weight:700;color:#fff;line-height:1;">${monthly}</div>
        ${!isPost ? `<div style="font-size:12px;color:rgba(255,255,255,0.45);margin-top:4px;">${freq}</div>` : ''}
        ${!isPost && annualVal && annualVal !== '$—' ? `<div style="margin-top:12px;font-size:13px;color:#3ab529;font-weight:600;">Annual: ${annualVal}</div>` : ''}
      </div>

      <!-- Breakdown -->
      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border:1px solid #e9ecef;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">Price Breakdown</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;width:40%;">Service Type</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;font-weight:600;">${isPost ? 'Post-Construction' : 'Commercial Cleaning'}</td></tr>
          ${isPost ? `<tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Clean Tier</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${tierLabel}</td></tr>` : ''}
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Square Footage</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${Number(sqft).toLocaleString()} sqft</td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Rate Used</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${sqftRate}</td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Base (sqft)</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${base}</td></tr>
          ${!isPost ? `<tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Add-Ons/visit</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${addons !== '$—' ? addons : '$0'}</td></tr>` : ''}
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Distance</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${distance} mi — Fuel/visit: ${fuel}</td></tr>
          ${!isPost ? `<tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Frequency</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${freq} (${visits} visits/mo)</td></tr>` : ''}
          <tr><td style="padding:7px 0;color:#999;">Per Visit</td><td style="padding:7px 0;color:#222;font-weight:700;">${perVisit}</td></tr>
        </table>
      </div>

      <!-- Space breakdown (commercial only) -->
      ${!isPost ? `
      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border:1px solid #e9ecef;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">Space Breakdown</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${spaceRows}</table>
      </div>` : ''}

      <!-- Terms -->
      <div style="background:#f0fdf0;border:1px solid rgba(58,181,41,0.25);border-radius:8px;padding:14px 18px;text-align:center;">
        <span style="font-size:13px;font-weight:600;color:#1a2744;">${isPost ? '50% deposit upfront · Net 7 on balance' : (visits === '1' && freq === 'one-time' ? 'Collect same day' : 'Invoice on Net 15')}</span>
      </div>

      <p style="text-align:center;color:#bbb;font-size:11px;margin-top:24px;">Kenest Cleaning Co. · kenestcleaning@gmail.com · (314) 325-6533</p>
    </div>
  `

  console.log(`[CALC QUOTE] ${new Date().toISOString()} | ${client} | ${monthly}`)

  if (!GMAIL_PASS) {
    console.warn('[CALC QUOTE] No GMAIL_APP_PASSWORD — logged but not sent.')
    return res.json({ success: true })
  }

  try {
    const t = getTransporter()
    await t.sendMail({
      from:    `"Kenest Calculator" <${GMAIL_USER}>`,
      to:      NOTIFY_EMAIL,
      subject: `Calculator Quote — ${client} · ${monthly}`,
      html
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Calc quote email error:', err)
    res.json({ success: true })
  }
})

// ── Short routes ──────────────────────────────────────────────────────────────
app.get('/calculator', (req, res) => res.redirect('/calculator.html'))
app.get('/quote',      (req, res) => res.redirect('/quote.html'))
app.get('/contact',    (req, res) => res.redirect('/contact.html'))
app.get('/about',      (req, res) => res.redirect('/about.html'))
app.get('/faq',        (req, res) => res.redirect('/faq.html'))
app.get('/commercial', (req, res) => res.redirect('/commercial.html'))
app.get('/post-construction', (req, res) => res.redirect('/post-construction.html'))

// ── Catch-all ─────────────────────────────────────────────────────────────────
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

app.listen(PORT, () => console.log(`KENEST Cleaning Co. running on port ${PORT}`))
