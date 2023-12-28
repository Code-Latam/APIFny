import React, { useState, useEffect } from "react";
import axios from "axios";
import "./modalworkflowclone.css";

function Modalworkflowclone({ onClose, sourceWorkflowName,SourceProductName }) {

  const [products, setProducts] = useState([]);

  const [selectedDestinationProduct, setSelectedDestinationProduct] = useState(null);
  const [selectedWorkflowCloneName, setSelectedWorkflowCloneName] = useState("No Name Yet");
  

  useEffect(() => {
    const fetchData = async () => {
      // first query products for products listbox


      const myProductsPayload = {
        clientNr: process.env.REACT_APP_CLIENTNR,
        explorerId: process.env.REACT_APP_EXPLORERID,
      }
      try {
        const productresponse = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/product/queryall", myProductsPayload);

        setProducts(productresponse.data);
         
        console.log("PRODUCTS");
        console.log(productresponse.data);
        
        if (productresponse.data.length > 0) {
          setSelectedDestinationProduct(productresponse.data[0].productName);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once after the initial render

  const handleNameChange = (event) => {
    setSelectedWorkflowCloneName(event.target.value);
  };
  


  
  const handleClone = async () => {
    // Perform save logic with selectedSource and selectedTarget
    // You can use these values to update your backend or state, as needed
    if (await handleCloneWorkflow(selectedDestinationProduct, selectedWorkflowCloneName))
    {
      alert("Workflow was succesfully cloned!")
      window.location.reload();
      onClose(); 
    }  
  };

  async function handleCloneWorkflow(DestinationProductName, workflowCloneName) {
    try {
      const mypayload = {
        clientNr: process.env.REACT_APP_CLIENTNR,
        explorerId: process.env.REACT_APP_EXPLORERID,
        productName: SourceProductName,
        destinationProductName: DestinationProductName,
        name: sourceWorkflowName,
        newName: workflowCloneName
      };
  
      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/workflow/cloneworkflow", mypayload);
  
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
    <div className="modalDialog">
      <div>
        <div className="top">
          <div className="left">Clone Workflow</div>
          <div className="close" onClick={onClose}>
            &times;
          </div>
        </div>

        <div className="switch-container">
          <label htmlFor="products">Destination Product folder</label>
          <select
            id="products"
            value={selectedDestinationProduct}
            onChange={(e) => setSelectedDestinationProduct(e.target.value)}
          >
            {products.map((product) => (
              <option key={product.productName} value={product.productName}>
                {product.productName}
              </option>
            ))}
          </select>

          <div>
              <label htmlFor="workflowName">Workflow Clone Target Name</label>
              <br />
              <input
                type="text"
                id="workflowName"
                value={selectedWorkflowCloneName}
                className="WorkflowModalinputname"
                onChange={handleNameChange}
              />
            </div>
        </div>

        <div className="modalDialog-buttons">
          <button className="modalclosebutton" onClick={onClose}>
            Close
          </button>
          <button className="modalsavebutton" onClick={handleClone}>
            Clone
          </button>
        </div>
      </div>
    </div>
  );
}


export default Modalworkflowclone;
