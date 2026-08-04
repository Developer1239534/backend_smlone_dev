const db = require('../src/db/neonClient');

const traineesToUpsert = [
  {
    id: "676",
    name: "Grace Alexandra",
    gender: "Female",
    date_of_birth: "2011-04-23",
    nama_sekolah: "NOBLE SCHOOL",
    cleaned_program: "Junior/Youth Program",
    membership: "Active",
    expiry_date: "2027-03-02",
    cabang_id: "TIMOR",
    first_enroll: "2023-07-28",
    class: "Galileo (Wed 4-6)",
    house: "House of Havaria",
    level: "Colonel",
    house_role: "Colonel",
    cabang_kelas: "TIMOR",
    newest_grade: "9",
    trainee_homeroom: "Ghaitsa",
    screening_test: "",
    draft_grade: "9",
    prev_grade: "11",
    ajy_by_class: "Youth",
    last_real_stage: "2025-10-05"
  },
  {
    id: "680",
    name: "Gracelyn Yap",
    gender: "Female",
    date_of_birth: "2012-02-21",
    nama_sekolah: "Sutomo 1",
    cleaned_program: "Junior/Youth Program",
    membership: "Active",
    expiry_date: "2027-04-14",
    cabang_id: "TIMOR",
    first_enroll: "2023-07-31",
    class: "Galileo (Wed 4-6)",
    house: "House of Quorion",
    level: "Lt. General",
    house_role: "Lt. General",
    cabang_kelas: "TIMOR",
    newest_grade: "8",
    trainee_homeroom: "Rizky",
    screening_test: "https://drive.google.com/file/d/1v4F8Jsyy-8RLecsgZ2vKoDoFDhRavyuo/view",
    draft_grade: "8",
    prev_grade: "10",
    ajy_by_class: "Youth",
    last_real_stage: "2025-05-18"
  },
  {
    id: "741",
    name: "Brayden Lisman",
    gender: "Male",
    date_of_birth: "2010-08-17",
    nama_sekolah: "KINGSTON SCHOOL",
    cleaned_program: "Junior/Youth Program",
    membership: "Active",
    expiry_date: "2026-10-27",
    cabang_id: "TIMOR",
    first_enroll: "2023-10-06",
    class: "Galileo (Wed 4-6)",
    house: "House of Quorion",
    level: "Colonel",
    house_role: "Colonel",
    cabang_kelas: "TIMOR",
    newest_grade: "10",
    trainee_homeroom: "Ghaitsa",
    screening_test: "https://drive.google.com/file/d/1xq8rOZk_rYd8vOsh8PU41ci1_SZGjRda/view?usp=drive_link",
    draft_grade: "10",
    prev_grade: "11",
    ajy_by_class: "Youth",
    last_real_stage: "2025-07-27"
  },
  {
    id: "745",
    name: "Jesslyn",
    gender: "Female",
    date_of_birth: "2010-07-16",
    nama_sekolah: "Sutomo 1",
    cleaned_program: "Junior/Youth Program",
    membership: "Active",
    expiry_date: "2026-10-04",
    cabang_id: "TIMOR",
    first_enroll: "2023-10-11",
    class: "Galileo (Wed 4-6)",
    house: "House of Thenova",
    level: "General",
    house_role: "General",
    cabang_kelas: "TIMOR",
    newest_grade: "10",
    trainee_homeroom: "Ghaitsa",
    screening_test: "",
    draft_grade: "10",
    prev_grade: "11",
    ajy_by_class: "Youth",
    last_real_stage: "2025-06-22"
  },
  {
    id: "852",
    name: "Cellistia Cangdiago",
    gender: "Female",
    date_of_birth: "2009-05-29",
    nama_sekolah: "SMA SUTOMO 1",
    cleaned_program: "Junior/Youth Program",
    membership: "Active (Grace Period)",
    expiry_date: "2026-08-10",
    cabang_id: "TIMOR",
    first_enroll: "2024-07-06",
    class: "Galileo (Wed 4-6)",
    house: "House of Quorion",
    level: "Lt. General",
    house_role: "Lt. General",
    cabang_kelas: "TIMOR",
    newest_grade: "11",
    trainee_homeroom: "Muly",
    screening_test: "https://drive.google.com/drive/folders/1qA99BgpZCMVxTmQESMFalF_uYxfPf5va?usp=drive_link",
    draft_grade: "11",
    prev_grade: "13",
    ajy_by_class: "Youth",
    last_real_stage: "2026-01-25"
  },
  {
    id: "896",
    name: "Nicolas Carlie Kuwira",
    gender: "Male",
    date_of_birth: "2009-03-31",
    nama_sekolah: "SMA Sutomo 1 Medan",
    cleaned_program: "Junior/Youth Program",
    membership: "Active",
    expiry_date: "2027-03-11",
    cabang_id: "TIMOR",
    first_enroll: "2024-08-22",
    class: "Galileo (Wed 4-6)",
    house: "House of Havaria",
    level: "Lt. General",
    house_role: "Lt. General",
    cabang_kelas: "TIMOR",
    newest_grade: "11",
    trainee_homeroom: "Ghaitsa",
    screening_test: "https://drive.google.com/drive/folders/1FnVHHyOUIsS0TBJlzadRrTD-YSz5PLDC?usp=drive_link",
    draft_grade: "11",
    prev_grade: "12",
    ajy_by_class: "Youth",
    last_real_stage: "2026-01-25"
  },
  {
    id: "904",
    name: "Callista Aurelia Tasma",
    gender: "Female",
    date_of_birth: "2010-05-08",
    nama_sekolah: "Methodis3",
    cleaned_program: "Junior/Youth Program",
    membership: "Active",
    expiry_date: "2027-03-18",
    cabang_id: "TIMOR",
    first_enroll: "2024-09-17",
    class: "Galileo (Wed 4-6)",
    house: "House of Thenova",
    level: "Colonel",
    house_role: "Colonel",
    cabang_kelas: "TIMOR",
    newest_grade: "10",
    trainee_homeroom: "Muly",
    screening_test: "https://drive.google.com/drive/folders/1m-Ad-X19MGz8OAjMGjhAgtnuwUH0Rm6s?usp=drive_link",
    draft_grade: "10",
    prev_grade: "11",
    ajy_by_class: "Youth",
    last_real_stage: "2026-01-25"
  },
  {
    id: "911",
    name: "Meivellynn Thamida",
    gender: "Female",
    date_of_birth: "2011-07-11",
    nama_sekolah: "Carnegie",
    cleaned_program: "Junior/Youth Program",
    membership: "Active",
    expiry_date: "2026-10-11",
    cabang_id: "TIMOR",
    first_enroll: "2024-09-30",
    class: "Galileo (Wed 4-6)",
    house: "House of Thenova",
    level: "Lt. Colonel",
    house_role: "Lt. Colonel",
    cabang_kelas: "TIMOR",
    newest_grade: "9",
    trainee_homeroom: "Rizky",
    screening_test: "https://drive.google.com/drive/folders/1i00uPInIYdKgCKzRxETd9h2c5Hn1bDTh?usp=drive_link",
    draft_grade: "9",
    prev_grade: "10",
    ajy_by_class: "Youth",
    last_real_stage: "2025-06-22"
  },
  {
    id: "1104",
    name: "Abbygael Mikaela Tangelyn",
    gender: "Female",
    date_of_birth: "2012-08-06",
    nama_sekolah: "Methodist III",
    cleaned_program: "Junior/Youth Program",
    membership: "Active",
    expiry_date: "2027-05-05",
    cabang_id: "TIMOR",
    first_enroll: "2025-10-28",
    class: "Galileo (Wed 4-6)",
    house: "House of Quorion",
    level: "Sergeant",
    house_role: "Sergeant",
    cabang_kelas: "TIMOR",
    newest_grade: "8",
    trainee_homeroom: "Ghaitsa",
    screening_test: "https://drive.google.com/drive/folders/1aemC9awc0pLOdHHI7Eyb_rt-vaHwpef3?usp=drive_link",
    draft_grade: "8",
    prev_grade: "2",
    ajy_by_class: "Youth",
    last_real_stage: ""
  },
  {
    id: "1161",
    name: "Randa Miracle Boasly Sihombing",
    gender: "Male",
    date_of_birth: "2009-09-26",
    nama_sekolah: "Sma St. Thomas 1 Medan",
    cleaned_program: "Junior/Youth Program",
    membership: "Active",
    expiry_date: "2026-12-03",
    cabang_id: "TIMOR",
    first_enroll: "2026-05-06",
    class: "Galileo (Wed 4-6)",
    house: "",
    level: "Private",
    house_role: "Private",
    cabang_kelas: "TIMOR",
    newest_grade: "11",
    trainee_homeroom: "Ghaitsa",
    screening_test: "https://drive.google.com/drive/folders/18diuZQu2FTszBfwIcPLEnAtX9oQ-EjHV?usp=sharing",
    draft_grade: "11",
    prev_grade: "12",
    ajy_by_class: "Youth",
    last_real_stage: ""
  }
];

