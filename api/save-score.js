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
    const cookies = req.headers.cookie || ''
    const lineUid = cookies.split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('line_uid='))
      ?.split('=')[1] || null

    const { error } = await supabase.from('scores').insert({
      ams_score, ams_judge, adam_positive,
      qpad_score, qpad_judge, overall_grade,
      line_uid: lineUid
    })

    if (error) return res.status(500).json({ error })
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
