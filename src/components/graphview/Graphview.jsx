import React, { useState, useEffect,useRef  } from "react"
import { Graph } from "react-d3-graph"
import "./graphview.css"
import axios from "axios";
import Modal from "../modal/Modal";
import Modallink from "../modallink/Modallink";



const Graphview = ({ selectedProduct, selectedWork,onTaskChange,onLinkChange,graphChange, designerMode }) => {
  console.log("SUPERDESIGNERMODE");
  console.log(designerMode);

  const d3Config = {
    gravity: 0,
    linkLength: 100,
    linkStrength: 0,
    disableLinkForce: true
  };

  const config = {
   
    nodeHighlightBehavior: true,
    directed: true,
    d3: d3Config,
    node: 
    {
      
      highlightStrokeColor: "red",
      labelProperty: "label",
      fontSize: 10,
      fontColor:"#03A062",
      draggable: true,
    },
    link: {
      highlightColor: "#03A062",
      renderArrow: true,
      strokeWidth: 2,
    },
    width: 700, // Set the width of the graph (adjust as needed)
    height: 200, // Set the height of the graph (adjust as needed)
    "freezeAllDragEvents": !designerMode,
    "staticGraph": !designerMode,
  };
  
  
  
  // Define a state variable to store the data from the API
    const [data, setData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [selectedEditMode, setSelectedEditMode] = useState(false);

    const [showModallink, setShowModallink] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedLink, setSelectedLink] = useState(null);
    const [nodesAdded, setNodesAdded] = useState(0);
  
    const onClickGraph = function(graph) {
      setSelectedTask(null);
      setSelectedLink(null);
      setSelectedWorkflow(graph);
      setNodesAdded(0);
      console.log("graph");
      console.log(graph);
      onTaskChange("workflow",selectedProduct, graph.name,null,null);
    
    };

    const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    function generateUniqueString(startingLetter) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const prefix = startingLetter;
      let uniqueString = prefix;
    
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        uniqueString += alphabet.charAt(randomIndex);
      }
    
      return uniqueString;
    }

    async function handleAddNode()  {
      if (!selectedWorkflow) {
        alert("Please select a workflow first by clicking on it, before adding nodes");
        return;
      }

      
     
      // generate a new node id based on the length of the nodes array
      const newNodeId = generateUniqueString("T");
      
      console.log(newNodeId);


      const mybody = {
        clientNr: process.env.REACT_APP_CLIENTNR,
        explorerId: process.env.REACT_APP_EXPLORERID,
        workflowName: selectedWorkflow.name,
        taskId: newNodeId,
        name: newNodeId,
        description: "No Description Yet",
        apiName:"",
        symbolType:"circle",
        x:  getRandomNumber(25, 150), 
        y:  getRandomNumber(25, 150),
      };

      console.log("task insert object");
      console.log(mybody);

      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/task/register", mybody);
      
      // onTaskChange("task",selectedProduct, selectedWorkflow.name,"",newNodeId);
      setNodesAdded(nodesAdded+1);
    };

   


    function handleAddLink()
    {
      setShowModallink(true);
    }

    function removeFromLinkList(objToRemove, arr) {
      // Use Array.findIndex to find the index of the object in the array
      const indexToRemove = arr.findIndex(obj => obj.source === objToRemove.source && obj.target === objToRemove.target);
  
      // Check if the object was found
      if (indexToRemove !== -1) {
          // Use Array.splice to remove the object at the found index
          arr.splice(indexToRemove, 1);
      }
      // Return the updated array
    return arr;
      }

    const handleDeleteLink = async () => {
      if (!selectedWorkflow) {
        alert("Please select a workflow before trying to delete a link.");
        return;
      }
      if (!selectedLink) {
        alert("Please select a link before trying to delete a link.");
        return;
      }

      selectedLink
      const myCurrentLinkList = selectedWorkflow.links;

      const myNewLinkList = removeFromLinkList(selectedLink, myCurrentLinkList)
    
      const myPayload = {
        clientNr: process.env.REACT_APP_CLIENTNR,
        explorerId: process.env.REACT_APP_EXPLORERID,
        workflowName: selectedWorkflow.name,
        links: myNewLinkList, // You might need to adjust this based on your data structure
      };

    
      try {
        // Make the API call to delete the node
        const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/link/update", myPayload);
        
        // Update the state or perform any other necessary actions
        setNodesAdded(nodesAdded + 1);
        setSelectedLink(null);
      } catch (error) {
        console.error("Error deleting Link:", error);
        // Handle the error appropriately
      }
    };
    
    const handleDeleteNode = async () => {
      if (!selectedWorkflow) {
        alert("Please select a workflow before trying to delete.");
        return;
      }
      if (!selectedTask) {
        alert("Please select a task before trying to delete.");
        return;
      }
    
      const nodeToDelete = {
        clientNr: process.env.REACT_APP_CLIENTNR,
        explorerId: process.env.REACT_APP_EXPLORERID,
        workflowName: selectedWorkflow.name,
        taskId: selectedTask.id, 
      };

    
      try {
        // Make the API call to delete the node
        const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/task/delete", nodeToDelete);
        
        // Update the state or perform any other necessary actions
        setNodesAdded(nodesAdded + 1);
        setSelectedTask(null);
      } catch (error) {
        console.error("Error deleting node:", error);
        // Handle the error appropriately
      }
    };

    function updateNodePosition(nodeId, x, y, workflowName) {
      // Use the axios.post method to send a POST request with the node id, x, and y as the request body
      const myPositionPayload = {
        clientNr: process.env.REACT_APP_CLIENTNR,
        explorerId: process.env.REACT_APP_EXPLORERID,
        workflowName: workflowName,
        taskId: nodeId,
        x: x,
        y: y
      }
      try { 
      console.log("Payload");
      console.log(myPositionPayload);
      const myresponse = axios.post(process.env.REACT_APP_CENTRAL_BACK + "/task/update",myPositionPayload)
    }
    catch (error) {
      console.error("Error updating node:", error);
      // Handle the error appropriately
    };
    }

  function findType(arr, source, target) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].source === source && arr[i].target === target) {
          return arr[i].type;
        }
      }
      // Return null or any default value if the combination is not found
      return null;
  }

   const handleClickLink = function(sourceId,targetId,graph) {
    console.log("LINK CLICKED");
    console.log(sourceId);
    console.log(targetId);
    console.log(graph);
    // find the type of the link
    // graph.links[..]

    const myType = findType(graph.links, sourceId, targetId)
    const myLinkObject =
    {
      source: sourceId,
      target: targetId,
      type: myType
    };
    setSelectedLink(myLinkObject);
    onLinkChange("link",selectedProduct, graph.name,myLinkObject);
    // setSelectedWorkflow(graph);

   }

    const onClickNode = function(nodeId, node,graphName, graph) {
      if ( node.apiName && node.apiName !=="")
      {
      onTaskChange("taskapi",selectedProduct,graphName,node.apiName,nodeId);
      }
      else
      {
        onTaskChange("task",selectedProduct, graphName,node.apiName,nodeId);
      }
      setSelectedTask(node);
      setSelectedWorkflow(graph);
      setSelectedLink(null);
    };

    const onDoubleClickNode = function(nodeId, node,graphName,graph) {
      if ( node.apiName && node.apiName !=="")
      {
      onTaskChange("api",selectedProduct,graphName,node.apiName,nodeId);
      }
      else
      {
        alert("Task is not an API, double click will not work")
      }

      setSelectedTask(node);
      // setSelectedWorkflow(graph);
    };

 const onZoomChange = function(previousZoom, newZoom) {
};


    const handleShowModal = (graph) => {
      setSelectedWorkflow(graph);
      setShowModal(true);
    };

   


    const fetchData = async () => {
      try {
        const mybody = {
          clientNr: process.env.REACT_APP_CLIENTNR,
          explorerId: process.env.REACT_APP_EXPLORERID,
          status: designerMode ? "All" : "Public",
        }

        if (selectedProduct && selectedWork) {
          // Case: Both product and workflow are selected
          mybody.productName = selectedProduct;
          mybody.name = selectedWork;
        } else if (selectedProduct) {
          // Case: Only product is selected
          mybody.productName = selectedProduct;
        }
    
        // Use different API endpoints for each case


        let endpoint = "/workflow/queryonegraph";
    
        if (!selectedProduct) {
          endpoint = "/workflow/queryallgraphs";
          setData([]);
          return
        } else if (selectedProduct && !selectedWork) {
          endpoint = "/workflow/queryallgraphsgivenproduct";
        }
    
        // Make the API call using axios and parse the response as JSON
        const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + endpoint, mybody);
        const json = response.data;
    
        // Set the data state variable with the filtered JSON data
        setData(json);
        console.log(json);
        if ((json.length > 0) && selectedProduct && selectedWork) {
          onClickGraph(json[0]);
        }
      } catch (error) {
        // Handle any errors
        console.error(error);
      }
    };
    
  
    // Use useEffect to fetch the data when the component mounts
    useEffect(() => {
      fetchData();
    },[selectedProduct,selectedWork,nodesAdded, graphChange]);

    return (
      <div className= "App">
        {designerMode &&(
        <div className="buttons">
        <button className = "actionButton" onClick={() => handleAddNode()}>Add Task</button>
        <button className = "actionButton" onClick={() => handleDeleteNode()}>Remove Task</button>
        <button className = "actionButton" onClick={() => handleAddLink()}>Add Link</button>
        <button className = "actionButton" onClick={() => handleDeleteLink()}>Remove Link</button>  
        </div>
        )}
        <div className="top-part">
          {data.map((graph, index) => (
            <div key={index}>
              <div
            className="graph-header"
            onClick={() => {
              console.log("Clicked graph:", graph); // Debugging statement
              handleShowModal(graph);
            }}
          >
            {graph.name}
          </div>
          <Graph
              key={index}
              id={`graph-${index}`}
              data={{
                ...graph,
                nodes: graph.nodes.map((node) => ({
                  ...node,
                  // Set color based on conditions
                  color:
                    node.apiName !== ""
                      ? "blue"
                      : "#03A062",
                })),
              }}
              config={config}
              d3 = {d3Config}
              onClickGraph={() => onClickGraph(graph)}
              onClickNode={(nodeId,node) => onClickNode(nodeId,node, graph.name,graph)}
              onClickLink = {(source,target) => handleClickLink(source,target,graph)}
              onDoubleClickNode={(nodeId,node) => onDoubleClickNode(nodeId,node, graph.name,graph)}
              onZoomChange={onZoomChange}
              onNodePositionChange = {(nodeId,x,y) => updateNodePosition(nodeId,x,y, graph.name)}
        
            />
            </div>
          ))}
        </div>
        
        {showModallink && (
        <Modallink
          graph={selectedWorkflow}
          onClose={() => {
            setShowModallink(false);
          }}
        />
      )}
      </div>
    );
          }   
    
export default Graphview;