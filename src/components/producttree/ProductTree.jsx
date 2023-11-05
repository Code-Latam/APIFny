import React, { useState, useEffect } from 'react';
import "./producttree.css" ;
import axios from "axios";
import ApiTerminal from "../../components/apiTerminal/ApiTerminal";
import ApiCode from "../../components/apicode/ApiCode";
import WorkflowCode from "../../components/workflowcode/WorkflowCode";
import Graphview from "../../components/graphview/Graphview";
import Productview from "../productview/Productview";
import Workflowview from '../workflowview/Workflowview';
import ContextMenu from "../contextmenu/ContextMenu"; 
import { FiMoreVertical } from 'react-icons/fi'
import {convertToOpenAPI} from "../../utils/utils.js";
import jsYaml from 'js-yaml';
import { saveAs } from 'file-saver';

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
  const [selectedCodeType, setCodeType] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedMenu,setMenu ] = useState(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false); 
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 }); 

  async function exportApiOpenApi(ExportApiName)
  {
    try {
      const myApibody = 
      {
        clientNr: clientNr,
        name: ExportApiName
      }
      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/api/query", myApibody);
      const myApi = await response.data;
      const myApiList = [];
      myApiList.push(myApi);

      // create the openApi Object
      const openAPIObject = convertToOpenAPI(myApiList);
      const yamlContent = jsYaml.dump(openAPIObject, { skipInvalid: true });
      // Create a Blob from the YAML content
      const blob = new Blob([yamlContent], { type: 'text/yaml' });
      // Use the saveAs function from the file-saver library to trigger the download
      saveAs(blob, 'api.yaml');
    } catch (error) {
      // Handle any errors
      console.error(error);
    }
  }


  const handleSelectMenuItem = (menuItem) => {
    switch (menuItem) {
      case 'javascript':
      case 'python':
        setMenu('code');
        if (selectedItemType === 'api') {
          setSelectedItemType("apicode");
        } else if (selectedItemType === 'workflow') {
          setSelectedItemType("workflowcode");
        }
        setCodeType(menuItem);
        break;
      case 'export-openapi':
        setMenu('export-openapi');
        if (selectedItemType === 'api'|| selectedItemType === 'apicode') {
          exportApiOpenApi(selectedApi);
        } else if (selectedItemType === 'workflow' || selectedItemType === 'workflowcode' ) {
          exportApiOpenApi(selectedApi);
        }
        break;
      default:
        if (menuItem !== 'close') {
          setMenu(menuItem);
        }
        break;
    }
    hideContextMenu();
  };
  


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
              onSelectMenuItem={handleSelectMenuItem}
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

        {selectedItemType === 'api' || selectedMenu === 'cURL' ?
         <ApiTerminal
         clientNr = {clientNr}
         explorerId = {explorerId}
         productName = {selectedProduct}
         workflowName = {selectedWork}
         apiName = {selectedApi}
         taskId = {selectedTaskId}
       /> 
         : null} 

        {(selectedItemType ==='apicode' && selectedMenu === 'code') ?
         <ApiCode
         clientNr = {clientNr}
         explorerId = {explorerId}
         productName = {selectedProduct}
         workflowName = {selectedWork}
         apiName = {selectedApi}
         taskId = {selectedTaskId}
         codeType = {selectedCodeType}
       /> 
         : null} 
        {(selectedItemType === 'workflowcode' && selectedMenu ==='code') ?
         <WorkflowCode
         clientNr = {clientNr}
         explorerId = {explorerId}
         productName = {selectedProduct}
         workflowName = {selectedWork}
         codeType = {selectedCodeType}
       /> 
         : null} 
        </div>
      </div>
      </div>
  );
  
};

export default ProductTree;
