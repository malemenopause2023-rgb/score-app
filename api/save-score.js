const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = async function handler(req, res) {
  try {
    const {
      ams_score, ams_judge, adam_positive,
      qpad_score, qpad_judge, overall_grade,
      age_group,
      ams_answers, adam_answers, qpad_answers
    } = req.body

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

    const { data: scoreData, error: scoreError } = await supabase
      .from('scores')
      .insert({
        ams_score, ams_judge, adam_positive,
        qpad_score, qpad_judge, overall_grade,
        age_group,
        line_uid: lineUid,
        line_name: lineName
      })
      .select()
      .single()

    if (scoreError) return res.status(500).json({ error: scoreError })

    const scoreId = scoreData.id

    const amsLabels = ['なし','軽い','中等度','重い','きわめて重い']
    const amsQList = [
      '総合的な調子の悪さ（健康状態の低下）','関節や筋肉の痛み','ひどい発汗',
      '睡眠の悩み','よく眠くなる、疲れを感じる','いらいらする','神経質になった',
      '不安感','体力の低下、活動性の低下','筋力の低下','憂うつな気分',
      '「自分は働き盛りのピークを過ぎた」と思う','力尽きた、どん底にいると感じる',
      'ひげの伸びが遅くなった','性的能力の衰え','早朝勃起（朝立ち）の回数の減少','性欲の低下'
    ]
    const adamQList = [
      '性欲の低下がありますか？','元気がなくなってきましたか？','体力や持続力の低下がありますか？',
      '身長が低くなりましたか？','毎日の楽しさがなくなりましたか？','悲しい気分や怒りっぽくなることがありますか？',
      '勃起力が弱くなりましたか？','最近、運動能力が低下したと感じますか？',
      '夕食後に居眠りをすることがありますか？','最近、仕事の能力が低下したと感じますか？'
    ]
    const qpadQList = [
      '不安感（理由のない不安）','抑うつ（気分が沈み、やる気が出ない）','興味の喪失',
      '集中力の低下','易疲労感（疲れやすさ）','睡眠障害','発汗・のぼせ',
      '肥満（特にお腹周り）','筋力低下','性欲の減退','朝立ちの回数の減少',
      '勃起力の低下','射精感の低下'
    ]
    const qpadLabels = ['なし','たまにある','よくある','ひどい']

    const details = []

    if (ams_answers) {
      ams_answers.forEach((val, i) => {
        details.push({
          score_id: scoreId, line_uid: lineUid, line_name: lineName,
          test_type: 'AMS', question_no: i + 1,
          question_text: amsQList[i],
          answer_value: val, answer_label: amsLabels[val - 1]
        })
      })
    }

    if (adam_answers) {
      adam_answers.forEach((val, i) => {
        details.push({
          score_id: scoreId, line_uid: lineUid, line_name: lineName,
          test_type: 'ADAM', question_no: i + 1,
          question_text: adamQList[i],
          answer_value: val ? 1 : 0, answer_label: val ? 'はい' : 'いいえ'
        })
      })
    }

    if (qpad_answers) {
      qpad_answers.forEach((val, i) => {
        details.push({
          score_id: scoreId, line_uid: lineUid, line_name: lineName,
          test_type: 'qPAD', question_no: i + 1,
          question_text: qpadQList[i],
          answer_value: val, answer_label: qpadLabels[val]
        })
      })
    }

    await supabase.from('score_details').insert(details)

    res.status(200).json({ ok: true, id: scoreId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
