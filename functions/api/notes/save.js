// functions/api/notes/save.js
export async function onRequestPost(context) {
    // This function runs when the frontend sends data here using POST

    // 1. Get the text notes sent from the frontend
    const noteContent = await context.request.text();
    console.log("Backend Save Function: Received notes -", noteContent.substring(0, 50) + "..."); // Log first part

    // 2. Get access to the KV store (make sure binding name matches)
    const kv = context.env.NOTES_KV;
    if (!kv) {
        console.error("Backend Save Function: NOTES_KV binding missing!");
        return new Response("Server setup error: KV binding missing.", { status: 500 });
    }

    // 3. Save the notes to KV using a simple, fixed key for now
    const noteKey = "my_main_note"; // We'll use the same key every time for this example
    try {
        await kv.put(noteKey, noteContent);
        console.log("Backend Save Function: Notes saved to KV with key:", noteKey);
        return new Response("Notes saved successfully!", { status: 200 });
    } catch (err) {
        console.error("Backend Save Function: Error saving to KV -", err);
        return new Response("Failed to save note.", { status: 500 });
    }
}
