import AppLoading from "expo-app-loading";
import * as Font from "expo-font";
import * as firebase from "firebase";
import React from "react";
import { AsyncStorage } from "react-native";
import Notification from "../../screen/NotificationScreen";
import { getFirestorData } from "./../../Firestore";

class NotificationContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: "script",
      loadingFont: true,
      distancelo: null,
      durationlo: null,
      end_address: null,
    };
    this._loadingFont = this._loadingFont.bind(this);
  }

  componentDidMount() {
    this._getlistAddress();
    this._pullfirebase();
    this._loadingFont();
  }

  componentWillUnmount() {
    this._getlistAddress();
  }

  async _loadingFont() {
    await Font.loadAsync({
      CloudBold: require("../../fonts/CloudBold.otf"),
      CloudLight: require("../../fonts/CloudLight.otf"),
      PromptLight: require("../../fonts/PromptLight.ttf"),
      PromptRegular: require("../../fonts/PromptRegular.ttf"),
      PromptSemiBold: require("../../fonts/PromptSemiBold.ttf"),
    });
    this.setState({ loadingFont: false });
  }

  _getlistAddress = async () => {
    try {
      await getFirestorData();
    } catch (err) {
      console.log("ERR:", err);
    }
    const listAddress = [];
    let Keyuid = await AsyncStorage.getItem("Key");

    const db = firebase.firestore();
    db.collection("User")
      .doc(Keyuid)
      .collection("DetailsAddress")
      .get()
      .then((querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
          const newdata = doc.data();
          newdata.key = doc.id;
          if (newdata.show === true) {
            listAddress.push(newdata);
          }
        });
        this.setState({
          resultAddress: listAddress,
        });
      });
    return listAddress;
  };

  _signOutGoogle = async () => {
    await firebase.auth().signOut();
    // Sign-out successful.
    console.log("================== Logout success =================");
    console.log("User is :>> ", firebase.auth().currentUser);
    this._clearAsyncStorage();
  };

  _clearAsyncStorage = async () => {
    try {
      let Keyuid = await AsyncStorage.getItem("Key");
      console.log("user logged out by :>> ", Keyuid);
      await AsyncStorage.clear();
      Keyuid = await AsyncStorage.getItem("Key");
      console.log("Good Bye !!", Keyuid);
    } catch (error) {
      // alert("Failed to clear the async storage.");
    }
  };

  _pullfirebase = async () => {
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    var docRef = db.collection("User").doc(Keyuid);
    docRef.onSnapshot((doc) => {
      let getData = doc.data();
      if (getData !== undefined) {
        const fullName = doc.data().fullName;
        const photoUrl = doc.data().photoUrl;
        this.setState({
          fullName,
          photoUrl,
        });
      }
    });
  };

  render() {
    const { loadingFont } = this.state;
    if (loadingFont) {
      return <AppLoading />;
    }
    return (
      <Notification
        resultAddress={this.state.resultAddress}
        distancelo={this.state.distancelo}
        durationlo={this.state.durationlo}
        end_addreslo={this.state.end_addreslo}
        navigation={this.props.navigation}
        photoUrl={this.state.photoUrl}
        fullName={this.state.fullName}
        _setsignOutGoogle={this._signOutGoogle}
      />
    );
  }
}

export default NotificationContainer;
