/**
 * sync_awards_data.js
 * 
 * Syncs the June 2026 QUANTITATIVE & QUALITATIVE awards data into the awards table.
 * - Matches trainee names to existing IDs in dashboard_trainne
 * - Creates new trainees if not found (with default password SML{next_id})
 * - Uses UPSERT to prevent duplicates
 * 
 * Run: node src/db/sync_awards_data.js
 */

require('dotenv').config();
const db = require('./neonClient');
const bcrypt = require('bcryptjs');

const PERIOD = 'jun-2026';

// ============================================================
// ALL AWARD DATA
// ============================================================

const QUANTITATIVE_AWARDS = [
  {
    award_name: 'The Most Explorative Award',
    thresholds: { junior: { bronze: 75, silver: 85, gold: 95 }, youth: { bronze: 75, silver: 85, gold: 95 } },
    winners: {
      junior: {
        bronze: [
          'Kiery Keionna Kie (80)', 'Annabella Wijaya (81)', 'Enrico Victorian (78)',
          'Alexandra Joan Micheline (82)', 'Nathan Immanuel Winanto (78)', 'Samho Gunawan (81)',
          'Delmond Osyan Sudilan (83)', 'Maryam Shareen Anandifa (84)', 'Elaine Gwen Lim (80)',
          'Raisha Adila Gunawan (84)', 'Keyzia Faiana Daulay (77)', 'Chloe Quisha Anggara (79)',
          'Hayden Fredderick Halim (80)'
        ],
        silver: [
          'Victoria Yap (89)', 'Rebecca Florencia Siregar (94)',
          'Jeovenna Cangie (86)', 'Felynn Holy Richson (86)'
        ],
        gold: ['Evonne Gwen Lim (95)', 'Chloe Marjorie Wen (97)']
      },
      youth: {
        bronze: [
          'Richmond Osyan Sudilan (78)', 'Candice Winardi Wong (81)', 'Ethan Aldrich Lie (76)',
          'Fiona Jolys Chong (77)', 'Kenneth Samuel Lim (79)', 'Filia Cielo Lim (83)',
          'Diandra Ezra Nauli Simatupang (75)', 'Jessica Sharon (75)', 'Carlos Ferdinand Putra (83)'
        ],
        silver: [
          'Justin Maxwell (94)', 'Darren Gabriel (90)', 'Gyan Lucero Joenardi (89)',
          'Gracelyn Yap (91)', 'Dixen Andersen (91)', 'Brayden Lisman (86)',
          'Jesslyn (92)', 'Lyvia Verlynn (89)', 'Keysha Kania Ramaditya (85)'
        ],
        gold: [
          'Aaron Goldwin Semarak (122)', 'Vallerio (109)', 'Cellistia Cangdiago (133)',
          'Nicolas Carlie Kuwira (100)', 'Sakina Alima Regune Harahap (100)', 'Winston Hubert (99)'
        ]
      }
    }
  },
  {
    award_name: 'The Grand Champions Award',
    thresholds: { junior: { bronze: 6, silver: 7, gold: 8 }, youth: { bronze: 6, silver: 7, gold: 8 } },
    winners: {
      junior: {
        bronze: [
          'Brandon Tiojaya (6)', 'Alexandra Joan Micheline (6)', 'Nathan Immanuel Winanto (6)',
          'Bonita Gaudeti Sinaga (6)', 'Victoria Yap (6)', 'Cherlyn Simen (6)',
          'Rexcaden Jazper Shu (6)', 'Maryam Shareen Anandifa (6)', 'Dareen Davinci Ginting (6)',
          'Hayden Fredderick Halim (6)'
        ],
        silver: ['Hermione Lovely Susanto (7)'],
        gold: ['Stanley Ace Lorence (11)', 'Raisha Adila Gunawan (8)']
      },
      youth: {
        bronze: [
          'Harvey Wijaya (6)', 'Gyan Lucero Joenardi (6)', 'Gracelyn Yap (6)',
          'Karin Destynsia (6)', 'Kenneth Samuel Lim (6)', 'Lyvia Verlynn (6)',
          'Keysha Kania Ramaditya (6)', 'Winston Hubert (6)'
        ],
        silver: [
          'Dyra Muntazsirah (7)', 'Charrelle Anthony (7)', 'Davar Aly Harahap (7)',
          'Maria Jill Lumbantoruan (7)', 'Kirania Inara Azalea (7)',
          'Candice Julian Sakiwa (7)', 'Elaine Gabriella Chandella (7)'
        ],
        gold: [
          'Jolie Huang (9)', 'Dixen Andersen (8)', 'Brayden Lisman (8)',
          'Lovea Fendy Kho (9)', 'Cellistia Cangdiago (9)', 'Joel Edward (13)',
          'Nicolas Carlie Kuwira (10)'
        ]
      }
    }
  },
  {
    award_name: "The People's Voice Award",
    thresholds: { junior: { bronze: 12, silver: 14, gold: 16 }, youth: { bronze: 12, silver: 14, gold: 16 } },
    winners: {
      junior: {
        bronze: [
          'Elaine Velicia (12)', 'Florencia Hewi (13)', 'Alexandra Joan Micheline (12)',
          'Nathan Immanuel Winanto (12)', 'Howie Chan (12)', 'Maryam Shareen Anandifa (13)',
          'Elaine Gwen Lim (12)', 'Raisha Adila Gunawan (12)', 'Felynn Holy Richson (12)',
          'Alfred Smaver Tanasal (12)'
        ],
        silver: [
          'Russell William Tanner (14)', 'Victoria Yap (15)',
          'Evonne Gwen Lim (14)', 'Chloe Quisha Anggara (14)'
        ],
        gold: [
          'Stanley Ace Lorence (17)', 'Delmond Osyan Sudilan (21)',
          'Keyzia Faiana Daulay (18)', 'Rebecca Florencia Siregar (18)'
        ]
      },
      youth: {
        bronze: [
          'Candice Winardi Wong (13)', 'Felivia Riandy (13)', 'Aubree Lisman (12)',
          'Lovea Fendy Kho (13)', 'Karin Destynsia (12)', 'Cellistia Cangdiago (12)',
          'Joel Edward (13)', 'Kirania Inara Azalea (12)', 'Radinka Agra Sitepu (13)',
          'Carlos Ferdinand Putra (12)'
        ],
        silver: ['Brayden Lisman (15)', 'Jesslyn (15)', 'Daniel Goh (15)'],
        gold: [
          'Valerie Legolas Cen (17)', 'Gyan Lucero Joenardi (17)',
          'Gracelyn Yap (23)', 'Giselle Liandy (18)'
        ]
      }
    }
  },
  {
    award_name: 'Gold Points Top Scorers',
    thresholds: { junior: { bronze: 2600, silver: 2900, gold: 3200 }, youth: { bronze: 2600, silver: 2900, gold: 3200 } },
    winners: {
      junior: {
        bronze: [
          'Mandy Ellen Sanusi (2630)', 'Nathan Immanuel Winanto (2733)', 'Renzo Tanaka (2841)',
          'Howie Chan (2672)', 'Victoria Yap (2835)', 'Rexcaden Jazper Shu (2760)',
          'Nichole Hasan (2880)', 'Velove Alexa Winstan (2790)', 'Hayden Fredderick Halim (2610)'
        ],
        silver: [
          'Stanley Ace Lorence (2914)', 'Bonita Gaudeti Sinaga (3030)',
          'Maryam Shareen Anandifa (3000)', 'Raisha Adila Gunawan (3165)',
          'Keyzia Faiana Daulay (3080)'
        ],
        gold: []
      },
      youth: {
        bronze: [
          'Justin Maxwell (2710)', 'Darren Gabriel (2865)', 'Jolie Huang (2710)',
          'Kenneth Samuel Lim (2810)', 'Joel Edward (2720)'
        ],
        silver: [],
        gold: [
          'Aaron Goldwin Semarak (3340)', 'Gyan Lucero Joenardi (3230)',
          'Gracelyn Yap (3827)', 'Dixen Andersen (3550)', 'Brayden Lisman (3250)',
          'Jesslyn (3915)', 'Lovea Fendy Kho (3530)', 'Vallerio (4645)',
          'Cellistia Cangdiago (9170)', 'Nicolas Carlie Kuwira (4775)', 'Winston Hubert (3560)'
        ]
      }
    }
  },
  {
    award_name: 'The Extra Miles Award',
    thresholds: { junior: { bronze: 750, silver: 1000, gold: 1250 }, youth: { bronze: 750, silver: 1000, gold: 1250 } },
    winners: {
      junior: {
        bronze: [
          'Russell William Tanner (800)', 'Stanley Ace Lorence (754)', 'Howie Chan (932)',
          'Jayden Tarmidi (890)', 'Bonita Gaudeti Sinaga (960)', 'Victoria Yap (785)',
          'Hermione Lovely Susanto (780)', 'Dominic Kie (780)', 'Raisha Adila Gunawan (875)',
          'Velove Alexa Winstan (860)', 'David Howard (880)'
        ],
        silver: ['Renzo Tanaka (1001)', 'Keyzia Faiana Daulay (1120)', 'Nichole Hasan (1110)'],
        gold: ['Mandy Ellen Sanusi (1320)']
      },
      youth: {
        bronze: [
          'Ivaldo Juanda (920)', 'Fiona Jolys Chong (910)', 'Dixen Andersen (910)',
          'Yeslin Yap (750)', 'Jeanice Wu (835)'
        ],
        silver: ['Cherryl Riquelme Potan (1100)'],
        gold: [
          'Gracelyn Yap (1397)', 'Jesslyn (1475)', 'Lovea Fendy Kho (1460)',
          'Vallerio (2095)', 'Cellistia Cangdiago (5220)', 'Nicolas Carlie Kuwira (1585)'
        ]
      }
    }
  },
  {
    award_name: 'The Habits Builder Award',
    thresholds: { junior: { bronze: 20, silver: 25, gold: 30 }, youth: { bronze: 20, silver: 25, gold: 30 } },
    winners: {
      junior: {
        bronze: [
          'Sofia Grace Wu (24)', 'Shane Ferrucio Lim (22)', 'Delmond Osyan Sudilan (23)',
          'Rebecca Florencia Siregar (20)', 'Velove Alexa Winstan (22)'
        ],
        silver: ['Enrico Victorian (27)', 'Jeovenna Cangie (26)'],
        gold: []
      },
      youth: {
        bronze: ['Dixen Andersen (21)', 'Jesslyn (21)', 'Candice Julian Sakiwa (24)'],
        silver: ['Sakina Alima Regune Harahap (27)'],
        gold: [
          'Aaron Goldwin Semarak (59)', 'Justin Maxwell (30)', 'Candice Winardi Wong (32)',
          'Darren Gabriel (33)', 'Gyan Lucero Joenardi (32)', 'Vallerio (34)',
          'Cellistia Cangdiago (56)', 'Nicolas Carlie Kuwira (31)', 'Winston Hubert (37)'
        ]
      }
    }
  },
  {
    award_name: 'Master of Society Award',
    thresholds: { junior: { bronze: 6, silver: 7, gold: 8 }, youth: { bronze: 6, silver: 7, gold: 8 } },
    winners: {
      junior: {
        bronze: [
          'Florencia Hewi (6)', 'Annabella Wijaya (6)', 'Delmond Osyan Sudilan (6)',
          'Bonita Gaudeti Sinaga (6)', 'Aileen Sophie Kesuma (6)', 'Maryam Shareen Anandifa (6)',
          'Evonne Gwen Lim (6)', 'Keyzia Faiana Daulay (6)', 'Rebecca Florencia Siregar (6)',
          'Nichole Hasan (6)', 'Felynn Holy Richson (6)', 'Alfred Smaver Tanasal (6)'
        ],
        silver: [
          'Hugo Viandi (7)', 'Renzo Tanaka (7)', 'Elaine Gwen Lim (7)', 'Hayden Fredderick Halim (7)'
        ],
        gold: ['Russell William Tanner (9)', 'Raisha Adila Gunawan (9)', 'Chloe Marjorie Wen (9)']
      },
      youth: {
        bronze: [
          'Gracelyn Yap (6)', 'Hardey Moeldoko Law (6)', 'Jay Ven (6)', 'Keysha Kania Ramaditya (6)'
        ],
        silver: [
          'Alvaro Richie Theus (7)', 'Winston Lawrence (7)',
          'Zoefiker Putera Ngadiman (7)', 'Jessica Sharon (7)'
        ],
        gold: []
      }
    }
  },
  {
    award_name: 'Empowerment Warrior Award',
    thresholds: { junior: { bronze: 12, silver: 14, gold: 16 }, youth: { bronze: 12, silver: 14, gold: 16 } },
    winners: {
      junior: {
        bronze: [
          'Russell William Tanner (13)', 'Kiery Keionna Kie (12)', 'Brandon Tiojaya (12)',
          'Nathan Immanuel Winanto (12)', 'Stanley Ace Lorence (13)', 'Kelly Alyse Tanary (13)',
          'Hogan Chan (12)', 'Victoria Yap (12)', 'Elaine Gwen Lim (13)', 'Breanna Octovindo (13)'
        ],
        silver: ['Evonne Gwen Lim (15)', 'Keyzia Faiana Daulay (14)', 'Chloe Marjorie Wen (14)'],
        gold: [
          'Annabella Wijaya (16)', 'Delmond Osyan Sudilan (16)',
          'Rebecca Florencia Siregar (16)', 'Chloe Quisha Anggara (17)'
        ]
      },
      youth: {
        bronze: [
          'Valerie Legolas Cen (13)', 'Candice Winardi Wong (13)', 'Josh Derrick Phen (13)',
          'Fiona Candiof (12)', 'Nicholas Zheng (12)', 'Rayden Chiang (12)',
          'Felivia Riandy (12)', 'Gracelyn Yap (12)', 'Dixen Andersen (12)',
          'Zoefiker Putera Ngadiman (12)', 'Aubree Lisman (12)', 'Navarro Lim (13)',
          'Vallerio (12)', 'Filia Cielo Lim (12)', 'Victoria Cenata (13)',
          'Marwa Alya Sakinah Rangkuti (12)'
        ],
        silver: [
          'Justin Maxwell (14)', 'Jayxen Maxwell (14)', 'Brandon Chiang (14)',
          'Yamin Yenardo (14)', 'Cellistia Cangdiago (15)', 'Kenji Ryo Kusumo (15)'
        ],
        gold: []
      }
    }
  },
  {
    award_name: 'The Trailblazer Award',
    thresholds: { junior: { bronze: 4, silver: 5, gold: 6 }, youth: { bronze: 4, silver: 5, gold: 6 } },
    winners: {
      junior: {
        bronze: ['Mandy Ellen Sanusi (4)', 'Bonita Gaudeti Sinaga (4)'],
        silver: [],
        gold: []
      },
      youth: {
        bronze: [
          'Ufaira Tiandra Dalimunthe (4)', 'Dixen Andersen (4)', 'Kenward Melvern Djohan (4)',
          'Hillary Calista Tamado Panjaitan (4)', 'Vallerio (4)', 'Nicolas Carlie Kuwira (4)',
          'Keysha Kania Ramaditya (4)', 'Sakina Alima Regune Harahap (4)'
        ],
        silver: [
          'Richmond Osyan Sudilan (5)', 'Grace Alexandra (5)', 'Kirania Inara Azalea (5)'
        ],
        gold: []
      }
    }
  },
  {
    award_name: 'The Resilience Award',
    thresholds: { junior: { bronze: 5, silver: 6, gold: 7 }, youth: { bronze: 5, silver: 6, gold: 7 } },
    winners: {
      junior: {
        bronze: [
          'Denzel Geraldo Wijaya (5)', 'Hugo Viandi (5)', 'Nathan Immanuel Winanto (5)',
          'Samho Gunawan (5)', 'Madelyn Odelia Lowis (5)', 'Elaine Gwen Lim (5)',
          'Chloe Marjorie Wen (5)'
        ],
        silver: [
          'Wallace Evencio (6)', 'Malcolm (6)', 'Ananda Putera Ngadiman (6)',
          'Aldiana Masha Lovelia Br Sembiring (6)'
        ],
        gold: ['Kiery Keionna Kie (7)', 'Mikaella Hutteleigh Ng (7)']
      },
      youth: {
        bronze: [
          'Josevin Carel H. (5)', 'Fiona Jolys Chong (5)', 'Kenward Melvern Djohan (5)',
          'Warren Emanuel (5)', 'Valerie Ivana Chen (5)'
        ],
        silver: ['Josh Derrick Phen (6)', 'Hardey Moeldoko Law (6)'],
        gold: ['Ufaira Tiandra Dalimunthe (7)']
      }
    }
  }
];

