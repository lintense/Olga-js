import { Gemini_3_5_Flash_API } from './apis/Gemini_3_5_Flash_API.js';
import { Gemini_3_1_Flash_Lite_API } from './apis/Gemini_3_1_Flash_Lite_API.js';

export default class Olga {

    constructor() {
        this.models = []
        this.instances = []
        Object.freeze(this)
        this.initModels()
    }
    initModels() {
        // Explicit bindings easiest possible way to manage models and their always evolvingplans...
        new Instance(this,
            { name: "Gemini 3.1 Flash Lite", provider: "Google", quality: 310, api: Gemini_3_1_Flash_Lite_API },
            { name: "Level 1", tokenInputPrice: 0.25 / 1000000, tokenOutputPrice: 1.5 / 1000000, RPM: 4000, TPM: 4000000, RPD: 150000 })
        new Instance(this,
            { name: "Gemini 3.5 Flash", provider: "Google", quality: 350, api: Gemini_3_5_Flash_API },
            { name: "Level 1", tokenInputPrice: 1.5 / 1000000, tokenOutputPrice: 9 / 1000000, RPM: 1000, TPM: 2000000, RPD: 10000 })
        new Instance(this,
            { name: "Gemini 3.5 Flash", provider: "Google", quality: 350, api: Gemini_3_5_Flash_API },
            { name: "Free tier", RPM: 10, TPM: 250000, RPD: 1500 })
    }
    * generate({ prompt, chunkHandler, doneHandler, quality = 0, provider = null, apiKey = null }) {
        // Aquire best instance based on quality and availability
        const inst = this.instances.filter(instance => instance.model.provider == provider && instance.model.quality >= quality)[0]
        //.sort((a, b) => b.model.quality - a.model.quality) // Sort by quality descending
        //.filter(instance => instance.quality >= quality) // Filter out instances that have no remaining RPM
        return inst.generate({ prompt, chunkHandler, doneHandler, apiKey })
    }
    list() {
        return this.instances
    }
    test() {
        this.instances.forEach(instance => instance.test())
    }
    downloadIIS_Config() {
        const apis = {}
        this.instances.forEach(instance => { apis[instance.model.api.handlerName] = instance.model.api.extractIISRules() })

        let textContents = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
`
        for (const [key, value] of Object.entries(apis))
            textContents += value + "\n"

        textContents += `               </rules>
        </rewrite>
    </system.webServer>
</configuration>`
        const filename = "web.config"

        // 1. Create a Blob object from your string data
        const blob = new Blob([textContents], { type: 'text/plain;charset=utf-8' });

        // 2. Generate a temporary localized URL pointing to the Blob
        const blobUrl = URL.createObjectURL(blob);

        // 3. Create a hidden anchor element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename; // Sets the default saved file name
        link.style.display = 'none';

        // 4. Append to DOM, trigger click to prompt download, then clean up
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 5. Release memory allocation once the download starts
        URL.revokeObjectURL(blobUrl);
    }
}

class Plan {
    constructor({ name, maxToken, resetTime, tokenInputPrice = 0, tokenOutputPrice = 0, RPM, TPM, RPD }) {

        this.name = name;
        this.maxToken = maxToken;
        this.resetTime = resetTime;
        this.tokenInputPrice = tokenInputPrice;
        this.tokenOutputPrice = tokenOutputPrice;

        this.RPM = RPM // Request per minute
        this.TPM = TPM // Token per minute
        this.RPD = RPD // Request per day

        Object.freeze(this)
    }
}

class Model {
    constructor({ name, provider, quality, api }) {
        this.name = name;
        this.provider = provider
        this.quality = quality // a score of the model's output quality. This is a subjective measure based on benchmarks and user feedback.
        this.api = api
        Object.freeze(this)
    }
}

class Instance {
    constructor(olga, model, plan) {
        this.model = model
        this.plan = plan

        // Freeze identity attributes to prevent changes after initialization, ensuring immutability of the instance's core properties.
        Object.defineProperty(this, 'model', { value: model, writable: false, configurable: false, enumerable: true });
        Object.defineProperty(this, 'plan', { value: plan, writable: false, configurable: false, enumerable: true });

        this.tokenCount = [] // [{ts, in, out}]
        this.runningBill = 0

        olga.instances.push(this)
    }
    generate({ prompt, chunkHandler, doneHandler, apiKey }) {
        const token = { in: prompt.length, out: 0, ts: Date.now() }
        const out = this.model.api.generate({ prompt, chunkHandler, doneHandler, apiKey, token })
        // TODO compute metrics here!!!
        this.tokenCount.push(token)
        this.runningBill += token.in * this.plan.tokenInputPrice + token.out * this.plan.tokenOutputPrice
    }
    test() {
        if (!this.model.api.lastTested || Date.now() - this.model.api.lastTested > 5 * 60 * 1000) {
            // Just test the connection and streaming, not the content. We want to bypass any caching
            //const self = this
            this.generate({ prompt: "Just respond the word ok no other text" })
        }
    }
}

//window.OlgaAPI = new _Olga();
//export const Olga = window.OlgaAPI;