const Ably = require('ably');

const key = '9xE97w.eZA9xg:1YhIFkNQ0qqAEKg7KIqmPbBprxIGa5L57KqOEAn2-eI';

async function test() {
  try {
    const ably = new Ably.Rest(key);
    const token = await ably.auth.createTokenRequest({ clientId: 'test-client' });
    console.log('✅ Success! Token request created:', token);
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

test();
