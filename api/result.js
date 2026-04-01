const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = async function handler(req, res) {
  try {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id is required' })

    // scoresテーブルから取得
    const { data: score, error: scoreError } = await supabase
      .from('scores')
      .select('*')
      .eq('id', id)
      .single()

    if (scoreError || !score) return res.status(404).json({ error: 'Not found' })

    // score_detailsテーブルから取得
    const { data: details, error: detailsError } = await supabase
      .from('score_details')
      .select('*')
      .eq('score_id', id)
      .order('test_type', { ascending: true })
      .order('question_no', { ascending: true })

    if (detailsError) return res.status(500).json({ error: detailsError })

    res.status(200).json({ score, details })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
