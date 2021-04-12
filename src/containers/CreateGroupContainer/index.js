import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import React from "react";
import { AsyncStorage } from "react-native";
import CreateGroup from "../../screen/CreateGroupScreen";

class CreateGroupContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resultlistfriendGroup: "",
    };
  }

  async componentDidMount() {
    const resultlistfriendGroup = await this._getlistFriend();
    this.setState({
      resultlistfriendGroup,
    });
  }

  _getlistFriend = async () => {
    const listname = [];
    let Keyuid = await AsyncStorage.getItem("Key");

    const db = firebase.firestore();
    await db
      .collection("User")
      .doc(Keyuid)
      .collection("Friends")
      .get()
      .then((querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
          const newdata = doc.data();
          newdata.key = doc.id;
          listname.push(newdata);
        });
      });
    return listname;
  };
  render() {
    console.log(
      "Result list All Friend to Create Group:>> ",
      this.state.resultlistfriendGroup
    );
    console.log("=========================================================");
    return (
      <CreateGroup
        resultlistfriendGroup={this.state.resultlistfriendGroup}
        navigation={this.props.navigation}
      />
    );
  }
}

export default CreateGroupContainer;
