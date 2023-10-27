import React, { useState, useEffect } from "react";
import axios from "axios";
import "./modal.css";

function Modal({ graph, onClose }) {
console.log("Clicked graph:", graph); // Debugging statement

  return (
    <div className="modalDialog">
      <div>
        <div className="top">
          <div className="left">Workflow Information</div>
          <div className="close" onClick={onClose}>
            &times;
          </div>
        </div>
        <input
          type="text"
          id="name"
          value={graph.name}
          className="inputname"
          disabled
        />
        <div>
          <label htmlFor="descriptiveName">Description</label>
          <br />
          <textarea
            id="descriptiveName"
            value={graph.description}
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

export default Modal;
