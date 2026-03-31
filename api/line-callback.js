module.exports = async function handler(req, res) {
  try {
    const { code } = req.query
    if (!code) return res.status(400).send('No code')

    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.APP_URL}/api/line-callback`,
        client_id: process.env.LINE_CHANNEL_ID,
        client_secret: process.env.LINE_CHANNEL_SECRET
      })
    })
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return res.status(500).send('Token error: ' + JSON.stringify(tokenData))
    }

    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const profile = await profileRes.json()

    if (!profile.userId) {
      return res.status(500).send('Profile error: ' + JSON.stringify(profile))
    }

    // UID と名前をクッキーに保存
    const cookies = [
      `line_uid=${profile.userId}; Path=/; Max-Age=31536000`,
      `line_name=${encodeURIComponent(profile.displayName)}; Path=/; Max-Age=31536000`
    ]
    res.setHeader('Set-Cookie', cookies)
    res.redirect('/')

  } catch (err) {
    console.error(err)
    res.status(500).send('Error: ' + err.message)
  }
}
