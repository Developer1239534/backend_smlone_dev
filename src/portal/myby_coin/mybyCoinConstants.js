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
    id: 'rew-stiker',
    title: 'Stiker & Badge Bubbo',
    category: 'Merchandise',
    cost: 3,
    stock: 100,
    tag: 'Eksklusif',
    image_url: '/asset/reward-stiker-bubbo.webp',
    description: 'Lembar stiker motivasi dan badge maskot Bubbo SMLONE dengan pesan inspiratif.'
  },
  {
    id: 'rew-promo-bubo',
    title: 'Custom Notebook Bubbo A6',
    category: 'Promo Spesial',
    cost: 5,
    stock: 100,
    tag: 'PROMO',
    image_url: '/asset/reward-custom-notebook-bubbo-a6.webp',
    description: 'Buku catatan eksklusif A6 edisi kustom maskot Bubo SMLONE.'
  },
  {
    id: 'rew-1',
    title: 'Keychain / Pena SMLONE',
    category: 'Merchandise',
    cost: 5,
    stock: 99,
    tag: 'Terjangkau',
    image_url: '/asset/reward-keychain.webp',
    description: 'Pilihan gantungan kunci akrilik eksklusif atau bolpoin premium berlogo SMLONE.'
  },
  {
    id: 'rew-2',
    title: 'Lego Mini / Notebook A6',
    category: 'Merchandise',
    cost: 10,
    stock: 100,
    tag: 'Populer',
    image_url: '/asset/reward-notebook-a6.webp',
    description: 'Miniatur Lego karakter menarik atau buku catatan mini saku A6 praktis untuk ide harian.'
  },
  {
    id: 'rew-3',
    title: 'Notebook A5',
    category: 'Stationery',
    cost: 15,
    stock: 100,
    tag: 'Favorit',
    image_url: '/asset/reward-notebook-a5.webp',
    description: 'Buku catatan ukuran A5 hardcover elegan untuk mencatat materi modul dan speech project.'
  },
  {
    id: 'rew-4',
    title: 'Payung SMLONE',
    category: 'Merchandise',
    cost: 20,
    stock: 100,
    tag: 'Pilihan Seru',
    image_url: '/asset/reward-payung.webp',
    description: 'Payung lipat eksklusif tahan cuaca berlogo resmi SMLONE.'
  },
  {
    id: 'rew-tiket-1',
    title: '1 Tiket Nonton',
    category: 'Voucher & Perk',
    cost: 20,
    stock: 100,
    tag: 'Voucher',
    image_url: '/asset/reward-tiket-nonton.webp',
    description: '1 voucher tiket nonton bioskop XXI/CGV. (Note: Tiket Nonton hanya berlaku untuk trainee di program Core & Orator)'
  },
  {
    id: 'rew-5',
    title: 'Agenda SMLONE',
    category: 'Stationery',
    cost: 30,
    stock: 100,
    tag: 'Spesial',
    image_url: '/asset/reward-agenda.webp',
    description: 'Buku agenda kerja eksklusif SMLONE hardcover elegan untuk mencatat aktivitas dan jadwal harian.'
  },
  {
    id: 'rew-tiket-2',
    title: '2 Tiket Nonton',
    category: 'Voucher & Perk',
    cost: 30,
    stock: 100,
    tag: 'Spesial',
    image_url: '/asset/reward-tiket-nonton-2.webp',
    description: 'Paket 2 voucher tiket nonton bioskop XXI/CGV. (Note: Tiket Nonton hanya berlaku untuk trainee di program Core & Orator)'
  },
  {
    id: 'rew-bottle',
    title: 'Botol Minum "My Words Build Worlds"',
    category: 'Merchandise',
    cost: 35,
    stock: 100,
    tag: 'Inspiratif',
    image_url: '/asset/reward-botol-minum.webp',
    description: 'Botol minum reusable eksklusif bertuliskan "My Words Build Worlds" khas SMLONE.'
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
    title: 'Jaket SMLONE',
    category: 'Merchandise',
    cost: 50,
    stock: 100,
    tag: 'Reward Utama',
    image_url: '/asset/reward-jaket.webp',
    description: 'Jaket bomber/varsity premium SMLONE edisi terbatas.'
  },
  {
    id: 'rew-tas',
    title: 'Tas Ransel SMLONE',
    category: 'Merchandise',
    cost: 50,
    stock: 100,
    tag: 'Reward Utama',
    image_url: '/asset/reward-tas-ransel.webp',
    description: 'Tas ransel color-blocked eksklusif SMLONE dengan kompartemen luas dan logo fox.'
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
