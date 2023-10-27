import React, { useState, useEffect } from "react";
import axios from "axios";
import "./modaltask.css";

function Modaltask({ node, onClose }) {

  return (
    <div className="modalDialog">
      <div>
        <div className="top">
          <div className="left">Task Information</div>
          <div className="close" onClick={onClose}>
            &times;
          </div>
        </div>
        <label htmlFor="taskid">Task Id</label>
        <input
          type="text"
          id="taskid"
          value={node.id}
          className="inputname"
          disabled
        />
        <label htmlFor="taskname">Task Name</label>
        <input
          type="text"
          id="taskname"
          value={node.label}
          className="inputname"
          disabled
        />
        <label htmlFor="apiname">Associated API</label>
        <input
          type="text"
          id="apiname"
          value={node.apiName}
          className="inputname"
          disabled
        />
        <div>
          <label htmlFor="descriptiveName">Description</label>
          <br />
          <textarea
            id="descriptiveName"
            value={node.description}
            className="input"
            disabled
            rows="4"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          />
        </div>
        <div className="switch-container">
        </div>
        <div className="modalDialog-buttons">
          <button className="modalcancelbutton" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modaltask;
