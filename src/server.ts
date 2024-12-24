import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 3000

async function isTwitterVerified(username: string): Promise<boolean> {
  try {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY!,
        'X-RapidAPI-Host': 'twitter-api45.p.rapidapi.com',
      },
    }

    const response = await fetch(
      `https://twitter-api45.p.rapidapi.com/screenname.php?screenname=${encodeURIComponent(username)}`,
      options,
    )

    const data = await response.json()
    return data.blue_verified === true
  } catch (error) {
    console.error('Error checking Twitter verification:', error)
    return false
  }
}

app.post('/check-twitter', async (req, res) => {
  const { username } = req.body

  try {
    const verified = await isTwitterVerified(username)
    console.log('Verified:', verified)
    res.json({ verified })
  } catch (error) {
    res.status(500).json({ error: 'Failed to check Twitter verification' })
  }
})

app.post('/create-dns', async (req, res) => {
  const { host, value, username } = req.body

  try {
    // First verify Twitter status
    const isVerified = await isTwitterVerified(username)
    if (!isVerified) {
      return res.status(403).json({ error: 'Only verified Twitter users can create DNS records' })
    }

    // Proceed with DNS creation if verified
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.VITE_CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Email': process.env.VITE_CLOUDFLARE_EMAIL!,
          'X-Auth-Key': process.env.VITE_CLOUDFLARE_API_KEY!,
        },
        body: JSON.stringify({
          type: 'TXT',
          name: `_atproto.${host}.bluecheck.id`,
          content: `"${value}"`,
          comment: 'Domain verification record',
          proxied: false,
          ttl: 1,
        }),
      },
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Failed to create DNS record')
    }

    res.json(data)
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An error occurred',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
