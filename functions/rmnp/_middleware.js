export async function onRequest(context) {
  const { request, env } = context;

  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    }).filter(([k]) => k)
  );

  if (cookies.rmnp_auth) {
    const valid = await verifyToken(cookies.rmnp_auth, env.RMNP_PASSWORD);
    if (valid) return context.next();
  }

  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = formData.get('password');

    if (password === env.RMNP_PASSWORD) {
      const token = await generateToken(env.RMNP_PASSWORD);
      const isSecure = new URL(request.url).protocol === 'https:';
      const securePart = isSecure ? ' Secure;' : '';
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/rmnp',
          'Set-Cookie': `rmnp_auth=${token}; Path=/rmnp; HttpOnly;${securePart} SameSite=Strict; Max-Age=2592000`
        }
      });
    }
    return loginPage('Incorrect password. Try again.');
  }

  return loginPage();
}

async function generateToken(password) {
  const timestamp = Date.now().toString();
  const data = new TextEncoder().encode(password + ':' + timestamp);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${timestamp}.${hex}`;
}

async function verifyToken(token, password) {
  try {
    const [timestamp, hash] = token.split('.');
    if (!timestamp || !hash) return false;

    const age = Date.now() - parseInt(timestamp);
    if (age > 30 * 24 * 60 * 60 * 1000) return false;

    const data = new TextEncoder().encode(password + ':' + timestamp);
    const expected = await crypto.subtle.digest('SHA-256', data);
    const expectedHex = Array.from(new Uint8Array(expected)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hash === expectedHex;
  } catch {
    return false;
  }
}

function loginPage(error = '') {
  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RMNP Launch Pad</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#F0F0F0;background:#1a1a2e;background-image:url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q100 30 200 50 T400 50' fill='none' stroke='%23ffffff08' stroke-width='1'/%3E%3Cpath d='M0 100 Q100 80 200 100 T400 100' fill='none' stroke='%23ffffff06' stroke-width='1'/%3E%3Cpath d='M0 150 Q100 130 200 150 T400 150' fill='none' stroke='%23ffffff08' stroke-width='1'/%3E%3Cpath d='M0 200 Q100 180 200 200 T400 200' fill='none' stroke='%23ffffff06' stroke-width='1'/%3E%3Cpath d='M0 250 Q100 230 200 250 T400 250' fill='none' stroke='%23ffffff08' stroke-width='1'/%3E%3Cpath d='M0 300 Q100 280 200 300 T400 300' fill='none' stroke='%23ffffff06' stroke-width='1'/%3E%3Cpath d='M0 350 Q100 330 200 350 T400 350' fill='none' stroke='%23ffffff08' stroke-width='1'/%3E%3C/svg%3E")}
.card{background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:48px;max-width:400px;width:90%;text-align:center}
h1{font-size:24px;margin-bottom:8px;color:#E8751A}
p{color:#9A9488;margin-bottom:24px;font-size:14px}
.icon{font-size:48px;margin-bottom:16px}
input[type="password"]{width:100%;padding:14px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#F0F0F0;font-size:16px;margin-bottom:16px;outline:none;-webkit-appearance:none}
input[type="password"]:focus{border-color:#E8751A;box-shadow:0 0 0 2px rgba(232,117,26,0.2)}
button{width:100%;padding:14px;background:linear-gradient(135deg,#E8751A,#D4651A);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s;min-height:48px}
button:hover{box-shadow:0 4px 16px rgba(232,117,26,0.3);transform:translateY(-1px)}
.error{color:#ff6b6b;font-size:14px;margin-bottom:16px}
@media(max-width:640px){.card{padding:32px 24px;width:94%}h1{font-size:20px}p{font-size:13px}.icon{font-size:40px;margin-bottom:12px}}
</style>
</head>
<body>
<div class="card">
<div class="icon">&#127956;</div>
<h1>RMNP Launch Pad</h1>
<p>Enter the password to access the reservation helper</p>
${error ? '<div class="error">' + error + '</div>' : ''}
<form method="POST">
<input type="password" name="password" placeholder="Password" autofocus required>
<button type="submit">Enter</button>
</form>
</div>
</body>
</html>`, {
    status: error ? 401 : 200,
    headers: { 'Content-Type': 'text/html;charset=UTF-8' }
  });
}
