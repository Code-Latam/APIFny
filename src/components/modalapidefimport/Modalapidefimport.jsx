import React, { useState, useEffect } from "react";
import axios from "axios";
import "./modalapidefimport.css";
import FileUpload from '../fileupload/FileUpload';

function Modalapidefimport({ onClose }) {

  const [products, setProducts] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWorkflowName, setSelectedWorkflowName] = useState("No Name Yet");
  const [selectedWorkflowDescription, setSelectedWorkflowDescription] = useState("No Description Yet");
  

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
          setSelectedProduct(productresponse.data[0].productName);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once after the initial render

  const handleNameChange = (event) => {
    setSelectedWorkflowName(event.target.value);
  };
  
  const handleDescriptionChange = (event) => {
    setSelectedWorkflowDescription(event.target.value)
    }


  
  const handleSave = async () => {
    // Perform save logic with selectedSource and selectedTarget
    // You can use these values to update your backend or state, as needed
    if (await handleCreateProduct(selectedProduct, selectedWorkflowName,selectedWorkflowDescription))
    {
      onClose(); 
    }  
  };

  async function handleCreateProduct(productName, workflowName, workflowDescription) {
    try {
      const mypayload = {
        clientNr: process.env.REACT_APP_CLIENTNR,
        explorerId: process.env.REACT_APP_EXPLORERID,
        productName: productName,
        name: workflowName,
        description: workflowDescription
      };
  
      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/workflow/register", mypayload);
  
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
        <div className="topapidef">
          <div className="leftapiImport">Import Api Definitions</div>
          <div className="close" onClick={onClose}>
            &times;
          </div>
        </div>

        <div className="switch-container">
          <FileUpload />
        </div>

        <div className="modalDialog-buttons">
          <button className="modalclosebutton" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


export default Modalapidefimport;
