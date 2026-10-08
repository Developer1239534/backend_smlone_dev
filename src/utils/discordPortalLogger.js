const https = require('https');
const path = require('path');
const fs = require('fs');

// In-memory cache of trainee ID to active Discord thread ID
// Map<traineeId, { threadId: string, timestamp: number }>
const activeThreads = new Map();

function getDiscordToken() {
  if (process.env.DISCORD_BOT_TOKEN) {
    return process.env.DISCORD_BOT_TOKEN;
  }
  try {
    const envPath = '/root/.hermes/.env';
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/^DISCORD_BOT_TOKEN=(.+)$/m);
      if (match) {
        return match[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  } catch (e) {
    console.error('[DiscordPortalLogger] Error reading token:', e.message);
  }
  return null;
}

const PORTAL_CHANNEL_ID = '1553302926095552553'; // #🌐・bubo-portal

/**
 * Log login activity to Discord Portal channel as a new thread
 */
async function logPortalLogin({ traineeId, traineeName, success, statusText, ip, userAgent }) {
  // Abaikan logging jika request berasal dari internal health-check / QC audit bot
  if (userAgent && userAgent.includes('SMLONE-QC-Audit')) {
    return;
  }
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    if (userAgent && (userAgent.includes('curl') || userAgent.includes('QC-Audit') || userAgent.includes('node'))) {
      return;
    }
  }

  const token = getDiscordToken();
  if (!token) {
    console.error('[DiscordPortalLogger] DISCORD_BOT_TOKEN is missing');
    return;
  }

  const nowWIB = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const statusIcon = success ? '✅' : '❌';
  const threadName = `${statusIcon} Log Login: ${traineeName || 'Trainee'} (${traineeId || 'Unknown'}) - ${nowWIB}`;

  const postData = JSON.stringify({
    name: threadName.substring(0, 100),
    auto_archive_duration: 1440,
    type: 11 // GUILD_PUBLIC_THREAD
  });

  const options = {
    hostname: 'discord.com',
    port: 443,
    path: `/api/v10/channels/${PORTAL_CHANNEL_ID}/threads`,
    method: 'POST',
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'SMLONE-Backend-Logger (1.0)'
    }
  };

  const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => { responseBody += chunk; });
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const parsed = JSON.parse(responseBody);
          const threadId = parsed.id;
          if (traineeId && success) {
            activeThreads.set(String(traineeId), { threadId, timestamp: Date.now() });
          }
          sendThreadMessage(token, threadId, {
            traineeId,
            traineeName,
            success,
            statusText,
            ip,
            userAgent,
            nowWIB
          });
        } catch (err) {
          console.error('[DiscordPortalLogger] Failed to parse thread response:', err.message);
        }
      } else {
        console.error(`[DiscordPortalLogger] Thread HTTP ${res.statusCode}:`, responseBody);
      }
    });
  });

  req.on('error', (e) => {
    console.error('[DiscordPortalLogger] Request error:', e.message);
  });

  req.write(postData);
  req.end();
}

function sendThreadMessage(token, threadId, data) {
  const { traineeId, traineeName, success, statusText, ip, userAgent, nowWIB } = data;
  const statusBadge = success ? '🟢 **BERHASIL LOGIN**' : '🔴 **GAGAL LOGIN**';

  let messageText = `🔐 **LOG AKTIVITAS LOGIN PORTAL TRAINEE**\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 **Trainee Name:** ${traineeName || 'N/A'}\n` +
    `🆔 **Trainee ID:** \`${traineeId || 'N/A'}\` \n` +
    `📊 **Status Login:** ${statusBadge}\n` +
    `⏰ **Waktu (WIB):** \`${nowWIB}\` \n` +
    `🌐 **IP Address:** \`${ip || 'Unknown'}\` \n` +
    `📱 **User Agent:** \`${(userAgent || 'N/A').substring(0, 150)}\` \n`;

  if (!success) {
    messageText += `⚠️ **Penyebab Gagal:** \`${statusText || 'Credential / Password Salah'}\` \n`;
  }
  
  messageText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  postRawToThread(token, threadId, messageText);
}

/**
 * Log page navigation, button click, or ERROR event into the trainee's active thread
 */
async function logPortalActivity({ traineeId, traineeName, eventType, label, path: pagePath, details }) {
  // Telemetry tracker dihapus permanen sesuai instruksi Bos Rakha
  return;
}

function dispatchActivityMessage(token, threadId, { eventType, label, pagePath, details }) {
  const nowWIB = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });
  let icon = '👆';
  let typeTitle = 'BUTTON CLICK';

  const isError = eventType === 'error' || eventType === 'exception' || eventType === 'api_error';

  if (isError) {
    icon = '💥';
    typeTitle = 'ERROR DETECTED';
  } else if (eventType === 'page_view') {
    icon = '📄';
    typeTitle = 'PAGE VIEW';
  } else if (eventType === 'action') {
    icon = '⚡';
    typeTitle = 'ACTION';
  }

  let content = '';

  if (isError) {
    const detailStr = typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details || 'Tidak ada stack trace');
    content = `💥 **[ERROR EXCEPTION]** \`${label || 'Runtime Error'}\` \n` +
      `📍 **Halaman/Endpoint:** \`${pagePath || '/'}\` | ⏰ **Jam:** \`${nowWIB} WIB\` \n` +
      `⚠️ **Penyebab & Detail Error:**\n\`\`\`text\n${detailStr.substring(0, 1500)}\n\`\`\``;
  } else {
    let detailStr = '';
    if (details) {
      detailStr = typeof details === 'object' ? JSON.stringify(details) : String(details);
    }
    content = `${icon} **[${typeTitle}]** \`${label || 'Unknown Action'}\` \n` +
      `📍 Halaman: \`${pagePath || '/'}\` | ⏰ Jam: \`${nowWIB} WIB\`` +
      (detailStr ? `\n📝 Detail: \`${detailStr.substring(0, 500)}\`` : '');
  }

  postRawToThread(token, threadId, content);
}

function postRawToThread(token, threadId, contentText) {
  const postData = JSON.stringify({ content: contentText });
  const options = {
    hostname: 'discord.com',
    port: 443,
    path: `/api/v10/channels/${threadId}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'SMLONE-Backend-Logger (1.0)'
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`[DiscordPortalLogger] Activity posted to thread ${threadId}`);
    } else {
      console.error(`[DiscordPortalLogger] HTTP ${res.statusCode} posting to thread ${threadId}`);
    }
  });

  req.on('error', (e) => {
    console.error('[DiscordPortalLogger] Post error:', e.message);
  });

  req.write(postData);
  req.end();
}

module.exports = {
  logPortalLogin,
  logPortalActivity
};
