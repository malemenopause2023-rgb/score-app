const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = async function handler(req, res) {
  try {
    const {
      ams_score, ams_judge, adam_positive,
      qpad_score, qpad_judge, overall_grade
    } = req.body

    // クッキーからUIDと名前を取得
    const cookieHeader = req.headers.cookie || ''
    let lineUid = null
    let lineName = null

    cookieHeader.split(';').forEach(c => {
      const parts = c.trim().split('=')
      const key = parts[0]
      const val = parts.slice(1).join('=')
      if (key === 'line_uid') lineUid = val
      if (key === 'line_name') lineName = decodeURIComponent(val)
    })

    const { error } = await supabase.from('scores').insert({
      ams_score, ams_judge, adam_positive,
      qpad_score, qpad_judge, overall_grade,
      line_uid: lineUid,
      line_name: lineName
    })

    if (error) return res.status(500).json({ error })
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
