import React from "react";
import { AsyncStorage } from "react-native";
import "firebase/auth";
import "firebase/firestore";
import * as firebase from "firebase";

import ShardPlace from "../../screen/ShardPlaceScreen";

class ShardPlaceContainer extends React.Component {
  constructor(props) {
    super(props);
    this.Endpoint = this.props.navigation.getParam("Endpoint", undefined);
    this.EndpointName = this.props.navigation.getParam(
      "EndpointName",
      undefined
    );
    this.EndpointAddress = this.props.navigation.getParam(
      "EndpointAddress",
      undefined
    );

    this.EndpointLat = this.props.navigation.getParam("EndpointLat", undefined);
    this.EndpointLng = this.props.navigation.getParam("EndpointLng", undefined);

    this.state = {
      resultlistShard: ""
    };
    //this.dbRef = firebase.database().ref(`${roomName}/messages`);
  }

  async componentDidMount() {
    //alert("Endpoint:" + this.Endpoint);
    const resultlistShard = await this._getlistFriend();
    this.setState({
      resultlistShard
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
    console.log(
      "Result list All Friend to Shard :>> ",
      this.state.resultlistShard
    );
    console.log(
      "============================================================================"
    );

    return (
      <ShardPlace
        Endpoint={this.Endpoint}
        EndpointName={this.EndpointName}
        EndpointAddress={this.EndpointAddress}
        EndpointLat={this.EndpointLat}
        EndpointLng={this.EndpointLng}
        resultlistShard={this.state.resultlistShard}
        navigation={this.props.navigation}
      />
    );
  }
}

export default ShardPlaceContainer;
