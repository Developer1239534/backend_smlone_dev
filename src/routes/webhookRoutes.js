const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Webhook endpoint for Fonnte WhatsApp Gateway
// POST /api/webhook/fonnte
router.post('/fonnte', async (req, res) => {
  const { sender, message, inboxid } = req.body;

  // Acknowledge the webhook request immediately to Fonnte
  res.status(200).json({ success: true, message: 'Webhook received' });

  // If no sender or message, stop processing
  if (!sender || !message) {
    return;
  }

  console.log(`[Fonnte Webhook] Received message from ${sender}: "${message}"`);

  // Pattern matching: "Request Student ID - [Full Name]"
  const match = message.match(/^Request Student ID\s*-\s*(.+)$/i);
  
  if (match) {
    const fullName = match[1].trim();
    let replyMessage = '';

    try {
      // Query the database for the trainee's name (case-insensitive exact match)
      const queryResult = await db.query(
        'SELECT id, trainee_name FROM dashboard_trainne WHERE LOWER(trainee_name) = LOWER($1)',
        [fullName]
      );

      if (queryResult.rows.length > 0) {
        const trainee = queryResult.rows[0];
        replyMessage = `Halo! Student ID untuk *${trainee.trainee_name}* adalah *${trainee.id}*.`;
      } else {
        replyMessage = `Maaf, trainee dengan nama *${fullName}* tidak ditemukan di database kami. Pastikan penulisan nama lengkap Anda sudah benar.`;
      }
    } catch (err) {
      console.error('[Fonnte Webhook] Database error:', err.message);
      replyMessage = 'Maaf, terjadi kesalahan internal server saat memproses permintaan Anda.';
    }

    // Send the reply message back to the sender using Fonnte API
    const fonnteToken = process.env.FONNTE_TOKEN;
    if (!fonnteToken) {
      console.warn('⚠️  WARNING: FONNTE_TOKEN is not set in environment variables! Cannot send WhatsApp reply.');
      return;
    }

    try {
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': fonnteToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: sender,
          message: replyMessage,
          inboxid: inboxid
        })
      });

      const resData = await response.json();
      console.log('[Fonnte Webhook] WhatsApp reply sent. Status:', resData.status ? 'Success' : 'Failed', resData.reason || '');
    } catch (apiErr) {
      console.error('[Fonnte Webhook] Error calling Fonnte API:', apiErr.message);
    }
  } else {
    // Optional: reply with help format if message looks like an attempt to get student ID but format is wrong
    if (message.toLowerCase().includes('student id') || message.toLowerCase().includes('id murid')) {
      const fonnteToken = process.env.FONNTE_TOKEN;
      if (!fonnteToken) return;

      const helpMessage = 'Format pesan salah. Gunakan format:\n\n*Request Student ID - [Nama Lengkap Anda]*\n\nContoh:\n*Request Student ID - Valerie Legolas Cen*';
      
      try {
        await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': fonnteToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            target: sender,
            message: helpMessage,
            inboxid: inboxid
          })
        });
      } catch (err) {
        console.error('[Fonnte Webhook] Error sending help message:', err.message);
      }
    }
  }
});

module.exports = router;
