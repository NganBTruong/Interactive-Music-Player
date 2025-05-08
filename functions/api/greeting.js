// functions/api/greeting.js
export async function onRequestGet(context) {
  const data = {
    message: "Hello from your Cloudflare Pages Function!",
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
