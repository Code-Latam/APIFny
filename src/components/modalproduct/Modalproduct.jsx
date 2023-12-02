import React, { useState, useEffect } from "react";
import axios from "axios";
import "./modalproduct.css";

function Modalproduct({ onClose }) {

  const [products, setProducts] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState("No Name Yet");
  const [selectedProductDescription, setSelectedProductDescription] = useState("No Description Yet");
  

  useEffect(() => {

  }, []); // Empty dependency array ensures the effect runs only once after the initial render

  const handleNameChange = (event) => {
    setSelectedProductName(event.target.value);
  };
  
  const handleDescriptionChange = (event) => {
    setSelectedProductDescription(event.target.value)
    }


  
  const handleSave = async () => {
    // Perform save logic with selectedSource and selectedTarget
    // You can use these values to update your backend or state, as needed
    if (await handleCreateProduct(selectedProductName,selectedProductDescription))
    {
      onClose(); 
    }  
  };

  async function handleCreateProduct(productName, productDescription) {
    try {
      const mypayload = {
        clientNr: process.env.REACT_APP_CLIENTNR,
        explorerId: process.env.REACT_APP_EXPLORERID,
        productName: productName,
        description: productDescription
      };
  
      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/product/register", mypayload);
  
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
    <div className="ProductmodalDialog">
      <div>
        <div className="top">
          <div className="left">Add new Product</div>
          <div className="close" onClick={onClose}>
            &times;
          </div>
        </div>
        <br/>
          <div>
              <label htmlFor="productName">Product Name</label>
              <input
                type="text"
                id="productName"
                value={selectedProductName}
                className="ProductModalinputname"
                onChange={handleNameChange}
              />
              <div>
            </div>
            <div>
              <label htmlFor="productDescription">Description</label>
              <br />
              <textarea
                id="productDescription"
                value={selectedProductDescription}
                className="ProductModalinputname"
                onChange={handleDescriptionChange}
                rows= "10"
                style={{ maxHeight: "200px", overflowY: "auto", width: "350px" }}
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


export default Modalproduct;
