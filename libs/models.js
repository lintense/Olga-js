import Google_API from '../apis/Google_API.js';
import Nvidia_API from '../apis/Nvidia_API.js';
import OpenAI_API from '../apis/OpenAI_API.js';

export default function initModels(olga) {
    // Explicit bindings easiest possible way to manage models and their always evolvingplans...
    olga.addInstance(
        {
            name: "Gemini 3.1 Flash Lite", provider: "Google", quality: 310,
            card: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-1-flash-lite",
            api: new Google_API({ providerName: "Google", handlerName: "gemini-3.1-flash-lite" })
        },
        { name: "Level 1", tokenInputPrice: 0.25 / 1000000, tokenOutputPrice: 1.5 / 1000000, RPM: 4000, TPM: 4000000, RPD: 150000 })
    olga.addInstance(
        {
            name: "Gemini 3.5 Flash", provider: "Google", quality: 350,
            card: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash",
            api: new Google_API({ providerName: "Google", handlerName: "gemini-3.5-flash" })
        },
        { name: "Level 1", tokenInputPrice: 1.5 / 1000000, tokenOutputPrice: 9 / 1000000, RPM: 1000, TPM: 2000000, RPD: 10000 })
    olga.addInstance(
        {
            name: "Gemini 3.5 Flash", provider: "Google", quality: 350,
            card: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash",
            api: new Google_API({ providerName: "Google", handlerName: "gemini-3.5-flash" })
        },
        { name: "Free tier", RPM: 10, TPM: 250000, RPD: 1500 })
    olga.addInstance(
        {
            name: "GLM 5.1", provider: "Nvidia", quality: 350,
            card: "https://build.nvidia.com/z-ai/glm-5.1/modelcard",
            api: new Nvidia_API({ providerName: "Nvidia", handlerName: "z-ai/glm-5.1" })
        },
        { name: "Free tier", RPM: 4, TPM: 1000, RPD: 1000 })
    olga.addInstance(
        {
            name: "GPT 5 Nano", provider: "Open AI", quality: 200,
            card: "https://developers.openai.com/api/docs/models/gpt-5-nano",
            api: new OpenAI_API({ providerName: "Open_AI", handlerName: "gpt-5-nano" })
        },
        { name: "Tier 1", RPM: 500, TPM: 200000, RPD: 0, tokenInputPrice: 0.05 / 1000000, tokenOutputPrice: 0.4 / 1000000 })

    olga.addInstance(
        {
            name: "GPT 3.5 Turbo", provider: "Open AI", quality: 250,
            card: "https://developers.openai.com/api/docs/models/gpt-3.5-turbo",
            api: new OpenAI_API({ providerName: "Open_AI", handlerName: "gpt-3.5-turbo" })
        },
        { name: "Tier 1", RPM: 500, TPM: 200000, RPD: 10000, tokenInputPrice: 0.5 / 1000000, tokenOutputPrice: 1.5 / 1000000 })

    olga.addInstance(
        {
            name: "Qwen 3.5 122B A10B", provider: "Nvidia", quality: 250,
            card: "https://docs.api.nvidia.com/nim/reference/qwen-qwen3-5-122b-a10b",
            api: new Nvidia_API({ providerName: "Nvidia", handlerName: "qwen/qwen3.5-122b-a10b" })
        },
        { name: "Free tier", RPM: 500, TPM: 200000, RPD: 10000 })

    olga.addInstance(
        {
            name: "Deepseek v4 Flash", provider: "Nvidia", quality: 250,
            card: "https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash",
            api: new Nvidia_API({ providerName: "Nvidia", handlerName: "deepseek-ai/deepseek-v4-flash" })
        },
        { name: "Free tier", RPM: 500, TPM: 200000, RPD: 10000 })


}