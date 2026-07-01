export default class BaseAPI {

    static DEF_HANDLER = (x) => { console.log(x) };
    static NULL_HANDLER = (x) => { };
    static SERVER_MANAGED_KEY = "api"
    static BROWSER_MANAGED_KEY = "api-tempkey"
    static API_KEY_SUFFIX = "_KEY"

    constructor({ providerName, handlerName }) {
        this.providerName = providerName
        this.handlerName = handlerName
        this.metrics = { lastTested: null, ping: null, speed: null, status: 0, statusText: "Not tested yet" }
        Object.freeze(this)
    }
    // This function contains the logic to extract IIS rules from the streaming response.
    // The implementation would depend on the specific format of the response and the rules.
    // For example, if the rules are included in a specific JSON structure, we would parse the stream for that structure and extract the rules accordingly.
    extractIISRules() {
        throw new Error("To be implemented by subclass")
    }
    extractContent() {
        throw new Error("To be implemented by subclass")
    }
    async generate({ chunkHandler = BaseAPI.NULL_HANDLER, doneHandler = BaseAPI.DEF_HANDLER, token, url, payload, headers = {} }) {
        this.metrics.lastTested = Date.now() // Mark the time of this generation attempt;
        console.log(`Sending request to ${this.handlerName} with prompt: ${prompt}`);
        const t1 = performance.now()

        try {

            // The browser thinks it's staying on 'https://local_project', so CORS is bypassed!
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    ...headers,
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache, no-store, must-revalidate", // Prevents caching
                    "Pragma": "no-cache",                                   // For older HTTP/1.0 compatibility
                    "Expires": "0" // Proxies treat as immediately expired
                },
                body: JSON.stringify(payload)
            });

            this.metrics.status = response.status
            this.metrics.statusText = BaseAPI.HTTP_CODE_TEXT[response.status] || response.statusText
            const pingTime = performance.now() - t1
            this.metrics.ping = !this.metrics.ping ? pingTime : (this.metrics.ping * 2 + pingTime) / 3 // Moving average ping in ms
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            console.log(`Streaming response from ${this.handlerName} starting ...`);
            let fullOutput = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    token.out += fullOutput.length
                    doneHandler(fullOutput); // Call the done handler with the full output when streaming is complete
                    const responseTime = performance.now() - pingTime - t1
                    this.metrics.speed = !this.metrics.speed ? responseTime / token.out : (this.metrics.speed * 2 + responseTime / token.out) / 3 // Moving average speed in chars per ms
                    break;
                }

                const chunkText = decoder.decode(value, { stream: true });
                //const regex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
                const regex = this.extractContent()
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
            this.metrics.status = 500
            console.error("Error reading proxy stream:", error);
        }
    }
    static ACCESSORS = {
        LastTested: (api => api.metrics.lastTested),
        Ping: (api => api.metrics.ping),
        Speed: (api => api.metrics.speed),
        Status: (api => api.metrics.status),
    }
    static HTTP_CODE_TEXT = {
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        207: 'Multi-Status',
        208: 'Already Reported',
        226: 'IM Used',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Payload Too Large',
        414: 'URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Range Not Satisfiable',
        417: 'Expectation Failed',
        421: 'Misdirected Request',
        422: 'Unprocessable Entity',
        423: 'Locked',
        424: 'Failed Dependency',
        426: 'Upgrade Required',
        428: 'Precondition Required',
        429: 'Too Many Requests',
        431: 'Request Header Fields Too Large',
        451: 'Unavailable For Legal Reasons',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported',
        506: 'Variant Also Negotiates',
        507: 'Insufficient Storage',
        508: 'Loop Detected',
        510: 'Not Extended',
        511: 'Network Authentication Required'
    };
}