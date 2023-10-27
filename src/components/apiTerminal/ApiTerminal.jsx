
import React, { useState, useEffect } from "react"
import './apiTerminal.css'; // Import your CSS file here
import axios from "axios";

const ApiTerminal = ({ clientNr, explorerId, productName, workflowName, taskId,apiName }) => {
  const [gwoken, setGwoken] = useState('saasasasas');
  const [chatbotKey, setChatbotKey] = useState('chatbot199');
  const [username, setUsername] = useState('Rodolfo Dominguez');
  const [response, setResponse] = useState('');
  const [api, setApi] = useState([]);
  const [explorer, setExplorer] = useState([]);
  const [requestBodyFields, setRequestBodyFields] = useState({});

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
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setResponse(''); // Clear the response
    
    //build the headers dynamically
    const headers = api.headers.reduce((acc, header) => {
      const [key, value] = header.split(':');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});

    fetch(explorer.apiEndpoint +  api.urlRoute, {
      method: api.method,
      headers: {
        ...headers,
      },
      body: JSON.stringify(requestBodyFields),
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
              <div>4  // The URL is {explorer.apiEndpoint +  api.urlRoute} </div>
              <div>5  //</div>
              <div>
                6  curl -X {api.method} {explorer.apiEndpoint + api.urlRoute} {api.headers && api.headers.map((header) => `-H "${header}"`).join(' ')} -d {' '}
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
        <div className="panel panel-d">
          <h2>TERMINAL</h2>
          <div id="terminal-prompt"></div>
          <pre id="response" className="typing-effect">
            {response}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ApiTerminal;
