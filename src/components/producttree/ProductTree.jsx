import React, { useState, useEffect } from 'react';
import "./producttree.css" ;
import axios from "axios";
import ApiTerminal from "../../components/apiTerminal/ApiTerminal";
import ApiCode from "../../components/apicode/ApiCode";
import WorkflowCode from "../../components/workflowcode/WorkflowCode";
import Graphview from "../../components/graphview/Graphview";
import Productview from "../productview/Productview";
import Productcomplianceview from "../productcomplianceview/Productcomplianceview";
import Workflowview from '../workflowview/Workflowview';
import Workflowcomplianceview from '../workflowcomplianceview/Workflowcomplianceview';
import Workflowterminal from '../workflowterminal/Workflowterminal';
import Taskview from '../taskview/Taskview';
import Taskcomplianceview from '../taskcomplianceview/Taskcomplianceview';
import Linkview from '../linkview/Linkview';
import ContextMenu from "../contextmenu/ContextMenu"; 
import Modalworkflow from "../modalworkflow/Modalworkflow"; 
import Modalproduct from "../modalproduct/Modalproduct";
import Modalconfiguration from "../modalconfiguration/Modalconfiguration";
import Modalapidefimport from "../modalapidefimport/Modalapidefimport";  
import Chatbot from "../chatbot/Chatbot"; 
import { FiMoreVertical } from 'react-icons/fi'
import {convertToOpenAPI} from "../../utils/utils.js";
import jsYaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { TerminalContextProvider } from "react-terminal";

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

