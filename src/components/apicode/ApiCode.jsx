import React, { useState, useEffect } from "react"
import './apicode.css'; // Import your CSS file here
import axios from "axios";
import prettier from "prettier";

const ApiCode = ({ clientNr, explorerId, productName, workflowName, taskId,apiName, codeType}) => {
  const [gwoken, setGwoken] = useState('saasasasas');
  const [chatbotKey, setChatbotKey] = useState('chatbot199');
  const [username, setUsername] = useState('Rodolfo Dominguez');
  const [response, setResponse] = useState('');
  const [api, setApi] = useState([]);
  const [explorer, setExplorer] = useState([]);
  const [requestBodyFields, setRequestBodyFields] = useState({});
  const [generatedCode, setGeneratedCode] = useState('');

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

      generateCode();

    } catch (error) {
      // Handle any errors
      console.error(error);
    }
  };

  const generateCode = () => {
    if (codeType === "python") {
      const pythonCode = generatePythonCode(api, explorer, requestBodyFields);
      setGeneratedCode(prettifyPythonCode(pythonCode));
    } else if (codeType === "javascript") {
      const javascriptCode = generateJavaScriptCode(api, explorer, requestBodyFields);
      setGeneratedCode(prettifyJavaScriptCode(javascriptCode));
    }
  };

  const prettifyPythonCode = (pythonCode) => {
    // Prettify Python code using autopep8 or other Python code formatter
    return prettier.format(pythonCode, { parser: "babel" });
  };

  const prettifyJavaScriptCode = (javascriptCode) => {
    // Prettify JavaScript code using prettier or other JavaScript code formatter
    return prettier.format(javascriptCode, { parser: "babel" });
  };

  return (
    <div className="container">
      <div className="code-display">
        <pre>{generatedCode}</pre>
      </div>
    </div>
  );
};


function generatePythonCode(api, explorer, requestBodyFields) {
    // Generate Python code for making an API call using requests library
    const url = explorer.apiEndpoint + api.urlRoute;
    const method = api.method;
    const headers = api.headers.map(header => {
      const [key, value] = header.split(':');
      return `'${key.trim()}': '${value.trim()}'`;
    }).join(', ');
  
    const pythonCode = `
  import requests
  
  url = "${url}"
  method = "${method}"
  headers = {
      ${headers}
  }
  
  data = ${JSON.stringify(requestBodyFields, null, 4)}
  
  response = requests.request(method, url, headers=headers, json=data)
  print(response.text)
  `;
  
    return pythonCode;
  }
  

function generateJavaScriptCode(api, explorer, requestBodyFields) {
    // Generate JavaScript code for making an API call using fetch
    const url = explorer.apiEndpoint + api.urlRoute;
    const method = api.method;
    const headers = Object.fromEntries(api.headers.map(header => {
      const [key, value] = header.split(':');
      return [key.trim(), value.trim()];
    }));
  
    const javascriptCode = `
  const url = "${url}";
  const method = "${method}";
  const headers = ${JSON.stringify(headers, null, 4)};
  const data = ${JSON.stringify(requestBodyFields, null, 4)};
  
  fetch(url, {
    method,
    headers,
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(responseData => console.log(responseData))
    .catch(error => console.error(error));
  `;
  
    return javascriptCode;
  }

export default ApiCode;
