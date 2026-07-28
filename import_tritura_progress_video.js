const db = require('./src/db/neonClient');

async function main() {
  console.log('🚀 Importing Progress Video for Tritura trainees...');

  // Parse the data: pattern is ID, "▶️ Progress Video", URL (3 lines per entry)
  const rawData = `70100102
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqSPHhls4npu1VR8Ct6H_v0
70100106
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVraUiqtnBCnz8CAnZXTQAx_
70100110
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVo1RGIFjMUW2wO-AQgVhdK5
70100111
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVo5v7NpThk-r0hVXlL2C0hC
70100112
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVpVbXPGlGCirGHAELwNe786
70100113
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVrsPXThQwIDY2hfiYNST-8i
70100115
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVq00CNNpC0lCO5sUJYNxgEL
70100098
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVpC8qkwbHzSk3HPrecuU7Sc
70100116
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVq2zTbfZSjvYyeXDz6I7-Ca
70100117
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqhX_GpWCcsf6E-KAmDeZAj
70100118
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqzeN8k8fKOLwrMG62W2MWe
70100119
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoEakP9RWzHBSAuPLT2XTLo
70100120
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoDRYBG3OrKevtYkVwOfr2X
70100121
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoPG93luky6FT9p9fOk8ABY
70100122
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoJ_Zu2q1lp3Vvd7s7QbHg1
70100123
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVocxkWGv_4OSuVWLdXM2Wta
70100124
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoRjr5zm2NH9-ONsk4B1QVd
70100125
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVpRnqVl_OH4Ve9-tRF0J0gf
70100126
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqhHVF4atG1QNOhqn3tJsU-
70100127
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVotMavm3-JibseNltT0AD0a
70100128
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVrD2C8u-beQr_qybhv9dSO3
70100129
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqtQOEK6M38RurUiNT7lfkr
70100130
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqj6y37hhnKPZjCynZt7wYa
70100131
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoDfLYULU1Ra_qXyWSx1DKo
70100132
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVobKsVJ3ZYvCvWbRE-tDUIG
70100133
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVrfSVnCJ14dXu4qxlOitOLT
70100134
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVpqPp8NKa0Jbo7xX4MMMtry
70100135
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVo-Cv9CXjEM9ViZneCkXD6E
70100136
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqKycaPFwbV2Ke13TFZhAF_
70100138
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqsIZuXpQaECmKR63NhtUpK
70100139
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVomcE2ZtwfuOnCaXdzXmkYK
70100140
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVpmZgsu3ahEITzhGCNM1u9G
70100141
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVrf2AXN29FRkaz76Ex4xfUo
70100142
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVrVdA3Gkob_Qsucv0sn2Faj
70100143
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVp8mGT4WJ3_wVSh7IhV33mv
70100144
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVq6cunt3Bhhzp-ORClOc3V5
70100145
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVq5eySuyglwMdve8X3r-jB4
70100146
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVreeOywAF_qidjPbeACJ_aR
70100147
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVpKoupp1l4mCTt3Nmv-fuSC
70100148
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoEMLFlihri_UkDjQJHTVGp
70100149
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqx7K2s5bh3Fm1N9yOgzsrA
70100150
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVr59AR90D2uKEp_kCRd5ZNp
70100151
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVrBQWKAbDUpZWU3Vo4u6qDU
70100152
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqe5X8RRVIrTJW5kCIVyauo
70100153
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVpg5MQ3L6LyAv5RTfEb6j5d
70100156
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVopd2vZPm3p2dWca4LyvQ24
70100157
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoLPQ-pMogo0vsfwgYZe_KN
70100158
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVo9gTkXzW43rrzvHhJry9XV
70100159
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVrJMI2GZ_bq_UsNn1hVkqWe
70100160
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVo8boUBrPuVMkCg0vI71vvN
70100161
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoONgwkSEbH0KgumQ3O8BL1
70100162
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoAkfceQKKtTc3majy0B9cs
70100165
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVpNbUm5wMS8mm2PXgfJN10H
70100166
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVpuBx6ufU-y385o9A3vllFo
70100154
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVoaIfa3qyk0DaIqbCJcVVAs
70100155
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVrGxXVj4c8U8ZiIjFlJAn3K
70100173
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVrEgOtVVHtF9SyB6QQkwve6
70100174
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVpcM1ih0wsQyf-uEpxyzMTx
70100176
▶️ Progress Video
https://www.youtube.com/playlist?list=PLmfta-_9FZVqH_jynTEVkNM6rbDx8dne7
70100179
▶️ Progress Video
https://www.youtube.com/playlist?list=PLCiqaJ6lwMlk
70100180
▶️ Progress Video
https://www.youtube.com/playlist?list=PLbjXEtzYy8ew
70100184
▶️ Progress Video
https://www.youtube.com/playlist?list=PLHG5BBDH96rM
70100185
▶️ Progress Video
https://www.youtube.com/playlist?list=PLHLnJ0tUqh-M
70100186
▶️ Progress Video
https://www.youtube.com/playlist?list=PLP1VbrDUmG80
70100187
▶️ Progress Video
https://www.youtube.com/playlist?list=PLbeFG2WN9UpA
70100188
▶️ Progress Video
https://www.youtube.com/playlist?list=PLZ-BBCqbnc4g
70100189
▶️ Progress Video
https://www.youtube.com/playlist?list=PLKpTwxgtHR1Q
70100190
▶️ Progress Video
https://www.youtube.com/playlist?list=PLGbbvda-6Bhc
70100191
▶️ Progress Video
https://www.youtube.com/playlist?list=PLFpuswIDSUUs
70100167
▶️ Progress Video
https://www.youtube.com/playlist?list=PLTFvnOhvwIf8
70100168
▶️ Progress Video
https://www.youtube.com/playlist?list=PLMgj2jlcYSP0
70100175
▶️ Progress Video
https://www.youtube.com/playlist?list=PLd3zS2M6edic
70100177
▶️ Progress Video
https://www.youtube.com/playlist?list=PLf6UYKlWLf_w
70100192
▶️ Progress Video
https://www.youtube.com/playlist?list=PLOhxzUPQ6ReE
70100193
▶️ Progress Video
https://www.youtube.com/playlist?list=PLf4tUJYJj4wU
70100169
▶️ Progress Video
https://www.youtube.com/playlist?list=PLIr_DKP7Z2-Y`;

  const lines = rawData.split('\n').map(l => l.trim()).filter(Boolean);
  const entries = new Map();
  
  for (let i = 0; i < lines.length; i += 3) {
    const id = lines[i];
    // skip the "▶️ Progress Video" line
    const url = lines[i + 2];
    if (id && url && url.startsWith('http')) {
      entries.set(id, url);
    }
  }

  console.log(`Parsed ${entries.size} unique trainee entries.`);

  // Step 1: Insert into login_trainee (if not exists)
  let loginInserted = 0;
  let loginSkipped = 0;
  for (const [id] of entries) {
    const existing = await db.query(`SELECT student_id FROM login_trainee WHERE student_id = $1`, [id]);
    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO login_trainee (student_id, password, plain_password, created_at, updated_at) VALUES ($1, $2, $2, NOW(), NOW())`,
        [id, id]
      );
      loginInserted++;
    } else {
      loginSkipped++;
    }
  }
  console.log(`login_trainee: ${loginInserted} inserted, ${loginSkipped} already existed.`);

  // Step 2: Insert/update portal_trainee with branch_id = 'tritura' and progress_video_url
  let portalInserted = 0;
  let portalUpdated = 0;
  for (const [id, url] of entries) {
    const existing = await db.query(`SELECT trainee_id FROM portal_trainee WHERE trainee_id = $1`, [id]);
    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO portal_trainee (trainee_id, branch_id, progress_video_url, created_at, updated_at) VALUES ($1, 'tritura', $2, NOW(), NOW())`,
        [id, url]
      );
      portalInserted++;
    } else {
      await db.query(
        `UPDATE portal_trainee SET progress_video_url = $1, branch_id = 'tritura', updated_at = NOW() WHERE trainee_id = $2`,
        [url, id]
      );
      portalUpdated++;
    }
  }
  console.log(`portal_trainee: ${portalInserted} inserted, ${portalUpdated} updated.`);

  // Final counts
  const r1 = await db.query(`SELECT COUNT(*) as cnt FROM login_trainee WHERE student_id LIKE '701001%'`);
  console.log(`Total tritura-range login_trainee: ${r1.rows[0].cnt}`);
  const r2 = await db.query(`SELECT COUNT(*) as cnt FROM portal_trainee WHERE branch_id = 'tritura'`);
  console.log(`Total portal_trainee (tritura): ${r2.rows[0].cnt}`);
  const r3 = await db.query(`SELECT COUNT(*) as cnt FROM portal_trainee WHERE branch_id = 'tritura' AND progress_video_url IS NOT NULL`);
  console.log(`Tritura trainees with progress_video_url: ${r3.rows[0].cnt}`);

  console.log('✅ Done!');
}

main().catch(err => { console.error('❌ Error:', err); process.exit(1); });
