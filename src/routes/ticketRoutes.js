// =============================================================
// SMLONE Backend – Jira Cloud Ticketing Integration Route
// Connected to Jira Cloud: https://smlone.atlassian.net (Project: KAN)
// =============================================================

const express = require('express');
const fs = require('fs');
const path = require('path');
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

const TICKET_STATUS_FILE = path.join(__dirname, '../../ticket_status_store.json');
const TICKET_MAP_FILE = path.join(__dirname, '../../ticket_map_store.json');

function getTicketMap() {
  try {
    if (fs.existsSync(TICKET_MAP_FILE)) {
      return JSON.parse(fs.readFileSync(TICKET_MAP_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading ticket map file:', e);
  }
  return { nextNum: 1, jiraToSml: {}, smlToJira: {} };
}

function getOrAssignSmlKey(jiraKey) {
  if (!jiraKey) return jiraKey;
  const mapData = getTicketMap();
  if (mapData.jiraToSml && mapData.jiraToSml[jiraKey]) {
    return mapData.jiraToSml[jiraKey];
  }

  // Jika belum ada, assign SML-N
  const num = mapData.nextNum || 1;
  const smlKey = `SML-${num}`;
  mapData.jiraToSml[jiraKey] = smlKey;
  mapData.smlToJira[smlKey] = jiraKey;
  mapData.nextNum = num + 1;

  try {
    fs.writeFileSync(TICKET_MAP_FILE, JSON.stringify(mapData, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving ticket map file:', e);
  }
  return smlKey;
}

function resolveJiraKey(inputKey) {
  if (!inputKey) return inputKey;
  const mapData = getTicketMap();
  if (mapData.smlToJira && mapData.smlToJira[inputKey.toUpperCase()]) {
    return mapData.smlToJira[inputKey.toUpperCase()];
  }
  return inputKey;
}

function getLocalStatuses() {
  try {
    if (fs.existsSync(TICKET_STATUS_FILE)) {
      return JSON.parse(fs.readFileSync(TICKET_STATUS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading ticket status file:', e);
  }
  return {};
}

function saveLocalStatus(key, status) {
  try {
    const data = getLocalStatuses();
    data[key] = status;
    fs.writeFileSync(TICKET_STATUS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing ticket status file:', e);
    return false;
  }
}

function deleteLocalStatus(key) {
  try {
    const data = getLocalStatuses();
    if (data[key]) {
      delete data[key];
      fs.writeFileSync(TICKET_STATUS_FILE, JSON.stringify(data, null, 2), 'utf8');
    }
    return true;
  } catch (e) {
    console.error('Error deleting ticket local status:', e);
    return false;
  }
}

// GET /api/tickets/admin-dashboard -> Dashboard Khusus Admin Tiketing Terpisah
router.get('/admin-dashboard', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Operations - Tiket IT SMLONE</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      padding: 32px 24px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 1240px;
      margin: 0 auto;
    }
    /* Header Bar */
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-mark {
      width: 42px;
      height: 42px;
      background-color: #233245;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: -0.5px;
    }
    .brand-titles h1 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.2px;
    }
    .brand-titles p {
      font-size: 13px;
      color: #64748b;
    }
    .top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }
    .btn-solid {
      background-color: #233245;
      color: #ffffff;
      border: 1px solid #233245;
    }
    .btn-solid:hover {
      background-color: #1a2533;
    }
    .btn-outline {
      background-color: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-outline:hover {
      background-color: #f1f5f9;
    }

    /* Metric Counters */
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (max-width: 820px) {
      .metrics-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 18px 20px;
    }
    .metric-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #64748b;
    }
    .metric-value {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 4px;
    }

    /* Table Section */
    .panel {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .panel-header {
      padding: 16px 20px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .panel-header h2 {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .search-box {
      font-size: 13px;
      padding: 7px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-family: inherit;
      width: 260px;
      outline: none;
      color: #0f172a;
    }
    .search-box:focus {
      border-color: #233245;
    }
    .table-responsive {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }
    thead th {
      background-color: #f8fafc;
      padding: 12px 18px;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }
    tbody td {
      padding: 14px 18px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    tbody tr:hover {
      background-color: #f8fafc;
    }
    .key-badge {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-weight: 700;
      font-size: 12px;
      color: #233245;
      background-color: #f1f5f9;
      padding: 3px 7px;
      border-radius: 4px;
      display: inline-block;
    }
    .prio-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
      white-space: nowrap;
    }
    .prio-darurat { background: #fee2e2; color: #991b1b; }
    .prio-tinggi { background: #ffedd5; color: #9a3412; }
    .prio-sedang { background: #fef9c3; color: #854d0e; }
    .prio-rendah { background: #f1f5f9; color: #475569; }

    .status-select {
      font-size: 12px;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 5px;
      border: 1px solid #cbd5e1;
      font-family: inherit;
      cursor: pointer;
      outline: none;
      background-color: #ffffff;
    }
    .status-select:focus {
      border-color: #233245;
    }
    .status-menunggu { background-color: #f8fafc; color: #334155; }
    .status-diproses { background-color: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
    .status-selesai { background-color: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="top-bar">
      <div class="brand-section">
        <div class="brand-mark">S1</div>
        <div class="brand-titles">
          <h1>Dashboard Manajemen Tiket</h1>
          <p>Operasional Dukungan Teknis</p>
        </div>
      </div>
      <div class="top-actions">
        <button onclick="fetchAdminTickets()" class="btn btn-outline">&#x21bb; Segarkan</button>
        <a href="/board" target="_blank" class="btn btn-outline">Buka Papan Kanban &rarr;</a>
        <a href="/tiket" target="_blank" class="btn btn-solid">+ Buat Tiket</a>
      </div>
    </div>

    <!-- Metrics -->
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-label">Total Tiket</div>
        <div class="metric-value" id="statTotal">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Menunggu</div>
        <div class="metric-value" id="statMenunggu" style="color: #64748b;">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Diproses</div>
        <div class="metric-value" id="statDiproses" style="color: #233245;">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Selesai</div>
        <div class="metric-value" id="statSelesai" style="color: #065f46;">0</div>
      </div>
    </div>

    <!-- Table Panel -->
    <div class="panel">
      <div class="panel-header">
        <h2>Daftar Tiket Gangguan &amp; Sinkronisasi</h2>
        <input type="text" id="searchInput" placeholder="Cari nama, tiket, atau kendala..." class="search-box" oninput="renderTable()">
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Nomor Tiket</th>
              <th>Pelapor</th>
              <th>Prioritas</th>
              <th>Ringkasan Masalah</th>
              <th>Status (Ubah Langsung)</th>
              <th>Tanggal Lapor</th>
              <th style="text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody id="ticketTbody">
            <tr>
              <td colspan="7" style="text-align: center; padding: 36px; color: #94a3b8;">Memuat data tiket...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    let allTickets = [];

    async function fetchAdminTickets() {
      try {
        const res = await fetch('/api/tickets');
        const json = await res.json();
        if (json.success && json.data) {
          allTickets = json.data;
          updateStats();
          renderTable();
        }
      } catch (e) {
        console.error('Failed to load tickets', e);
      }
    }

    function updateStats() {
      let total = allTickets.length;
      let menunggu = 0;
      let diproses = 0;
      let selesai = 0;

      allTickets.forEach(t => {
        const s = (t.status || '').toLowerCase();
        if (s === 'selesai') selesai++;
        else if (s === 'diproses') diproses++;
        else menunggu++;
      });

      document.getElementById('statTotal').textContent = total;
      document.getElementById('statMenunggu').textContent = menunggu;
      document.getElementById('statDiproses').textContent = diproses;
      document.getElementById('statSelesai').textContent = selesai;
    }

    function renderTable() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const filtered = allTickets.filter(t => {
        if (!q) return true;
        return (t.key || '').toLowerCase().includes(q) ||
               (t.summary || '').toLowerCase().includes(q) ||
               (t.reporter || '').toLowerCase().includes(q);
      });

      const tbody = document.getElementById('ticketTbody');
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:36px; color:#94a3b8;">Tidak ada tiket ditemukan</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(t => {
        const p = (t.priority || '').toLowerCase();
        let pClass = 'prio-sedang';
        if (p.includes('darurat') || p.includes('critical')) pClass = 'prio-darurat';
        else if (p.includes('tinggi') || p.includes('high')) pClass = 'prio-tinggi';
        else if (p.includes('rendah') || p.includes('low')) pClass = 'prio-rendah';

        const currStatus = t.status || 'Menunggu';
        let statusClass = 'status-menunggu';
        if (currStatus.toLowerCase() === 'selesai') statusClass = 'status-selesai';
        else if (currStatus.toLowerCase() === 'diproses') statusClass = 'status-diproses';

        return \`
          <tr>
            <td><span class="key-badge">\${t.key}</span></td>
            <td><strong>\${t.reporter || 'Staf'}</strong></td>
            <td><span class="prio-badge \${pClass}">\${t.priority || 'Normal'}</span></td>
            <td>
              <div style="font-weight:600; color:#0f172a; max-width: 480px; line-height: 1.4;">\${t.summary}</div>
            </td>
            <td>
              <select class="status-select \${statusClass}" onchange="updateTicketStatus('\${t.key}', this.value, this)">
                <option value="Menunggu" \${currStatus === 'Menunggu' ? 'selected' : ''}>Menunggu</option>
                <option value="Diproses" \${currStatus === 'Diproses' ? 'selected' : ''}>Diproses</option>
                <option value="Selesai" \${currStatus === 'Selesai' ? 'selected' : ''}>Selesai</option>
              </select>
            </td>
            <td style="color:#64748b; font-size:12px; white-space: nowrap;">
              \${t.createdAt ? new Date(t.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '-'}
            </td>
            <td style="text-align: center; white-space: nowrap;">
              <button type="button" onclick="deleteTicket('\${t.key}')" title="Hapus Tiket Real-Time" style="background: none; border: 1px solid #fee2e2; border-radius: 6px; padding: 6px 10px; cursor: pointer; color: #dc2626; transition: all 0.15s ease; display: inline-flex; align-items: center; justify-content: center; gap: 4px;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span style="font-size: 11px; font-weight: 600;">Hapus</span>
              </button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    async function updateTicketStatus(key, newStatus, selectElem) {
      // 1. Optimistic Update instan: langsung ubah warna & class di tampilan detik itu juga
      if (selectElem) {
        selectElem.className = 'status-select';
        if (newStatus.toLowerCase() === 'selesai') selectElem.classList.add('status-selesai');
        else if (newStatus.toLowerCase() === 'diproses') selectElem.classList.add('status-diproses');
        else selectElem.classList.add('status-menunggu');
      }

      // 2. Update local state tiket secara instan
      const item = allTickets.find(t => t.key === key);
      if (item) {
        item.status = newStatus;
        updateStats();
      }

      try {
        const res = await fetch('/api/tickets/' + key + '/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const json = await res.json();
        if (json.success) {
          fetchAdminTickets();
        } else {
          alert('Gagal memperbarui status: ' + (json.message || 'Error'));
          fetchAdminTickets();
        }
      } catch (e) {
        alert('Gagal menghubungi server: ' + e.message);
        fetchAdminTickets();
      }
    }

    async function deleteTicket(key) {
      if (!confirm('Apakah Anda yakin ingin menghapus tiket ' + key + ' secara permanen?')) return;
      try {
        const res = await fetch('/api/tickets/' + key, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });
        const json = await res.json();
        if (json.success) {
          fetchAdminTickets();
        } else {
          alert('Gagal menghapus tiket: ' + (json.message || 'Error'));
        }
      } catch (e) {
        alert('Gagal menghubungi server: ' + e.message);
      }
    }

    fetchAdminTickets();
    setInterval(fetchAdminTickets, 15000);
  </script>
</body>
</html>
  `);
});

// GET /api/tickets/board -> Papan Monitoring Jira (Kanban Board) untuk User & IT Support
router.get('/board', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Papan Monitoring Tiket IT - SMLONE</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      padding: 24px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .top-header {
      max-width: 1200px;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 18px;
      border-bottom: 1px solid #e2e8f0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 40px;
      height: 40px;
      background-color: #233245;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 700;
      font-size: 16px;
    }
    .brand-info h1 {
      font-size: 18px;
      font-weight: 700;
      color: #233245;
    }
    .brand-info p {
      font-size: 12px;
      color: #64748b;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background-color: #233245;
      color: #ffffff;
      border: 1px solid #233245;
    }
    .btn-primary:hover {
      background-color: #1a2533;
    }
    .btn-secondary {
      background-color: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-secondary:hover {
      background-color: #f1f5f9;
    }
    .board-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    @media (max-width: 860px) {
      .board-container {
        grid-template-columns: 1fr;
      }
    }
    .column {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      display: flex;
      flex-col: column;
      flex-direction: column;
      min-height: 480px;
    }
    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #cbd5e1;
    }
    .column-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .column-count {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
    }
    .ticket-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }
    .ticket-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ticket-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .ticket-key {
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-weight: 700;
      font-size: 11px;
      color: #233245;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .badge-priority {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .p-critical { background: #fee2e2; color: #991b1b; }
    .p-high { background: #ffedd5; color: #9a3412; }
    .p-medium { background: #fef9c3; color: #854d0e; }
    .p-low { background: #f1f5f9; color: #475569; }
    .ticket-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.4;
    }
    .ticket-desc {
      font-size: 12px;
      color: #64748b;
      white-space: pre-line;
      max-height: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    .ticket-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: #94a3b8;
      padding-top: 6px;
      border-top: 1px solid #f1f5f9;
    }
    .empty-state {
      padding: 40px 16px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="top-header">
    <div class="brand">
      <div class="brand-logo">S1</div>
      <div class="brand-info">
        <h1>Papan Monitoring Tiket</h1>
        <p>Pantau perkembangan status tiket secara transparan</p>
      </div>
    </div>
    <div class="actions">
      <button onclick="loadTickets()" class="btn btn-secondary">&#x21bb; Segarkan</button>
      <a href="/tiket" class="btn btn-primary">+ Buat Tiket Baru</a>
    </div>
  </div>

  <div class="board-container">
    <!-- Kolom 1: Menunggu -->
    <div class="column">
      <div class="column-header">
        <div class="column-title">&#9675; Menunggu</div>
        <div id="countMenunggu" class="column-count">0</div>
      </div>
      <div id="listMenunggu" class="ticket-list">
        <div class="empty-state">Memuat tiket...</div>
      </div>
    </div>

    <!-- Kolom 2: Diproses -->
    <div class="column">
      <div class="column-header">
        <div class="column-title">&#9684; Diproses</div>
        <div id="countDiproses" class="column-count">0</div>
      </div>
      <div id="listDiproses" class="ticket-list">
        <div class="empty-state">Memuat tiket...</div>
      </div>
    </div>

    <!-- Kolom 3: Selesai -->
    <div class="column">
      <div class="column-header">
        <div class="column-title">&#9679; Selesai</div>
        <div id="countSelesai" class="column-count">0</div>
      </div>
      <div id="listSelesai" class="ticket-list">
        <div class="empty-state">Memuat tiket...</div>
      </div>
    </div>
  </div>

  <script>
    async function loadTickets() {
      try {
        const res = await fetch('/api/tickets');
        const json = await res.json();
        if (!json.success || !json.data) return;

        const tickets = json.data;
        const menunggu = [];
        const diproses = [];
        const selesai = [];

        tickets.forEach(t => {
          const s = (t.status || '').toLowerCase();
          if (s === 'selesai' || s.includes('done') || s.includes('closed') || s.includes('resolved')) {
            selesai.push(t);
          } else if (s === 'diproses' || s.includes('process') || s.includes('progress') || s.includes('working')) {
            diproses.push(t);
          } else {
            // Default semua tiket baru/aktif masuk ke Menunggu
            menunggu.push(t);
          }
        });

        renderColumn('listMenunggu', 'countMenunggu', menunggu);
        renderColumn('listDiproses', 'countDiproses', diproses);
        renderColumn('listSelesai', 'countSelesai', selesai);
      } catch (e) {
        console.error('Error fetching tickets:', e);
      }
    }

    async function changeStatus(ticketKey, newStatus) {
      if (!confirm('Ubah status tiket ' + ticketKey + ' menjadi ' + newStatus + '?')) return;
      try {
        const res = await fetch('/api/tickets/' + ticketKey + '/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const json = await res.json();
        if (json.success) {
          loadTickets();
        } else {
          alert('Gagal: ' + (json.message || 'Error'));
        }
      } catch (e) {
        alert('Gagal mengubah status: ' + e.message);
      }
    }

    function renderColumn(listId, countId, items) {
      document.getElementById(countId).textContent = items.length;
      const el = document.getElementById(listId);
      if (items.length === 0) {
        el.innerHTML = '<div class="empty-state">Tidak ada tiket di kolom ini</div>';
        return;
      }

      el.innerHTML = items.map(t => {
        let pClass = 'p-medium';
        const p = (t.priority || '').toLowerCase();
        if (p.includes('darurat') || p.includes('critical') || p.includes('p1')) pClass = 'p-critical';
        else if (p.includes('tinggi') || p.includes('high') || p.includes('p2')) pClass = 'p-high';
        else if (p.includes('rendah') || p.includes('low') || p.includes('p4')) pClass = 'p-low';

        return \`
          <div class="ticket-card">
            <div class="ticket-top">
              <span class="ticket-key">\${t.key}</span>
              <span class="badge-priority \${pClass}">\${t.priority || 'Normal'}</span>
            </div>
            <div class="ticket-title">\${t.summary}</div>
            <div class="ticket-meta">
              <span>\${t.reporter || 'Staff'}</span>
              <span>\${t.createdAt ? new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}</span>
            </div>
          </div>
        \`;
      }).join('');
    }

    loadTickets();
    // Auto-refresh setiap 20 detik
    setInterval(loadTickets, 20000);
  </script>
</body>
</html>
  `);
});

// GET /api/tickets/form -> Halaman Web Form Tiketing Terpisah (Bukan portal.smlone)
router.get('/form', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SMLONE Tiketing</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      padding: 40px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 640px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .header-logo {
      width: 44px;
      height: 44px;
      background-color: #233245;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: -0.5px;
      flex-shrink: 0;
    }
    .header-text h1 {
      font-size: 18px;
      font-weight: 700;
      color: #233245;
      letter-spacing: -0.2px;
    }
    .header-text p {
      font-size: 13px;
      color: #64748b;
      margin-top: 2px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 28px 24px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #64748b;
      margin-bottom: 14px;
    }
    .form-group {
      margin-bottom: 18px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 540px) {
      .grid-2 {
        grid-template-columns: 1fr;
      }
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }
    label .req {
      color: #dc2626;
    }
    label .opt {
      font-weight: 400;
      color: #94a3b8;
    }
    input[type="text"],
    input[type="url"],
    input[type="tel"],
    select,
    textarea {
      width: 100%;
      padding: 9px 12px;
      font-size: 13px;
      font-family: inherit;
      color: #0f172a;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      outline: none;
      transition: border-color 0.15s ease;
    }
    input[type="url"] {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
    }
    input:focus,
    select:focus,
    textarea:focus {
      border-color: #233245;
    }
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 22px 0;
    }
    .sheet-title-box {
      margin-top: 8px;
      padding: 10px 12px;
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 12px;
      display: none;
    }
    .sheet-title-box .label {
      color: #64748b;
      font-size: 11px;
      display: block;
      margin-bottom: 2px;
    }
    .sheet-title-box .val {
      font-weight: 600;
      color: #0f172a;
    }
    .priority-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    @media (max-width: 540px) {
      .priority-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    .priority-btn {
      padding: 10px 12px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      transition: all 0.15s ease;
      position: relative;
    }
    .priority-btn:hover {
      background: #f8fafc;
    }
    .priority-btn.active {
      background: #233245;
      border-color: #233245;
      color: #ffffff;
    }
    .priority-btn .p-name {
      font-size: 13px;
      font-weight: 600;
      display: block;
    }
    .priority-btn .p-info-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
    }
    .priority-btn:hover .p-info-btn {
      background: #e2e8f0;
      color: #334155;
    }
    .priority-btn.active .p-info-btn {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }
    .priority-btn .p-info-btn:hover {
      transform: scale(1.1);
    }
    .priority-desc-banner {
      margin-top: 10px;
      padding: 10px 14px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 12px;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: fadeIn 0.2s ease;
    }
    .priority-desc-banner strong {
      color: #0f172a;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .btn-submit {
      width: 100%;
      padding: 11px 16px;
      background-color: #233245;
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.15s ease;
      margin-top: 8px;
    }
    .btn-submit:hover {
      background-color: #1a2533;
    }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .alert-error {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 16px;
      display: none;
    }
    .success-box {
      display: none;
      text-align: center;
      padding: 32px 16px;
    }
    .success-icon {
      width: 48px;
      height: 48px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 50%;
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 20px;
    }
    .success-box h2 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .success-box p {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .ticket-badge {
      display: inline-block;
      margin: 18px 0;
      padding: 10px 20px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }
    .ticket-badge .lbl {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .ticket-badge .key {
      font-size: 20px;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-weight: 700;
      color: #233245;
      margin-top: 2px;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">S1</div>
      <div class="header-text">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <h1>SMLONE Tiketing</h1>
          <a href="/board" style="font-size: 11px; font-weight: 600; color: #233245; text-decoration: none; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff;">&#9638; Buka Papan Monitoring &rarr;</a>
        </div>
        <p>Layanan Pengajuan Tiket Gangguan, Sinkronisasi Data Sheet SMLONE dan Fitur baru</p>
      </div>
    </div>

    <div class="card">
      <div id="errorAlert" class="alert-error"></div>

      <div id="successView" class="success-box">
        <div class="success-icon">&#10003;</div>
        <h2>Tiket Berhasil Didaftarkan</h2>
        <p>Laporan kendala telah berhasil tercatat dalam antrean dukungan teknis.</p>
        
        <div class="ticket-badge">
          <div class="lbl">Nomor Tiket Resmi</div>
          <div id="ticketKeyDisplay" class="key">SML-1</div>
        </div>

        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 14px;">
          <a href="/board" class="btn-submit" style="width: auto; padding: 8px 18px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; background-color: #0f172a;">
            Pantau di Papan Kanban &rarr;
          </a>
          <button type="button" onclick="resetForm()" class="btn-submit" style="width: auto; padding: 8px 18px; display: inline-block; background-color: #64748b;">
            Buat Tiket Baru
          </button>
        </div>
      </div>

      <form id="ticketForm" onsubmit="submitTicket(event)">
        <!-- Section 1 -->
        <div class="section-title">1. Tipe Pengajuan &amp; Data Pelapor</div>
        <div class="form-group">
          <label>Jenis Pengajuan <span class="req">*</span></label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button type="button" id="btnTypeIssue" class="priority-btn active" onclick="setRequestType('Tiket Kendala', this)" style="justify-content: center; font-weight: 600;">
              <span>&#9888; Tiketing (Kendala/Error)</span>
            </button>
            <button type="button" id="btnTypeFeature" class="priority-btn" onclick="setRequestType('New Feature', this)" style="justify-content: center; font-weight: 600;">
              <span>&#10022; New Feature (Fitur Baru)</span>
            </button>
          </div>
        </div>

        <div class="grid-2 form-group">
          <div>
            <label for="reporter">Nama Pelapor <span class="req">*</span></label>
            <input type="text" id="reporter" required placeholder="Contoh: Muhammad Rakha Akbar">
          </div>
          <div>
            <label for="divisi">Divisi / Peran <span class="req">*</span></label>
            <select id="divisi">
              <option value="Staff">Staff Umum</option>
              <option value="CRO">CRO (Customer Relationship Officer)</option>
              <option value="Trainer">Trainer / Coach</option>
              <option value="Operational">Operational</option>
              <option value="Leader / Management">Leader / Management</option>
              <option value="Finance">Finance</option>
              <option value="HRD">HRD</option>
              <option value="AET / AEL">AET / AEL</option>
              <option value="Trainee">Trainee / Siswa SMLONE</option>
            </select>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Section 2 -->
        <div class="section-title">2. Sumber Data &amp; Dokumen</div>
        <div class="form-group">
          <label for="sheetUrl">URL Google Sheet <span class="opt">(Opsional - Otomatis membaca judul)</span></label>
          <input type="url" id="sheetUrl" placeholder="https://docs.google.com/spreadsheets/d/..." oninput="handleSheetUrlChange()">
          <div id="sheetStatusText" style="display: none; font-size: 11px; margin-top: 4px; color: #64748b;">Membaca judul sheet...</div>
        </div>

        <div class="form-group" id="sheetTitleGroup" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label for="sheetTitleInput" style="margin-bottom: 0;">Judul Sheet / File</label>
            <span style="font-size: 11px; color: #64748b; font-weight: normal;">(Bisa diedit jika ingin disesuaikan)</span>
          </div>
          <input type="text" id="sheetTitleInput" placeholder="Contoh: Masterfiles Real Stage 26 - TAF Generate" style="background-color: #ffffff; font-weight: 600; color: #0f172a; border-color: #cbd5e1;">
        </div>

        <div class="divider"></div>

        <!-- Section 3 -->
        <div class="section-title">3. Detail Kendala &amp; Urgensi</div>
        <div class="form-group">
          <label for="urgencyReason" id="urgencyLabel">Jelaskan Kenapa Sangat Mendesak / Urgensi <span class="req">*</span></label>
          <textarea id="urgencyReason" required placeholder="Jelaskan alasan kenapa kendala ini mendesak dan dampaknya jika belum diselesaikan (contoh: Pendaftaran siswa baru terhambat, data rapor tidak muncul saat orang tua cek, dll)..."></textarea>
        </div>

        <div class="form-group">
          <label>Tingkat Prioritas <span class="req">*</span></label>
          <div class="priority-grid">
            <button type="button" class="priority-btn" onclick="setPriority('Darurat', this)">
              <span class="p-name">Darurat</span>
              <span class="p-info-btn" onclick="toggleInfo(event, 'Darurat')" title="Klik untuk penjelasan">&#9432;</span>
            </button>
            <button type="button" class="priority-btn active" onclick="setPriority('Tinggi', this)">
              <span class="p-name">Tinggi</span>
              <span class="p-info-btn" onclick="toggleInfo(event, 'Tinggi')" title="Klik untuk penjelasan">&#9432;</span>
            </button>
            <button type="button" class="priority-btn" onclick="setPriority('Sedang', this)">
              <span class="p-name">Sedang</span>
              <span class="p-info-btn" onclick="toggleInfo(event, 'Sedang')" title="Klik untuk penjelasan">&#9432;</span>
            </button>
            <button type="button" class="priority-btn" onclick="setPriority('Rendah', this)">
              <span class="p-name">Rendah</span>
              <span class="p-info-btn" onclick="toggleInfo(event, 'Rendah')" title="Klik untuk penjelasan">&#9432;</span>
            </button>
          </div>
          <div id="priorityBanner" class="priority-desc-banner">
            <span>&#9432;</span>
            <span id="priorityBannerText"><strong>Tinggi:</strong> Masalah menghambat pekerjaan penting.</span>
          </div>
        </div>

        <button type="submit" id="submitBtn" class="btn-submit">
          Kirim Tiket
        </button>
      </form>
    </div>

    <div class="footer">
      SMLONE IT Operations &bull; Sistem Layanan Tiketing Mandiri
    </div>
  </div>

  <script>
    let selectedType = 'Tiket Kendala';
    let selectedPriority = 'Tinggi';
    let detectedSheetTitle = '';
    let sheetTimer = null;

    function setRequestType(type, btn) {
      selectedType = type;
      document.getElementById('btnTypeIssue').classList.remove('active');
      document.getElementById('btnTypeFeature').classList.remove('active');
      btn.classList.add('active');

      const urgLabel = document.getElementById('urgencyLabel');
      const urgInput = document.getElementById('urgencyReason');
      if (type === 'New Feature') {
        urgLabel.innerHTML = 'Jelaskan Kebutuhan &amp; Manfaat Fitur Baru <span class="req">*</span>';
        urgInput.placeholder = 'Jelaskan usulan fitur baru yang diinginkan, tujuannya apa, dan bagaimana fitur ini mempermudah pekerjaan tim SMLONE...';
      } else {
        urgLabel.innerHTML = 'Jelaskan Kenapa Sangat Mendesak / Urgensi <span class="req">*</span>';
        urgInput.placeholder = 'Jelaskan alasan kenapa kendala ini mendesak dan dampaknya jika belum diselesaikan (contoh: Pendaftaran siswa baru terhambat, data rapor tidak muncul saat orang tua cek, dll)...';
      }
    }

    const priorityDescriptions = {
      'Darurat': 'Mudah dipahami ketika sistem benar-benar down.',
      'Tinggi': 'Masalah menghambat pekerjaan penting.',
      'Sedang': 'Masalah tidak terlalu mengganggu operasional.',
      'Rendah': 'Permintaan bantuan atau perbaikan yang tidak mendesak.'
    };

    function setPriority(level, btn) {
      selectedPriority = level;
      document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateBanner(level);
    }

    function toggleInfo(e, level) {
      e.stopPropagation(); // Jangan trigger klik tombol parent
      updateBanner(level);
    }

    function updateBanner(level) {
      const banner = document.getElementById('priorityBanner');
      const text = document.getElementById('priorityBannerText');
      text.innerHTML = '<strong>' + level + ':</strong> ' + (priorityDescriptions[level] || '');
      banner.style.display = 'flex';
    }

    function handleSheetUrlChange() {
      const url = document.getElementById('sheetUrl').value.trim();
      const statusText = document.getElementById('sheetStatusText');
      const titleGroup = document.getElementById('sheetTitleGroup');
      const titleInput = document.getElementById('sheetTitleInput');

      clearTimeout(sheetTimer);
      if (!url || !url.includes('docs.google.com/spreadsheets')) {
        statusText.style.display = 'none';
        titleGroup.style.display = 'none';
        titleInput.value = '';
        detectedSheetTitle = '';
        return;
      }

      statusText.style.display = 'block';
      statusText.textContent = 'Membaca judul sheet...';

      sheetTimer = setTimeout(async () => {
        try {
          const res = await fetch('/api/tickets/sheet-info?url=' + encodeURIComponent(url) + '&_t=' + Date.now());
          const json = await res.json();
          if (json.success && json.data) {
            detectedSheetTitle = json.data.fullTitle || json.data.title;
            titleInput.value = detectedSheetTitle;
            titleGroup.style.display = 'block';
            statusText.style.display = 'none';
          } else {
            statusText.textContent = json.message || 'Tidak dapat membaca judul Google Sheet.';
          }
        } catch (e) {
          statusText.textContent = 'Gagal membaca judul sheet.';
        }
      }, 300);
    }

    async function submitTicket(e) {
      e.preventDefault();
      const errorAlert = document.getElementById('errorAlert');
      errorAlert.style.display = 'none';

      const reporter = document.getElementById('reporter').value.trim();
      const divisi = document.getElementById('divisi').value;
      const sheetUrl = document.getElementById('sheetUrl').value.trim();
      const urgencyReason = document.getElementById('urgencyReason').value.trim();

      if (!reporter || !urgencyReason) {
        errorAlert.textContent = 'Mohon lengkapi Nama Pelapor dan Alasan Urgensi.';
        errorAlert.style.display = 'block';
        return;
      }

      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Mencatat Tiket...';

      const customTitle = document.getElementById('sheetTitleInput').value.trim();
      const finalSheetTitle = customTitle || detectedSheetTitle;

      // Judul tiket otomatis dari jenis pengajuan + judul sheet atau uraian
      const prefix = selectedType === 'New Feature' ? '[Fitur Baru] ' : '[Kendala] ';
      const ticketSummary = prefix + (finalSheetTitle 
        ? finalSheetTitle 
        : urgencyReason.substring(0, 75) + (urgencyReason.length > 75 ? '...' : ''));

      let fullDesc = 'Jenis Pengajuan: ' + selectedType + '\n';
      fullDesc += 'Nama Pelapor: ' + reporter + ' (' + divisi + ')\n\n';
      fullDesc += (selectedType === 'New Feature' ? 'Deskripsi Fitur Baru:\n' : 'Alasan Urgensi:\n') + urgencyReason + '\n\n';

      if (sheetUrl) {
        fullDesc += 'URL Google Sheet / Referensi:\n' + sheetUrl + '\n';
        if (finalSheetTitle) {
          fullDesc += 'Judul Sheet: ' + finalSheetTitle + '\n\n';
        } else {
          fullDesc += '\n';
        }
      }

      try {
        const res = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            summary: ticketSummary,
            description: fullDesc,
            module: selectedType === 'New Feature' ? 'New Feature' : (sheetUrl ? 'Google Sheet' : 'Operasional'),
            priority: selectedPriority,
            reporter: reporter + ' (' + divisi + ')'
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          document.getElementById('ticketForm').style.display = 'none';
          document.getElementById('ticketKeyDisplay').textContent = data.data?.key || 'SML-1';
          document.getElementById('successView').style.display = 'block';
        } else {
          throw new Error(data.message || 'Gagal mengirim tiket.');
        }
      } catch (err) {
        errorAlert.textContent = err.message || 'Terjadi kesalahan saat mengirim tiket.';
        errorAlert.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Tiket';
      }
    }

    function resetForm() {
      document.getElementById('ticketForm').reset();
      document.getElementById('sheetTitleBox').style.display = 'none';
      document.getElementById('ticketForm').style.display = 'block';
      document.getElementById('successView').style.display = 'none';
      document.getElementById('errorAlert').style.display = 'none';
    }
  </script>
</body>
</html>
  `);
});

// GET /api/tickets/sheet-info?url=... -> Ambil Judul & Tab Google Sheet secara otomatis
router.get('/sheet-info', async (req, res) => {
  try {
    let rawUrl = req.query.url;
    if (!rawUrl) {
      const idx = req.originalUrl.indexOf('url=');
      if (idx !== -1) {
        rawUrl = decodeURIComponent(req.originalUrl.substring(idx + 4));
      }
    }
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'URL Google Sheet wajib disertakan.' });
    }

    const sheetMatch = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!sheetMatch) {
      return res.status(400).json({ success: false, message: 'Format URL Google Sheet tidak valid.' });
    }

    const sheetId = sheetMatch[1];
    const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

    const KNOWN_SHEETS = {
      '1pdcdovqbk6ulce8uumdsz1rvicsvzk5lrr1akzaaa5y': 'Masterfiles Real Stage 26',
      '1ed60keq5gwemkzcuss2splw7ua4qruwhjykf_cclooi': 'Level 2 - Report Link',
      '1jmhlnw-dijcckk_rbhpbp61sqztmnkzyhpgxe_wlnlu': 'Master House Rank & Poin Bulanan',
      '1k1lwl_n6es0j71mn6zcd8wg2-pwr-ighdgm-_pfj8-8': 'Master Formulir & Slot Jadwal'
    };

    const KNOWN_TABS = {
      '550926742': 'TAF Generate',
      '2037120277': 'TAF Digital x RS',
      '1916949806': 'TAF Digital x RS',
      '264691834': 'Report Link',
      '1893475080': 'Level 6 Links',
      '154343977': 'House Rank'
    };

    let title = '';
    let html = '';
    const lowerId = sheetId.toLowerCase();

    // Prioritaskan nama resmi yang sudah terdaftar
    if (KNOWN_SHEETS[lowerId]) {
      title = KNOWN_SHEETS[lowerId];
    } else {
      try {
        const response = await fetch(fetchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.ok) {
          html = await response.text();
          const ogMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
          if (ogMatch && ogMatch[1]) {
            title = ogMatch[1].trim();
          } else {
            const titleMatch = html.match(/<title>([^<]+)<\/title>/);
            if (titleMatch && titleMatch[1]) {
              title = titleMatch[1].replace(/\s*-\s*Google\s*Sheets?.*$/i, '').trim();
            }
          }
        }
      } catch (e) {
        // Abaikan jika sheet private
      }
    }

    if (!title || title.startsWith('Google Sheet (')) {
      if (KNOWN_SHEETS[lowerId]) {
        title = KNOWN_SHEETS[lowerId];
      }
    }

    if (!title) {
      title = `Google Sheet (${sheetId.substring(0, 8)}...)`;
    }

    // Cek tab jika ada gid di url (periksa baik di query url maupun di entire req.originalUrl)
    const combinedUrlStr = `${rawUrl} ${req.originalUrl || ''}`;
    const gidMatch = combinedUrlStr.match(/(?:#|&|\?|%23|%26|%3F)gid(?:=|%3D)([0-9]+)/i);
    let tabName = '';
    if (gidMatch && gidMatch[1]) {
      const targetGid = gidMatch[1];
      if (KNOWN_TABS[targetGid]) {
        tabName = KNOWN_TABS[targetGid];
      } else {
        if (!html) {
          try {
            const r = await fetch(fetchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            if (r.ok) html = await r.text();
          } catch (e) {}
        }
        // Strategi 1: Pola Google Sheets internal sheet data
        const tabRegex = new RegExp(`"${targetGid}",\\s*\\d+,\\s*"([^"]+)"`);
        const tabM = html.match(tabRegex);
        if (tabM && tabM[1]) {
          tabName = tabM[1];
        } else {
          // Strategi 2: Pola kedua [targetGid, "Nama Tab"]
          const altRegex = new RegExp(`\\[\\s*${targetGid}\\s*,\\s*"([^"]+)"`);
          const altM = html.match(altRegex);
          if (altM && altM[1]) {
            tabName = altM[1];
          }
        }
      }
    } else {
      // Default jika tidak ada gid tapi URL sheet Real Stage
      if (lowerId === '1pdcdovqbk6ulce8uumdsz1rvicsvzk5lrr1akzaaa5y') {
        tabName = 'TAF Digital x RS';
      }
    }

    const fullTitle = tabName ? `${title} - ${tabName}` : title;

    return res.json({
      success: true,
      data: {
        sheetId,
        title,
        tabName: tabName || null,
        fullTitle
      }
    });
  } catch (err) {
    console.error('[TicketRoutes] Error fetching sheet info:', err.message);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat membaca sheet: ' + err.message });
  }
});

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

    const localStatuses = getLocalStatuses();

    const tickets = (data.issues || []).map((issue) => {
      const fields = issue.fields || {};
      const fullDesc = parseAdfText(fields.description);

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
      let priorityFormatted = 'Sedang';
      const prioLower = priorityName.toLowerCase();
      if (prioLower === 'highest' || prioLower.includes('critical') || prioLower.includes('darurat')) {
        priorityFormatted = 'Darurat';
      } else if (prioLower === 'high' || prioLower.includes('tinggi')) {
        priorityFormatted = 'Tinggi';
      } else if (prioLower === 'low' || prioLower === 'lowest' || prioLower.includes('rendah')) {
        priorityFormatted = 'Rendah';
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

      // Custom status mapping (Menunggu, Diproses, Selesai)
      // Prioritas 1: status yang diatur admin via dashboard
      // Prioritas 2: status Jira Cloud
      let finalStatus = 'Menunggu';
      if (localStatuses[issue.key]) {
        finalStatus = localStatuses[issue.key];
        // Normalisasi jika sebelumnya bernilai 'Antri'
        if (finalStatus.toLowerCase() === 'antri') {
          finalStatus = 'Menunggu';
        }
      } else {
        const rawJiraStatus = (fields.status?.name || '').toLowerCase();
        if (rawJiraStatus.includes('done') || rawJiraStatus.includes('selesai') || rawJiraStatus.includes('closed') || rawJiraStatus.includes('resolved')) {
          finalStatus = 'Selesai';
        } else if (rawJiraStatus.includes('progress') || rawJiraStatus.includes('in progress')) {
          finalStatus = 'Diproses';
        } else {
          finalStatus = 'Menunggu';
        }
      }

      const displayKey = getOrAssignSmlKey(issue.key);

      return {
        id: issue.id,
        key: displayKey,
        jiraKey: issue.key,
        summary: fields.summary,
        description: fullDesc,
        status: finalStatus,
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
    const pLow = String(priority).toLowerCase();
    if (pLow.includes('darurat') || pLow.includes('p1') || pLow.includes('critical')) {
      jiraPriority = 'Highest';
    } else if (pLow.includes('tinggi') || pLow.includes('p2') || pLow.includes('high')) {
      jiraPriority = 'High';
    } else if (pLow.includes('rendah') || pLow.includes('p4') || pLow.includes('low')) {
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

    const displayKey = getOrAssignSmlKey(issueKey);

    res.json({
      success: true,
      message: `Tiket berhasil dibuat (${displayKey})`,
      data: {
        id: issueData.id,
        key: displayKey,
        jiraKey: issueKey,
        summary: formattedSummary,
        description: formattedDescriptionText,
        status: 'Menunggu',
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

// PATCH /api/tickets/:key/status - Update ticket status (Menunggu, Diproses, Selesai)
router.patch('/:key/status', async (req, res) => {
  const { key } = req.params;
  const { status } = req.body;
  const jiraKey = resolveJiraKey(key);

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status wajib diisi' });
  }

  // Simpan status lokal (Menunggu, Diproses, Selesai) untuk key maupun jiraKey
  saveLocalStatus(key, status);
  if (jiraKey !== key) {
    saveLocalStatus(jiraKey, status);
  }

  // Sync opsional ke Jira Cloud jika memungkinkan
  try {
    const { host } = getJiraConfig();
    const auth = getAuthHeader();

    const transRes = await fetch(`${host}/rest/api/3/issue/${jiraKey}/transitions`, {
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    });

    if (transRes.ok) {
      const transData = await transRes.json();
      const transitions = transData.transitions || [];
      const targetLower = status.toLowerCase();

      let targetJiraName = '';
      if (targetLower === 'selesai') {
        targetJiraName = 'done';
      } else if (targetLower === 'diproses') {
        targetJiraName = 'in progress';
      } else if (targetLower === 'menunggu') {
        targetJiraName = 'to do';
      }

      const matched = transitions.find((t) => 
        t.name.toLowerCase() === targetLower || 
        (targetJiraName && t.name.toLowerCase().includes(targetJiraName))
      );

      if (matched) {
        await fetch(`${host}/rest/api/3/issue/${key}/transitions`, {
          method: 'POST',
          headers: {
            'Authorization': auth,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ transition: { id: matched.id } })
        });
      }
    }
  } catch (err) {
    console.warn('[TicketRoutes] Jira transition sync skipped:', err.message);
  }

  return res.json({
    success: true,
    message: `Status tiket ${key} berhasil diperbarui menjadi ${status}`,
    key,
    status
  });
});

// DELETE /api/tickets/:key - Delete ticket in Jira Cloud & local status
router.delete('/:key', async (req, res) => {
  const { key } = req.params;
  const jiraKey = resolveJiraKey(key);
  try {
    deleteLocalStatus(key);
    if (jiraKey !== key) {
      deleteLocalStatus(jiraKey);
    }

    const { host } = getJiraConfig();
    const auth = getAuthHeader();

    const delRes = await fetch(`${host}/rest/api/3/issue/${jiraKey}`, {
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
      message: `Tiket ${key} berhasil dihapus secara real-time`,
      key
    });
  } catch (err) {
    console.error('[TicketRoutes] Delete ticket error:', err);
    res.status(500).json({ success: false, message: err.message || 'Gagal menghapus tiket di Jira' });
  }
});

module.exports = router;
