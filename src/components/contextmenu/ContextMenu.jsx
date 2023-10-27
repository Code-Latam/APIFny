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
  const handleMenuItemClick = (item) => {
    console.log("clicked");
    onSelectMenuItem(item);
  };

  return (
    
    <div
      className="context-menu"
      style={{ top: position.y, left: position.x }}
    >
      {selectedItemType === 'workflow' || selectedItemType === 'api' ? (
        <>
          <div className="menu-item" onClick={() => handleMenuItemClick('Description')}>
            <Description className="menu-icon" />
            <span className="menu-text">Description</span>
          </div>
          <div className="menu-separator"></div>
          <div className="menu-item" onClick={() => handleMenuItemClick('Javascript Code')}>
          <Code className="menu-icon" />
            <span className="menu-text">Javascript Code</span>
          </div>
          <div className="menu-item" onClick={() => handleMenuItemClick('Python Code')}>
          <Code className="menu-icon" />
            <span className="menu-text">Python Code</span>
          </div>
          <div className="menu-separator"></div>
          <div className="menu-item" onClick={() => handleMenuItemClick('Export to Swagger/Postman')}>
          <Folder className="menu-icon" />
            <span className="menu-text">Export to Swagger/Postman'</span>
          </div>
          {selectedItemType === 'api' && (
            
            <div className="menu-item" onClick={() => handleMenuItemClick('Export to Chatbot/Wiki')}>
          <Folder className="menu-icon" />
            <span className="menu-text">Export to Chatbot/Wiki'</span>
          </div>

          )}
        </>
      ) : null}
          <div className="menu-separator"></div>
          <div className="menu-item" onClick={() => handleMenuItemClick('Close')}>
          <Close className="menu-icon" />
            <span className="menu-text">Close</span>
          </div>
    </div>
  );
};

export default ContextMenu;
