/**
 * ============================================================
 * MYBY COIN - CONSTANTS & HELPERS
 * ============================================================
 */

// Bonus koin per hari dalam 1 siklus 7 hari (mulai 25 Okt 2026: 1 koin per hari)
const CYCLE_BONUSES = [1, 1, 1, 1, 1, 1, 1];

// Nama-nama hari siklus (Minggu - Sabtu)
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Katalog reward merchandise resmi bawaan
const DEFAULT_REWARDS = [
  {
    id: 'rew-promo-bubo',
    title: 'Bubo Custom A5 Notebook SMLONE',
    category: 'Promo Spesial',
    cost: 5,
    stock: 100,
    tag: 'PROMO',
    image_url: '/asset/bubo_idle.png',
    description: 'Buku catatan eksklusif A5 edisi kustom maskot Bubo SMLONE.'
  },
  {
    id: 'rew-1',
    title: 'Keychain / Pena SMLONE',
    category: 'Merchandise',
    cost: 5,
    stock: 99,
    tag: 'Terjangkau',
    image_url: '/asset/reward-keychain.jpg?v=2',
    description: 'Pilihan gantungan kunci akrilik eksklusif atau bolpoin premium berlogo SMLONE.'
  },
  {
    id: 'rew-2',
    title: 'Lego Mini / Notebook A6',
    category: 'Merchandise',
    cost: 10,
    stock: 100,
    tag: 'Populer',
    image_url: '/asset/reward-notebook-a6.jpg?v=2',
    description: 'Miniatur Lego karakter menarik atau buku catatan mini saku A6 praktis untuk ide harian.'
  },
  {
    id: 'rew-3',
    title: 'Notebook A5',
    category: 'Stationery',
    cost: 15,
    stock: 100,
    tag: 'Favorit',
    image_url: '/asset/reward-notebook-a5.jpg?v=2',
    description: 'Buku catatan ukuran A5 hardcover elegan untuk mencatat materi modul dan proyek coding.'
  },
  {
    id: 'rew-4',
    title: 'Payung SMLONE / 1 Tiket Nonton',
    category: 'Voucher & Perk',
    cost: 20,
    stock: 100,
    tag: 'Pilihan Seru',
    image_url: '/asset/reward-payung.jpg?v=2',
    description: 'Payung lipat eksklusif tahan cuaca atau 1 voucher tiket nonton bioskop XXI/CGV. (Note: Tiket Nonton hanya berlaku untuk trainee di program Core & Orator)'
  },
  {
    id: 'rew-5',
    title: 'Agenda SMLONE / 2 Tiket Nonton',
    category: 'Voucher & Perk',
    cost: 30,
    stock: 100,
    tag: 'Spesial',
    image_url: '/asset/reward-agenda.jpg?v=2',
    description: 'Buku agenda kerja eksklusif SMLONE atau paket 2 voucher tiket nonton bioskop. (Note: Tiket Nonton hanya berlaku untuk trainee di program Core & Orator)'
  },
  {
    id: 'rew-6',
    title: 'Tumblr SMLONE',
    category: 'Merchandise',
    cost: 40,
    stock: 100,
    tag: 'Best Value',
    image_url: '/asset/reward-tumbler.jpg?v=3',
    description: 'Tumbler stainless steel vacuum insulated tahan dingin & panas hingga 24 jam dengan ukiran SMLONE.'
  },
  {
    id: 'rew-7',
    title: 'Jaket / Tas SMLONE',
    category: 'Merchandise',
    cost: 50,
    stock: 100,
    tag: 'Reward Utama',
    image_url: '/asset/reward-jaket.jpg?v=2',
    description: 'Jaket bomber/hoodie premium SMLONE atau tas ransel fungsional tahan air edisi terbatas.'
  }
];

// Helper: Ambil tanggal format YYYY-MM-DD zona waktu Asia/Jakarta (WIB)
function getWIBDate(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(d);
}

module.exports = {
  CYCLE_BONUSES,
  DAY_NAMES,
  DEFAULT_REWARDS,
  getWIBDate
};
