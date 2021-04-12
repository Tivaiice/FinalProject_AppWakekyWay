/**
 *	Fix1 container
 */

import "@firebase/firestore";
import AppLoading from "expo-app-loading";
import * as Font from "expo-font";
import * as Google from "expo-google-app-auth";
import firebase from "firebase/app";
import "firebase/auth";
import React from "react";
import { AsyncStorage } from "react-native";
import Login from "../../screen/LoginScreen";

class LoginContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: "script",
      loadingFont: true,
      signedIn: false,
      firstname: "",
      photoUrl: "",
      uid: "",
    };
    this._loadingFont = this._loadingFont.bind(this);
  }

  componentDidMount() {
    console.log("Welcome to My app :)");
    this._loadingFont();
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

  signInWithGoogleAsync = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId: "XXXXXXXXXXXXXXXXXXXXXXXX",
        iosClientId: "XXXXXXXXXXXXXXXXXXXXXXXX",
        scopes: ["profile", "email"],
      });

      if (result.type === "success") {
        const { idToken, accessToken } = result;
        const credential = firebase.auth.GoogleAuthProvider.credential(
          idToken,
          accessToken
        );
        console.log("================== Login success ==================");
        firebase
          .auth()
          .signInWithCredential(credential)
          .then((res) => {
            // user res, create your user, do whatever you want
            const db = firebase.firestore();
            db.collection("/User").doc(firebase.auth().currentUser.uid).set(
              {
                firstname: result.user.givenName,
                fullName: result.user.name,
                email: result.user.email,
                photoUrl: result.user.photoUrl,
                id: result.user.id,
                uid: firebase.auth().currentUser.uid,
              },
              { merge: true }
            );

            this.saveKey();
            this.props.navigation.navigate("Notification");
          })
          .catch((error) => {
            console.log("firebase cred err:", error);
          });
      } else {
        return { cancelled: true };
      }
    } catch (err) {
      console.log("err:", err);
    }
  };

  saveKey = async () => {
    const Keyuid = firebase.auth().currentUser.uid;
    AsyncStorage.setItem("Key", Keyuid);
  };

  render() {
    const { loadingFont } = this.state;

    if (loadingFont) {
      return <AppLoading />;
    }
    return (
      <Login
        navigation={this.props.navigation}
        setsignInGoogleAsync={this.signInWithGoogleAsync}
      />
    );
  }
}

export default LoginContainer;
