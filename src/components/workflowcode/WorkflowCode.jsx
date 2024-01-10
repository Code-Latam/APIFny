import React, { useState, useEffect } from "react"
import './workflowcode.css'; // Import your CSS file here
import {generateJavaScriptCode,generatePythonCode, getDecodedBody} from "../../utils/utils.js";
import axios from "axios";
import SyntaxHighlighter from "react-syntax-highlighter";
import { light as lightStyle, dark as darkStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { CopyToClipboard } from "react-copy-to-clipboard";
import { FaCopy } from "react-icons/fa";

import { ToastContainer, toast } from 'react-toastify'; // import toastify components
import 'react-toastify/dist/ReactToastify.css'; // import toastify CSS

const WorkflowCode = ({ clientNr, explorerId, productName, workflowName, codeType}) => {
  
  
  const [explorer, setExplorer] = useState([]);
  const [requestBodyFields, setRequestBodyFields] = useState({});
  const [generatedCode, setGeneratedCode] = useState('');
  const [ApiList, setApiList] = useState([]);

  const handleCopy = () => {
    toast.success('Code copied!', {autoClose: 1000});
  };

  const handleRequestBodyChange = (field, value) => {
    // Update the state with the new value for the specified field
    setRequestBodyFields((prevFields) => ({
      ...prevFields,
      [field]: value,
    }));
  };

  useEffect(() => {
      fetchApi();
  }, [clientNr, explorerId, productName, workflowName, codeType]);

  

  const fetchApi = async () => {
    
    try {
      const myApibody = 
      {
        clientNr: clientNr,
        explorerId: explorerId,
        workflowName:workflowName
      }
      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/link/queryorderedapi", myApibody);
      const myApiList = await response.data;
      console.log("API OBJECT first render");

      generateCode(myApiList)

      setApiList(myApiList);

      const myExplorerbody = 
      {
        clientNr: clientNr,
        explorerId: explorerId
      }
      const Eresponse = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/explorer/query", myExplorerbody);
      const myExplorer = Eresponse.data;
      setExplorer(myExplorer);



    } catch (error) {
      // Handle any errors
      console.error(error);
    }
  };

  const generateCode = (apis) => {
    let combinedPythonCode = `# Python code for: 
# Workflow Name: ${workflowName}
`;
    let combinedJavaScriptCode = `// JavaScript code for: 
// Workflow Name: ${workflowName}
`;
  
    for (const api of apis) {
      if (Object.keys(api).length > 0) {
        if (codeType === "python") {
          const pythonCode = generatePythonCode(api, explorer, requestBodyFields);
          combinedPythonCode += pythonCode;
        } else if (codeType === "javascript") {
          const javascriptCode = generateJavaScriptCode(api, explorer, requestBodyFields);
          combinedJavaScriptCode += javascriptCode;
        }
      }
    }
  
    // Determine the combined code based on the selected codeType
    const combinedCode = codeType === "python" ? combinedPythonCode : combinedJavaScriptCode;
  
    // Set the combined code using setGeneratedCode
    setGeneratedCode(combinedCode);
};

  
  return (
    <div className = "code-display">
      <SyntaxHighlighter language="javascript" style={darkStyle}>
        {generatedCode}
      </SyntaxHighlighter>
    </div>
  );
};




export default WorkflowCode;
