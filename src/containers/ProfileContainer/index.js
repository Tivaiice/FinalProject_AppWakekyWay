import React, { useEffect } from "react";
import Profile from "../../screen/ProfileScreen";

import { AsyncStorage, View } from "react-native";
import "firebase/auth";
import "firebase/firestore";
import * as firebase from "firebase";

class ProfileContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: "script",
      fullName: "",
      photoUrl: "",
      email: "",
      resultlist: ""
    };
  }

  async componentDidMount() {
    this._pullfirebase();
    const resultlist = await this._getlistFriend();

    this.setState({
      resultlist: resultlist
    });
  }

  componentWillUnmount() {
    this._pullfirebase();
  }

  _pullfirebase = async () => {
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    var docRef = db.collection("User").doc(Keyuid);
    docRef.onSnapshot(doc => {
      const fullName = doc.data().fullName;
      const photoUrl = doc.data().photoUrl;
      const email = doc.data().email;
      this.setState({
        fullName,
        photoUrl,
        email
      });
    });
  };

  _getlistFriend = async () => {
    const listname = [];
    let Keyuid = await AsyncStorage.getItem("Key");

    const db = firebase.firestore();
    await db
      .collection("User")
      .doc(Keyuid)
      .collection("Friends")
      .get()
      .then(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          const newdata = doc.data();
          newdata.key = doc.id;
          listname.push(newdata);
        });
      });
    return listname;
  };

  render() {
    return (
      <Profile
        resultlist={this.state.resultlist}
        fullName={this.state.fullName}
        photoUrl={this.state.photoUrl}
        email={this.state.email}
        navigation={this.props.navigation}
      />
    );
  }
}

export default ProfileContainer;
