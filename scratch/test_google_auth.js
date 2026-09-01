const crypto = require('crypto');
const https = require('https');

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCtAdZxkwRowr5w
qTSkCijK8DukzoCnV7f9smYlGo5D3YEsKwvdaP9/GOjnZA4r0eDZBoxZGHOFO+5M
Ja44xGmP6K8apFJvYdcR1A1j0BCGh6sU/OxkES+CvyVEFYF73iqfNqOeaid3lqqX
I+xVVTKfw/Oe1yVYQYL+DeQBqIxXBhu/xa77UbyJ8HcxvsTxNpo6uYB6JMLCK8Ib
QIu+c4lUz1e5qkK2vUXo6Lk02kqOA+j1PyvPSjfN9vfEzQPGpZq8Ch5Cp3u08NlJ
PVpebddFvr5qZn9M8AkZHW9T0N5UIkVcmcWW9+eZFfQQ0CwX4AKRhVTFsVKdKWNh
CGz+ok3xAgMBAAECgf9foCRnoltNjFa27s+p2/OwOBi/f2SdGl8YWwMafxMjb8t2
HlTwjJisJ5iUTTmH/vnI+1WX6WvwuK9+Z1VlCytN387pauolpm656/t6sAZyVYq6
jxIaPWWFXyG6ACkRzjrAxfKqHQKzlxOzdqeqguz4YdbGdSSvI4bD5emhAQiREGZr
ysogz1cyOrrwKZu92JhRKnkrGjVNXJxoYd5h2lyulN/NpQPhFbMfOkesFCy+ne51
VAsZBuAXW1zRrP9Msytkfr2dHXehJ1pG/LE1RTIUyxMZU0CfD2p90SRq+pExNWaY
hwTvA0PtIUaec/OQP5MlDUdWVMY+YF6IfpSHuSkCgYEA23pf1EYEDBBWXVkuh7po
+5XqXRFc0FBztceFoKbENRkc+5F3u6hsO0nVNFf+tutL21QUqsw6kOvRaEO9NHEv
YZnvR6U3PxtYMk2JSxPH4yeDyc8+kc8PzmrNhQJWzx6h7Of2gYfkQU78WrUX6Hqh
crxMlJ3hk6lrZrUOwUe4f4UCgYEAycvVpJOnTPVnk6m39QUiCuZfWRSEU2iL4VLW
devdBXhoFOcIVxHBEXvttBUysc6ELD/nj56GM8lNcj0l2jvGybNyV8Zn8uKmQOOR
vYZrVEYNcaKS8E1d5nXOUQReC0f/uZnbJHfzoPjgPnLTRkxfyBx0l6ZBhdPO+E/0
Cb9pAn0CgYBazJjisAiymPux6NhYLKWMF+x6jllQkUgdlyrQWM3pjbcw2HCpgTct
nBEJc7IcKOIcHf/i3VUJaZYbxZJ8JKtOfKnCgTaG9CAbx3oaRle2wT1De2rOVdSb
OBJIibwyOeERqrGPyxGCd1PtjugSNNGgLwibn2mYdknJlvRAwBQzJQKBgQCDLstY
DdS4puAKkk5QLmIPC+v4EOpk/pXQiPV5+zbXk4q16+r0D0qffxzr8Mvf4wzxZym1
p6w+hiKenTm6QRndjZZLkWOJ9eV2UXow5u1m/5NFyBYVuXXNl8/jwx8P3mJT2b0o
XAI5JxFAB41pKcUqZbU10JLP2P23VuKiY5h0UQKBgH1wTgqwQzArsfA/La9hmPhA
D7CJn8S7E9W9F7fuKKmOVKeGZ15s7qVFpxx56Dj8uTnE9MYXwe6CI6sWRTogquzC
kcN9Lwnxy15N1JBQ4cxxMMG9lSX9JMqZS/xf39X8WUIhxxeIgcQGqrxhecJ77jOJ
GJHWZPNqKLvv1R6QArPm
-----END PRIVATE KEY-----`;

const serviceAccount = {
  "project_id": "n8n-smlone",
  "private_key_id": "8ba5e13919a7e39c7e9ccf525fa13722325ed621",
  "private_key": privateKey,
  "client_email": "robot-n8n@n8n-smlone.iam.gserviceaccount.com"
};

function base64url(str, encoding = 'utf8') {
  return Buffer.from(str, encoding).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function testGoogleAuth() {
  const header = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
  
  const now = Math.floor(Date.now() / 1000);
  const claim = JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://accounts.google.com/o/oauth2/token', // Try old token URL
    exp: now + 3600,
    iat: now
  });

  const payload = base64url(header) + '.' + base64url(claim);
  
  try {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(payload);
    const signature = sign.sign(serviceAccount.private_key, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = payload + '.' + signature;
    
    const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;
    
    const req = https.request({
      hostname: 'accounts.google.com', // Try accounts.google.com instead
      path: '/o/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${body}`);
      });
    });

    req.on('error', (e) => {
      console.error(`Request error: ${e.message}`);
    });

    req.write(postData);
    req.end();

  } catch (err) {
    console.error('Signature signing failed:', err.message);
  }
}

testGoogleAuth();
