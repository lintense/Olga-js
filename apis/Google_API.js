import BaseAPI from '../apis/BaseAPI.js';

export default class Google_API extends BaseAPI {

    extractIISRules() {
        // This function contains the logic to extract IIS rules from the streaming response.
        // The implementation would depend on the specific format of the response and the rules.
        // For example, if the rules are included in a specific JSON structure, we would parse the stream for that structure and extract the rules accordingly.
        return `<rule name="${this.providerName}-${SERVER_MANAGED_KEY}" stopProcessing="true">
    <match url=".*${this.providerName}-${SERVER_MANAGED_KEY}(.*)" />
    <action type="Rewrite" url="https://generativelanguage.googleapis.com/{R:1}?key={API_KEYS:${this.providerName}_KEY}" appendQueryString="true" />
</rule>
<rule name="${this.providerName}-${BROWSER_MANAGED_KEY}" stopProcessing="true">
    <match url=".*${this.providerName}-${BROWSER_MANAGED_KEY}/(.*)" />
    <action type="Rewrite" url="https://generativelanguage.googleapis.com/{R:1}?" appendQueryString="true" />
</rule>`
    }

    async generate({ prompt, chunkHandler, doneHandler, token, apiKey = null }) {
        this.metrics.lastTested = Date.now() // Mark the time of this generation attempt;
        const url = apiKey == null
            ? `./${this.providerName}-${BaseAPI.SERVER_MANAGED_KEY}/v1beta/models/${this.handlerName}:streamGenerateContent?`
            : `./${this.providerName}-${BaseAPI.BROWSER_MANAGED_KEY}/v1beta/models/${this.handlerName}:streamGenerateContent?key=${apiKey}`;
        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        };
        console.log(`Sending request to ${this.handlerName} with payload:`, prompt);
        return super.generate({ prompt, chunkHandler, doneHandler, token, url, payload })
    }

}