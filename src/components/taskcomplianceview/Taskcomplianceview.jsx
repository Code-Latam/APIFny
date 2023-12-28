import React, { useState, useEffect } from 'react';
import "./taskcomplianceview.css";
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import htmlToMd from 'html-to-md';
import ReactMarkdown from 'react-markdown';
import { renderToString } from 'react-dom/server';

function Taskcomplianceview({ clientNr, explorerId, workflowName, taskId, designerMode,updateGraphView }) {

  console.log("TASKVIEW DESIGNERMODE");
  console.log(designerMode);
  const [task, setTask] = useState(null);


  const [isRichTextMode, setIsRichTextMode] = useState(true);

  const [markdownContent, setMarkdownContent] = useState('');

  const toggleDisplayMode = () => {
    setIsRichTextMode((prevMode) => !prevMode);
  };

  

  useEffect(() => {

    

    // Define the API URL for fetching the product
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/task/query';

    // Define the request body
    const requestBody = {
      clientNr: clientNr,
      explorerId: explorerId,
      workflowName: workflowName,
      taskId: taskId
     
    };

      console.log(requestBody)

    // Make a POST request to fetch the task
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
        setTask(data);
        // set the markdown
        const markdownContent = htmlToMd(data.complianceDescription);
        setMarkdownContent(markdownContent);
      })
      .catch((error) => {
        console.error('Error fetching task:', error);
      });
  }, [workflowName,taskId]);

 const handleComplianceDescriptionChange = (value) => {
  setTask((prevTask) => ({
    ...prevTask,
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
  setTask((prevTask) => ({
    ...prevTask,
    complianceDescription: htmlString,
  }));
  setMarkdownContent(markdownContent);
};


  const handleUpdate = async () => {
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/task/update';

    // Define the request body
    const requestBody = {
      clientNr: clientNr,
      explorerId: explorerId,
      workflowName:workflowName,
      taskId:taskId,
      complianceDescription: task.complianceDescription
    };

      const myResponse = await axios.post(apiUrl, requestBody);
      alert("Task was succesfully updated.");

  };

  return (
    <div className="Taskview">
      <div>
        
        {task ? (
          <div>
            <div>
              <label htmlFor="taskName">Task Name</label>
              <br />
              <input
                type="text"
                id="taskName"
                value={task.name}
                className="TaskViewinputname"
                disabled
              />
            </div>
            <div>
              <label htmlFor="workflowDescription">Compliance Description</label>
              <br />
              {isRichTextMode ? (
                 <div style={{ height: "150px", overflowY: "auto", width: "780px", marginTop: "10px" , marginBottom: "14px", border: "1px solid white" }}>
                <ReactQuill
                  value={task.complianceDescription}
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
                  readOnly =  {!designerMode}  
                  disabled = {!designerMode}
                  
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
          <p>Loading Task information...</p>
        )}
      </div>
      {designerMode && (<div>
        <button className='editorButton' onClick={toggleDisplayMode}>
          {isRichTextMode ? 'Use Markdown Editor' : 'Use Rich Text Editor'}
        </button>
      </div>)}
      {designerMode && (
              <div>
                <button className = 'editorButton' onClick={handleUpdate}>Update</button>
              </div>
            )}
    </div>
  );
}

export default Taskcomplianceview;
