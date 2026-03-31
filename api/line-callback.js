module.exports = async function handler(req, res) {
  const { code, state } = req.query

  if (!code) return res.status(400).send('No code')

  // LINEのアクセストークンを取得
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

  // LINEのユーザー情報を取得
  const profileRes = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  })
  const profile = await profileRes.json()

  // ユーザーIDをクッキーに保存してトップページへ
  res.setHeader('Set-Cookie', `line_uid=${profile.userId}; Path=/; Max-Age=31536000`)
  res.redirect('/')
}
