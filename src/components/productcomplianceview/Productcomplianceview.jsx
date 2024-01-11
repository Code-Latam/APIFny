import React, { useState, useEffect } from 'react';
import "./productcomplianceview.css";
import axios from "axios";
import ReactQuill from 'react-quill';
import { ImageDrop } from 'quill-image-drop-module';
import 'react-quill/dist/quill.snow.css'; // import styles
import htmlToMd from 'html-to-md';
import ReactMarkdown from 'react-markdown';
import { renderToString } from 'react-dom/server';

function Productcomplianceview({ clientNr, explorerId, productName, designerMode, updateTreeView }) {
  const [product, setProduct] = useState(null);

  const [isRichTextMode, setIsRichTextMode] = useState(true);

  const [markdownContent, setMarkdownContent] = useState('');

  const toggleDisplayMode = () => {
    setIsRichTextMode((prevMode) => !prevMode);
  };

  const handleComplianceDescriptionChange = (value) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
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
    setProduct((prevProduct) => ({
      ...prevProduct,
      complianceDescription: htmlString,
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
      complianceDescription: product.complianceDescription
    };

      const myResponse = await axios.post(apiUrl, requestBody);
      alert("Product was succesfully updated.");

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
    console.log("IN FETCH");
    console.log(requestBody);
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
        console.log("DATA");
        console.log(data);
        setProduct(data);
        const markdownContent = htmlToMd(data.complianceDescription);
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
            <div classname = "viewButtons">
        <button className='editorButton' onClick={toggleDisplayMode}>
          {isRichTextMode ? 'Use Markdown Editor' : 'Use Rich Text Editor'}
        </button>
      {designerMode && (
                <button className = "actionbutton" onClick={handleUpdate}>Update</button>
            )}
      </div>
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
              <label htmlFor="productDescription">Compliance Description</label>
              <br />
              {isRichTextMode ? (
                 <div style={{ overflowY: "auto", marginTop: "10px" , marginBottom: "14px", border: "1px solid white" }}>
                <ReactQuill
                  value={product.complianceDescription}
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
                  className="ProductComplienceviewinput"
                  onChange={handleComplianceDescriptionChange}
                  disabled = {!designerMode} 
                  readOnly =  {!designerMode}        
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
          <p>Loading product information...</p>
        )}
      </div>

      
    </div>
  );
}

export default Productcomplianceview;
