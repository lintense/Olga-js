const DEF_HANDLER = (x) => { console.log(x) };
const NULL_HANDLER = (x) => { };

export class _Gemini_3_1_Flash_Lite_API {

    constructor() {
        this.handlerName = "gemini-3.1-flash-lite"
        this.lastTested = null
        this.status = false
    }
    extractIISRules() {
        // This function would contain the logic to extract IIS rules from the streaming response.
        // The implementation would depend on the specific format of the response and the rules.
        // For example, if the rules are included in a specific JSON structure, we would parse the stream for that structure and extract the rules accordingly.
        return `<rule name="${this.handlerName}-api" stopProcessing="true">
    <match url=".*${this.handlerName}-api/(.*)" />
    <action type="Rewrite" url="https://generativelanguage.googleapis.com/{R:1}?key=YOUR_KEY_HERE" appendQueryString="true" />
</rule>
<rule name="${this.handlerName}-api-tempkey" stopProcessing="true">
    <match url=".*${this.handlerName}-api-tempkey/(.*)" />
    <action type="Rewrite" url="https://generativelanguage.googleapis.com/{R:1}?" appendQueryString="true" />
</rule>`
    }

    async generate({ prompt, chunkHandler = NULL_HANDLER, doneHandler = DEF_HANDLER, token, apiKey = null }) {
        this.lastTested = Date.now() // Mark the time of this generation attempt;
        const url = apiKey == null
            ? `./${this.handlerName}-api/v1beta/models/gemini-3.5-flash:streamGenerateContent?`
            : `./${this.handlerName}-api-tempkey/v1beta/models/gemini-3.5-flash:streamGenerateContent?${this.keyParamName}=${apiKey}`;

        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        };

        try {
            console.log("Sending request to Gemini with payload:", prompt);
            // The browser thinks it's staying on 'https://local_project', so CORS is bypassed!
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate", // Prevents caching
                    "Pragma": "no-cache",                                   // For older HTTP/1.0 compatibility
                    "Expires": "0" // Proxies treat as immediately expired
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                this.status = false
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            console.log("Streaming response starting...");
            let fullOutput = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    this.status = true
                    token.out += fullOutput.length
                    doneHandler(fullOutput); // Call the done handler with the full output when streaming is complete   
                    break;
                }

                const chunkText = decoder.decode(value, { stream: true });
                const regex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
                let match;

                while ((match = regex.exec(chunkText)) !== null) {
                    const cleanText = match[1]
                        .replace(/\\n/g, '\n')
                        .replace(/\\t/g, '\t')
                        .replace(/\\"/g, '"');

                    fullOutput += cleanText;
                    chunkHandler(cleanText);
                }
            }

            console.log("...Streaming response ended");

        } catch (error) {
            this.status = false
            console.error("Error reading proxy stream:", error);
        }
    }

}

export const Gemini_3_1_Flash_Lite_API = new _Gemini_3_1_Flash_Lite_API();