// functions/api/greeting.js
export async function onRequestGet(context) {
  // This function runs when someone accesses /api/greeting using a GET request

  // Create a simple data object
  const data = {
    message: "Hello from your Cloudflare Pages Function!",
    timestamp: new Date().toISOString() // Add a timestamp to see it change
  };

  // Return the data as a JSON response
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
