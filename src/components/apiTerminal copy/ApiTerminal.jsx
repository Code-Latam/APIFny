
import React, { useState, useEffect } from "react"
import './apiTerminal.css'; // Import your CSS file here
import axios from "axios";
import crypto from 'crypto-js';
import {HeadersGlobalAdd, requestBodyGlobalAdd, addAuthToHeaders, addAuthToRequestBody, parseApiHeaders, getConfiguration, isValidConfiguration} from "../../utils/api-spec-util.js";

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
        const yamlObject = getConfiguration(explorer);
        const initialRequestBodyFields = { ...myApi.requestBody };
        const myRequestBodyWithGlobals = requestBodyGlobalAdd( initialRequestBodyFields,yamlObject);
        console.log()
        setRequestBodyFields(myRequestBodyWithGlobals);
      }


    } catch (error) {
      // Handle any errors
      console.error(error);
    }
  };
  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse(''); // Clear the response

    // get the YAML configuration of ApiFny for this explorer 
    if (!isValidConfiguration(explorer ))
    {
      alert("The APIFny configuration file is not a valid yaml file.");
      return;
    }
    const yamlObject = getConfiguration(explorer)
    //build the headers as found in the API dynamically
    const apiHeaders = parseApiHeaders(api);
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
