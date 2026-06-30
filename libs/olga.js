import BaseAPI from '../apis/BaseAPI.js';
import Google_API from '../apis/Google_API.js';
import Nvidia_API from '../apis/Nvidia_API.js';
import MiniSort from '../libs//MiniSort.js';

export default class Olga {

    constructor() {
        this.models = []
        this.instances = []
        this.mini = new MiniSort(Instance.ACCESSORS)
        Object.freeze(this)
        this.initModels()
    }
    initModels() {
        // Explicit bindings easiest possible way to manage models and their always evolvingplans...

        new Instance(this,
            {
                name: "Gemini 3.1 Flash Lite", provider: "Google", quality: 310,
                card: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-1-flash-lite",
                api: new Google_API({ providerName: "Google", handlerName: "gemini-3.1-flash-lite" })
            },
            { name: "Level 1", tokenInputPrice: 0.25 / 1000000, tokenOutputPrice: 1.5 / 1000000, RPM: 4000, TPM: 4000000, RPD: 150000 })
        new Instance(this,
            {
                name: "Gemini 3.5 Flash", provider: "Google", quality: 350,
                card: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash",
                api: new Google_API({ providerName: "Google", handlerName: "gemini-3.5-flash" })
            },
            { name: "Level 1", tokenInputPrice: 1.5 / 1000000, tokenOutputPrice: 9 / 1000000, RPM: 1000, TPM: 2000000, RPD: 10000 })
        new Instance(this,
            {
                name: "Gemini 3.5 Flash", provider: "Google", quality: 350,
                card: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash",
                api: new Google_API({ providerName: "Google", handlerName: "gemini-3.5-flash" })
            },
            { name: "Free tier", RPM: 10, TPM: 250000, RPD: 1500 }),
            // https://build.nvidia.com/z-ai/glm-5.1
            new Instance(this,
                {
                    name: "GLM 5.1", provider: "Nvidia", quality: 350,
                    card: "https://build.nvidia.com/z-ai/glm-5.1/modelcard",
                    api: new Nvidia_API({ providerName: "Nvidia_GLM", handlerName: "z-ai/glm-5.1" })
                },
                { name: "Free tier", RPM: 4, TPM: 1000, RPD: 1000 })
    }
    sortInstances(selector) {
        if (Array.isArray(selector))
            return this.mini.process(this.instances, this.mini.parse(selector))
        else
            return this.mini.processList(this.instances, this.mini.parseList(selector))
    }
    static DEFAULT_SELECTOR = "Status=true, <TokenOutputPrice, <TokenInputPrice, >Quality";
    * generate({ instance = null, prompt, chunkHandler, doneHandler, apiKey = null }) {
        if (!prompt)
            throw new Error("Empty prompt!")

        // Aquire best instance based on quality and availability
        const instances = this.selectInstance(Olga.DEFAULT_SELECTOR)
        return instances[0].generate({ prompt, chunkHandler, doneHandler, apiKey })
    }
    test() {
        this.instances.forEach(instance => instance.test())
    }
    downloadIIS_Config() {
        const apis = {}
        this.instances.forEach(instance => { apis[instance.model.provider] = instance.model.api.extractIISRules() })

        let textContents = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
`
        for (const [key, value] of Object.entries(apis))
            textContents += value + "\n"

        textContents += `               </rules>
            <allowedServerVariables>
                <remove name="HTTP_Authorization" />
                <add name="HTTP_Authorization" />
            </allowedServerVariables>
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
    static ACCESSORS = {
        PlanName: plan => plan.name,
        MaxToken: plan => plan.maxToken,
        ResetTime: plan => plan.resetTime,
        TokenInputPrice: plan => plan.tokenInputPrice,
        TokenOutputPrice: plan => plan.tokenOutputPrice,
        RPM: plan => plan.RPM,
        TPM: plan => plan.TPM,
        RPD: plan => plan.RPD,
    }
}

class Model {
    constructor({ name, provider, quality, api, card }) {
        this.name = name;
        this.provider = provider
        this.quality = quality // a score of the model's output quality. This is a subjective measure based on benchmarks and user feedback.
        this.api = api
        this.card = card
        Object.freeze(this)
    }
    static ACCESSORS = {
        ModelName: model => model.name,
        Provider: model => model.provider,
        Quality: model => model.Quality,
    }
}
const remap = (obj, func) => Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, v => value(func(v))]))
class Instance {
    constructor(olga, model, plan) {
        this.model = model
        this.plan = plan
        this.name = `${model.name} (${plan.name})`

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
        this.model.api.metrics.status = false
        this.generate({ prompt: "Just respond the word ok no other text" })
    }
    static ACCESSORS = {
        ...remap(Model.ACCESSORS, x => instance => x(instance.model)),
        ...remap(Plan.ACCESSORS, x => instance => x(instance.plan)),
        ...remap(BaseAPI.ACCESSORS, x => instance => x(instance.model.api)),
    }
}


//window.OlgaAPI = new _Olga();
//export const Olga = window.OlgaAPI;