import React, { useState, useEffect } from 'react';
import "./productview.css";

function Productview({ clientNr, explorerId, productName }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Define the API URL for fetching the product
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/product/query';

    // Define the request body
    const requestBody = {
      clientNr,
      explorerId,
      productName,
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
        setProduct(data);
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
      });
  }, [clientNr, explorerId, productName]);

  return (
    <div className="Productview">
      <div>
        
        {product ? (
          <div>
            <div>
              <label htmlFor="productName">Product Name</label>
              <br />
              <input
                type="text"
                id="productName"
                value={product.productName}
                className="ProductViewinputname"
                disabled
              />
            </div>
            <div>
              <label htmlFor="productDescription">Description</label>
              <br />
              <br />
              <textarea
                id="productDescription"
                value={product.description}
                className="Productviewinput"
                rows= "10"
                disabled
                style={{ maxHeight: "200px", overflowY: "auto", width: "800px" }}
              />
            </div>
          </div>
        ) : (
          <p>Loading product information...</p>
        )}
      </div>
    </div>
  );
}

export default Productview;