const QUALITATIVE_AWARDS = [
  {
    award_name: 'Rising Star',
    thresholds: { apprentice: { silver: 1, gold: 2 }, junior: { silver: 2, gold: 3 }, youth: { silver: 2, gold: 3 } },
    winners: {
      apprentice: {
        silver: [
          'Hugo Maximus Ling (1)', 'Kingsley Alisson Tenang (1)', 'Jasmine Ryana Ngadimin (1)',
          'Reynard Shendior (1)', 'Stoffel Swandeez Angkasa (1)', 'Keiko Hanara Sihombing (1)',
          'Kent Arthur Luman (1)', 'Maxwell Kenson Wibisono (1)', 'Ricson Stanlay (1)',
          'Cladys Nadine Frietania (1)'
        ],
        gold: ['Louis Harvey Soesanto (2)']
      },
      junior: {
        silver: [
          'Bryant Maximus Ling (2)', 'Maryam Shareen Anandifa (2)',
          'Aldiana Masha Lovelia Br Sembiring (2)', 'Jarell Hofang (2)',
          'Malcolm (2)', 'Delmond Osyan Sudilan (2)'
        ],
        gold: []
      },
      youth: {
        silver: [
          'Sakina Alima Regune Harahap (2)', 'Hillary Calista Tamado Panjaitan (2)',
          'Cherryl Riquelme Potan (2)', 'Maria Jill Lumbantoruan (2)',
          'Sharleen Velicia Lim (2)', 'Khairiy Raka Azizi Hermansyah (2)',
          'Beatrys Vanesa Moiras (2)', 'Annabel Audriana (2)', 'Candice Winardi Wong (2)'
        ],
        gold: ['Junior Auson Halim (3)', 'Winston Hubert (3)']
      }
    }
  },
  {
    award_name: 'Spirit of the Class',
    thresholds: { apprentice: { silver: 1, gold: 2 }, junior: { silver: 2, gold: 3 }, youth: { silver: 2, gold: 3 } },
    winners: {
      apprentice: {
        silver: [
          'Reynard Alderich Guntur (1)', 'Hugo Maximus Ling (1)', 'Harvey Taufik (1)',
          'Catherine Gotami (1)', 'Alicia Quinn chandranata (1)', 'Ricson Stanlay (1)',
          'Clairine Bellvania Gavrila Ginting (1)', 'Louis Harvey Soesanto (1)', 'Garent Nyoto (1)'
        ],
        gold: ['Ivy Jeane Chanella (3)']
      },
      junior: {
        silver: [
          'Felicia Tham (2)', 'Chloe Olivia Ruslie (2)', 'Nichole Hasan (2)',
          'Alexandra Joan Micheline (2)', 'Shane Anastasya Kristy Simangunsong (2)',
          'Annabela Himeko Winarta (2)', 'Victoria Yap (2)'
        ],
        gold: [
          'Sofia Grace Wu (3)', 'Delmond Osyan Sudilan (3)',
          'Samho Gunawan (3)', 'Jayden Tarmidi (3)'
        ]
      },
      youth: {
        silver: [
          'Jessica Sharon (2)', 'Keysha Kania Ramaditya (2)', 'Jenessa Effendy (2)',
          'Vallerio (2)', 'Reizo Kazuo Wong (2)', 'Valerie Legolas Cen (2)',
          'Brandon Chiang (2)', 'Navarro Lim (2)', 'Zoefiker Putera Ngadiman (2)'
        ],
        gold: ['Fiona Candiof (3)']
      }
    }
  },
  {
    award_name: 'The Diligence Award',
    thresholds: { apprentice: { silver: 1, gold: 2 }, junior: { silver: 2, gold: 3 }, youth: { silver: 2, gold: 3 } },
    winners: {
      apprentice: {
        silver: [
          'Alfarizy Raqila Hermansyah (1)', 'Videline Gillian Chaikoff (1)',
          'Naia Sydney Winfield (1)', 'Berliando Lovely Sihombing (1)'
        ],
        gold: [
          'Hugo Maximus Ling (2)', 'Ivy Jeane Chanella (2)',
          'Ricson Stanlay (2)', 'Louis Harvey Soesanto (2)'
        ]
      },
      junior: {
        silver: [
          'Velove Alexa Winstan (2)', 'Bryant Maximus Ling (2)',
          'Maryam Shareen Anandifa (2)', 'Rebecca Florencia Siregar (2)',
          'Rachel Nathania Situmorang (2)', 'Harvardo Lovenzo Susanto (2)'
        ],
        gold: [
          'Keyzia Faiana Daulay (3)', 'Delmond Osyan Sudilan (3)', 'Bonita Gaudeti Sinaga (3)'
        ]
      },
      youth: {
        silver: [
          'Keysha Kania Ramaditya (2)', 'Karin Destynsia (2)',
          'Yasmin Fadhila Azzakiyah (2)', 'Giselle Liandy (2)',
          'Vivienne Zheng (2)', 'Candyce Valezka Moiras (2)'
        ],
        gold: [
          'Jesslyn (3)', 'Gracelyn Yap (3)', 'Zia Arafa Khairina (3)',
          'Lovea Fendy Kho (3)', 'Winston Hubert (3)'
        ]
      }
    }
  },
  {
    award_name: 'The Idea Explorer Award',
    thresholds: { apprentice: { silver: 1, gold: 2 }, junior: { silver: 2, gold: 3 }, youth: { silver: 2, gold: 3 } },
    winners: {
      apprentice: {
        silver: [
          'Jasmine Ryana Ngadimin (1)', 'Mikayla Seline Wu (1)', 'Kent Arthur Luman (1)',
          'Gillian Alexa Pearl (1)', 'Reia Rose Winfield (1)', 'Kenrich Thantio Yangderson (1)',
          'Maria Graciana Chica Purba (1)', 'Reagan Oliver Zhuang (1)', 'Scarlett Avery Ten (1)'
        ],
        gold: ['Hugo Maximus Ling (2)', 'Reynard Shendior (2)']
      },
      junior: {
        silver: [
          'Chloe Olivia Ruslie (2)', 'Enzo Howell (2)', 'Keyzia Faiana Daulay (2)',
          'Rowan Maverick Ang (2)', 'Qori Putri Syahviah (2)', 'Kendrick Melvern Djohan (2)'
        ],
        gold: [
          'Raisha Adila Gunawan (3)', 'Rebecca Florencia Siregar (3)',
          'Delmond Osyan Sudilan (3)', 'Russell William Tanner (3)'
        ]
      },
      youth: {
        silver: [
          'Andrea Tabitha Florencia Simatupang (2)', 'Keysha Kania Ramaditya (2)',
          'Davar Aly Harahap (2)', 'Dixen Andersen (2)', 'Reizo Kazuo Wong (2)',
          'Aaron Goldwin Semarak (2)', 'Thalissha Yeonan (2)', 'Richmond Osyan Sudilan (2)',
          'Kenji Ryo Kusumo (2)', 'Zoefiker Putera Ngadiman (2)'
        ],
        gold: ['Kenneth Samuel Lim (3)']
      }
    }
  },
  {
    award_name: 'Skill Manner Life',
    thresholds: { apprentice: { silver: 1, gold: 2 }, junior: { silver: 2, gold: 3 }, youth: { silver: 2, gold: 3 } },
    winners: {
      apprentice: {
        silver: [
          'Ivy Jeane Chanella (1)', 'Meghan Hailey Hidayat (1)', 'Jesslyn Hofang (1)',
          'Mikayla Seline Wu (1)', 'Catherine Gotami (1)', 'Annastasia Hideko Winarta (1)',
          'Chloe Sinjaya (1)', 'Ricson Stanlay (1)', 'Kenrich Thantio Yangderson (1)', 'Syia (1)'
        ],
        gold: ['Kingsley Alisson Tenang (2)', 'Louis Harvey Soesanto (2)']
      },
      junior: {
        silver: [
          'Shane Ferrucio Lim (2)', 'Lincoln Blaine (2)', 'Maryam Shareen Anandifa (2)',
          'Jeovenna Cangie (2)', 'Annisa Letizia Shanum (2)', 'Federico Fredelyn Jeoh (2)',
          'Abigail Rhea Lim (2)', 'Caren Axella Natania Lumbantoruan (2)', 'Jason Allen Tjoa (2)'
        ],
        gold: ['Jayden Tarmidi (3)']
      },
      youth: {
        silver: [
          'Marwa Alya Sakinah Rangkuti (2)', 'Yasmin Fadhila Azzakiyah (2)',
          'Jesslyn (2)', 'Gracelyn Yap (2)', 'Ufaira Tiandra Dalimunthe (2)',
          'Lovea Fendy Kho (2)', 'Winston Hubert (2)', 'Brandon Chiang (2)',
          'Ivaldo Juanda (2)', 'Kevin Declan Kusumo (2)', 'Candyce Valezka Moiras (2)'
        ],
        gold: [
          'Diandra Ezra Nauli Simatupang (3)', 'Clarisa Valencia Khomala (3)', 'Jasmine Yenarti (3)'
        ]
      }
    }
  }
];

