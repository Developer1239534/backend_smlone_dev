const PDFDocument = require('pdfkit');

/**
 * Generate PDF voucher bukti klaim hadiah SMLONE
 * @param {Object} data
 * @param {string} data.redeemId - ID Klaim / Voucher
 * @param {string} data.traineeId - ID Siswa
 * @param {string} data.traineeName - Nama Siswa
 * @param {string} data.recipientEmail - Email Penerima
 * @param {string} data.rewardTitle - Nama Hadiah
 * @param {number} data.coinsSpent - Koin Ditukarkan
 * @param {number} data.remainingBalance - Sisa Koin
 * @param {string} [data.branch] - Cabang
 * @param {string} [data.program] - Program
 * @returns {Promise<Buffer>}
 */
function generateClaimPdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Bukti Klaim Hadiah - ${data.rewardTitle}`,
          Author: 'SMLONE Indonesia',
          Subject: 'Voucher Penukaran Hadiah MYBY Coin',
          Keywords: 'SMLONE, Hadiah, MYBY Coin, Voucher'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const navyColor = '#1a3a6e';
      const slateDark = '#0f172a';
      const slateMuted = '#64748b';
      const lightBg = '#f8fafc';
      const borderCol = '#cbd5e1';

      // ── TOP HEADER BANNER ───────────────────────────────────────────
      doc.rect(40, 40, 515, 65).fill(navyColor);

      doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
        .text('SMLONE INDONESIA', 60, 52);
      doc.fontSize(11).font('Helvetica')
        .text('BUKTI RESMI KLAIM HADIAH MYBY COIN', 60, 75);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#fde047')
        .text('STATUS: VERIFIED', 420, 55, { align: 'right', width: 115 });
      doc.fontSize(9).font('Helvetica').fillColor('#e2e8f0')
        .text(new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(new Date()), 420, 72, { align: 'right', width: 115 });

      doc.moveDown(2);

      // ── VOUCHER CODE & TITLE ────────────────────────────────────────
      const startY = 125;
      doc.roundedRect(40, startY, 515, 45, 8).fillAndStroke(lightBg, borderCol);

      doc.fillColor(slateMuted).fontSize(9).font('Helvetica')
        .text('NOMOR VOUCHER / KODE KLAIM:', 55, startY + 10);
      doc.fillColor(navyColor).fontSize(14).font('Helvetica-Bold')
        .text(data.redeemId || `RDM-${Date.now()}`, 55, startY + 23);

      doc.fillColor(slateMuted).fontSize(9).font('Helvetica')
        .text('TANGGAL PENGAJUAN (WIB):', 350, startY + 10);
      doc.fillColor(slateDark).fontSize(11).font('Helvetica-Bold')
        .text(new Intl.DateTimeFormat('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Jakarta'
        }).format(new Date()), 350, startY + 23);

      // ── INFORMASI SISWA & PENERIMA ──────────────────────────────────
      const traineeY = 185;
      doc.fillColor(navyColor).fontSize(12).font('Helvetica-Bold')
        .text('I. DATA PENERIMA & TRAINEE', 40, traineeY);

      doc.roundedRect(40, traineeY + 18, 515, 85, 8).fillAndStroke('#ffffff', borderCol);

      const tLabels = [
        ['ID Trainee', data.traineeId || '-'],
        ['Nama Lengkap', data.traineeName || 'Trainee SMLONE'],
        ['Email Penerima', data.recipientEmail || '-'],
        ['Program / Cabang', `${data.program || '-'} / ${data.branch || '-'}`]
      ];

      let rowY = traineeY + 28;
      tLabels.forEach(([lbl, val], idx) => {
        const xPos = idx % 2 === 0 ? 55 : 300;
        const yPos = idx < 2 ? rowY : rowY + 32;

        doc.fillColor(slateMuted).fontSize(9).font('Helvetica').text(lbl, xPos, yPos);
        doc.fillColor(slateDark).fontSize(10).font('Helvetica-Bold').text(val, xPos, yPos + 12);
      });

      // ── DETAIL HADIAH & TRANSAKSI KOIN ──────────────────────────────
      const rewardY = 305;
      doc.fillColor(navyColor).fontSize(12).font('Helvetica-Bold')
        .text('II. RINCIAN HADIAH & PEMOTONGAN KOIN', 40, rewardY);

      doc.roundedRect(40, rewardY + 18, 515, 95, 8).fillAndStroke('#ffffff', borderCol);

      // Table-style row
      doc.rect(40, rewardY + 18, 515, 26).fill('#f1f5f9');
      doc.fillColor(navyColor).fontSize(9).font('Helvetica-Bold')
        .text('NAMA MERCHANDISE / HADIAH', 55, rewardY + 26)
        .text('KOIN DITUKAR', 350, rewardY + 26, { width: 90, align: 'right' })
        .text('SISA SALDO', 445, rewardY + 26, { width: 90, align: 'right' });

      doc.fillColor(slateDark).fontSize(11).font('Helvetica-Bold')
        .text(data.rewardTitle || '-', 55, rewardY + 58);
      doc.fillColor('#e11d48').fontSize(11).font('Helvetica-Bold')
        .text(`-${Number(data.coinsSpent || 0).toLocaleString('id-ID')} Koin`, 350, rewardY + 58, { width: 90, align: 'right' });
      doc.fillColor('#059669').fontSize(11).font('Helvetica-Bold')
        .text(`${Number(data.remainingBalance || 0).toLocaleString('id-ID')} Koin`, 445, rewardY + 58, { width: 90, align: 'right' });

      // ── PANDUAN PENUKARAN ───────────────────────────────────────────
      const guideY = 430;
      doc.fillColor(navyColor).fontSize(12).font('Helvetica-Bold')
        .text('III. PANDUAN PENGAMBILAN DI FRONT DESK', 40, guideY);

      doc.roundedRect(40, guideY + 18, 515, 90, 8).fillAndStroke('#fffbeb', '#fef3c7');

      doc.fillColor('#92400e').fontSize(9).font('Helvetica')
        .text('1. Tunjukkan dokumen voucher PDF ini (cetak atau via smartphone) kepada staf Admin SMLONE.', 55, guideY + 30)
        .text('2. Pengambilan merchandise dapat dilakukan pada jam operasional cabang masing-masing.', 55, guideY + 48)
        .text('3. Voucher ini adalah bukti sah penukaran saldo MYBY Coin dan berlaku 1x penukaran fisik.', 55, guideY + 66)
        .text('4. Jika membutuhkan bantuan, hubungi Helpdesk WA SMLONE di 082169833829.', 55, guideY + 84);

      // ── STAMP & SIGNATURE SECTION ───────────────────────────────────
      const stampY = 550;
      doc.roundedRect(40, stampY, 515, 80, 8).fillAndStroke(lightBg, borderCol);

      doc.fillColor(slateMuted).fontSize(8).font('Helvetica')
        .text('Diterbitkan secara elektronik oleh:', 55, stampY + 12)
        .text('Sistem Otomasi Portal SMLONE Indonesia', 55, stampY + 24)
        .text('Kerahasiaan data dan keaslian dilindungi oleh cryptographic hash sistem.', 55, stampY + 36);

      doc.rect(420, stampY + 10, 115, 60).stroke(navyColor);
      doc.fillColor(navyColor).fontSize(8).font('Helvetica-Bold')
        .text('SMLONE INDONESIA', 420, stampY + 20, { align: 'center', width: 115 })
        .text('VERIFIED & APPROVED', 420, stampY + 34, { align: 'center', width: 115 })
        .text(new Date().getFullYear().toString(), 420, stampY + 48, { align: 'center', width: 115 });

      // ── FOOTER ──────────────────────────────────────────────────────
      doc.fillColor(slateMuted).fontSize(8).font('Helvetica')
        .text('SMLONE Indonesia • WhatsApp: 082169833829 • Instagram: @smloneid • https://portal.smlone.com', 40, 780, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateClaimPdf };
