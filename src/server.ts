import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 3000

app.post('/create-dns', async (req, res) => {
  const { host, value } = req.body
  console.log('Creating DNS record for:', { host, value })

  try {
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
    console.log('Cloudflare response:', data)

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
