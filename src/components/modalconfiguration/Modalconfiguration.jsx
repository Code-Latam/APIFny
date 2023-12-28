import React, { useState, useEffect } from "react";
import axios from "axios";
import "./modalconfiguration.css";

function Modalconfiguration({ onClose }) {

  
  
  const [selectedConfigurationYaml, setSelectedConfigurationYaml] = useState("No Description Yet");
  

  useEffect(() => {

    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/explorer/query';

    // Define the request body
    const requestBody = {
      clientNr: process.env.REACT_APP_CLIENTNR,
      explorerId: process.env.REACT_APP_EXPLORERID,
    };

    // Make a POST request to fetch the configuration
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        // Set the fetched configuration data to the state
        setSelectedConfigurationYaml(data.yaml);
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
      });

  }, []); // Empty dependency array ensures the effect runs only once after the initial render

  
  const handleYamlChange = (event) => {
    setSelectedConfigurationYaml(event.target.value)
    }


  
  const handleSave = async () => {
    // Perform save logic with selectedSource and selectedTarget
    // You can use these values to update your backend or state, as needed
    if (await handleSaveYaml(selectedConfigurationYaml))
    {
      onClose(); 
    }  
  };

  async function handleSaveYaml(configuration) {
    try {
      const mypayload = {
        clientNr: process.env.REACT_APP_CLIENTNR,
        explorerId: process.env.REACT_APP_EXPLORERID,
        yaml: configuration
      };

      console.log("HANDLE SAVE");
      console.log(mypayload);
  
      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/explorer/update", mypayload);
  
      // Check if the response indicates an error
      if (response.data && response.data.error) {
        // Display an alert with the error data
        alert(`Error: ${response.data.error}`);
        return false;
      }
  
      // setNodesAdded(nodesAdded + 1);
      return true;
    } catch (error) {
      // Handle unexpected errors (e.g., network issues)
      console.error("An unexpected error occurred:", error);
      alert("An unexpected error occurred. Please try again.");
      return false;
    }
  };
  

  

  return (
    <div className="ConfigurationmodalDialog">
      <div>
        <div className="top">
          <div className="left">Configuration</div>
          <div className="close" onClick={onClose}>
            &times;
          </div>
        </div>
        <br/>
          <div>
            <div>
            </div>
            <div>
              <label htmlFor="yaml">Yaml</label>
              <br />
              <textarea
                id="yaml"
                value={selectedConfigurationYaml}
                className="YamlModalinputname"
                onChange={handleYamlChange}
                rows= "20"
                style={{ maxHeight: "200px", overflowY: "auto", width: "800px" }}
              />
            </div>
        </div>

        <div className="modalDialog-buttons">
          <button className="modalclosebutton" onClick={onClose}>
            Close
          </button>
          <button className="modalsavebutton" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}


export default Modalconfiguration;
