import React, { useContext, useState } from "react";
import axios from "axios";
import "./fileupload.css";
import { AuthContext } from "../../context/AuthContext";
import { encodebody, getDecodedBody } from "../../utils/utils.js";

const PF = process.env.REACT_APP_PUBLIC_FOLDER;

function FileUpload(props) {
  const { user } = useContext(AuthContext);
  const fileInputRef = React.createRef();
  const file2InputRef = React.createRef();
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false); // State for confirmation dialog
  const [confirmation2Open, setConfirmation2Open] = useState(false);
  const [filename, setFilename] = useState("");
  const [files, setFiles] = useState(null); // State for uploaded files

  const handleCancelUpload = () => {
    // Close the confirmation dialog
    setConfirmationOpen(false);
    setConfirmation2Open(false);

    // Clear the file input when the user cancels
    fileInputRef.current.value = "";
    file2InputRef.current.value = "";

    // Reset the files state
    setFiles(null);
  };

  const handleFileChange = () => {
    const selectedFiles = fileInputRef.current.files;
    console.log("FILE SELECTED");
    console.log(file2InputRef.current.files);

    if (selectedFiles.length > 0) {
      console.log("IN THE LOOP");
      const selectedFilename = selectedFiles[0].name;
      setFilename(selectedFilename);
      // Display confirmation dialog before uploading
      setConfirmationOpen(true);
      setConfirmation2Open(false);
      // Set the selected files in the state
      setFiles(selectedFiles[0]);
    } else {
      return;
    }
  };

  const handleFile2Change = () => {
    const selectedFiles = file2InputRef.current.files;
    console.log("FILE SELECTED");
    console.log(file2InputRef.current.files);

    if (selectedFiles.length > 0) {
      console.log("IN THE LOOP 2");
      const selectedFilename = selectedFiles[0].name;
      setFilename(selectedFilename);
      // Display confirmation dialog before uploading
      setConfirmation2Open(true);
      setConfirmationOpen(false);
      // Set the selected files in the state
      setFiles(selectedFiles[0]);
    } else {
      return;
    }
  };

  const confirmUpload = () => {
    // Close the confirmation dialog
    setConfirmationOpen(false);

    // Set progress to 25% before uploading
    setProgress(25);
    setShowProgressBar(true); // Show the progress bar

    const formData = new FormData();
   
    const clientNr = process.env.REACT_APP_CLIENTNR;
    const explorerId = process.env.REACT_APP_EXPLORERID
    
    formData.append("clientNr", clientNr);
    formData.append("explorerId", explorerId);
    formData.append("file", files);

    axios
      .post(process.env.REACT_APP_CENTRAL_BACK + "/uploadapidef", formData)
      .then((response) => {
        const myfilename = files.name;
        console.log(myfilename);
        // Set progress to 25% before calling API
        setProgress(50);
        callAPI(clientNr, process.env.REACT_APP_HOST_CENTRAL_BACK + "/upload/postmandef/"+clientNr+ "/" + explorerId + "/" + myfilename);
      })
      .catch((error) => {
        alert(error.response.data);
      });
  };

  function callAPI(clientNr,url) {
    const originalbody = {
      clientNr: clientNr,
      url: url
    };
    const body = originalbody;
    axios
      .post(process.env.REACT_APP_CENTRAL_BACK + "/apiimport/postman", body)
      .then((response) => {
        setProgress(90);
        alert("finished uploading")
        setShowProgressBar(false);
        window.location.reload();
      })
      .catch((error) => {
        alert(error.response.data);
      });
  }

  const confirmUpload2 = () => {
    // Close the confirmation dialog
    setConfirmation2Open(false);

    // Set progress to 25% before uploading
    setProgress(25);
    setShowProgressBar(true); // Show the progress bar

    const formData = new FormData();
   
    const clientNr = process.env.REACT_APP_CLIENTNR;
    const explorerId = process.env.REACT_APP_EXPLORERID
    
    formData.append("clientNr", clientNr);
    formData.append("explorerId", explorerId);
    formData.append("file", files);

    axios
      .post(process.env.REACT_APP_CENTRAL_BACK + "/uploadapidef2", formData)
      .then((response) => {
        const myfilename = files.name;
        console.log(myfilename);
        // Set progress to 25% before calling API
        setProgress(50);
        callAPI2(clientNr, process.env.REACT_APP_HOST_CENTRAL_BACK + "/upload/swaggerdef/"+clientNr+ "/" + explorerId + "/" + myfilename);
      })
      .catch((error) => {
        alert(error.response.data);
      });
  };

  function callAPI2(clientNr,url) {
    const originalbody = {
      clientNr: clientNr,
      url: url
    };
    const body = originalbody;
    axios
      .post(process.env.REACT_APP_CENTRAL_BACK + "/apiimport/openapi", body)
      .then((response) => {
        setProgress(90);
        alert("finished uploading")
        setShowProgressBar(false);
        window.location.reload();
      })
      .catch((error) => {
        alert(error.response.data);
      });
  }


  

  return (
    <div>
      <div className="uploadBox">
        <div className="uploadelements">
          <label htmlFor="file" className="my-custom-file-label">
            Upload Postman APIS v2.1
          </label>
          <input
            type="file"
            id="file"
            name="file"
            className="fileInput"
            acceptCharset="utf-8"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange} // Trigger file upload on change
          />
          <label htmlFor="file2" className="my-custom-file-label">
            Upload Swagger OpenApi v3.0
          </label>
          <input
            type="file"
            id="file2"
            name="file2"
            className="fileInput"
            acceptCharset="utf-8"
            ref={file2InputRef}
            style={{ display: "none" }}
            onChange={handleFile2Change} // Trigger file upload on change
          />
        </div>
        <p></p>
        {showProgressBar && (
          <div className="progressContainer">
            <div className="progressText">{`${Math.round(progress)}%`}</div>
            <progress value={progress} max="100" className="progressBar" />
          </div>
        )}
      </div>

      {confirmationOpen && (
        <div className="confirmationDialog">
          <p>
            <b>Are you sure, you want to upload the Postman collection?</b>
          </p>
          <p>
            If there are API definitions with the same name, It will overwrite them.
          </p>
          <br></br>
          <div className="filetext">{filename} </div>
          <div className="confirmationDialog-buttons">
            <button className="proceedbutton" onClick={confirmUpload}>
              Proceed
            </button>
            <button className="cancelbutton" onClick={handleCancelUpload}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {confirmation2Open && (
        <div className="confirmationDialog">
          <p>
            <b>Are you sure, you want to upload the OpenApi 3.0 definitions?</b>
          </p>
          <p>
            If there are API definitions with the same name, It will overwrite them.
          </p>
          <br></br>
          <div className="filetext">{filename} </div>
          <div className="confirmationDialog-buttons">
            <button className="proceedbutton" onClick={confirmUpload2}>
              Proceed
            </button>
            <button className="cancelbutton" onClick={handleCancelUpload}>
              Cancel
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default FileUpload;