// ============================================================
// HELPERS
// ============================================================

function parseWinnerEntry(entry) {
  // Parse "Name (score)" format
  const match = entry.match(/^(.+?)\s*\((\d+)\)$/);
  if (match) {
    return { name: match[1].trim(), score: parseInt(match[2], 10) };
  }
  return { name: entry.trim(), score: 0 };
}

async function loadTraineeMap(client) {
  const result = await client.query('SELECT id, trainee_name FROM dashboard_trainne');
  const map = {};
  for (const row of result.rows) {
    // Map by normalized lowercase name for matching
    const normalizedName = row.trainee_name.trim().toLowerCase();
    map[normalizedName] = row.id;
  }
  return map;
}

async function getNextTraineeId(client) {
  const result = await client.query('SELECT MAX(CAST(id AS INTEGER)) as max_id FROM dashboard_trainne');
  return (result.rows[0].max_id || 90100000) + 1;
}

async function createNewTrainee(client, id, name) {
  const plainPassword = `SML${id}`;
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  await client.query(`
    INSERT INTO dashboard_trainne (id, trainee_name, status, password, plain_password)
    VALUES ($1, $2, 'Active', $3, $4)
    ON CONFLICT (id) DO NOTHING
  `, [String(id), name, hashedPassword, plainPassword]);

  console.log(`  ➕ Created new trainee: ${name} (ID: ${id}, password: ${plainPassword})`);
  return String(id);
}

