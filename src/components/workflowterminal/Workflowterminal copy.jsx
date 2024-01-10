import React, { useState, useEffect } from 'react';
import { ReactTerminal, ReactThemes } from 'react-terminal-component';
import {
    EmulatorState, OutputFactory, CommandMapping,
    EnvironmentVariables, FileSystem, History,
    Outputs, defaultCommandMapping
  } from 'javascript-terminal';
import axios from 'axios';

const Workflowterminal = ({ clientNr, explorerId, productName, name, designerMode }) => {
  const [explorer, setExplorer] = useState([]);
  const [workflowStarted, setWorkflowStarted] = useState(false);
  const [inputStr, setInputStr] = useState('run workflow');
  var ApiList = [];
  var current_api_index = 0;

  useEffect(() => {
    const fetchDataAndInitializeTerminal = async () => {
      await fetchApi();
    };

    fetchDataAndInitializeTerminal();
  }, [workflowStarted]);

  const handleApiExecution = async (index) => {
    if (index < ApiList.length) {
      const userResponse = window.confirm(`Do you want to run API: ${ApiList[index].name}?`);
      if (userResponse) {
        // Add your command execution logic here
        console.log(`Executing API: ${ApiList[index].name}`);
      }
      handleApiExecution(index + 1);
    } else {
      console.log('Workflow completed.');
      setWorkflowStarted(false);
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

      ApiList = myApiList.filter(obj => Object.keys(obj).length > 0);

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

  // Create a custom emulator state
  const customState = EmulatorState.create({
    'commandMapping': CommandMapping.create({
      ...defaultCommandMapping,
      'run': {
        'function': (state, opts) => {

          // const input = opts.join(' ');
          if (opts === 'workflow')
          {
            current_api_index = 0 ;
            setInputStr('run workflow 2');

          }

          return {
            output: OutputFactory.makeTextOutput('workflow executed!')
          };
        },
        'optDef': {}
      }
    })
  });

  return (
    
      <ReactTerminal
       inputStr={inputStr}
       emulatorState={customState}
       theme={ReactThemes.hacker} // Use a built-in theme
       promptSymbol=">" // Change the prompt symbol
       onInputChange={(inputStr) => setInputStr(inputStr)}
       onStateChange={(emulatorState) => this.setState({emulatorState})}
      />
    
  );
};

export default Workflowterminal;

