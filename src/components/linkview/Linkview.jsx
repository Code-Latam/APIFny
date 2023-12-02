import React, { useState, useEffect } from 'react';
import "./linkview.css";
import axios from "axios";

function Linkview({ clientNr, explorerId, workflowName, mylink,designerMode,updateGraphView }) {

  const [link, setLink] = useState(mylink);
  const [selectedType, setSelectedType] = useState(mylink.type);
  const [sourceAndTargetNames, setSourceAndTargetNames] = useState({sourceName:"",targetName:""});
  const typeOptions = ["STRAIGHT", "CURVE_SMOOTH", "CURVE_FULL"];

  console.log('LINKVIEW');
  console.log(mylink)

  function replaceType(arr, source, target, newType) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].source === source && arr[i].target === target) {
        arr[i].type = newType;
        // If you want to stop after the first occurrence is replaced, you can return here
        return arr;
      }
    }
  }

  const handleUpdate = async () => {

    const MyrequestBody = {
      clientNr: clientNr,
      explorerId: explorerId,
      workflowName:workflowName
    };

    // get original links
    const myQueryResponse = await axios.post(process.env.REACT_APP_CENTRAL_BACK + '/link/query', MyrequestBody);
    const myLinks = myQueryResponse.data.links;

    // replace the type in the original links
    const myNewLinks =  replaceType(myLinks, mylink.source, mylink.target, selectedType) 
    
    console.log("LINKS");
    console.log(myNewLinks);
    console.log("test");

    // Update the links object
    const MyPayload = {
      clientNr: clientNr,
      explorerId: explorerId,
      workflowName:workflowName,
      links:myNewLinks
    };

      const myResponse = await axios.post(process.env.REACT_APP_CENTRAL_BACK + '/link/update', MyPayload);
      alert("Link was succesfully updated.");
      updateGraphView();
  };

  useEffect(() => {
    // Define the API URL for fetching the product

        // fetch the source name and target name of the nodes
        fetch();
  }, [workflowName,mylink]);

  async function fetch() {
    const myPayloadSource = {
      clientNr: clientNr,
      explorerId: explorerId,
      workflowName: workflowName,
      taskId: mylink.source

    }
    const myPayloadTarget = {
      clientNr: clientNr,
      explorerId: explorerId,
      workflowName: workflowName,
      taskId: mylink.target

    }

    const myResponseSource = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/task/query", myPayloadSource )
    const myResponseTarget = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/task/query", myPayloadTarget )
     
    console.log("AFTER FETCH");
    console.log(myResponseSource.data.name);


    const mySourceAndTargetNames = {
      sourceName: myResponseSource.data.name,
      targetName: myResponseTarget.data.name,
    }

    setSourceAndTargetNames(mySourceAndTargetNames)
    setLink(mylink);

  }

  return (
    <div className="Taskview">
      <div>
        
        {link ? (
          <div>
            <div>
              <label htmlFor="source">Source</label>
              <br />
              <input
                type="text"
                id="source"
                value={sourceAndTargetNames.sourceName}
                className="LinkViewinputname"
                disabled
              />
            </div>
            <div>
              <label htmlFor="target">Target</label>
              <br />
              <input
                type="text"
                id="target"
                value={sourceAndTargetNames.targetName}
                className="LinkViewinputname"
                disabled
              />
              <br/>
              <label htmlFor="linkType">Link Type</label>
              <br/>
              <select
                id="linkType"
                value={selectedType}
                className="LinkTViewType"
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={!designerMode }
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <br />
            {designerMode && (
              <div>
                <button onClick={handleUpdate}>Update</button>
              </div>
            )}
          </div>
        ) : (
          <p>Loading Link information...</p>
        )}
      </div>
    </div>
  );
}

export default Linkview;
