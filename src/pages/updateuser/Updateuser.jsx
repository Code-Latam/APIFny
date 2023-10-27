import axios from "axios";
import { useRef } from "react";
import "./updateuser.css";
import { useHistory } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Topbar from "../../components/topbar/Topbar";
import {encodebody,getDecodedBody} from "../../utils/utils.js";


export default function Updateuser() {

  
  const { user: currentUser } = useContext(AuthContext);
  const clientNr = currentUser.clientNr;
  

  const formRef = useRef(null);

  const chatbotKey = useRef();
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const history = useHistory();

  const handleClick = async (e) => {
    e.preventDefault();
    if (passwordAgain.current.value !== password.current.value) {
      passwordAgain.current.setCustomValidity("Passwords don't match!");
    } else {
      const user = {
        clientNr: clientNr,
        chatbotKey: chatbotKey.current.value,
        username: username.current.value,
        email: email.current.value,
        password: password.current.value,
      };
      const body = encodebody(user);
      try {
        await axios.post(process.env.REACT_APP_CENTRAL_BACK + "/users/update", body);
        alert("User has been updated");
        history.push("/");
      } catch (err) {
        alert(getDecodedBody(err.response.data))
        }
    }
  };

  return (
    <>
    <Topbar />
    <div className="updateuser">
      <div className="updateuserWrapper">
        <div className="updateuserLeft">
          <h3 className="updateuserLogo">GWOCU Chat</h3>
          <span className="updateuserDesc">
            Change your password regularly for more security.
          </span>
        </div>
        <div className="updateuserRight">
          <form ref={formRef} className="updateuserBox" onSubmit={handleClick}>
          <input
              placeholder="Chatbot Key"
              required
              ref={chatbotKey}
              className="updateuserInput"
              value = {currentUser.chatbotKey}
              disabled
            />
            <input
              placeholder="Username"
              required
              ref={username}
              className="updateuserInput"
              value = {currentUser.username}
              disabled
            />
            <input
              placeholder="Email"
              required
              ref={email}
              className="updateuserInput"
              type="email"
              value = {currentUser.email}
              disabled
            />
            <input
              placeholder="New Password"
              required
              ref={password}
              className="updateuserInput"
              type="password"
              minLength="6"
              autocomplete="new-password"
            />
            <input
              placeholder="New Password Again"
              required
              ref={passwordAgain}
              className="updateuserInput"
              type="password"
            />
            <button className="updateuserButton" type="submit">
              Change
            </button>
            <button className="updateuserRegisterButton"  onClick={() => history.push("/")}>Close</button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
