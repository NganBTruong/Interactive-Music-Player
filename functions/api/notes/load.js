// functions/api/notes/load.js
export async function onRequestGet(context) {
    // This function runs when the frontend asks for data using GET

    console.log("Backend Load Function: Request received.");

    // 1. Get access to the KV store
    const kv = context.env.NOTES_KV;
     if (!kv) {
        console.error("Backend Load Function: NOTES_KV binding missing!");
        return new Response("Server setup error: KV binding missing.", { status: 500 });
    }

    // 2. Try to get the notes using the same fixed key
    const noteKey = "my_main_note";
    try {
        const savedNote = await kv.get(noteKey);
        console.log("Backend Load Function: Retrieved from KV with key:", noteKey, "-", savedNote ? savedNote.substring(0, 50) + "..." : "null");

        if (savedNote === null) {
            // If nothing is saved yet, send back empty text
            return new Response("", { status: 200 });
        } else {
            // If notes were found, send them back
            return new Response(savedNote, { status: 200 });
        }
    } catch (err) {
        console.error("Backend Load Function: Error loading from KV -", err);
        return new Response("Failed to load note.", { status: 500 });
    }
}
