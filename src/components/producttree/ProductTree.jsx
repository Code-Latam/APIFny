import React, { useState, useEffect } from 'react';
import "./producttree.css" ;
import axios from "axios";
import ApiTerminal from "../../components/apiTerminal/ApiTerminal";
import Graphview from "../../components/graphview/Graphview";
import Productview from "../productview/Productview";
import Workflowview from '../workflowview/Workflowview';
import ContextMenu from "../contextmenu/ContextMenu"; 
import { FiMoreVertical } from 'react-icons/fi'

const clientNr = process.env.REACT_APP_CLIENTNR;
const explorerId = process.env.REACT_APP_EXPLORERID;

const TreeNode = ({ label, children, isChild, topLevelClick }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = (product) => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={`tree-node ${isChild ? 'child-node' : ''}`}>
      <span onClick={topLevelClick || toggleCollapse}>
        {collapsed ? '▶' : '▼'} {label}
      </span>
      <div style={{ display: collapsed ? 'none' : 'block' }}>
        {children}
      </div>
    </div>
  );
};

const ProductTree = () => {
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWork, setSelectedWorkflow] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedApi, setSelectedApi] = useState(null);
  const [products, setProducts] = useState([]);
  const [contextMenuVisible, setContextMenuVisible] = useState(false); 
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 }); 


  const handleSelectedItemChange = (newValue,newApiName, newTaskId) => {
    setSelectedItemType(newValue);
    setSelectedTaskId(newTaskId);
    setSelectedApi(newApiName);
  };

  const handleProductClick = (product) => {
    console.log("product clicked");
    console.log(product);
    setSelectedItemType('product'); // Set the selected item type to 'product'
    setSelectedProduct(product); // Set the selected product
    setSelectedWorkflow(null);
  };

  const handleWorkflowClick = (workflow,product) => {
    console.log("workflow clicked");
    console.log(workflow);
    setSelectedItemType('workflow');
    setSelectedWorkflow(workflow);
    setSelectedProduct(product);
  };

  useEffect(() => {
    // Fetch the initial products using an API call
    // Replace this with your actual API endpoint
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    
    try {
      const mybody = 
      {
        clientNr: clientNr,
        explorerId: explorerId
      }
      // Make the API call using axios and parse the response as JSON
      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/product/gettree", mybody);
      const json = response.data;

      // Set the data state variable with the JSON data
      setProducts(json);
    } catch (error) {
      // Handle any errors
      console.error(error);
    }

   //  const mockProducts = [
   //   { name: 'Product 1', workflows: ['Workflow 1', 'Workflow 2'] },
   //  { name: 'Product 2', workflows: ['Workflow 3'] },
   // ];

    // setProducts(mockProducts);
  };

  const renderTree = (nodes, isChild) => {
    return nodes.map((node, index) => (
      <TreeNode
        key={index}
        label={node.name}
        isChild={isChild}
        onProductClick={handleProductClick}
        topLevelClick={isChild ? undefined : () => handleProductClick(node.name)}
      >
        {node.workflows.map((workflow, wIndex) => (
          <div
            key={wIndex}
            className="workflow"
            onClick={() => handleWorkflowClick(workflow,node.name)} // Handle workflow click
          >
            {workflow}
          </div>
        ))}
      </TreeNode>
    ));
  };

  const handleContextMenuClick = (e) => {
    e.preventDefault();
    // Calculate the position of the context menu based on the click event
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  };

  const hideContextMenu = () => {
    setContextMenuVisible(false);
  };

  return (
    <div className="main-container">
        <div className="left-container">
          <br></br>
          {renderTree(products, false)}
        </div>
      <div className = "right-container">
        <div className="graph-view">
          <Graphview
            selectedProduct={selectedProduct}
            selectedWork={selectedWork}
            onTaskChange = {handleSelectedItemChange}
          />
        </div>
        <div className="lower-panel">

        <div className="context-menu-icon" onClick={handleContextMenuClick}>
        <FiMoreVertical /> {/* Use the kebab icon */}
          </div>
          {contextMenuVisible && (
            <ContextMenu
              selectedItemType={selectedItemType}
              onSelectMenuItem={(menuItem) => {
                // Handle menu item selection here
                hideContextMenu();
              }}
              position={contextMenuPosition}
            />
          )}


        {selectedItemType === 'product' ? 
        <Productview
        clientNr = {clientNr}
        explorerId = {explorerId}
        productName = {selectedProduct}
        /> 
        : null}
        {selectedItemType === 'workflow' ?
         <Workflowview
         clientNr = {clientNr}
         explorerId = {explorerId}
         productName = {selectedProduct}
         name = {selectedWork}
       /> 
         : null} 

        {selectedItemType === 'api' ?
         <ApiTerminal
         clientNr = {clientNr}
         explorerId = {explorerId}
         productName = {selectedProduct}
         workflowName = {selectedWork}
         apiName = {selectedApi}
         taskId = {selectedTaskId}
       /> 
         : null} 
        </div>
      </div>
      </div>
  );
  
};

export default ProductTree;
