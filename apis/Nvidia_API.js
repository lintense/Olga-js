import BaseAPI from '../apis/BaseAPI.js';

export default class Nvidia_API extends BaseAPI {

    extractIISRules() {
        // This function contains the logic to extract IIS rules from the streaming response.
        // The implementation would depend on the specific format of the response and the rules.
        // For example, if the rules are included in a specific JSON structure, we would parse the stream for that structure and extract the rules accordingly.
        return `<rule name="Nvidia-Models-api" stopProcessing="true">
<match url=".*Nvidia-Models-api(.*)" />
<conditions>
    <add input="{API_KEYS:${this.providerName}${BaseAPI.API_KEY_SUFFIX}}" pattern="(.+)" />
</conditions>
<serverVariables>
    <set name="HTTP_Authorization" value="Bearer {C:1}" />
</serverVariables>
<action type="Rewrite" url="https://integrate.api.nvidia.com/v1/chat/completions" appendQueryString="true" />
</rule>
<rule name="Nvidia-Models-api-tempkey" stopProcessing="true">
    <match url=".*Nvidia-Models-api-tempkey(.*)" />
    <action type="Rewrite" url="https://integrate.api.nvidia.com/v1/chat/completions" appendQueryString="true" />
</rule>
`
    }
    extractContent() {
        return /"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    }
    async generate({ prompt, chunkHandler, doneHandler, token, apiKey = null, temp, topP, maxOutput }) {
        this.metrics.lastTested = Date.now() // Mark the time of this generation attempt;
        const url = apiKey == null
            ? `./Nvidia-Models-${BaseAPI.SERVER_MANAGED_KEY}`
            : `./Nvidia-Models-${BaseAPI.BROWSER_MANAGED_KEY}`
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