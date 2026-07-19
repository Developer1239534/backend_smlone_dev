async function test() {
  try {
    const response = await fetch('http://localhost:4000/api/webhook/level-1-cp-cleaned-trainee/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'smlone-n8n-secret-key-2026'
      },
      body: JSON.stringify({
        "row_number": 3,
        "ID": 20,
        "Name": "Nicholas"
      })
    });
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
