const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = async function handler(req, res) {
  try {
    const { code } = req.body

    if (!code || code.trim() === '') {
      return res.status(200).json({ valid: false, message: 'コードを入力してください' })
    }

    const { data, error } = await supabase
      .from('participant_codes')
      .select('code, label')
      .eq('code', code.trim().toUpperCase())
      .single()

    if (error || !data) {
      return res.status(200).json({ valid: false, message: '無効なコードです' })
    }

    return res.status(200).json({ valid: true, label: data.label })
  } catch (err) {
    console.error(err)
    res.status(500).json({ valid: false, message: 'エラーが発生しました' })
  }
}
