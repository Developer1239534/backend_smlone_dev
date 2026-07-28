const db = require('./src/db/neonClient');

async function main() {
  // ====== PART 1: QUARTERLY REPORT ======
  console.log('🚀 [1/2] Importing Quarterly Report for Tritura trainees...');

  const qrData = `70100098
Sep-Dec 2025
https://docs.google.com/document/d/12q4Ln1caa091HFIcA1oBIkF6Q2u8YRuGqMKA8DPReIs/edit?usp=drivesdk
70100102
Sep-Dec 2025
https://docs.google.com/document/d/1PMmRNQDj6OmUIghkIsS8-L16k2mOPpu4A_bPiA7uoTI/edit?usp=drivesdk
70100106
Sep-Dec 2025
https://docs.google.com/document/d/1adsDcLiY1MbB-A11wn2dg8raivxcXAew_X-aDk76JSo/edit?usp=drivesdk
70100111
Sep-Dec 2025
https://docs.google.com/document/d/1CGgYLecfzr-EbnpNecrGVHWKSwScf295LC6pXG0sXTk/edit?usp=drivesdk
70100112
Sep-Dec 2025
https://docs.google.com/document/d/15oEH6N3GuOCOjXZvX_wBnSG6SCF1Mw_-QEczhFI4Nkc/edit?usp=drivesdk
70100113
Sep-Dec 2025
https://docs.google.com/document/d/1V40gxRnRLI_YylyDkJ367ayajq6Gp-VIU0_VYcUGE_o/edit?usp=drivesdk
70100115
Sep-Dec 2025
https://docs.google.com/document/d/1oMF0moN8uAx0nCmF5nyfXJgoTZC2a5mXzsMHONyTRGc/edit?usp=drivesdk
70100116
Sep-Dec 2025
https://docs.google.com/document/d/1OUWf4vYw_a1Caoo4MGM8GKjqUz6mh4lQU7RbMS1JLqk/edit?usp=drivesdk
70100117
Sep-Dec 2025
https://docs.google.com/document/d/1eYTjsgE3cGFbh139pF2XXv-YYYJ1zNfoLi1jCie6efI/edit?usp=drivesdk
70100118
Sep-Dec 2025
https://docs.google.com/document/d/1YyrUzGBZgix4o9VsB0AS5vwUJQD66ea4ddp4IcRp-Js/edit?usp=drivesdk
70100119
Sep-Dec 2025
https://docs.google.com/document/d/1C0Bgp4Sf1hW6vTEwJWDurYrvA-4_XShAEY9u-T0atVI/edit?usp=drivesdk
70100120
Sep-Dec 2025
https://docs.google.com/document/d/1FzObU2aO72kJhRT7m26yarvU5dBa9JfAWCCvcQg28sY/edit?usp=drivesdk
70100121
Sep-Dec 2025
https://docs.google.com/document/d/1th3Gzd1S6mvrdNuyNpzkYQAqEiF5_N6Sk65VJ3oP2M8/edit?usp=drivesdk
70100122
Sep-Dec 2025
https://docs.google.com/document/d/153IT3zbgtKgto-UzxjoVL_0xxToIqq9LWQm-MNETBFU/edit?usp=drivesdk
70100123
Sep-Dec 2025
https://docs.google.com/document/d/1Qpg9azMYw5X4A5cvgG5Y_sB3lZ6jUafpVKbryKn69nc/edit?usp=drivesdk
70100124
Sep-Dec 2025
https://docs.google.com/document/d/1lQSI5aCMP69RQmnva09AI9fDb1Jm1bXWJPr9hPGhwnI/edit?usp=drivesdk
70100125
Sep-Dec 2025
https://docs.google.com/document/d/1OIOs0t4gqEfKQTKjhXs7326FuW3BA2S8lz0s77-d3Lc/edit?usp=drivesdk
70100126
Sep-Dec 2025
https://docs.google.com/document/d/19s_P3ocaHY3FinzDVYpyUnvxqgBjnOo--SoT9YLf2GI/edit?usp=drivesdk
70100127
Sep-Dec 2025
https://docs.google.com/document/d/1s_2H1Usz6LHe1bxZPxyKxbrRwMb_KYCcEljmDWBZRlM/edit?usp=drivesdk
70100128
Sep-Dec 2025
https://docs.google.com/document/d/1R5jfae8JbwuvyRjJRX8TDRs_oV1MleLjiHa3FrzgbBg/edit?usp=drivesdk
70100129
Sep-Dec 2025
https://docs.google.com/document/d/178vXfzw4W9gI1Wu_zRBlahaVpUgf1lZ6diZPDY_iJ_Y/edit?usp=drivesdk
70100130
Sep-Dec 2025
https://docs.google.com/document/d/1qLB7ZoAivItFb7tN6cHKlCL6Q8rnLr__MnhwnqYaZqU/edit?usp=drivesdk
70100131
Sep-Dec 2025
https://docs.google.com/document/d/1MavwFX03oIjDDoqCElJcG8J8dLqgiNkGpU9nVMCM_KI/edit?usp=drivesdk
70100132
Sep-Dec 2025
https://docs.google.com/document/d/1f1StH7wNoIvhFJtj-1oWh8LglIDlpIiCdVXjd-MbGx4/edit?usp=drivesdk
70100133
Sep-Dec 2025
https://docs.google.com/document/d/1gheTEar2l16zxPlzM5RxI4OY7hDG6lm8UKUg4CQ45Ac/edit?usp=drivesdk
70100134
Sep-Dec 2025
https://docs.google.com/document/d/1Tt-lbAd9UM4M9rpj0GZyI2UI4xuxImfxZo4HuUzQCqU/edit?usp=drivesdk
70100135
Sep-Dec 2025
https://docs.google.com/document/d/1dK0tOOxylAPZxvIyGcDxEffhyz0zlJUefF_gH6LNxNc/edit?usp=drivesdk
70100136
Sep-Dec 2025
https://docs.google.com/document/d/1EUfBTlcvClj25o32TCsVmoeE-iLHhjIGJHf-4cNNggE/edit?usp=drivesdk
70100138
Sep-Dec 2025
https://docs.google.com/document/d/1SEUUds3hn0A0X8dKR_v7ktllHl91Rg13eheGVB94Xhk/edit?usp=drivesdk
70100139
Sep-Dec 2025
https://docs.google.com/document/d/18gHZBxa7nqKao8DbzQ3Q-X0AvM-ACQwoPq7VAAMAN4Y/edit?usp=drivesdk
70100116
Jan-Apr 2026
https://docs.google.com/document/d/15UuNl9zLWqeUpldZLFbioYDLnNI961Hl3Ve2FZO7DRg/edit?usp=drivesdk
70100117
Jan-Apr 2026
https://docs.google.com/document/d/1LYl8byChuy9C35rk-_tHddossTIsWIkh50Adbo0GuUQ/edit?usp=drivesdk
70100132
Jan-Apr 2026
https://docs.google.com/document/d/1MENqGXRalZHzUe9lw94dJWwZGQ-qu4GfAl7aaIq_6KU/edit?usp=drivesdk
70100133
Jan-Apr 2026
https://docs.google.com/document/d/1H_qTA54W5F9-413feNAZ_YxK7y63og7ZBVjj98Vphvs/edit?usp=drivesdk
70100136
Jan-Apr 2026
https://docs.google.com/document/d/1XizouEwcZJRtqP-8neOcAYJYJ5lDbCoFTRfOroTzWGI/edit?usp=drivesdk
70100138
Jan-Apr 2026
https://docs.google.com/document/d/1_tknktyngsLVboeYcPuItGPBNjTRXFW9_yTHJckGEus/edit?usp=drivesdk
70100140
Jan-Apr 2026
https://docs.google.com/document/d/1gUUoaFizL5iVE4_nieGtaYhi49q8A7ZztyVeJsB5fXk/edit?usp=drivesdk
70100141
Jan-Apr 2026
https://docs.google.com/document/d/15UHhV5f5AdzQAXh6ZRsomQYQTNStpmBsCdpAHb4qAhk/edit?usp=drivesdk
70100144
Jan-Apr 2026
https://docs.google.com/document/d/1ALy54t1hEGf1orkdBBh3d3GzNh_EZAbilSnEtp9mGUA/edit?usp=drivesdk
70100145
Jan-Apr 2026
https://docs.google.com/document/d/1HepiqmLbqz2nblEjPPUE8Xlxe4TfvKBaNF6jOq4cxtk/edit?usp=drivesdk
70100102
Jan-Apr 2026
https://docs.google.com/document/d/1usdp046evHNB3w7wI2B2IVm8wQvb1_wiL1TtgJ-B0aI/edit?usp=drivesdk
70100134
Jan-Apr 2026
https://docs.google.com/document/d/1HWJPlxwcotMwefTcTT_VdnDqp0460Hl7m6FkXpWLRXo/edit?usp=drivesdk
70100142
Jan-Apr 2026
https://docs.google.com/document/d/1rOHjDuQEqKex6_l2xD5kOiBQNxeeFDuJS4d7oNPd4D0/edit?usp=drivesdk
70100143
Jan-Apr 2026
https://docs.google.com/document/d/1JQPP8PqDhV4brLpSgySveyVqeTh0jmYwNS_H4dBOHuQ/edit?usp=drivesdk
70100147
Jan-Apr 2026
https://docs.google.com/document/d/1bmXWQx7d22ulQDvvNimSkn4EBWLqk2K9b-yd97Wn5mE/edit?usp=drivesdk
70100112
Jan-Apr 2026
https://docs.google.com/document/d/1gVr7l5DHzZH9Ma0LLsE7pIzeIFdHsnD3sWX-r5JjLkE/edit?usp=drivesdk
70100127
Jan-Apr 2026
https://docs.google.com/document/d/1wlGIOtqNK25eH7YTYEpWp5pzqH1QgwWlpZHcBqoihsQ/edit?usp=drivesdk
70100148
Jan-Apr 2026
https://docs.google.com/document/d/1A8qQ-XYfWInJHdDykwP6-VIv7CO5Ew2c7BTIpPu5Ck8/edit?usp=drivesdk
70100152
Jan-Apr 2026
https://docs.google.com/document/d/157pPtRXTwKXipoeoG360XYSjPU9I02v_G_j2_1oOjko/edit?usp=drivesdk
70100119
Jan-Apr 2026
https://docs.google.com/document/d/1KCxpcNmvD5fyng4OSu3g02ooGwfvwwZTjPKTgysRqX0/edit?usp=drivesdk
70100120
Jan-Apr 2026
https://docs.google.com/document/d/1BmNgUO9qa4BIrmaI3oTlnpUb3JAhLIDWGv7M83w-UH8/edit?usp=drivesdk
70100121
Jan-Apr 2026
https://docs.google.com/document/d/10KhFbLe5CjgPsL-UCMnpQo_O0mW4qIbZd0Vm6wrBVIg/edit?usp=drivesdk
70100125
Jan-Apr 2026
https://docs.google.com/document/d/16ThuAp0PFeYRgK7_yuqEeBRuHvub4_gfHTEPFJsBaQM/edit?usp=drivesdk
70100129
Jan-Apr 2026
https://docs.google.com/document/d/19NRcHE22z5g3bPdGdDtbxOI2HnzHk2nXIfwcoeopgzk/edit?usp=drivesdk
70100130
Jan-Apr 2026
https://docs.google.com/document/d/1uR3lSP0ZbM2uFYMdFg1-Bwggy9EJ5AHQD6w70Tajl0o/edit?usp=drivesdk
70100139
Jan-Apr 2026
https://docs.google.com/document/d/1UkNNXXdchOuNTmDry6T1IYVU7YEN5m8NdH-DXTZGl2Q/edit?usp=drivesdk
70100098
Jan-Apr 2026
https://docs.google.com/document/d/1MfZy3IGSPMgKt5J41Ra9KpQo0LTrPejtJSkEZYMxai4/edit?usp=drivesdk
70100113
Jan-Apr 2026
https://docs.google.com/document/d/1OocdZ0eLc-lqGgGGkWca0Hor_kb21OLmQveqOnocXZ8/edit?usp=drivesdk
70100135
Jan-Apr 2026
https://docs.google.com/document/d/166Ddj8ENxqKX78wFkhw4GPl_rr7oZ0YUu0rnZMX7Xnc/edit?usp=drivesdk
70100146
Jan-Apr 2026
https://docs.google.com/document/d/1dTWrzm9XhXHU9GCRxey7UMi2fv-uq7MAbn-4FZHMd44/edit?usp=drivesdk
70100106
Jan-Apr 2026
https://docs.google.com/document/d/1gM0DKB87ptRz3_DzWyH_R1_-ilzY8usSnMQ11S6lhic/edit?usp=drivesdk
70100122
Jan-Apr 2026
https://docs.google.com/document/d/12UriH8xAVwrcRlho1ASqYvdQ_LLJYYOnv89A0-qDzf4/edit?usp=drivesdk
70100123
Jan-Apr 2026
https://docs.google.com/document/d/1BxCXdsFDgniyK61E9LIhsiZwUbCz2sCAk9zMHGDcAeM/edit?usp=drivesdk
70100153
Jan-Apr 2026
https://docs.google.com/document/d/1U8DTJeX5g3uiDQCSo6xHnNm4WsM2xoU9SLIgievFz_A/edit?usp=drivesdk
70100118
Jan-Apr 2026
https://docs.google.com/document/d/1kS8gSIvrImthkra-76XYPvhKxKVi2QMiKMhD4aEh70E/edit?usp=drivesdk
70100126
Jan-Apr 2026
https://docs.google.com/document/d/1ozINNL8DSWcTPAyxc2W95aocd551j3kiymFWyvu31vQ/edit?usp=drivesdk
70100128
Jan-Apr 2026
https://docs.google.com/document/d/1sfM0sfYviGOxb4_TPkqoZB1weZjYhv-Rjz79BwqdqcE/edit?usp=drivesdk
70100131
Jan-Apr 2026
https://docs.google.com/document/d/1H02htNYkMZKZVvgObWTmd4rweTt4rsPCH5XYUBWsup4/edit?usp=drivesdk
70100176
May 2026 - Jun 2026
https://drive.google.com/file/d/1JAPEfROXQf9yx7UFpEvP31a2Vc2WJcaf/view?usp=drivesdk
70100174
May 2026 - Jun 2026
https://drive.google.com/file/d/1owk84PtJlGgxOdQO57ajCL8tXjh8dy5t/view?usp=drivesdk
70100173
May 2026 - Jun 2026
https://drive.google.com/file/d/1H9ZmlObIOlsBJuNrPyO5aQJhiv2ePs7r/view?usp=drivesdk
70100162
May 2026 - Jun 2026
https://drive.google.com/file/d/1kCNZUqVYUwPVW8Mxmd3teHR3NmHDupqT/view?usp=drivesdk
70100161
May 2026 - Jun 2026
https://drive.google.com/file/d/1U922pftcMBamHTSNAyoNy_Do4KCrZoZ-/view?usp=drivesdk
70100160
May 2026 - Jun 2026
https://drive.google.com/file/d/1FFL6MDpgvUgk0S4BFDgQYOa7qIQPp8-P/view?usp=drivesdk
70100159
May 2026 - Jun 2026
https://drive.google.com/file/d/13Gs8ZSp93H3jkV63QntPHQ9vGLQRWOOP/view?usp=drivesdk
70100158
May 2026 - Jun 2026
https://drive.google.com/file/d/156Wx4XJjg-Z0lUNjbshGQ8k5uph5sBFl/view?usp=drivesdk
70100157
May 2026 - Jun 2026
https://drive.google.com/file/d/1CWvLI_ljqEJEOO99XtoXbbWCbsS62ASB/view?usp=drivesdk
70100156
May 2026 - Jun 2026
https://drive.google.com/file/d/1I3K8nnHu8EC1y0nzpUZEQsyo0dC3cYLv/view?usp=drivesdk
70100155
May 2026 - Jun 2026
https://drive.google.com/file/d/1eqvxFFBulGl1mdtGMWFcpD1imMbAqzBA/view?usp=drivesdk
70100154
May 2026 - Jun 2026
https://drive.google.com/file/d/1JGtbpqo7JJFuI0pOF5sUb8QY7ZTQ_aHm/view?usp=drivesdk
70100153
May 2026 - Jun 2026
https://drive.google.com/file/d/1sN5vw4mrhkrAKznElGO-IZndNluhwX62/view?usp=drivesdk
70100152
May 2026 - Jun 2026
https://drive.google.com/file/d/1tzYVndHAFYicZT7geK3C9Ma7U-ALXCLo/view?usp=drivesdk
70100151
May 2026 - Jun 2026
https://drive.google.com/file/d/1zR9m6EyHnNKbhkoGfN1_n82AsznVvxP1/view?usp=drivesdk
70100150
May 2026 - Jun 2026
https://drive.google.com/file/d/1OED_DhriG7cpqLYc1QhfdHzHpFw10dbL/view?usp=drivesdk
70100149
May 2026 - Jun 2026
https://drive.google.com/file/d/1OSxryMhIsH7zsx2PqNJUb1-IVJGzAh_U/view?usp=drivesdk
70100148
May 2026 - Jun 2026
https://drive.google.com/file/d/1-e8H3FQamGBzCkNg9Uo3E5Clas2nlxbt/view?usp=drivesdk
70100147
May 2026 - Jun 2026
https://drive.google.com/file/d/1xA_6p9jH7uLpHe788gQMauTxAF-Nzzql/view?usp=drivesdk
70100146
May 2026 - Jun 2026
https://drive.google.com/file/d/1yW_FO1Wg6IEMuk4iDVk2M01-kgHqwhqP/view?usp=drivesdk
70100145
May 2026 - Jun 2026
https://drive.google.com/file/d/1Fhi9jhELpY9ZBoyZ_OsBT59MC5WUZLMm/view?usp=drivesdk
70100144
May 2026 - Jun 2026
https://drive.google.com/file/d/16LgeEtu7MLIS0Ut7A1XRQMeT1wMkp8oN/view?usp=drivesdk
70100143
May 2026 - Jun 2026
https://drive.google.com/file/d/1zrNmBdMWcKxit7LcjFCBxrYcMEFJ6Ka4/view?usp=drivesdk
70100140
May 2026 - Jun 2026
https://drive.google.com/file/d/1-o1r7PyuUBIaAqo_oDT1cLZQamX2oip1/view?usp=drivesdk
70100139
May 2026 - Jun 2026
https://drive.google.com/file/d/1EWSkMy7Y61X39fbKZjIHO77IIOHAx7pm/view?usp=drivesdk
70100136
May 2026 - Jun 2026
https://drive.google.com/file/d/1OhQ7fc6aQCG9Vc-bARlnHnZbMBU3gtye/view?usp=drivesdk
70100135
May 2026 - Jun 2026
https://drive.google.com/file/d/1Ilp2Vfnpp3CpqnpyfF-dmvmVZScMrKla/view?usp=drivesdk
70100134
May 2026 - Jun 2026
https://drive.google.com/file/d/1hYC79cq2jZt8kf-KUrmUffbx9qWy3z3f/view?usp=drivesdk
70100133
May 2026 - Jun 2026
https://drive.google.com/file/d/1iT0W1AHHUFVPttCJBvz5DXrfI7oOAeOx/view?usp=drivesdk
70100131
May 2026 - Jun 2026
https://drive.google.com/file/d/12AF7GYkcGnFhnKnMPjPUawzZqD63fenO/view?usp=drivesdk
70100130
May 2026 - Jun 2026
https://drive.google.com/file/d/1taqPGdtMFH0Obekipx3L484ZSBJlizo0/view?usp=drivesdk
70100128
May 2026 - Jun 2026
https://drive.google.com/file/d/1Ce1hOFrRV3eR7RSfOvD3keyHI8mnsX3M/view?usp=drivesdk
70100127
May 2026 - Jun 2026
https://drive.google.com/file/d/18KMbJQnsRlCWbQOCM2LtEY-lycH-k0_Q/view?usp=drivesdk
70100126
May 2026 - Jun 2026
https://drive.google.com/file/d/1Q3zbtANhtUf2h8r5N24nJYhe8lfaAFTA/view?usp=drivesdk
70100123
May 2026 - Jun 2026
https://drive.google.com/file/d/1gFYIJ52qYQvbE8xOi3NnEStOMhrhXjaW/view?usp=drivesdk
70100122
May 2026 - Jun 2026
https://drive.google.com/file/d/1E0R0vxutDHocb39dvIcteljrwuHemhP6/view?usp=drivesdk
70100121
May 2026 - Jun 2026
https://drive.google.com/file/d/1LuvyLf_9g-QoDz7dY7ieMesYwh5vpUYl/view?usp=drivesdk
70100118
May 2026 - Jun 2026
https://drive.google.com/file/d/1TTvUeQY3DVIFyJ1Z8YNRhpEDMa9oebJ0/view?usp=drivesdk
70100117
May 2026 - Jun 2026
https://drive.google.com/file/d/12SPclYTrh-_ajbOdnXAFW4vtil5NIGdV/view?usp=drivesdk
70100113
May 2026 - Jun 2026
https://drive.google.com/file/d/19Eyh1eAtbIzj-f4ICiaitC9tZll7E_Ox/view?usp=drivesdk
70100112
May 2026 - Jun 2026
https://drive.google.com/file/d/1cAuQQ3kR9AxxOHaJcXBpSYYALxI68q51/view?usp=drivesdk
70100106
May 2026 - Jun 2026
https://drive.google.com/file/d/1GLA-lYkQRpfVJX6LawAoRNXP9naJm5oT/view?usp=drivesdk
70100102
May 2026 - Jun 2026
https://drive.google.com/file/d/1vCFVOeGaDW7anwkbgwUszwkrerS1t4mL/view?usp=drivesdk
70100098
May 2026 - Jun 2026
https://drive.google.com/file/d/1GOHF0p0SIdcTMUE3041CkCsnX8QI0rph/view?usp=drivesdk`;

  const qrLines = qrData.split('\n').map(l => l.trim()).filter(Boolean);
  const qrMap = new Map(); // id -> latest url (last entry wins)
  for (let i = 0; i < qrLines.length; i += 3) {
    const id = qrLines[i];
    const url = qrLines[i + 2];
    if (id && url && url.startsWith('http')) {
      qrMap.set(id, url);
    }
  }
  console.log(`  Parsed ${qrMap.size} unique QR trainee IDs (latest URL kept).`);

  let qrUpdated = 0, qrSkipped = 0;
  for (const [id, url] of qrMap) {
    const existing = await db.query(`SELECT trainee_id FROM portal_trainee WHERE trainee_id = $1`, [id]);
    if (existing.rows.length > 0) {
      await db.query(`UPDATE portal_trainee SET quarterly_report_url = $1, updated_at = NOW() WHERE trainee_id = $2`, [url, id]);
      qrUpdated++;
    } else {
      qrSkipped++;
    }
  }
  console.log(`  QR Updated: ${qrUpdated}, Skipped (ID not in DB): ${qrSkipped}`);

  // ====== PART 2: REAL STAGE ======
  console.log('🚀 [2/2] Importing Real Stage for Tritura trainees...');

  const rsData = `70100106
Real Stage 46
https://drive.google.com/file/d/1zpD7PRfTOeUXNcHUegTlGzgDvyMWDkWu/view?usp=drivesdk
70100102
Real Stage 47
https://drive.google.com/file/d/168U4DdUH2Q_T41KIGZaMulkbkb7FtHn_/view?usp=drivesdk
70100112
Real Stage 47
https://drive.google.com/file/d/1I8bO0o_QuTT-JhSJ7U_SH8t0xCzU8I6n/view?usp=drivesdk
70100121
Real Stage 47
https://drive.google.com/file/d/1mbwhKnXz9MW7ybic-B8TZ8xq_3QutjGq/view?usp=drivesdk
70100098
Real Stage 48
https://drive.google.com/file/d/1zrQ8csPPC8m2u5yx3oXAVW8Ubvzh3bHS/view?usp=drivesdk
70100139
Real Stage 48
https://drive.google.com/file/d/1feQWO6vRxrmWeWuk5TxxEzjINaozkz7J/view?usp=drivesdk
70100122
Real Stage 48
https://drive.google.com/file/d/1pXSBeyfuwVilHiS2gY7yemBiwfbiCmSu/view?usp=drivesdk`;

  const rsLines = rsData.split('\n').map(l => l.trim()).filter(Boolean);
  const rsMap = new Map();
  for (let i = 0; i < rsLines.length; i += 3) {
    const id = rsLines[i];
    const url = rsLines[i + 2];
    if (id && url && url.startsWith('http')) {
      rsMap.set(id, url);
    }
  }
  console.log(`  Parsed ${rsMap.size} unique RS trainee IDs.`);

  let rsUpdated = 0, rsSkipped = 0;
  for (const [id, url] of rsMap) {
    const existing = await db.query(`SELECT trainee_id FROM portal_trainee WHERE trainee_id = $1`, [id]);
    if (existing.rows.length > 0) {
      await db.query(`UPDATE portal_trainee SET real_stage_report_url = $1, updated_at = NOW() WHERE trainee_id = $2`, [url, id]);
      rsUpdated++;
    } else {
      rsSkipped++;
    }
  }
  console.log(`  RS Updated: ${rsUpdated}, Skipped (ID not in DB): ${rsSkipped}`);

  // Final summary
  const c1 = await db.query(`SELECT COUNT(*) as cnt FROM portal_trainee WHERE branch_id = 'tritura'`);
  const c2 = await db.query(`SELECT COUNT(*) as cnt FROM portal_trainee WHERE branch_id = 'tritura' AND quarterly_report_url IS NOT NULL`);
  const c3 = await db.query(`SELECT COUNT(*) as cnt FROM portal_trainee WHERE branch_id = 'tritura' AND real_stage_report_url IS NOT NULL`);
  const c4 = await db.query(`SELECT COUNT(*) as cnt FROM portal_trainee WHERE branch_id = 'tritura' AND progress_video_url IS NOT NULL`);
  console.log('--- FINAL SUMMARY (Tritura) ---');
  console.log(`Total portal_trainee: ${c1.rows[0].cnt}`);
  console.log(`With quarterly_report_url: ${c2.rows[0].cnt}`);
  console.log(`With real_stage_report_url: ${c3.rows[0].cnt}`);
  console.log(`With progress_video_url: ${c4.rows[0].cnt}`);
  console.log('✅ All done!');
}

main().catch(err => { console.error('❌ Error:', err); process.exit(1); });