const ProductTree = ({designerMode}) => {
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWork, setSelectedWorkflow] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [selectedApi, setSelectedApi] = useState(null);
  const [selectedCodeType, setCodeType] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedMenu,setMenu ] = useState(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false); 
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [newTreeItem, setNewTreeItem] = useState(0);
  const [newGraphItem, setNewGraphItem] = useState(0);

  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isApiDefImportModalOpen, setIsApiDefImportModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isConfigurationModalOpen, setIsConfigurationModalOpen] = useState(false);

  const openWorkflowModal = () => {
    setIsWorkflowModalOpen(true);
  };

  const openApiDefImportModal = () => {
    setIsApiDefImportModalOpen(true);
  };

  openApiDefImportModal

  const openProductModal = () => {
    setIsProductModalOpen(true);
  };

  const openConfigurationModal = () => {
    setIsConfigurationModalOpen(true);
  };


  const closeModal = () => {
    setIsWorkflowModalOpen(false);
    setIsProductModalOpen(false);
  };

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
      const openAPIObject = convertToOpenAPI(myApiList,myApi.name, myApi.description);
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


  async function exportWorkflowOpenApi(workflowName)
  {
    try {
      const myWorkflowbody = 
      {
        clientNr: clientNr,
        explorerId: explorerId,
        workflowName: workflowName
      }
      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/link/queryorderedapi", myWorkflowbody);
      const myApiList = await response.data;

      if (myApiList === undefined || myApiList.length === 0)
      {
        return
      }
      // remove empty object from array.
      const nonEmptyApiList = myApiList.filter(item => Object.keys(item).length > 0);

      const openAPIObject = convertToOpenAPI(nonEmptyApiList, workflowName,"collection of APIS belongin to workflow" );
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

  async function exportProductOpenApi(productName)
  {
    try {
      const myWorkflowListRequestBody =
      {
        clientNr: clientNr,
        explorerId: explorerId,
        productName: productName
      }

      const workflowListResponse = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/workflow/queryallgivenproduct", myWorkflowListRequestBody);
      const myWorkflowList = await workflowListResponse.data;
      if (myWorkflowList === undefined || myWorkflowList.length === 0)
      {
        return
      }

      var myProductApiList = [];

      for (const myWorkflow of myWorkflowList) 
      {

            const myWorkflowRequestbody = 
            {
              clientNr: clientNr,
              explorerId: explorerId,
              workflowName: myWorkflow.name
            }
            console.log('before query');
            console.log(myWorkflowRequestbody);

            try {
              const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/link/queryorderedapi", myWorkflowRequestbody);
              var myApiList = await response.data;
        
              if (myApiList === undefined || myApiList.length === 0) {
                myApiList = [];
              }
              // add myApiList to myProductApiList
              myProductApiList = myProductApiList.concat(myApiList);
            } catch (error) {
              // Handle the error for this specific API call, e.g., set myApiList to an empty array
              myApiList = [];
            }

          }
            // remove empty object from array.



      const nonEmptyApiList = myProductApiList.filter(item => Object.keys(item).length > 0)

      const openAPIObject = convertToOpenAPI(nonEmptyApiList, productName,"collection of APIS belongin to product" );
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
        if (selectedItemType === 'api'|| selectedItemType === 'taskapi' || selectedItemType === 'apicompliance') {
          setSelectedItemType("apicode");
        } else if (selectedItemType === 'workflow' || selectedItemType === 'workflowcompliance'|| selectedItemType === 'workflowterminal') {
          setSelectedItemType("workflowcode");
        }
        setCodeType(menuItem);
        break;
      case 'cURL':
          setMenu('cURL');
          if (selectedItemType === 'api' || selectedItemType === 'apicode' || selectedItemType === 'taskapi' || selectedItemType === 'apicompliance' ) {
            setSelectedItemType("api");
            break;
          } 
      case 'description':
          setMenu('description');
          if (selectedItemType === 'api' || selectedItemType === 'apicode' || selectedItemType === 'taskapi' || selectedItemType === 'apicompliance'  ) {
            setSelectedItemType("taskapi");
            break;  
          } 
          if (selectedItemType === 'task' || selectedItemType === 'taskcompliance') {
            setSelectedItemType("task");
            break;  
          } 
          if (selectedItemType === 'workflow' || selectedItemType === 'workflowcode'  || selectedItemType === 'workflowcompliance' || selectedItemType === 'workflowterminal') {
            setSelectedItemType("workflow");
            break;
          }
          if (selectedItemType === 'product' || selectedItemType === 'productcompliance' ) {
            setSelectedItemType("product");
            break;
          }
          break;
          case 'compliancedescription':
            setMenu('compliancedescription');
            if (selectedItemType === 'api' || selectedItemType === 'apicode' || selectedItemType === 'taskapi' ) {
              setSelectedItemType("apicompliance");
              break;  
            } 
            if (selectedItemType === 'task' ) {
              setSelectedItemType("taskcompliance");
              break;  
            } 
            if (selectedItemType === 'workflow' || selectedItemType === 'workflowcode' || selectedItemType === 'workflowterminal') {
              setSelectedItemType("workflowcompliance");
              break;
            }
            if (selectedItemType === 'product' || selectedItemType === 'productcompliance' ) {
              setSelectedItemType("productcompliance");
              break;
            }
            break;
            case 'workflowterminal':
              setMenu('workflowterminal');
              if (selectedItemType === 'workflow' || selectedItemType === 'workflowcode' || selectedItemType === 'workflowterminal' || selectedItemType === 'workflowcompliance') {
                setSelectedItemType("workflowterminal");
                break;
              }
              break;  
      case 'export-openapi':
        setMenu('export-openapi');
        if (selectedItemType === 'api'|| selectedItemType === 'apicode' || selectedItemType === 'taskapi' || selectedItemType === 'apicompliance') {
          exportApiOpenApi(selectedApi);
          break; } 
          if (selectedItemType === 'workflow' || selectedItemType === 'workflowcode'  || selectedItemType === 'workflowcompliance' || selectedItemType === 'workflowterminal' ) {
          exportWorkflowOpenApi(selectedWork);
          break;}
          if (selectedItemType === 'product' || selectedItemType === 'productcompliance' ) {
            exportProductOpenApi(selectedProduct);
            break;}
        break;
      default:
        if (menuItem !== 'close') {
          setMenu(menuItem);
        }
        break;
    }
    hideContextMenu();
  };
  


  const handleSelectedItemChange = (newselectItem,newProductName,newWorkflowName,newApiName, newTaskId) => {
    
    setSelectedItemType(newselectItem);
    setSelectedProduct(newProductName);
    
    setSelectedTaskId(newTaskId);
    setSelectedApi(newApiName);
    setSelectedWorkflow(newWorkflowName);
    setSelectedLink(null);
  };

  const handleSelectedLinkChange = (newselectItem,newProductName,newWorkflowName,newLink) => {
    
    setSelectedItemType(newselectItem);
    setSelectedProduct(newProductName);
    setSelectedWorkflow(newWorkflowName);
    setSelectedLink(newLink)
    setSelectedTaskId(null)
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
  }, [newTreeItem]);

  const fetchProducts = async () => {
    
    try {
      const mybody = {
        clientNr: clientNr,
        explorerId: explorerId,
        status: designerMode ? "All" : "Public",
      };
      // Make the API call using axios and parse the response as JSON
      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/product/gettree", mybody);
      const json = response.data;

      // Set the data state variable with the JSON data
      setProducts(json);
      // on first fetch set the productname
      setSelectedProduct(json[0].name)
      setSelectedItemType('product');
     
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
    setContextMenuPosition({ x: (e.clientX - 550), y: e.clientY - 275});
    setContextMenuVisible(true);
  };

  const hideContextMenu = () => {
    setContextMenuVisible(false);
  };

  return (
    <div className="main-container">
        <div className="left-container">
          {designerMode && (
          <div>
          <button className="open-modal-button" onClick={openConfigurationModal}>
          ...
          </button>
          <button className="open-modal-button" onClick={openProductModal}>
          Add Product
          </button>
          <button className="open-modal-button" onClick={openWorkflowModal}>
          Add Workflow
          </button>
          <button className="open-modal-button" onClick={openApiDefImportModal}>
          Import Api definitions
          </button>
          <br></br>
          <br></br>
          </div>
          )}

          {renderTree(products, false)}
        </div>
        <div className = "middle-panel">
        <div className="graph-view">
        {(selectedProduct || selectedWork) && (
          <Graphview
            selectedProduct={selectedProduct}
            selectedWork={selectedWork}
            onTaskChange = {handleSelectedItemChange}
            onLinkChange = {handleSelectedLinkChange}
            graphChange = {newGraphItem}
            designerMode={designerMode}
          />
        )}
        </div>
        
        <div className="lower-middle-panel">
        <div className="icon-right-align">
          <FiMoreVertical className="context-menu-icon" onClick={handleContextMenuClick} />
        </div>

        {isWorkflowModalOpen && (
        <Modalworkflow
          onClose={() => {
            setIsWorkflowModalOpen(false);
            setNewTreeItem(newTreeItem+1);
          }}
        />
      )}
       {isProductModalOpen && (
        <Modalproduct
          onClose={() => {
            setIsProductModalOpen(false);
            setNewTreeItem(newTreeItem+1);
          }}
        />
      )}
      {isConfigurationModalOpen && (
        <Modalconfiguration
          onClose={() => {
            setIsConfigurationModalOpen(false);
          }}
        />
      )}

        {isApiDefImportModalOpen && (
                <Modalapidefimport
                  onClose={() => {
                    setIsApiDefImportModalOpen(false);
                  }}
                />
              )}

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
        designerMode = {designerMode}
        updateTreeView = {() => {
          setNewTreeItem(newTreeItem+1);
        }}
        /> 
        : null}
        {selectedItemType === 'productcompliance' ? 
        <Productcomplianceview
        clientNr = {clientNr}
        explorerId = {explorerId}
        productName = {selectedProduct}
        designerMode = {designerMode}
        updateTreeView = {() => {
          setNewTreeItem(newTreeItem+1);
        }}
        /> 
        : null}
        {selectedItemType === 'workflow' ?
         <Workflowview
         clientNr = {clientNr}
         explorerId = {explorerId}
         productName = {selectedProduct}
         name = {selectedWork}
         designerMode = {designerMode}
         updateTreeView = {() => {
          setNewTreeItem(newTreeItem+1);
        }}
       /> 
         : null} 
        {selectedItemType === 'workflowcompliance' ?
         <Workflowcomplianceview
         clientNr = {clientNr}
         explorerId = {explorerId}
         productName = {selectedProduct}
         name = {selectedWork}
         designerMode = {designerMode}
         updateTreeView = {() => {
          setNewTreeItem(newTreeItem+1);
        }}
       /> 
         : null} 
        {selectedItemType === 'workflowterminal' ?
        <TerminalContextProvider>
         <Workflowterminal
         clientNr = {clientNr}
         explorerId = {explorerId}
         productName = {selectedProduct}
         name = {selectedWork}
         designerMode = {designerMode}
       /> 
       </TerminalContextProvider>
         : null} 
        {selectedItemType === 'task' || selectedItemType === 'taskapi' ?
         <Taskview
         clientNr = {clientNr}
         explorerId = {explorerId}
         workflowName = {selectedWork}
         taskId = {selectedTaskId}
         designerMode = {designerMode}
         updateGraphView = {() => {
          setNewGraphItem(newGraphItem+1);
        }}
       /> 
         : null} 

        {selectedItemType === 'taskcompliance' ||  selectedItemType === 'apicompliance' ?
         <Taskcomplianceview
         clientNr = {clientNr}
         explorerId = {explorerId}
         workflowName = {selectedWork}
         taskId = {selectedTaskId}
         designerMode = {designerMode}
         updateGraphView = {() => {
          setNewGraphItem(newGraphItem+1);
        }}
       /> 
         : null}  
        {selectedItemType === 'link' ?
         <Linkview
         clientNr = {clientNr}
         explorerId = {explorerId}
         workflowName = {selectedWork}
         mylink = {selectedLink}
         designerMode = {designerMode}
         updateGraphView = {() => {
          setNewGraphItem(newGraphItem+1);
        }}
       /> 
         : null} 
        {selectedItemType === 'api'  ?
         <ApiTerminal
         clientNr = {clientNr}
         explorerId = {explorerId}
         productName = {selectedProduct}
         workflowName = {selectedWork}
         apiName = {selectedApi}
         taskId = {selectedTaskId}
       /> 
         : null} 

        {(selectedItemType ==='apicode' ) ?
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
        {(selectedItemType === 'workflowcode') ?
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
      <div classname= "right-panel">
          <div className = "title-wrap">
          <div className= "title-bot"> AI Podium</div>
          </div>
          <Chatbot
           clientNr = {clientNr}
          />
        </div>
      </div>
  );
  
};

export default ProductTree;
