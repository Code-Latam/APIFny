import React from 'react';
import './contextmenu.css';
import {
    RssFeed,
    Chat,
    PlayCircleFilledOutlined,
    Group,
    Bookmark,
    HelpOutline,
    WorkOutline,
    Event,
    School,
    Videocam,
    Adb,
    MoreVertIcon, 
    Description,
    Code,
    Folder,
    Close
  } from "@material-ui/icons";

  const ContextMenu = ({ selectedItemType, onSelectMenuItem, position }) => {
    console.log("Selected Item Type is:");
    console.log(selectedItemType);
  
    const handleMenuItemClick = (item) => {
      console.log("clicked");
      onSelectMenuItem(item);
    };
  
    const isCodeItem =
      selectedItemType === "api" ||
      selectedItemType === "apicode" ||
      selectedItemType === "workflowcode" ||
      selectedItemType === "taskapi" ||
      selectedItemType === "apicompliance";
  
    return (
      <div className="context-menu" style={{ top: position.y, left: position.x }}>
        {(isCodeItem || selectedItemType === "workflow" || selectedItemType === "workflowcompliance" || selectedItemType === "workflowterminal") && (
          <>
            {isCodeItem  && selectedItemType !== "workflowcode" && (
              <>
                <div className="menu-item" onClick={() => handleMenuItemClick("cURL")}>
                  <Code className="menu-icon" />
                  <span className="menu-text">cURL</span>
                </div>
              </>
            )}
            {(selectedItemType === "workflow" || selectedItemType === "workflowcompliance" || selectedItemType === "workflowterminal" || selectedItemType === "workflowcode") && (
              <>
            <div className="menu-separator"></div>
            <div className="menu-item" onClick={() => handleMenuItemClick("workflowterminal")}>
              <Code className="menu-icon" />
              <span className="menu-text">Run workflow..</span>
            </div> 
            </> 
            )}

            <div className="menu-separator"></div>
            <div className="menu-item" onClick={() => handleMenuItemClick("javascript")}>
              <Code className="menu-icon" />
              <span className="menu-text">Javascript Code</span>
            </div>
            <div className="menu-item" onClick={() => handleMenuItemClick("python")}>
              <Code className="menu-icon" />
              <span className="menu-text">Python Code</span>
            </div>
            <div className="menu-separator"></div>
            <div className="menu-item" onClick={() => handleMenuItemClick("export-openapi")}>
              <Folder className="menu-icon" />
              <span className="menu-text">Export Open API 3.0.0</span>
            </div>
          </>
        )}
        {selectedItemType === "product" && (
          <>
            <div className="menu-item" onClick={() => handleMenuItemClick("export-openapi")}>
              <Folder className="menu-icon" />
              <span className="menu-text">Export Open API 3.0.0</span>
            </div>
            
          </>
        )}
        <div className="menu-separator"></div>
        <div className="menu-item" onClick={() => handleMenuItemClick("description")}>
              <Description className="menu-icon" />
              <span className="menu-text">Description</span>
        </div>
        <div className="menu-item" onClick={() => handleMenuItemClick("compliancedescription")}>
              <Description className="menu-icon" />
              <span className="menu-text">Compliance..</span>
        </div>
        <div className="menu-item" onClick={() => handleMenuItemClick("Close")}>
          <Close className="menu-icon" />
          <span className="menu-text">Close</span>
        </div>
      </div>
    );
  };
  

export default ContextMenu;
