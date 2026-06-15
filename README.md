# Online LLM Generic Adapter (Olga.js)

![image](./img/carousel-horses-1551367820tSF.jpg)

Olga thrives to be the simplest LLM adpater you can hope for and yet its unique features will make it quickly indispensable. In a word, Olga does not tell you what to do or how to do it!

What she do:
- All server are accessed through the same common interface
- Support for text only generator for now
- API Keys can be manage by the web server and/or simultaneously by your application
- All server requests are metered

What she does not do:
- No pre/post processsing
- No system/assistant/user prompt
- No dependencies

### To configure Olga on Windows
- First, you will need to add the URL Rewriting features into IIS.
- Update the olga/web.config file to include your API_KEYS (or your ALIASES)
- Add a `<location/>` block in your main site to alow children sites to have their own config
```
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <location path="." inheritInChildApplications="true" overrideMode="Allow">
        <system.webServer>
        ...
        </system.webServer>
    </location>
</configuration> 
```

## Interface

To generate new content from any available LLM

```
const olga = new Olga();
olga.generate({
    prompt: "Just respond the word ok no other text", 
    doneHandler: (x) => console.log(x),
});
```
Optional parameters:
- `Provider` : Which provider you want to call, default = any
- `Key` : The end user API key (require Provider), default provided by IIS
- `Quality` : The minimum level of quality, default = 0
- `Temperature` : *TO BE IMPLEMENTED*

### Testing the APIs
Test the connection and streaming, not the content.
```
const olga = new Olga();
olga.test()
```

## Advanced stuff
### Managing instances
Instances are used to keep track of all interactions with the LLM servers.

It is possible to provide a handler to be called after every successfull requested.
This handler should be used to manage the instance internal statistics.
Do this only if you want to update the instance default behavior.
```
olga.setHandler( (instance) => {...} )
```
Some management strategy are provided for convenience.
The default strategy is ```Olga.CHEAPEST_FIRST```

### Adding new server API
New generator APIs and their associated plan are always welcome.

Steps to create a new API:
- Create a new API class file under ___olga/apis/___ (use any existing one as a template)
- Add the import line on top of the ___olga/olga.js___ file
- Add the related instances ```new Instance({model, plan})``` into the ```olga.initModels()``` method
- Call ```olga.downloadIIS_Config()``` to refresh the ___olga/web.config___ file

Note that each combination of model-plan is a different instance.

## Be carefull with your key management
Never write your API Keys in plain code, it could inatvertently end up on a public Github folder...


---


https://aistudio.google.com/

Les limites de débit sont généralement mesurées selon trois dimensions :

Requêtes par minute (RPM)
Jetons par minute (entrée) (TPM)
Requêtes par jour (RPD) Les quotas de RPD (requêtes par jour) sont réinitialisés à minuit (heure du Pacifique).

Les limites varient en fonction du modèle spécifique utilisé, et certaines limites ne s'appliquent qu'à certains modèles. Par exemple, les images par minute (IPM) ne sont calculées que pour les modèles capables de générer des images (Nano Banana), mais sont conceptuellement similaires aux TPM. D'autres modèles peuvent avoir une limite de jetons par jour (TPD).

[!CAUTION] API Key Security: Avoid exposing API keys in client-side code. Use server-side implementations in production environments.

Gemini 3.5 Flash
RPM 1000
TPM 2000000
RPD 10000

price 1.5/10000000

Gemini 2.5 Flash
RPM 1000
TPM 1000000
RPD 10000

Gemini 2 Flash
RPM 2000
TPM 4000000
RPD infinity

Gemini 2 Flash Lite
RPM 4000
TPM 4000000
RPD infinity

Gemini 3.1 Flash Lite
RPM 4000
TPM 4000000
RPD 150000

It just send your prompt to the LLM and returns you the answer.

The end-user is responsible to provide its API-Key which allows browser applications without a connected server.

You do not need to install anything
You can easily create and contribute new model adapters


Windows version:
- Remote LLM servers and their associated keys are stored into IIS

Upon request, Olga will upload a web.config file that you will need to:
- Add your API Keys into
- Merge into your already existing web.config that sits into your Website Root Folder

Olga does not manage your API Keys
