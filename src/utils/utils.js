const crypto = require('crypto-js');
const forge = require('node-forge');

export function encodebody(originalbody)
{

    console.log("Original Body:");
    console.log(originalbody);

    const gwocuSettingsString = localStorage.getItem('gwocu-setting');
    const gwocuSettings = gwocuSettingsString ? JSON.parse(gwocuSettingsString) : null;

    console.log("Settings");
    console.log(gwocuSettings);
    const gwoken = gwocuSettings.gwokenEnabled ;
    const E2EE = gwocuSettings.E2EEEnabled ; 
    const gwokutoken = gwocuSettings.gwokenToken ;






    // const gwoken = process.env.REACT_APP_GWOKEN ;
    // const E2EE = process.env.REACT_APP_E2EE ;    ;
    // const gwokutoken = process.env.REACT_APP_GWOKUTOKEN ;



    

    if (gwoken) // if gwoken calculation is necessary
    {
        // check if EE2E is necessary and if so add the public key of the admin module so the backend can respond with encryption
        if (E2EE)
            {
                originalbody.apiPublicKey = process.env.REACT_APP_PUBLIC_KEY;
            }
        
        console.log("GWOKUToken before calling calculatesignature");
        console.log(gwokutoken);
        const MySignature = CalculateSignature(gwokutoken, originalbody);
        originalbody.gwoken = MySignature;
    }

    if (E2EE)
    {
        var backendpublicKeyPem = process.env.REACT_APP_BACKEND_PUBLIC_KEY;
        var backendpublicKey = forge.pki.publicKeyFromPem(backendpublicKeyPem);

        /**** START Encrypt AES with assymetric RSA-OAEP key and set body ekey variable ****/

        var aesKey = forge.random.getBytesSync(16); // generate random 16 bits key

        var encryptedaesKey = backendpublicKey.encrypt (aesKey, 'RSA-OAEP');
        var encoded64encryptedaesKey = forge.util.encode64 (encryptedaesKey); 
        
        /**** END OF Encrypt AES key ****/

        
        /**** START Encrypt message with symetric AES key ****/
        // add the public key of the admin module so the backend can respond with encryption
        originalbody.apiPublicKey = process.env.REACT_APP_PUBLIC_KEY;

        var originalMessageString = JSON.stringify(originalbody);
        var cipher = forge.cipher.createCipher('AES-CBC', aesKey);
        cipher.start({iv: aesKey}); // use the same key as iv for simplicity
        cipher.update(forge.util.createBuffer(originalMessageString));
        cipher.finish();
        var encryptedMessage = cipher.output.getBytes(); // get encrypted message
        var ecoded64encryptedMessage = forge.util.encode64(encryptedMessage); // encode to 64 so it can be sent

        /**** END OF Encrypt message with symetric AES key ****/
        const myreturnbody =
        {
            ekey:encoded64encryptedaesKey,
            message:ecoded64encryptedMessage
        }
        console.log(myreturnbody);
        return myreturnbody;
    }
    else
    {
        return originalbody;
    }

}


function CalculateSignature(token,parameters)
{
    // calculate the hash value of the token
    console.log("GWOCU TOKEN on first line of CALCULATE SIGNATURE");
    console.log(token);
    console.log("PARAMETER FOR on first line CALCULATE SIGNATURE");
    console.log(parameters);

    
    // var ApiTokenHashvalue = CryptoJS.MD5(str_1 + str_2).toString();
    var ApiTokenHashvalue = crypto.MD5(token).toString();
    
    // order parameters alfabetically
    var SortedParams = sortObjByReverseKey(parameters);
    
    // Concatenate: add '&' between key and value pair and replace : for = 
    var MyString = '' ;
    for (const [key, value] of Object.entries(SortedParams)) {
        MyString += (`${key}=${value}&`);}

    //  add hash value of token at the and of the string
    MyString += ApiTokenHashvalue ;

    // create the verifySign

    const MySignature = crypto.MD5(MyString).toString();

    return MySignature;
    }

    