// ============================================================
// MAIN SYNC
// ============================================================

async function syncAwards() {
  const client = await db.pool.connect();
  
  try {
    console.log('🏆 Starting awards data sync for period:', PERIOD);
    console.log('');

    // Load existing trainee name->id map
    let traineeMap = await loadTraineeMap(client);
    let nextId = await getNextTraineeId(client);
    const newTrainees = [];

    // Collect all unique winner names across all awards
    const allNames = new Set();
    
    function collectNames(awards) {
      for (const award of awards) {
        for (const category of Object.keys(award.winners)) {
          for (const medal of Object.keys(award.winners[category])) {
            for (const entry of award.winners[category][medal]) {
              const { name } = parseWinnerEntry(entry);
              allNames.add(name);
            }
          }
        }
      }
    }

    collectNames(QUANTITATIVE_AWARDS);
    collectNames(QUALITATIVE_AWARDS);

    console.log(`📋 Total unique winner names: ${allNames.size}`);

    // Create any missing trainees
    let createdCount = 0;
    for (const name of allNames) {
      const normalized = name.trim().toLowerCase();
      if (!traineeMap[normalized]) {
        const newId = nextId++;
        await createNewTrainee(client, newId, name);
        traineeMap[normalized] = String(newId);
        newTrainees.push({ id: String(newId), name });
        createdCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`\n✅ Created ${createdCount} new trainees`);
    } else {
      console.log('✅ All winner names already exist in database');
    }

    // Now insert all awards
    console.log('\n📝 Inserting award entries...');
    
    let totalInserted = 0;
    let totalUpdated = 0;

    async function insertAwardEntries(awardType, awards) {
      for (const award of awards) {
        for (const category of Object.keys(award.winners)) {
          for (const medal of Object.keys(award.winners[category])) {
            const entries = award.winners[category][medal];
            const threshold = award.thresholds[category]?.[medal] || 0;

            for (const entry of entries) {
              const { name, score } = parseWinnerEntry(entry);
              const normalized = name.trim().toLowerCase();
              const traineeId = traineeMap[normalized] || '';

              const result = await client.query(`
                INSERT INTO awards (award_type, award_name, category, medal, trainee_id, trainee_name, score, threshold, period)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (award_name, category, trainee_id, period)
                DO UPDATE SET
                  award_type = EXCLUDED.award_type,
                  medal = EXCLUDED.medal,
                  trainee_name = EXCLUDED.trainee_name,
                  score = EXCLUDED.score,
                  threshold = EXCLUDED.threshold
                RETURNING (xmax = 0) AS is_insert
              `, [awardType, award.award_name, category, medal, traineeId, name, score, threshold, PERIOD]);

              if (result.rows[0].is_insert) {
                totalInserted++;
              } else {
                totalUpdated++;
              }
            }
          }
        }
      }
    }

    await insertAwardEntries('quantitative', QUANTITATIVE_AWARDS);
    await insertAwardEntries('qualitative', QUALITATIVE_AWARDS);

    console.log(`\n✅ Awards sync complete!`);
    console.log(`   📊 Inserted: ${totalInserted}`);
    console.log(`   🔄 Updated: ${totalUpdated}`);
    console.log(`   📈 Total entries: ${totalInserted + totalUpdated}`);

    if (newTrainees.length > 0) {
      console.log(`\n🆕 New trainees created:`);
      for (const t of newTrainees) {
        console.log(`   ID: ${t.id} | Name: ${t.name} | Password: SML${t.id}`);
      }
    }

    // Final count verification
    const countResult = await client.query('SELECT COUNT(*) as total FROM awards WHERE period = $1', [PERIOD]);
    console.log(`\n📊 Total awards in database for ${PERIOD}: ${countResult.rows[0].total}`);

    // Summary per award
    const summaryResult = await client.query(`
      SELECT award_type, award_name, COUNT(*) as winners 
      FROM awards WHERE period = $1 
      GROUP BY award_type, award_name 
      ORDER BY award_type, award_name
    `, [PERIOD]);
    
    console.log('\n📋 Summary per award:');
    for (const row of summaryResult.rows) {
      console.log(`   [${row.award_type}] ${row.award_name}: ${row.winners} winners`);
    }

  } catch (err) {
    console.error('❌ Error syncing awards:', err);
    throw err;
  } finally {
    client.release();
    await db.pool.end();
  }
}

syncAwards();
