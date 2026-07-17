async function test() {
  try {
    const res = await fetch('https://api.smlone.cloud/api/webhook/registrations/push', {
      method: 'POST',
      headers: {
        'x-api-key': 'smlone-n8n-secret-key-2026',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ "Email Address": "test@test.com", "Full Name": "Test Name" }])
    });
    console.log('STATUS:', res.status);
    const text = await res.text();
    console.log('RESPONSE:', text);
  } catch (err) {
    console.error(err);
  }
}
test();
