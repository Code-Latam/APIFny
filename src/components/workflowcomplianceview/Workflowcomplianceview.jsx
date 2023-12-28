import React, { useState, useEffect } from 'react';
import "./workflowcomplianceview.css";
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import htmlToMd from 'html-to-md';
import ReactMarkdown from 'react-markdown';
import { renderToString } from 'react-dom/server';
import Modalworkflowclone from "../modalworkflowclone/Modalworkflowclone"; 

function Workflowcomplianceview({ clientNr, explorerId, productName, name, designerMode, updateTreeView  }) {
  const [workflow, setWorkflow] = useState(null);
  const [isRichTextMode, setIsRichTextMode] = useState(true);

  const [markdownContent, setMarkdownContent] = useState('');


  const toggleDisplayMode = () => {
    setIsRichTextMode((prevMode) => !prevMode);
  };


  useEffect(() => {
    // Define the API URL for fetching the product
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/workflow/query';

    // Define the request body
    const requestBody = {
      clientNr,
      explorerId,
      productName,
      name
    };

    // Make a POST request to fetch the product
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        // Set the fetched product data to the state
        setWorkflow(data);
        const markdownContent = htmlToMd(data.complianceDescription);
        setMarkdownContent(markdownContent);
      })
      .catch((error) => {
        console.error('Error fetching workflow:', error);
      });
  }, [clientNr, explorerId, productName, name]);

  const handleComplianceDescriptionChange = (value) => {
    setWorkflow((prevWorkflow) => ({
      ...prevWorkflow,
      complianceDescription: value,
    }));
    const markdownContent = htmlToMd(value);
    setMarkdownContent(markdownContent);
  };
  

  const handleTextareaChange = (e) => {
    // Assuming e.target.value contains Markdown content
    const markdownContent = e.target.value;
    const htmlContent = <ReactMarkdown>{markdownContent}</ReactMarkdown>;
    const htmlString = renderToString(htmlContent);
    
    console.log("HTML VALUE");
    console.log(htmlContent);
    setWorkflow((prevWorkflow) => ({
      ...prevWorkflow,
      complianceDescription: htmlString,
    }));
    setMarkdownContent(markdownContent);
  };


  const handleUpdate = async () => {
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/workflow/update';

    // Define the request body
    const requestBody = {
      clientNr: clientNr,
      explorerId: explorerId,
      productName:productName,
      name:name,
      complianceDescription: workflow.complianceDescription,
    };

      const myResponse = await axios.post(apiUrl, requestBody);
      alert("Workflow was succesfully updated.");
  };


  return (
    <div className="Workflowview">
      <div>
        
        {workflow ? (
          <div>
            <div>
              <label htmlFor="workflowName">Workflow Name</label>
              <br />
              <input
                type="text"
                id="workflowName"
                value={workflow.name}
                className="WorkflowViewinputname"
                disabled
              />
            </div>
            <div>
              <label htmlFor="workflowComplianceDescription">Compliance Description</label>
              <br />
              {isRichTextMode ? (
                 <div style={{ height: "150px", overflowY: "auto", width: "780px", marginTop: "10px" , marginBottom: "14px", border: "1px solid white" }}>
                <ReactQuill
                  value={workflow.complianceDescription}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link', 'image'],
                      ['clean'],
                    ],
                  }}
                  theme = "snow"
                  className="Taskviewinput"
                  onChange={handleComplianceDescriptionChange}
                  disabled = {!designerMode} 
                  readOnly =  {!designerMode}                   
                />
                </div>
              ) : (
                <textarea
              value={markdownContent}
              className="Markdowninput"
              disabled = {!designerMode}
              style={{ height: "150px", overflowY: "auto", width: "800px" }}
              onChange={handleTextareaChange}
            />
              )}
            </div>
          </div>
        ) : (
          <p>Loading Workflow information...</p>
        )}
      </div>
      {designerMode && (<div>
        <button className='editorButton' onClick={toggleDisplayMode}>
          {isRichTextMode ? 'Use Markdown Editor' : 'Use Rich Text Editor'}
        </button>
      </div>)}
      {designerMode && (
              <div>
                <button className = "actionbutton" onClick={handleUpdate}>Update</button>   
              </div>
            )}
    </div>
  );
}

export default Workflowcomplianceview;
