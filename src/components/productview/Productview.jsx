import React, { useState, useEffect } from 'react';
import "./productview.css";
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import htmlToMd from 'html-to-md';
import ReactMarkdown from 'react-markdown';
import { renderToString } from 'react-dom/server';

function Productview({ clientNr, explorerId, productName, designerMode, updateTreeView }) {
  const [product, setProduct] = useState(null);

  const [isRichTextMode, setIsRichTextMode] = useState(true);

  const [markdownContent, setMarkdownContent] = useState('');

  const toggleDisplayMode = () => {
    setIsRichTextMode((prevMode) => !prevMode);
  };

  const handleDescriptionChange = (value) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
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
    setProduct((prevProduct) => ({
      ...prevProduct,
      description: htmlString,
    }));
    setMarkdownContent(markdownContent);
  };


  const handleUpdate = async () => {
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/product/update';

    // Define the request body
    const requestBody = {
      clientNr: clientNr,
      explorerId: explorerId,
      
      productName:product.productName,
      description: product.description
    };

      const myResponse = await axios.post(apiUrl, requestBody);
      alert("Product was succesfully updated.");

  };

  const handleDelete = async () => {
    const apiUrl = process.env.REACT_APP_CENTRAL_BACK + '/product/delete';

    // Define the request body
    const requestBody = {
      clientNr: clientNr,
      explorerId: explorerId, 
      productName:product.productName,
    };

      const myResponse = await axios.post(apiUrl, requestBody);
      alert("Product was succesfully removed.");
      updateTreeView();

  };

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
        const markdownContent = htmlToMd(data.description);
        setMarkdownContent(markdownContent);
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
                className="ProductViewinput"
                disabled
              />
            </div>
            <div>
              <label htmlFor="productDescription">Description</label>
              <br />
              {isRichTextMode ? (
                 <div style={{ height: "150px", overflowY: "auto", width: "780px", marginTop: "10px" , marginBottom: "14px", border: "1px solid white" }}>
                <ReactQuill
                  value={product.description}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link', 'image'],
                      ['clean'],
                    ],
                  }}
                  theme = "snow"
                  className="Productviewinput"
                  onChange={handleDescriptionChange}
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
          <p>Loading product information...</p>
        )}
      </div>
      <div>
        <button className='editorButton' onClick={toggleDisplayMode}>
          {isRichTextMode ? 'Use Markdown Editor' : 'Use Rich Text Editor'}
        </button>
      </div>
      {designerMode && (
              <div>
                <button className = "actionbutton" onClick={handleUpdate}>Update</button>
                <button className = "actionbutton" onClick={handleDelete}>Remove</button>
              </div>
            )}
    </div>
  );
}

export default Productview;
