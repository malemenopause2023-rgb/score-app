
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

    // クッキーからLINEユーザーIDを取得
    const cookieHeader = req.headers.cookie || ''
    console.log('cookies:', cookieHeader)
    
    let lineUid = null
    cookieHeader.split(';').forEach(c => {
      const parts = c.trim().split('=')
      if (parts[0] === 'line_uid') {
        lineUid = parts.slice(1).join('=')
      }
    })
    
    console.log('lineUid:', lineUid)

    const { error } = await supabase.from('scores').insert({
      ams_score, ams_judge, adam_positive,
      qpad_score, qpad_judge, overall_grade,
      line_uid: lineUid
    })

    if (error) return res.status(500).json({ error })
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
