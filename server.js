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
  const { fname, lname, email, phone, business, service, frequency, sqft, notes } = req.body
  const name = [fname, lname].filter(Boolean).join(' ').trim()

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
          <tr><td style="padding:7px 0;color:#999;">Business</td><td style="padding:7px 0;color:#222;">${business || 'Not provided'}</td></tr>
        </table>
      </div>

      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border:1px solid #e9ecef;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">Service Details</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;width:32%;">Service</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;font-weight:600;">${service}</td></tr>
          <tr><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#999;">Frequency</td><td style="padding:7px 0;border-bottom:1px solid #f1f3f5;color:#222;">${frequency || 'Not specified'}</td></tr>
          <tr><td style="padding:7px 0;color:#999;">Space / Sq Ft</td><td style="padding:7px 0;color:#222;">${sqft || 'Not specified'}</td></tr>
        </table>
      </div>

      ${notes ? `
      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border:1px solid #e9ecef;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Additional Notes</h2>
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0;">${notes}</p>
      </div>` : ''}

      <div style="text-align:center;margin-top:20px;">
        <a href="mailto:${email}?subject=Re: Your Kenest Cleaning Quote Request&body=Hi ${fname || name},%0A%0AThank you for reaching out to Kenest Cleaning Co.! We've received your quote request for ${service} and will follow up shortly with a custom quote for your space.%0A%0ALooking forward to working with you!%0A%0AKenest Cleaning Co."
          style="display:inline-block;background:#3ab529;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
          Reply to ${fname || name} &rarr;
        </a>
      </div>

      <p style="text-align:center;color:#bbb;font-size:11px;margin-top:24px;letter-spacing:0.5px;">Kenest Cleaning Co. &middot; St. Louis, MO</p>
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
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto;background:#f4f7f4;padding:32px;border-radius:10px;">
      <div style="background:linear-gradient(135deg,#1a2744,#0f1a30);padding:24px;border-radius:8px;margin-bottom:20px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;letter-spacing:2px;">NEW CONTACT MESSAGE</h1>
        <p style="color:rgba(255,255,255,0.4);margin:5px 0 0;font-size:13px;letter-spacing:1px;">KENEST Cleaning Co., LLC</p>
      </div>

      <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:14px;border-left:4px solid #3ab529;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">Contact Details</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#888;width:32%;">Name</td><td style="color:#1a2744;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Email</td><td><a href="mailto:${email}" style="color:#3ab529;">${email}</a></td></tr>
          <tr><td style="padding:6px 0;color:#888;">Phone</td><td style="color:#1a2744;">${phone || 'Not provided'}</td></tr>
        </table>
      </div>

      <div style="background:#fff;border-radius:8px;padding:20px;border-left:4px solid #3ab529;">
        <h2 style="font-size:11px;color:#3ab529;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Message</h2>
        <p style="font-size:14px;color:#333;line-height:1.7;margin:0;">${message}</p>
      </div>

      <div style="margin-top:16px;text-align:center;">
        <a href="mailto:${email}?subject=Re: Your Kenest Cleaning Inquiry&body=Hi ${name},%0A%0AThank you for reaching out to Kenest Cleaning Co.!"
          style="display:inline-block;background:#3ab529;color:#ffffff;padding:10px 24px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1px;">
          REPLY TO ${name.toUpperCase()} &rarr;
        </a>
      </div>

      <div style="margin-top:16px;padding:12px;background:#1a2744;border-radius:6px;text-align:center;">
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;letter-spacing:1px;">KENEST CLEANING CO., LLC &middot; ST. LOUIS, MO</p>
      </div>
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

// ── Catch-all ─────────────────────────────────────────────────────────────────
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

app.listen(PORT, () => console.log(`KENEST Cleaning Co. running on port ${PORT}`))
