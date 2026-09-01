const { google } = require('googleapis');

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
  "type": "service_account",
  "project_id": "n8n-smlone",
  "private_key_id": "8ba5e13919a7e39c7e9ccf525fa13722325ed621",
  "private_key": privateKey,
  "client_email": "robot-n8n@n8n-smlone.iam.gserviceaccount.com"
};

async function main() {
  try {
    const auth = google.auth.fromJSON(serviceAccount);
    auth.scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    const token = await auth.getAccessToken();
    console.log('Google Auth from JSON succeeded!');
    console.log('Token fetched successfully:', token.token ? 'YES' : 'NO');
  } catch (err) {
    console.error('Google Auth failed:', err.message);
  }
}

main();