// algabetical sort helper function
    function sortObjByReverseKey(obj) 
    {
    return Object.keys(obj).sort(function (a, b) {
      return a.split("").reverse().join("").localeCompare(b.split("").reverse().join(""));
    }).reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
  }

  export function getDecodedBody(data) {
    const failure = "Decryption failed. API result unknown"
    if (typeof data === 'string')
    {
      return data;
    }
    else // data is an object
    {
      if (data.ekey) // server is sending encryption
        {
          const decryption = endToEndDecrypt(data); 
          if (!decryption[0])
          { return failure}
          else
          { 
            return decryption[1]
          }
        }  
      else // server is sending unencoded object
     {
        return data;
     }    
    }
  }


  function endToEndDecrypt(body) {

    // Get private key of frontend
    
    const frontendPrivateKey = process.env.REACT_APP_PRIVATE_KEY;
    
    // create a private key forge object
    
    const privateKey = forge.pki.privateKeyFromPem(frontendPrivateKey);
    
    // bring both key and message to 64 base
    
    var ekeydecodedfrom64 = forge.util.decode64(body.ekey)
    var messagedecodedfrom64 = forge.util.decode64(body.message);
    
    // We will first decrypt the key that was used to encrypt the message
    
    const decryptedAESkey = privateKey.decrypt(ekeydecodedfrom64, 'RSA-OAEP');
    
    // now we will decrypt the message
    
    var decipher = forge.cipher.createDecipher('AES-CBC', decryptedAESkey);
    decipher.start({iv: decryptedAESkey}); // use the same key as iv for simplicity
    decipher.update(forge.util.createBuffer(messagedecodedfrom64));
    decipher.finish();
    var decryptedData = decipher.output.getBytes();
    
    // Convert the decrypted data to a JSON object
    
    try {
      const data = JSON.parse(decryptedData);
      console.log("DYCRYPTED DATA");
      console.log(data);
      return [true, data];
    } 
    catch (error) {
      return [false,"none"]
    }
     
    
      };


      export function generatePythonCode(api, explorer, requestBodyFields) {
        // Generate Python code for making an API call using requests library
        const url = api.urlRoute;
        const method = api.method;
        const headers = api.headers.map(header => {
          const [key, value] = header.split(':');
          return `'${key.trim()}': '${value.trim()}'`;
        }).join(', ');
      
        const pythonCode = `
      import requests
    
      # API Name: ${api.name}
      # API Description: ${api.description}
      
      url_${api.name.replace(/\s/g, '')} = "${url}"
      method_${api.name.replace(/\s/g, '')} = "${method}"
      headers_${api.name.replace(/\s/g, '')} = {
          ${headers}
      }
      
      data_${api.name.replace(/\s/g, '')} = ${JSON.stringify(requestBodyFields, null, 4)}
      
      response = requests.request(method-${api.name.replace(/\s/g, '')}, url_${api.name.replace(/\s/g, '')}, headers=headers_${api.name.replace(/\s/g, '')}, json=data_${api.name.replace(/\s/g, '')})
      print(response.text)
      `;
      
        return pythonCode;
      }
      
    
    export function generateJavaScriptCode(api, explorer, requestBodyFields) {
        // Generate JavaScript code for making an API call using fetch
        console.log("API OBJECT");
          console.log(api);
        const url = api.urlRoute;
        const method = api.method;
        const headers = Object.fromEntries(api.headers.map(header => {
          const [key, value] = header.split(':');
          return [key.trim(), value.trim()];
        }));
      
        const javascriptCode = `
// API Name: ${api.name}
// API Description: ${api.description}
    
const url${api.name.replace(/\s/g, '')} = "${url}";
const method${api.name.replace(/\s/g, '')}= "${method}";
const headers${api.name.replace(/\s/g, '')} = ${JSON.stringify(headers, null, 4)};
const data${api.name.replace(/\s/g, '')} = ${JSON.stringify(requestBodyFields, null, 4)};
      
fetch(url${api.name.replace(/\s/g, '')}, {
method: method${api.name.replace(/\s/g, '')} ,
headers: headers${api.name.replace(/\s/g, '')},
body: JSON.stringify(data${api.name.replace(/\s/g, '')})
      })
        .then(response => response.json())
        .then(responseData => console.log(responseData))
        .catch(error => console.error(error));
      `;
      
      return javascriptCode;
}

export function convertToOpenAPI(apiObjects, title, titleDescription) {
  
  const openAPIObject = {
    openapi: '3.0.0', // Specify the OpenAPI version
    info: {
      title: title,
      description: titleDescription,
      version: '1.0.0',
    },
    paths: {},
  };

  apiObjects.forEach(apiDefinition => {
    const apiObject = {
      _id: apiDefinition._id || 'Default ID', // Set your default value here
      clientNr: apiDefinition.clientNr || 'Default Client Number', // Set your default value here
      name: apiDefinition.name || 'Default Name', // Set your default value here
      method: apiDefinition.method || 'GET', // Set your default value here, e.g., 'GET'
      description: apiDefinition.description || 'Default Description', // Set your default value here
      requestBodyType: apiDefinition.requestBodyType || 'JSON', // Set your default value here, e.g., 'JSON'
      responseBodyType: apiDefinition.responseBodyType || 'application/json', // Set your default value here
      parametersDescription: apiDefinition.parametersDescription || {}, // Set your default value here as an empty object
      urlRoute: apiDefinition.urlRoute || '/default-route', // Set your default value here, e.g., '/default-route'
    };

    // Define the request content type based on requestBodyType
    const contentType = apiObject.requestBodyType === 'JSON' ? 'application/json' : 'application/x-www-form-urlencoded';

    openAPIObject.paths[apiObject.urlRoute] = openAPIObject.paths[apiObject.urlRoute] || {};
    openAPIObject.paths[apiObject.urlRoute][apiObject.method.toLowerCase()] = {
      operationId: apiObject._id,
      summary: apiObject.description,
      requestBody: {
        content: {
          [contentType]: {
            schema: {
              type: 'object',
              properties: {},
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
              },
            },
          },
        },
      },
      parameters: [],
    };

    // Add request body properties and their types dynamically
    for (const key in apiDefinition.requestBody) {
      if (apiDefinition.requestBody.hasOwnProperty(key)) {
        const type = apiObject.parametersDescription[key] || 'string'; // Default to 'string' if the type is not defined
        const defaultValue = apiDefinition.requestBody[key];
        openAPIObject.paths[apiObject.urlRoute][apiObject.method.toLowerCase()].requestBody.content[contentType].schema.properties[key] = {
          type,
          default: defaultValue, // Use the OpenAPI 'default' keyword to specify default values
        };
      }
    }

    // Add request headers from apiDefinition.headers
    if (apiDefinition.headers && Array.isArray(apiDefinition.headers)) {
      apiDefinition.headers.forEach(header => {
        const [name, value] = header.split(': ');
        openAPIObject.paths[apiObject.urlRoute][apiObject.method.toLowerCase()].parameters.push({
          name, // Use the header name
          in: 'header',
          description: `Value of ${name} header`,
          required: true, // You can modify this based on your requirements
          schema: {
            type: 'string', // Assuming your headers contain string values
            default: value, // Use the OpenAPI 'default' keyword to specify default header values
          },
        });
      });
    }
  });

  return openAPIObject;
}


