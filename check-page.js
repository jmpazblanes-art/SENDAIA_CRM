
async function checkPage() {
    try {
        const response = await fetch('http://localhost:3001/dashboard/calls');
        const text = await response.text();
        console.log("Status:", response.status);
        if (text.includes("Fallo en Agentes de Voz")) {
            console.log("Found error page!");
            const errorMatch = text.match(/<code[^>]*>([^<]+)<\/code>/);
            if (errorMatch) {
                console.log("Error message from page:", errorMatch[1]);
            }
        } else if (text.includes("Agentes de Voz")) {
            console.log("Page rendered successfully.");
            if (text.includes("Sin resultados")) {
                console.log("But no data found.");
            }
        } else {
            console.log("Page content unexpected.");
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
checkPage();
