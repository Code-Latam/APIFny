import React, { useState, useEffect } from 'react';
import "./productview.css";
import axios from "axios";
import ReactQuill from 'react-quill';
import { ImageDrop } from 'quill-image-drop-module';
import 'react-quill/dist/quill.snow.css'; // import styles
import htmlToMd from 'html-to-md';
import ReactMarkdown from 'react-markdown';
import { renderToString } from 'react-dom/server';

function Productview({ clientNr, explorerId, productName, designerMode, updateTreeView }) {
  const [product, setProduct] = useState(null);

  const [isRichTextMode, setIsRichTextMode] = useState(true);

  const [markdownContent, setMarkdownContent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState("Private");

  const statusOptions = ["Private","Public"];

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

  const handleSequenceChange = (event) => {
    const inputValue = event.target.value;
  
    // Check if the input is a valid number
    if (/^\d+$/.test(inputValue) || inputValue === '') {
      // If it's a valid number or an empty string, update the state
      setProduct((prevProduct) => ({
        ...prevProduct,
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
      sequence: product.sequence,
      description: product.description,
      status: selectedStatus
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
        setSelectedStatus(data.status);
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
            <div className = "input-container">
              <label className = "input-label" htmlFor="productName">Product Name:</label>
              <input
                type="text"
                id="productName"
                value={product.productName}
                className="ProductViewNameinput"
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
              <label className = "input-label" htmlFor="sequence">Sequence:</label>
              <input
                type="text"
                id="sequence"
                value={product.sequence}
                className="ProductViewSequenceinput"
                onChange={handleSequenceChange}
                disabled = {!designerMode} 
          
              />
            </div>
            <div>
              <label htmlFor="productDescription">Description:</label>
              <br />
              {isRichTextMode ? (
                 <div style={{ height: "150px", overflowY: "auto", width: "700px", marginTop: "10px" , marginBottom: "14px", border: "1px solid white" }}>
                <ReactQuill
                  value={product.description}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2,3, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link'],
                      ['clean'],
                    ],
                  }}
                  theme = "snow"
                  className="Productviewinput"
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
              style={{ height: "150px", overflowY: "auto", width: "700px" }}
              onChange={handleTextareaChange}
            />
              )}
            </div>
          </div>
        ) : (
          <p>Loading product information...</p>
        )}
      </div>
      <div >
        <button className='editorButton' onClick={toggleDisplayMode}>
          {isRichTextMode ? 'Use Markdown Editor' : 'Use Rich Text Editor'}
        </button>
      {designerMode && (
                <button className = "actionbutton" onClick={handleUpdate}>Update</button>        
            )}
      {designerMode && (
                <button className = "actionbutton" onClick={handleDelete}>Remove</button>
            )}
      </div>
    </div>
  );
}

export default Productview;
