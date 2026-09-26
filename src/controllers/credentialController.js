const axios = require('axios');
const db = require('../db/neonClient');

async function handleSendCredential(req, res) {
  const { id, email } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  // 1. Validasi Input
  if (!id || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'ID Trainee dan Alamat Email wajib diisi dengan format valid.'
    });
  }

  const trimmedId = String(id).trim();
  const trimmedEmail = String(email).trim().toLowerCase();

  try {
    // 2. Validasi cepat ke Database Neon PostgreSQL
    const checkUser = await db.query(
      'SELECT "ID", "Name", "Password" FROM public.credential_portal WHERE "ID" = $1 OR "ID" ILIKE $1 LIMIT 1',
      [trimmedId]
    );

    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'ID Trainee atau email tidak sesuai dengan data sistem.'
      });
    }

    const trainee = checkUser.rows[0];
    const actualId = trainee.ID;
    const traineeName = trainee.Name || 'Trainee';
    const sentAt = new Date().toISOString();

    // 3. LANGSUNG return response 200 OK ke Frontend (< 100ms)
    res.status(200).json({
      success: true,
      message: 'Kredensial berhasil dikirim! Silakan periksa kotak masuk atau spam email Anda.',
      data: {
        id: actualId,
        name: traineeName,
        email: trimmedEmail,
        sentAt
      }
    });

    // 4. Proses pengiriman Webhook / Email secara Asinkron (di background via setImmediate)
    setImmediate(async () => {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-jua7.srv1825659.hstgr.cloud/webhook/send-credential-email';
      try {
        const n8nRes = await axios.post(
          n8nWebhookUrl,
          {
            id: actualId,
            name: traineeName,
            email: trimmedEmail,
            password: trainee.Password
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
          }
        );

        // Catat audit log SUCCESS
        await db.query(
          `INSERT INTO public.credential_email_logs (trainee_id, recipient_email, status, n8n_response, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [actualId, trimmedEmail, 'SUCCESS', JSON.stringify(n8nRes.data || {}), ip, userAgent]
        );
        console.log(`[CREDENTIAL DISPATCH] Berhasil dikirim ke: ${trimmedEmail} (ID: ${actualId})`);
      } catch (dispatchErr) {
        const errDetail = dispatchErr.response?.data || { error: dispatchErr.message };
        console.error(`[CREDENTIAL DISPATCH ERROR] Gagal mengirim ke ${trimmedEmail}:`, dispatchErr.message);

        // Catat audit log FAILED
        await db.query(
          `INSERT INTO public.credential_email_logs (trainee_id, recipient_email, status, n8n_response, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [actualId, trimmedEmail, 'FAILED', JSON.stringify(errDetail), ip, userAgent]
        ).catch(e => console.error('[Audit Log Error]', e.message));
      }
    });

  } catch (err) {
    console.error('[API ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan pada server.'
    });
  }
}

module.exports = {
  handleSendCredential
};
