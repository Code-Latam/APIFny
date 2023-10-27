import axios from "axios";
import {encodebody, getDecodedBody} from "./utils/utils.js";

export const loginCall = async (userCredential, dispatch) => {

  dispatch({ type: "LOGIN_START" });
  try {
    
    const gwocuSettings = {
   
      clientNr: userCredential.clientNr,
      gwokenToken: userCredential.gwokenToken,
      gwokenEnabled: JSON.parse(userCredential.gwokenEnabled),
      E2EEEnabled: JSON.parse(userCredential.E2EEEnabled)
    };

    const gwocuSettingsString = JSON.stringify(gwocuSettings);
    localStorage.setItem('gwocu-setting', gwocuSettingsString);
    
    const mybody = {
      clientNr: gwocuSettings.clientNr,
      chatbotKey: userCredential.chatbotKey,
      email: userCredential.email,
      password: userCredential.password
    }
    const body = encodebody(mybody);

    console.log("ENCODED BODY");
    console.log(body);

    const res = await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/auth/login", body);
    console.log("result of API login call");
    console.log(res);

    // add clientNr and gwoken to payload

    const mydecodedbody = getDecodedBody(res.data);
    console.log("mydecodebody:");
    console.log(mydecodedbody);


    const mypayload = {
      clientNr: userCredential.clientNr,
      ...getDecodedBody(res.data)
    }
    dispatch({ type: "LOGIN_SUCCESS", payload: mypayload });
  } catch (err) {
    alert(getDecodedBody(err.response.data));
    dispatch({ type: "LOGIN_FAILURE", payload: err });
  }
};

