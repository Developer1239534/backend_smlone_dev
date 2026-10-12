// =============================================================
// SMLONE Backend – Jira Cloud Ticketing Integration Route
// Connected to Jira Cloud: https://smlone.atlassian.net (Project: KAN)
// =============================================================

const express = require('express');
const fs = require('fs');
const router = express.Router();

function getJiraConfig() {
  try {
    if (fs.existsSync('/root/.jira_config.json')) {
      const raw = fs.readFileSync('/root/.jira_config.json', 'utf8');
      const parsed = JSON.parse(raw);
      return {
        host: parsed.host?.replace(/\/+$/, '') || 'https://smlone.atlassian.net',
        email: parsed.email || 'developer@smlone.com',
        token: parsed.token || process.env.JIRA_API_TOKEN || ''
      };
    }
  } catch (err) {
    console.error('[TicketRoutes] Error reading jira config:', err.message);
  }
  return {
    host: process.env.JIRA_HOST?.replace(/\/+$/, '') || 'https://smlone.atlassian.net',
    email: process.env.JIRA_EMAIL || 'developer@smlone.com',
    token: process.env.JIRA_API_TOKEN || ''
  };
}

function getAuthHeader() {
  const { email, token } = getJiraConfig();
  return `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
}

function parseAdfText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  let text = '';
  if (node.text) text += node.text;
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      text += parseAdfText(child);
      if (child.type === 'paragraph' || child.type === 'heading') {
        text += '\n';
      }
    }
  }
  return text.trim();
}

// GET /api/tickets - Fetch tickets from Jira Cloud KAN
router.get('/', async (req, res) => {
  try {
    const { host } = getJiraConfig();
    const auth = getAuthHeader();

    const jql = 'project = KAN ORDER BY created DESC';
    const jiraRes = await fetch(`${host}/rest/api/3/search/jql`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        jql,
        maxResults: 50,
        fields: ['summary', 'status', 'issuetype', 'priority', 'created', 'updated', 'description', 'attachment', 'creator', 'reporter']
      })
    });

    if (!jiraRes.ok) {
      const errText = await jiraRes.text();
      return res.status(jiraRes.status).json({
        success: false,
        message: `Jira API error: ${jiraRes.status}`,
        error: errText
      });
    }

    const data = await jiraRes.json();
    const issues = data.issues || [];

    const tickets = issues.map((issue) => {
      const fields = issue.fields || {};
      const fullDesc = parseAdfText(fields.description) || '';

      // Ekstrak metadata dari deskripsi jika ada
      let module = 'Admin portal';
      if (/Modul\s*\/\s*Sistem:\s*Portal/i.test(fullDesc) || /\[Portal\]/i.test(fields.summary)) {
        module = 'Portal';
      } else if (/Modul\s*\/\s*Sistem:\s*Admin\s*portal/i.test(fullDesc) || /\[Admin\s*portal\]/i.test(fields.summary)) {
        module = 'Admin portal';
      }

      let reporter = fields.reporter?.displayName || fields.creator?.displayName || 'Staf SMLONE';
      const reporterMatch = fullDesc.match(/Pelapor:\s*([^(\n]+)/i);
      if (reporterMatch && reporterMatch[1]) {
        reporter = reporterMatch[1].trim();
      }

      let reporterPhone = '';
      const phoneMatch = fullDesc.match(/WA:\s*([^\n)]+)/i);
      if (phoneMatch && phoneMatch[1]) {
        reporterPhone = phoneMatch[1].trim();
      }

      // Priority mapping
      let priorityName = fields.priority?.name || 'Medium';
      let priorityFormatted = 'P3 - Medium';
      if (priorityName.toLowerCase() === 'highest' || priorityName.toLowerCase().includes('critical')) {
        priorityFormatted = 'P1 - Critical';
      } else if (priorityName.toLowerCase() === 'high') {
        priorityFormatted = 'P2 - High';
      } else if (priorityName.toLowerCase() === 'low' || priorityName.toLowerCase() === 'lowest') {
        priorityFormatted = 'P4 - Low';
      }

      // Attachments
      const attachments = (fields.attachment || []).map((att) => ({
        id: att.id,
        filename: att.filename,
        size: att.size,
        mimeType: att.mimeType,
        url: att.content,
        thumbnail: att.thumbnail || att.content
      }));

      return {
        id: issue.id,
        key: issue.key,
        summary: fields.summary,
        description: fullDesc,
        status: fields.status?.name || 'To Do',
        priority: priorityFormatted,
        module,
        reporter,
        reporterPhone,
        attachments,
        createdAt: fields.created,
        updatedAt: fields.updated
      };
    });

    res.json({
      success: true,
      total: tickets.length,
      data: tickets
    });
  } catch (err) {
    console.error('[TicketRoutes] Error fetching tickets:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Gagal mengambil data tiket dari Jira'
    });
  }
});

// POST /api/tickets - Create new ticket in Jira Cloud with optional image
router.post('/', async (req, res) => {
  try {
    const {
      summary,
      description = '',
      module = 'Admin portal',
      priority = 'P3 - Medium',
      reporter = 'Staf SMLONE',
      reporterPhone = '',
      image,
      imageFilename = 'bukti_kendala.png'
    } = req.body;

    if (!summary || !String(summary).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Judul kendala (summary) wajib diisi'
      });
    }

    const { host } = getJiraConfig();
    const auth = getAuthHeader();

    // Map priority ke Jira Cloud priority
    let jiraPriority = 'Medium';
    if (priority.includes('P1') || priority.toLowerCase().includes('critical')) {
      jiraPriority = 'Highest';
    } else if (priority.includes('P2') || priority.toLowerCase().includes('high')) {
      jiraPriority = 'High';
    } else if (priority.includes('P4') || priority.toLowerCase().includes('low')) {
      jiraPriority = 'Low';
    }

    const cleanSummary = String(summary).trim();
    const formattedSummary = cleanSummary.startsWith('[') 
      ? cleanSummary 
      : `[${module}] ${cleanSummary}`;

    const formattedDescriptionText = `📌 Modul / Sistem: ${module}\n👤 Pelapor: ${reporter}${reporterPhone ? ` (WA: ${reporterPhone})` : ''}\n⚡ Prioritas: ${priority}\n\n📝 Deskripsi Lengkap Kendala:\n${description || cleanSummary}`;

    const descNode = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: formattedDescriptionText
            }
          ]
        }
      ]
    };

    const payload = {
      fields: {
        project: { key: 'KAN' },
        summary: formattedSummary,
        description: descNode,
        issuetype: { name: 'Task' },
        priority: { name: jiraPriority }
      }
    };

    const jiraRes = await fetch(`${host}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!jiraRes.ok) {
      const errBody = await jiraRes.text();
      return res.status(jiraRes.status).json({
        success: false,
        message: 'Gagal membuat issue di Jira',
        error: errBody
      });
    }

    const issueData = await jiraRes.json();
    const issueKey = issueData.key;
    let uploadedAttachments = [];

    // Jika ada bukti gambar (Base64 atau Data URL)
    if (image && typeof image === 'string') {
      try {
        let base64Data = image;
        let mimeType = 'image/png';
        let fname = imageFilename || 'bukti_kendala.png';

        if (image.startsWith('data:')) {
          const matches = image.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            mimeType = matches[1];
            base64Data = matches[2];
            if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
              fname = fname.replace(/\.[^.]+$/, '') + '.jpg';
            } else if (mimeType.includes('webp')) {
              fname = fname.replace(/\.[^.]+$/, '') + '.webp';
            }
          }
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const formData = new FormData();
        const blob = new Blob([buffer], { type: mimeType });
        formData.append('file', blob, fname);

        const attachRes = await fetch(`${host}/rest/api/3/issue/${issueKey}/attachments`, {
          method: 'POST',
          headers: {
            'Authorization': auth,
            'X-Atlassian-Token': 'no-check'
          },
          body: formData
        });

        if (attachRes.ok) {
          const attachData = await attachRes.json();
          uploadedAttachments = Array.isArray(attachData) ? attachData.map((a) => ({
            id: a.id,
            filename: a.filename,
            url: a.content,
            size: a.size,
            mimeType: a.mimeType
          })) : [];
        } else {
          console.error('[TicketRoutes] Failed to upload attachment to Jira:', await attachRes.text());
        }
      } catch (uploadErr) {
        console.error('[TicketRoutes] Exception during image upload to Jira:', uploadErr);
      }
    }

    res.json({
      success: true,
      message: `Tiket berhasil dibuat di Jira Cloud (${issueKey})`,
      data: {
        id: issueData.id,
        key: issueKey,
        summary: formattedSummary,
        description: formattedDescriptionText,
        status: 'To Do',
        priority,
        module,
        reporter,
        reporterPhone,
        attachments: uploadedAttachments,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[TicketRoutes] Create ticket error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Gagal memproses tiket ke Jira'
    });
  }
});

