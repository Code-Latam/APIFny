import React, { useState, useEffect } from "react";
import axios from "axios";
import "./modallink.css";

function Modallink({ graph, onClose }) {

  const [sources, setSources] = useState([]);
  const [targets, setTargets] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedType, setSelectedType] = useState("STRAIGHT");
  const typeOptions = ["STRAIGHT", "CURVE_SMOOTH", "CURVE_FULL"];

  useEffect(() => {
    const fetchData = async () => {
      const myBody = {
        clientNr: process.env.REACT_APP_CLIENTNR,
        explorerId: process.env.REACT_APP_EXPLORERID,
        workflowName: graph.name,
      }
      try {
        const tasksresponse = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/task/queryall", myBody);

        setSources(tasksresponse.data);
        setTargets(tasksresponse.data);
        
        if (tasksresponse.data.length > 0) {
          setSelectedSource(tasksresponse.data[0].taskId);
        }
        if (tasksresponse.data.length > 0) {
          setSelectedTarget(tasksresponse.data[0].taskId);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once after the initial render

  const handleSave = async () => {
    // Perform save logic with selectedSource and selectedTarget
    // You can use these values to update your backend or state, as needed
    if (await handlecreateLink(selectedSource, selectedTarget))
    {
      onClose(); 
    }  
  };

  async function handlecreateLink(nodeIdSource, nodeIdtarget)  {
    
    const currentLinks = graph.links

    const MyNewLinkObject = {
      source: nodeIdSource,
      target: nodeIdtarget,
      type: selectedType
    }

    if (!validNewLink(MyNewLinkObject,currentLinks ))
    {
      alert("link source and target not valid. Please us another combination");
      return false;
    }
    currentLinks.push(MyNewLinkObject);

    const mypayload = {
      clientNr: process.env.REACT_APP_CLIENTNR,
      explorerId: process.env.REACT_APP_EXPLORERID,
      workflowName: graph.name,
      links: currentLinks
    };

    console.log("GRAPH");
    console.log(graph);

    console.log("Link create Payload for API");
    console.log(mypayload);

    const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/link/update", mypayload);
    
    // setNodesAdded(nodesAdded+1);
    return true;
  };

  function validNewLink(myLinkObject, myLinkList)
  {
    console.log("We are in validation of link");
    console.log("my link object")
    console.log(myLinkObject);
    console.log("my link list");
    console.log(myLinkList);

    if (myLinkObject.source === myLinkObject.target )
    {
    console.log("hello2");
    return false
    }

    if (isObjectInList(myLinkObject,myLinkList))
    {
    console.log("hello3");
    return false
    }
    console.log("hello4");
    return true;
  }

  const isObjectInList = (obj, list) => {
    return list.some(item => item.source === obj.source && item.target === obj.target);
  };


  return (
    <div className="modalDialog">
      <div>
        <div className="top">
          <div className="left">Add new Link</div>
          <div className="close" onClick={onClose}>
            &times;
          </div>
        </div>

        <div className="switch-container">
          <label htmlFor="sources">Source</label>
          <select
            id="sources"
            defaultValue={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            {sources.map((source) => (
              <option key={source.taskId} value={source.taskId}>
                {source.name}
              </option>
            ))}
          </select>

          <label htmlFor="targets">Target</label>
          <select
            id="targets"
            defaultValue={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
          >
            {targets.map((target) => (
              <option key={target.taskId} value={target.taskId}>
                {target.name}
              </option>
            ))}
          </select>
          <label htmlFor="linkType">Link Type</label>
          <select
            id="linkType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="modalDialog-buttons">
          <button className="modalclosebutton" onClick={onClose}>
            Close
          </button>
          <button className="modalsavebutton" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}


export default Modallink;
