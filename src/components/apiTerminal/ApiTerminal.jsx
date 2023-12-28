
import React, { useState, useEffect } from "react"
import './apiTerminal.css'; // Import your CSS file here
import axios from "axios";
import yaml from 'js-yaml';
import crypto from 'crypto-js';

const ApiTerminal = ({ clientNr, explorerId, productName, workflowName, taskId,apiName }) => {
  const [gwoken, setGwoken] = useState('saasasasas');
  const [chatbotKey, setChatbotKey] = useState('chatbot199');
  const [username, setUsername] = useState('Rodolfo Dominguez');
  const [response, setResponse] = useState('');
  const [api, setApi] = useState([]);
  const [explorer, setExplorer] = useState([]);
  const [requestBodyFields, setRequestBodyFields] = useState({});

  console.log("in api terminal");
  console.log(clientNr);
  console.log(apiName);

  const handleRequestBodyChange = (field, value) => {
    // Update the state with the new value for the specified field
    setRequestBodyFields((prevFields) => ({
      ...prevFields,
      [field]: value,
    }));
  };

  useEffect(() => {
    // Fetch the initial products using an API call
    // Replace this with your actual API endpoint
    fetchApi();
  }, [clientNr,explorerId,apiName]);

  const fetchApi = async () => {
    
    try {
      const myApibody = 
      {
        clientNr: clientNr,
        name: apiName
      }
      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/api/query", myApibody);
      const myApi = response.data;
      setApi(myApi);

      const myExplorerbody = 
      {
        clientNr: clientNr,
        explorerId: explorerId
      }
      const Eresponse = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/explorer/query", myExplorerbody);
      const myExplorer = Eresponse.data;
      setExplorer(myExplorer);

      if (myApi.requestBody) {
        const initialRequestBodyFields = { ...myApi.requestBody };
        setRequestBodyFields(initialRequestBodyFields);
      }


    } catch (error) {
      // Handle any errors
      console.error(error);
    }
  };
  
  const isStringValidYAML = (yamlString) => {
    try {
      // Try to parse the YAML string
      yaml.load(yamlString);
      // If parsing succeeds, return true
      return true;
    } catch (error) {
      // If an error occurs during parsing, return false
      return false;
    }
  };

  function HeadersGlobalAdd(apiHeaders, yamlObject) {
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

  function addAuthToHeaders(myheadersWithGlobals,yamlObject )
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

  function addAuthToRequestBody(myRequestBodyWithGlobals,yamlObject )
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
        // remove the signature parameter from the body if it is present  
        delete myRequestBodyWithGlobals[parameterName] ;
        console.log("BODY BEFORE GOING INTO SIGNATURE");
        console.log(myRequestBodyWithGlobals);

        
        let calculationFunction = new Function("token, parameters,crypto",functionString);
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

  function requestBodyGlobalAdd (apiRequestBody, yamlObject) {
    const globalParameters = yamlObject['Global-Parameters-RequestBody'];
  
    if (!globalParameters || (globalParameters.enable ==='no') || !globalParameters.parameters || Object.keys(globalParameters.parameters).length === 0) {
      // No parameters specified, return the original apiHeaders
      return apiRequestBody;
    }
  
    if (globalParameters.overwrite && globalParameters.overwrite.toLowerCase() === 'yes') {
      // Overwrite specified parameters in apiHeaders
      for (const param in globalParameters.parameters) {
        if (apiRequestBody.hasOwnProperty(param)) {
          apiRequestBody[param] = globalParameters.parameters[param];
        }
      }
    }
  
    // Add missing parameters to apiHeaders
    for (const param in globalParameters.parameters) {
      if (!apiRequestBody.hasOwnProperty(param)) {
        apiRequestBody[param] = globalParameters.parameters[param];
      }
    }
  
    return apiRequestBody;
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse(''); // Clear the response

    // get the YAML configuration of ApiFny for this explorer 
    if (!isStringValidYAML(explorer.yaml ))
    {
      alert("The APIFny configuration file is not a valid yaml file.");
      return;
    }
    const yamlObject = yaml.load(explorer.yaml); 
    //build the headers as found in the API dynamically
    const apiHeaders = api.headers.reduce((acc, header) => {
      const [key, value] = header.split(':');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});
    // add or replace the global parameters (found in the config) to the headers
    const myheadersWithGlobals = HeadersGlobalAdd(apiHeaders,yamlObject )
    // add or replace the global parameters (found in the config) to the request body
    const myRequestBodyWithGlobals = requestBodyGlobalAdd( requestBodyFields,yamlObject)
    
    const finalHeaders = addAuthToHeaders(myheadersWithGlobals,yamlObject );
    const finalRequestBody = addAuthToRequestBody(myRequestBodyWithGlobals,yamlObject,crypto);
    // we are using the relay function of our backen to get to the clients API so:

    finalRequestBody.destination = api.urlRoute ;

    //  Determine the three mayor parameters of API call based on the authentication case

    console.log("FINAl HEADERS");
    console.log(finalHeaders);
    console.log("FINAL RequestBody");
    console.log(finalRequestBody);


    fetch(process.env.REACT_APP_CENTRAL_BACK + "/relay", {
      method: api.method,
      headers: {
        ...finalHeaders,
      },
      body: JSON.stringify(finalRequestBody),
    })
      .then((response) => response.json())
      .then((response) => {
        setResponse(JSON.stringify(response, null, 2));
      })
      .catch((error) => {
        setResponse(JSON.stringify(error, null, 2));
      });
  };

  return (
    <div className="container">
      <div className="page">
        <div className="curl-panel">
          <form id="form" onSubmit={handleSubmit}>
            <div className="input-fields">
              <div>1  // API EXPLORER. NOTE, FIELDS ARE EDITABLE!!</div>
              <div>2  //</div>
              <div>3  // {api.description}.</div>
              <div>4  // The URL is {api.urlRoute} </div>
              <div>5  //</div>
              <div>
                6  curl -X {api.method} {api.urlRoute} {api.headers && api.headers.map((header) => `-H "${header}"`).join(' ')} -d {' '}
              </div>

              {api.requestBody &&
                Object.keys(api.requestBody).map((field, index) => (
                  <div key={index}>
                    {`"${field}": `}
                    <input
                      title={`The ${field} is a...`}
                      className="mycurlinput"
                      type="text"
                      name={field}
                      value={requestBodyFields[field]}
                      onChange={(e) => handleRequestBodyChange(field, e.target.value)}
                    />,
                  </div>
                ))}

              
              <div>11 } </div>
            </div>
            <p></p>
            <br></br>
            <input type="submit" value="EXECUTE CODE" />
          </form>
        </div>
        <div className="panel-d">
          <h2>TERMINAL</h2>
          <div id="terminal-prompt"></div>
          <pre id="response" className="typing-effect">
            <code>
          {response}
          </code>
          </pre>
        </div>
      </div>
    </div>
  );
};


function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
export default ApiTerminal;
