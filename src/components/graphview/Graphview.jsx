import React, { useState, useEffect,useRef  } from "react"
import { Graph } from "react-d3-graph"
import "./graphview.css"
import axios from "axios";
import Modal from "../modal/Modal";
import Modaltask from "../modaltask/Modaltask";

const config = {
  nodeHighlightBehavior: true,
  directed: true,
  node: 
  {
    color: (node) => node.color,
    highlightStrokeColor: "#03A062",
    labelProperty: "label",
    fontSize: 10,
    fontColor:"#03A062",
  },
  link: {
    highlightColor: "#03A062",
    renderArrow: true,
    strokeWidth: 2,
  },
  width: 400, // Set the width of the graph (adjust as needed)
  height: 300, // Set the height of the graph (adjust as needed)
  freezeAllDragEvents: true
};

const Graphview = ({ selectedProduct, selectedWork,onTaskChange }) => {
    // Define a state variable to store the data from the API
    const [data, setData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);

    const [showModaltask, setShowModaltask] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
  
    const onClickGraph = function(graph) {
      setSelectedWorkflow(graph);
      console.log("graph");
      console.log(graph);
      onTaskChange("workflow",selectedProduct, graph.name,null,null);
      //handleShowModal(graph);
    };

    const graphRef = useRef(null);

    const onClickNode = function(nodeId, node,graphName) {
      if ( node.apiName && node.apiName !=="")
      {
      onTaskChange("taskapi",selectedProduct,graphName,node.apiName,nodeId);
      }
      else
      {
        onTaskChange("task",selectedProduct, graphName,node.apiName,nodeId);
      }
      // handleShowModaltask(nodeId, node);
    };

    const onDoubleClickNode = function(nodeId, node,graphName) {
      if ( node.apiName && node.apiName !=="")
      {
      onTaskChange("api",selectedProduct,graphName,node.apiName,nodeId);
      }
      else
      {
        alert("Task is not an API, double click will not work")
      }
    };

 const onZoomChange = function(previousZoom, newZoom) {
};


    const handleShowModal = (graph) => {
      setSelectedWorkflow(graph);
      setShowModal(true);
    };

    const handleShowModaltask = (nodeId,node) => {
      setSelectedTask(node);
      setShowModaltask(true);
    };

    const fetchData = async () => {
      try {
        const mybody = {
          clientNr: "Pockyt",
          explorerId: "1",
        };
        console.log("in fetch");
        console.log(selectedProduct);
        console.log(selectedWork);

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
        } else if (selectedProduct && !selectedWork) {
          endpoint = "/workflow/queryallgraphsgivenproduct";
        }
    
        // Make the API call using axios and parse the response as JSON
        const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + endpoint, mybody);
        const json = response.data;
    
        // Set the data state variable with the filtered JSON data
        setData(json);
      } catch (error) {
        // Handle any errors
        console.error(error);
      }
    };
    
  
    // Use useEffect to fetch the data when the component mounts
    useEffect(() => {
      fetchData();
    },[selectedProduct,selectedWork]);

    return (
      <div className= "App">
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
              onClickGraph={() => onClickGraph(graph)}
              onClickNode={(nodeId,node) => onClickNode(nodeId,node, graph.name)}
              onDoubleClickNode={(nodeId,node) => onDoubleClickNode(nodeId,node, graph.name)}
              onZoomChange={onZoomChange}
            />
            </div>
          ))}
        </div>
        {showModal && (
        <Modal
          graph={selectedWorkflow}
          onClose={() => {
            setSelectedWorkflow(null);
            setShowModal(false);
          }}
        />
      )}
        {showModaltask && (
        <Modaltask
          node={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            setShowModaltask(false);
          }}
        />
      )}
      </div>
    );
          }   
    
export default Graphview;