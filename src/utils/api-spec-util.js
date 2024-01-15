const crypto = require('crypto-js');
const forge = require('node-forge');
import yaml from 'js-yaml';

export function HeadersGlobalAdd(apiHeaders, yamlObject) {
  const globalParameters = yamlObject['Global-Parameters-Header'];

  if (!globalParameters || (globalParameters.enable ==='no') || !globalParameters.parameters || Object.keys(globalParameters.parameters).length === 0) {
    // No parameters specified, return the original apiHeaders
    return apiHeaders;
  }

  if (globalParameters.overwrite && globalParameters.overwrite.toLowerCase() === 'yes') {
    // Overwrite specified parameters in apiHeaders
    for (const param in globalParameters.parameters) {
      if (apiHeaders.hasOwnProperty(param)) {
        apiHeaders[param] = globalParameters.parameters[param];
      }
    }
  }

  // Add missing parameters to apiHeaders
  for (const param in globalParameters.parameters) {
    if (!apiHeaders.hasOwnProperty(param)) {
      apiHeaders[param] = globalParameters.parameters[param];
    }
  }

  return apiHeaders;
}

export function addAuthToHeaders(myheadersWithGlobals,yamlObject )
  {
    const authenticationType =  yamlObject['Authentication-Type'];

    switch (authenticationType) {
      case "No-Authentication":
        return myheadersWithGlobals;
      case "Digital-Signature":
        return myheadersWithGlobals;
      case "Basic-Authentication":
        return myheadersWithGlobals;
      case "ApiKey":
        return myheadersWithGlobals;
      default:
        return myheadersWithGlobals;
    }
  }

  export function addAuthToRequestBody(myRequestBodyWithGlobals,yamlObject )
  {
    const authenticationType =  yamlObject['Authentication-Type'];

    switch (authenticationType) {
      case "No-Authentication":
        return myRequestBodyWithGlobals;
      case "Digital-Signature":
        // get properties for the digital signature
        const DigitalSignature = yamlObject['Digital-Signature'] ;
        // parameters and result of the function
        const token = DigitalSignature.token ;

        const functionString = DigitalSignature.calculationFunction
        const parameterName = DigitalSignature.parameterName
        // remove the destination and signature parameter from the body if it is present 
        console.log("PARAMETER NAME");
        console.log(parameterName); 
        console.log("BODY BEFORE DELETE OF SIGNATURE");
        console.log(myRequestBodyWithGlobals);

        delete myRequestBodyWithGlobals["destination"] ;
        delete myRequestBodyWithGlobals[parameterName] ;
        
        console.log("BODY AFTER DELETE OF SIGNATURE");
        console.log(myRequestBodyWithGlobals);

        
        const calculationFunction = new Function("token, parameters,crypto",functionString);
        const mydigitalSignature = calculationFunction(token,myRequestBodyWithGlobals,crypto);
        console.log("DIGITAL SIGNATURE");
        console.log(mydigitalSignature);
        myRequestBodyWithGlobals[parameterName] = mydigitalSignature ;
        return myRequestBodyWithGlobals;
      case "Basic-Authentication":
        return myRequestBodyWithGlobals;
      case "ApiKey":
        return myRequestBodyWithGlobals;
      default:
        return myRequestBodyWithGlobals;
    }
  }

  function isFunctionParam(inputString) {
    // Check if the inputString contains the word "function"
    return inputString.includes("{");
}

  export function requestBodyGlobalAdd (apiRequestBody, yamlObject) {
    const globalParameters = yamlObject['Global-Parameters-RequestBody'];
  
    if (!globalParameters || (globalParameters.enable ==='no') || !globalParameters.parameters || Object.keys(globalParameters.parameters).length === 0) {
      // No parameters specified, return the original apiHeaders
      return apiRequestBody;
    }
  
    if (globalParameters.overwrite && globalParameters.overwrite.toLowerCase() === 'yes') {
      // Overwrite specified parameters in api Request Body
      for (const param in globalParameters.parameters) {
        if (apiRequestBody.hasOwnProperty(param)) {
          // first check if it is a function or regular value parameter
          const paramValue = globalParameters.parameters[param];

          if (isFunctionParam(String(paramValue)))
          {
              // it is a function. Calll the function to return the value
              console.log ("function found")
              console.log(String(paramValue));
              const functionString = String(paramValue);
              const calculationFunction = new Function(functionString);
              const myparamvalue = calculationFunction();
              console.log("FUNCTION VALUE");
              console.log(myparamvalue);
              apiRequestBody[param] = myparamvalue;
          }
          else
          {
            //not a function. use value
            apiRequestBody[param] = globalParameters.parameters[param];
          }
            
        }
      }
    }
  
    // Add missing parameters to body
    for (const param in globalParameters.parameters) {
      if (!apiRequestBody.hasOwnProperty(param)) {
        apiRequestBody[param] = globalParameters.parameters[param];
      }
    }
  
    return apiRequestBody;
  }

  export function parseApiHeaders(api) {
    return api.headers.reduce((acc, header) => {
      const [key, value] = header.split(':');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});
  }

  export function getConfiguration(explorerObject) {
    return yaml.load(explorerObject.yaml); 
  }

  export function isValidConfiguration(explorerObject) {
    try {
      // Try to parse the YAML string
      yaml.load(explorerObject.yaml);
      // If parsing succeeds, return true
      return true;
    } 
    catch (error) {
      // If an error occurs during parsing, return false
      return false;
    }
  };

  export function makeCurlComponentFromApi(api,explorer) 
  {
    // Construct the curl statement
    const yamlObject = getConfiguration(explorer)
    const apiType = api.method;
    const endpoint = api.urlRoute;

    const apiHeaders = parseApiHeaders(api);
    const Globalheaders = HeadersGlobalAdd(apiHeaders, yamlObject);
    const headers = addAuthToHeaders(Globalheaders,yamlObject);

    const globalRequestBody = requestBodyGlobalAdd(api.requestBody,yamlObject );
    const requestBody = addAuthToRequestBody(globalRequestBody,yamlObject);

    const stringifiedHeaders = JSON.stringify(headers).replace(/"/g, "'"); // Adjust as needed
    const stringifiedRequestBody = JSON.stringify(requestBody).replace(/"/g, "'"); // Adjust as needed


    const curlStatement = `curl -X ${apiType.toUpperCase()} ${endpoint} -H '${stringifiedHeaders}' -d '${stringifiedRequestBody}'`;
    console.log("CURL COMPONENT C");
    console.log(curlStatement);
    return (
      <div>
        {curlStatement}
      </div>
    );
  };

  export function makeCurlComponentFromApiExecutionResult(api,explorer) 
  {
    // Construct the curl statement
    const yamlObject = getConfiguration(explorer)
    const apiType = api.method;
    const endpoint = api.urlRoute;

    const apiHeaders = parseApiHeaders(api);
    const Globalheaders = HeadersGlobalAdd(apiHeaders, yamlObject);
    const headers = addAuthToHeaders(Globalheaders,yamlObject);

    const globalRequestBody = requestBodyGlobalAdd(api.requestBody,yamlObject );
    const requestBody = addAuthToRequestBody(globalRequestBody,yamlObject);

    const curlStatement = "success";
    return (
      <div>
        <pre>{curlStatement}</pre>
      </div>
    );
  };

  
  