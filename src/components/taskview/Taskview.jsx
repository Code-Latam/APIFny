import React, { useState, useEffect } from 'react';
import "./taskview.css";

function Taskview({ clientNr, explorerId, workflowName, taskId }) {

  console.log("We are in Taskview");
  console.log(taskId);
  const [workflow, setWorkflow] = useState(null);
  const [task, setTask] = useState(null);

  useEffect(() => {
    // Define the API URL for fetching the product
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/task/query';

    // Define the request body
    const requestBody = {
      clientNr,
      explorerId,
      workflowName,
      taskId
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
        setTask(data)
      })
      .catch((error) => {
        console.error('Error fetching task:', error);
      });
  }, [workflowName,taskId]);

  return (
    <div className="Taskview">
      <div>
        
        {task ? (
          <div>
            <div>
              <label htmlFor="workflowName">Task Name</label>
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
              <label htmlFor="workflowDescription">Description</label>
              <br />
              <br />
              <textarea
                id="taskDescription"
                value={task.description}
                className="Taskviewinput"
                rows= "10"
                disabled
                style={{ maxHeight: "200px", overflowY: "auto", width: "800px" }}
              />
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
