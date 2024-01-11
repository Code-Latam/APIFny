import React, { useState, useEffect } from 'react';
import "./workflowview.css";
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import htmlToMd from 'html-to-md';
import ReactMarkdown from 'react-markdown';
import { renderToString } from 'react-dom/server';
import Modalworkflowclone from "../modalworkflowclone/Modalworkflowclone"; 

function Workflowview({ clientNr, explorerId, productName, name, designerMode, updateTreeView  }) {
  const [workflow, setWorkflow] = useState(null);
  const [isRichTextMode, setIsRichTextMode] = useState(true);

  const [markdownContent, setMarkdownContent] = useState('');

  const [isWorkflowCloneModalOpen, setIsWorkflowCloneModalOpen] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("Private");

  const statusOptions = ["Private","Public"];

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
        setSelectedStatus(data.status);
        const markdownContent = htmlToMd(data.description);
        setMarkdownContent(markdownContent);
      })
      .catch((error) => {
        console.error('Error fetching workflow:', error);
      });
  }, [clientNr, explorerId, productName, name]);

  const handleDescriptionChange = (value) => {
    setWorkflow((prevWorkflow) => ({
      ...prevWorkflow,
      description: value,
    }));
    const markdownContent = htmlToMd(value);
    setMarkdownContent(markdownContent);
  };

  const handleSequenceChange = (event) => {
    const inputValue = event.target.value;
  
    // Check if the input is a valid number
    if (/^\d+$/.test(inputValue) || inputValue === '') {
      // If it's a valid number or an empty string, update the state
      setWorkflow((prevWorkflow) => ({
        ...prevWorkflow,
        sequence: inputValue,
      }));
    }
    // If it's not a valid number, you can choose to do nothing or provide feedback to the user
    // For example, show an error message or prevent further action
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
      description: htmlString,
    }));
    setMarkdownContent(markdownContent);
  };

  const handleClone = () => {
    setIsWorkflowCloneModalOpen(true);
  };

  const handleUpdate = async () => {
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/workflow/update';

    // Define the request body
    const requestBody = {
      clientNr: clientNr,
      explorerId: explorerId,
      productName:productName,
      name:name,
      description: workflow.description,
      sequence: workflow.sequence,
      status: selectedStatus,
    };

      const myResponse = await axios.post(apiUrl, requestBody);
      alert("Workflow was succesfully updated.");
  };

  const handleDelete = async () => {
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/workflow/delete';

    // Define the request body
    const requestBody = {
      clientNr: clientNr,
      explorerId: explorerId,
      productName:productName,
      name:name,
    };

      const myResponse = await axios.post(apiUrl, requestBody);
      alert("Workflow was succesfully removed.");
      window.location.reload();
      // updateTreeView();

  };

  return (
    <div className="Workflowview">
      <div>
        
        {workflow ? (
          <div>
             <div>
      {designerMode && (
        <button className='editorButton' onClick={toggleDisplayMode}>
          {isRichTextMode ? 'Use Markdown Editor' : 'Use Rich Text Editor'}
        </button>
      )}
      {designerMode && (
                <button className = "actionbutton" onClick={handleUpdate}>Update</button>
            )}
      {designerMode && (          
                <button className = "actionbutton" onClick={handleDelete}>Remove</button>
            )}
      {designerMode && (
                <button className = "actionbutton" onClick={handleClone}>Clone</button>
            )}
      {isWorkflowCloneModalOpen && (
        <Modalworkflowclone
          SourceProductName = {productName}
          sourceWorkflowName = {name}
          onClose={() => {
            setIsWorkflowCloneModalOpen(false);
          }}
        />
      )}
      </div>
            <div className = "input-container">
              <label className='input-label' htmlFor="workflowName">Workflow Name:</label>
              <br />
              <input
                type="text"
                id="workflowName"
                value={workflow.name}
                className="WorkflowViewNameinput"
                disabled
              />
            </div>
            <div className = "input-container">
            <label className = "input-label" htmlFor="status">Status:</label>
              <select
                id="status"
                value={selectedStatus}
                className="ProductViewStatusinput"
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={!designerMode }
              >
                {statusOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className = "input-container">
              <label className='input-label' htmlFor="sequence">Sequence:</label>
              <br />
              <input
                type="text"
                id="sequence"
                value={workflow.sequence}
                className="WorkflowViewSequenceinput"
                onChange={handleSequenceChange}
                disabled = {!designerMode} 
          
              />
            </div>
            <div>
              <label htmlFor="workflowDescription">Description:</label>
              <br />
              {isRichTextMode ? (
                 <div style={{ overflowY: "auto", marginTop: "10px" , marginBottom: "14px", border: "1px solid white" }}>
                <ReactQuill
                  value={workflow.description}
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
                  onChange={handleDescriptionChange}
                  disabled = {!designerMode} 
                  readOnly =  {!designerMode}                   
                />
                </div>
              ) : (
                <textarea
              value={markdownContent}
              className="Markdowninput"
              disabled = {!designerMode}
              onChange={handleTextareaChange}
            />
              )}
            </div>
          </div>
        ) : (
          <p>Loading Workflow information...</p>
        )}
      </div>
     
    </div>
  );
}

export default Workflowview;