// PATCH /api/tickets/:key/status - Update ticket status transition
router.patch('/:key/status', async (req, res) => {
  const { key } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status wajib diisi' });
  }

  try {
    const { host } = getJiraConfig();
    const auth = getAuthHeader();

    const transRes = await fetch(`${host}/rest/api/3/issue/${key}/transitions`, {
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    });

    if (!transRes.ok) {
      return res.status(transRes.status).json({ success: false, message: 'Gagal mengambil transisi status Jira' });
    }

    const transData = await transRes.json();
    const transitions = transData.transitions || [];

    const targetLower = status.toLowerCase();
    const matched = transitions.find((t) => t.name.toLowerCase() === targetLower);

    if (!matched) {
      return res.status(400).json({
        success: false,
        message: `Transisi status '${status}' tidak tersedia. Pilihan: ${transitions.map((t) => t.name).join(', ')}`
      });
    }

    const applyRes = await fetch(`${host}/rest/api/3/issue/${key}/transitions`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transition: { id: matched.id }
      })
    });

    if (!applyRes.ok) {
      return res.status(applyRes.status).json({ success: false, message: 'Gagal menerapkan status ke Jira' });
    }

    res.json({
      success: true,
      message: `Status tiket ${key} berhasil diperbarui menjadi ${status}`,
      key,
      status
    });
  } catch (err) {
    console.error('[TicketRoutes] Status update error:', err);
    res.status(500).json({ success: false, message: err.message || 'Gagal mengubah status tiket di Jira' });
  }
});

// DELETE /api/tickets/:key - Delete ticket in Jira Cloud
router.delete('/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const { host } = getJiraConfig();
    const auth = getAuthHeader();

    const delRes = await fetch(`${host}/rest/api/3/issue/${key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': auth
      }
    });

    if (!delRes.ok && delRes.status !== 404) {
      return res.status(delRes.status).json({ success: false, message: 'Gagal menghapus tiket di Jira' });
    }

    res.json({
      success: true,
      message: `Tiket ${key} berhasil dihapus dari Jira Cloud`,
      key
    });
  } catch (err) {
    console.error('[TicketRoutes] Delete ticket error:', err);
    res.status(500).json({ success: false, message: err.message || 'Gagal menghapus tiket di Jira' });
  }
});

module.exports = router;
