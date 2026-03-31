const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = async function handler(req, res) {
  try {
    const { ams_score, ams_judge, adam_positive, qpad_score, qpad_judge, overall_grade } = req.body
    const { error } = await supabase.from('scores').insert({
      ams_score, ams_judge, adam_positive, qpad_score, qpad_judge, overall_grade
    })
    if (error) return res.status(500).json({ error })
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
