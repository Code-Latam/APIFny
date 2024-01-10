import React, { useState, useEffect } from 'react';
import { ReactTerminal } from "react-terminal";
import axios from 'axios';
import {makeCurlComponentFromApi,makeCurlComponentFromApiExecutionResult, HeadersGlobalAdd, requestBodyGlobalAdd, addAuthToHeaders, addAuthToRequestBody, parseApiHeaders, getConfiguration, isValidConfiguration} from "../../utils/api-spec-util.js";



const Workflowterminal = ({ clientNr, explorerId, productName, name, designerMode }) => {
  const [explorer, setExplorer] = useState([]);
  const [workflowStarted, setWorkflowStarted] = useState(false);
  const [apiList, setApiList] = useState([]);
  var current_api_index = 0;

  

  
  const commands = {
    whoami: "jackharper",
    cd: (directory) => {
      const myreturn = `changed path to ${directory}`;
      return myreturn;
    },
    run: async () => {
      setWorkflowStarted(true);
      current_api_index = 0;

      try {
       if (apiList.length === 0) 
        { return <div style={{ color: '#006400' }}> <br></br>{'There are no APIS to execute in this workflow'}</div>; }
      current_api_index = 0  ;
      const myOutput = await constructOutputAPIExecution(current_api_index)
      return <div style={{ color: '#006400' }}> <br></br><div>Workflow running..</div><br></br><div>Executed API..{apiList[current_api_index].name}</div><br></br>{myOutput}<br></br><div>Type "next" to execute next API or "stop" to end the workflow</div></div>;
      } catch (error) {
        console.error('Error during API execution:', error);
        return <div style={{ color: '#006400' }}> {'An error occured during API execution'}</div>;
      }
    },
    next: async () => {
      if (!workflowStarted)
      {  return <div style={{ color: '#006400' }}> Please start workflow first by typing "run"</div>;}
      current_api_index = current_api_index + 1;
      if (current_api_index === apiList.length) // we have overpassed the length of the api list
      {
        current_api_index = 0;
        setWorkflowStarted(false);
        return <div style={{ color: '#006400' }}> We have reached the end of the workflow. You can start the workflow again by typing "run"</div>;
      }
      try {
      const myOutput = await constructOutputAPIExecution(current_api_index)
      return <div style={{ color: '#006400' }}> <br></br><div>Executed API..{apiList[current_api_index].name}</div><br></br>{myOutput}<br></br><div>Type "next" to execute next API or "stop" to end the workflow</div></div>;
      } catch (error) {
        console.error('Error during API execution:', error);
        return <div style={{ color: '#006400' }}> {'An error occured during API execution. Type run to start the workflow again!'}</div>;
      }
    },
    stop: async () => {
      if (!workflowStarted)
      {  return <div style={{ color: '#006400' }}> Please start workflow first by typing "run"</div>;}
      current_api_index = 0;
      setWorkflowStarted(false)
      try {
        return <div style={{ color: '#006400' }}> <br></br>Workflow stopped! You can start the workflow again by typing "run"</div>;
      } catch (error) {
        console.error('Error during API execution:', error);
        return <div style={{ color: '#006400' }}> {'An error occured during API execution. Type run to start the workflow again!'}</div>;
      }
    },
  };

  useEffect(() => {
      
    fetchApi();

  }, []);

  const constructOutputAPIExecution = async (index) => {
    if (index < apiList.length) 
    {
      const curlComponent = makeCurlComponentFromApi(apiList[index],explorer)
      console.log("CURL COMPONENT B");
      console.log({curlComponent});
      // const executionResultComponent = makeCurlComponentFromApiExecutionResult(index,explorer)
      return curlComponent
    } else {
      setWorkflowStarted(false);
      return
      <div>
        Workflow Completed
      </div>
    }
  };

  const fetchApi = async () => {
    try {
      const myApibody = {
        clientNr: clientNr,
        explorerId: explorerId,
        workflowName: name
      };

      const response = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/link/queryorderedapi", myApibody);
      const myApiList = await response.data;

      setApiList(myApiList.filter(obj => Object.keys(obj).length > 0));

      console.log("FIRSTAPILIST");
      console.log(apiList);

      const myExplorerbody = {
        clientNr: clientNr,
        explorerId: explorerId
      };
      const Eresponse = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/explorer/query", myExplorerbody);
      const myExplorer = Eresponse.data;
      setExplorer(myExplorer);
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <div className = "workflow-terminal" >
      <ReactTerminal 
      className = "index_editor__JoDSg"
      commands={commands} 
      showControlBar = {false}
      themes={{
        "my-custom-theme": {
          themeBGColor: "black",
          themeToolbarColor: "#DBDBDB",
          themeColor: "#03A062",
          themePromptColor: "#03A062"
        }
      }}
      theme="my-custom-theme"
      prompt = '>>'
      welcomeMessage ={
        <div>
          Welcome to the ApiFny workflow execution terminal.
          <br />
          Please type in "run" to start the workflow.
          <br />
        </div>
      }
      />
      </div>
    
  );
};

export default Workflowterminal;