async function main() {
  console.log('🚀 Upserting 10 updated trainee rows into login_portal_fix...');

  for (const t of traineesToUpsert) {
    const password = `SML${t.id.toUpperCase()}`;
    const query = `
      INSERT INTO login_portal_fix (
        id, name, password, gender, date_of_birth, nama_sekolah, cleaned_program, membership,
        expiry_date, cabang_id, first_enroll, class, house, level, house_role, cabang_kelas,
        newest_grade, trainee_homeroom, screening_test, draft_grade, prev_grade, ajy_by_class, last_real_stage, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        gender = EXCLUDED.gender,
        date_of_birth = EXCLUDED.date_of_birth,
        nama_sekolah = EXCLUDED.nama_sekolah,
        cleaned_program = EXCLUDED.cleaned_program,
        membership = EXCLUDED.membership,
        expiry_date = EXCLUDED.expiry_date,
        cabang_id = EXCLUDED.cabang_id,
        first_enroll = EXCLUDED.first_enroll,
        class = EXCLUDED.class,
        house = EXCLUDED.house,
        level = EXCLUDED.level,
        house_role = EXCLUDED.house_role,
        cabang_kelas = EXCLUDED.cabang_kelas,
        newest_grade = EXCLUDED.newest_grade,
        trainee_homeroom = EXCLUDED.trainee_homeroom,
        screening_test = EXCLUDED.screening_test,
        draft_grade = EXCLUDED.draft_grade,
        prev_grade = EXCLUDED.prev_grade,
        ajy_by_class = EXCLUDED.ajy_by_class,
        last_real_stage = EXCLUDED.last_real_stage,
        updated_at = NOW();
    `;

    const params = [
      t.id, t.name, password, t.gender, t.date_of_birth || null, t.nama_sekolah, t.cleaned_program, t.membership,
      t.expiry_date || null, t.cabang_id, t.first_enroll || null, t.class, t.house, t.level, t.house_role, t.cabang_kelas,
      t.newest_grade, t.trainee_homeroom, t.screening_test, t.draft_grade, t.prev_grade, t.ajy_by_class, t.last_real_stage
    ];

    await db.query(query, params);
    console.log(`✅ Upserted trainee ID ${t.id} (${t.name}) into login_portal_fix`);
  }

  // Also sync names with report_trainee
  console.log('🔄 Syncing updated names into report_trainee...');
  await db.query(`
    UPDATE report_trainee r
    SET name = l.name, updated_at = NOW()
    FROM login_portal_fix l
    WHERE LOWER(r.id::text) = LOWER(l.id::text) OR LOWER(r.trainee_id::text) = LOWER(l.id::text);
  `);
  console.log('✅ Synchronized report_trainee names!');

  process.exit(0);
}

main().catch(console.error);
