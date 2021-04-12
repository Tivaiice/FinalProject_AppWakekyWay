import "@firebase/firestore";
import { decode, encode } from "base-64";
import firebase from "firebase/app";
import "firebase/auth";
import React from "react";
import App from "../App";

if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}

const firebaseConfig = {
  apiKey: "XXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "XXXXXXXXXXXXXXXXXXXXXXX",
  databaseURL: "XXXXXXXXXXXXXXXXXXXXXXX",
  projectId: "XXXXXXXXXXXXXXXXXXXXXXX",
  storageBucket: "XXXXXXXXXXXXXXXXXXXXXXX",
  messagingSenderId: "XXXXXXXXXXXXXXXXXXXXXXX",
  appId: "XXXXXXXXXXXXXXXXXXXXXXX",
  measurementId: "XXXXXXXXXXXXXXXXXXXXXXX",
};

if (!firebase.apps.length) {
  console.disableYellowBox = true;
  firebase.initializeApp(firebaseConfig);
}

class BootSetup extends React.Component {
  constructor() {
    super();
  }
  componentDidMount() {
    console.disableYellowBox = true;
  }
  render() {
    return <App />;
  }
}

export default BootSetup;
