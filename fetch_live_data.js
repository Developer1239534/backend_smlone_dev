async function fetchLive() {
  try {
    const res = await fetch('https://api.smlone.cloud/api/registrasi-cp');
    const json = await res.json();
    console.log('=== LIVE API CP DATA ===');
    console.log(JSON.stringify(json.data ? json.data.slice(0, 3) : json.slice(0, 3), null, 2));
  } catch (err) {
    console.error('Error fetching live:', err.message);
  }
}

fetchLive();
