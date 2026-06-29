import BaseAPI from '../apis/BaseAPI.js';

export default class Nvidia_API extends BaseAPI {

    extractIISRules() {
        // This function contains the logic to extract IIS rules from the streaming response.
        // The implementation would depend on the specific format of the response and the rules.
        // For example, if the rules are included in a specific JSON structure, we would parse the stream for that structure and extract the rules accordingly.
        return ``
    }

    async generate({ prompt, chunkHandler, doneHandler, token, apiKey = null }) {
        this.metrics.lastTested = Date.now() // Mark the time of this generation attempt;
        const url = `./${this.providerName}-${BaseAPI.SERVER_MANAGED_KEY}`
        /*apiKey == null
            ? `./${this.providerName}-${BaseAPI.SERVER_MANAGED_KEY}/${this.handlerName}:streamGenerateContent?`
            : `./${this.providerName}-${BaseAPI.BROWSER_MANAGED_KEY}/${this.handlerName}:streamGenerateContent?key=${apiKey}`;*/
        const payload = {
            "model": "z-ai/glm-5.1",
            "messages": [{ "role": "user", "content": prompt }],
            "temperature": 1,
            "top_p": 1,
            "max_tokens": 16384,
            "stream": true
        };
        //console.log(`Sending request to ${this.handlerName} with payload:`, prompt);
        return this.base_generate({ prompt, chunkHandler, doneHandler, token, url, payload })
    }

    async base_generate({ chunkHandler = BaseAPI.NULL_HANDLER, doneHandler = BaseAPI.DEF_HANDLER, token, url, payload, prompt }) {
        this.metrics.lastTested = Date.now() // Mark the time of this generation attempt;
        console.log(`Sending request to ${this.handlerName} with prompt: ${prompt}`);
        const t1 = performance.now()

        try {

            // The browser thinks it's staying on 'https://local_project', so CORS is bypassed!
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + this.providerName + "_KEY"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                this.metrics.status = false
                //throw new Error(`HTTP error! status: ${response.status}`);
            }

            const pingTime = performance.now() - t1
            this.metrics.ping = !this.metrics.ping ? pingTime : (this.metrics.ping * 2 + pingTime) / 3 // Moving average ping in ms
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            console.log(`Streaming response from ${this.handlerName} starting ...`);
            let fullOutput = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    this.metrics.status = true
                    token.out += fullOutput.length
                    doneHandler(fullOutput); // Call the done handler with the full output when streaming is complete
                    const responseTime = performance.now() - pingTime - t1
                    this.metrics.speed = !this.metrics.speed ? responseTime / token.out : (this.metrics.speed * 2 + responseTime / token.out) / 3 // Moving average speed in chars per ms
                    break;
                }

                const chunkText = decoder.decode(value, { stream: true });
                response.ok || console.log(chunkText)
                const regex = /"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
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

            console.log(`...Streaming response from ${this.handlerName} ended`);

        } catch (error) {
            this.metrics.status = false
            console.error("Error reading proxy stream:", error);
        }
    }




}