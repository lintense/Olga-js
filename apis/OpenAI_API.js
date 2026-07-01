import BaseAPI from './BaseAPI.js';

export default class OpenAI_API extends BaseAPI {

    extractIISRules() {
        // This function contains the logic to extract IIS rules from the streaming response.
        // The implementation would depend on the specific format of the response and the rules.
        // For example, if the rules are included in a specific JSON structure, we would parse the stream for that structure and extract the rules accordingly.
        return `<rule name="OpenAI-Models-api" stopProcessing="true">
<match url=".*OpenAI-Models-api(.*)" />
<conditions>
    <add input="{HTTP_Authorization}" pattern="^Bearer\\s+(.+)$" />
    <add input="{API_KEYS:{C:1}}" pattern="(.+)" />
</conditions>
<serverVariables>
    <set name="HTTP_Authorization" value="Bearer {C:1}" />
</serverVariables>
<action type="Rewrite" url="https://api.openai.com/v1/chat/completions" appendQueryString="true" />
</rule>
<rule name="OpenAI-Models-api-tempkey" stopProcessing="true">
    <match url=".*OpenAI-Models-api-tempkey(.*)" />
    <action type="Rewrite" url="https://api.openai.com/v1/chat/completions" appendQueryString="true" />
</rule>
`
    }
    extractContent() {
        return /"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    }
    async generate({ prompt, chunkHandler, doneHandler, token, apiKey = null, temp, topP, maxOutput }) {
        this.metrics.lastTested = Date.now() // Mark the time of this generation attempt;
        const url = apiKey == null
            ? `./OpenAI-Models-${BaseAPI.SERVER_MANAGED_KEY}`
            : `./OpenAI-Models-${BaseAPI.BROWSER_MANAGED_KEY}`
        const headers = apiKey
            ? { Authorization: "Bearer " + apiKey }
            : { Authorization: "Bearer " + this.providerName + BaseAPI.API_KEY_SUFFIX }
        const payload = {
            "model": this.handlerName,
            "messages": [{ "role": "user", "content": prompt }],
            "temperature": temp,
            "top_p": topP,
            "max_tokens": maxOutput,
            "stream": true
        };
        //console.log(`Sending request to ${this.handlerName} with payload:`, prompt);
        return super.generate({ prompt, chunkHandler, doneHandler, token, url, payload, headers })
    }

}