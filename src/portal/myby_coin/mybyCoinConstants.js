/**
 * ============================================================
 * MYBY COIN - CONSTANTS & HELPERS
 * ============================================================
 */

// Bonus koin per hari dalam 1 siklus 7 hari (Mulai dari 10 koin)
const CYCLE_BONUSES = [10, 10, 15, 15, 20, 25, 50];

// Nama-nama hari siklus (Minggu - Sabtu)
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Katalog reward merchandise resmi bawaan
const DEFAULT_REWARDS = [
  {
    id: 'rew-1',
    title: 'Keychain / Pena SMLONE',
    category: 'Merchandise',
    cost: 30,
    stock: 45,
    tag: 'Terjangkau',
    image_url: 'https://images.unsplash.com/photo-1585336261026-7d6f51954f9a?auto=format&fit=crop&w=600&q=80',
    description: 'Pilihan gantungan kunci akrilik eksklusif atau bolpoin premium berlogo SMLONE.'
  },
  {
    id: 'rew-2',
    title: 'Lego Mini / Notebook A6',
    category: 'Merchandise',
    cost: 50,
    stock: 30,
    tag: 'Populer',
    image_url: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80',
    description: 'Miniatur Lego karakter menarik atau buku catatan mini saku A6 praktis untuk ide harian.'
  },
  {
    id: 'rew-3',
    title: 'Notebook A5',
    category: 'Stationery',
    cost: 80,
    stock: 35,
    tag: 'Favorit',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    description: 'Buku catatan ukuran A5 hardcover elegan untuk mencatat materi modul dan proyek coding.'
  },
  {
    id: 'rew-4',
    title: 'Payung SMLONE / 1 Tiket Nonton',
    category: 'Voucher & Perk',
    cost: 100,
    stock: 20,
    tag: 'Pilihan Seru',
    image_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
    description: 'Payung lipat eksklusif tahan cuaca atau 1 voucher tiket nonton bioskop XXI/CGV.'
  },
  {
    id: 'rew-5',
    title: 'Agenda SMLONE / 2 Tiket Nonton',
    category: 'Voucher & Perk',
    cost: 150,
    stock: 18,
    tag: 'Spesial',
    image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
    description: 'Buku agenda kerja eksklusif SMLONE atau paket 2 voucher tiket nonton bioskop.'
  },
  {
    id: 'rew-6',
    title: 'Tumblr SMLONE',
    category: 'Merchandise',
    cost: 200,
    stock: 25,
    tag: 'Best Value',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    description: 'Tumbler stainless steel vacuum insulated tahan dingin & panas hingga 24 jam dengan ukiran SMLONE.'
  },
  {
    id: 'rew-7',
    title: 'Jaket / Tas SMLONE',
    category: 'Merchandise',
    cost: 250,
    stock: 12,
    tag: 'Reward Utama',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
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
