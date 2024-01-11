import React, { useState, useEffect } from 'react';
import "./taskview.css";
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import htmlToMd from 'html-to-md';
import ReactMarkdown from 'react-markdown';
import { renderToString } from 'react-dom/server';

function Taskview({ clientNr, explorerId, workflowName, taskId, designerMode,updateGraphView }) {

  console.log("TASKVIEW DESIGNERMODE");
  console.log(designerMode);
  const [task, setTask] = useState(null);
  const [selectedType, setSelectedType] = useState("circle");
  const [selectedApi, setSelectedApi] = useState("");
  const [apis, setApis] = useState([]);

  const typeOptions = ["circle","cross","diamond","square","star","triangle","wye"];

  const [isRichTextMode, setIsRichTextMode] = useState(true);

  const [markdownContent, setMarkdownContent] = useState('');

  const toggleDisplayMode = () => {
    setIsRichTextMode((prevMode) => !prevMode);
  };

  

  useEffect(() => {

    const fetchApis = async () => {
      const myBody = {
        clientNr: process.env.REACT_APP_CLIENTNR,
      }
      try {
        const apisresponse = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/api/queryall", myBody);
        const myEmptyApi = { apiName: ""}
        const myapis = apisresponse.data;
        myapis.unshift(myEmptyApi);;
        setApis(myapis);  
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchApis();


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
        setSelectedType(data.symbolType);
        setSelectedApi(data.apiName)
        // set the markdown
        const markdownContent = htmlToMd(data.description);
        setMarkdownContent(markdownContent);
      })
      .catch((error) => {
        console.error('Error fetching task:', error);
      });
  }, [workflowName,taskId]);

 const handleDescriptionChange = (value) => {
  setTask((prevTask) => ({
    ...prevTask,
    description: value,
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
    description: htmlString,
  }));
  setMarkdownContent(markdownContent);
};

  const handleNameChange = (event) => {
    setTask((prevTask) => ({
      ...prevTask,
      name: event.target.value,
    }));

  };

  const handleUpdate = async () => {
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/task/update';

    // Define the request body
    const requestBody = {
      clientNr: clientNr,
      explorerId: explorerId,
      workflowName:workflowName,
      taskId:taskId,
      symbolType: selectedType,
      apiName: selectedApi,
      name:task.name,
      description: task.description
    };

      const myResponse = await axios.post(apiUrl, requestBody);
      alert("Task was succesfully updated.");
      updateGraphView();

  };

  return (
    <div className="Taskview">
      <div>
        
        {task ? (
          <div>
            <div>
            {designerMode && (
            <button className='editorButton' onClick={toggleDisplayMode}>
              {isRichTextMode ? 'Use Markdown Editor' : 'Use Rich Text Editor'}
            </button>
          )}
      {   designerMode && (
                <button className = 'editorButton' onClick={handleUpdate}>Update</button>
            
            )}
      </div>     
            <div>
              <label htmlFor="workflowName">Task Name</label>
              <br />
              <input
                type="text"
                id="taskName"
                value={task.name}
                className="TaskViewinputname"
                onChange={handleNameChange}
                disabled={!designerMode }
              />
            </div>
            <div>
            <label htmlFor="nodeType">node Type</label>
              <br/>
              <select
                id="nodeType"
                value={selectedType}
                className="LinkTViewType"
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={!designerMode }
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
            <label htmlFor="api">Implements API:</label>
              <br/>
              <select
                id="api"
                value={selectedApi}
                className="LinkTViewType"
                onChange={(e) => setSelectedApi(e.target.value)}
                disabled={!designerMode }
              >
                {apis.map((api) => (
                  <option key={api.name} value={api.name}>
                    {api.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="workflowDescription">Description</label>
              <br />
              {isRichTextMode ? (
                 <div style={{ overflowY: "auto", marginTop: "10px" , marginBottom: "14px", border: "1px solid white" }}>
                <ReactQuill
                  value={task.description}
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
                  readOnly =  {!designerMode}  
                  disabled = {!designerMode}
                  
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
          <p>Loading Task information...</p>
        )}
      </div>
       
    </div>
  );
}

export default Taskview;
