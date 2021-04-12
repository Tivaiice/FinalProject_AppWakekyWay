/**
 *	Fix1 container
 */

import "@firebase/firestore";
import firebase from "firebase/app";
import "firebase/auth";
import React from "react";
import { Alert, AsyncStorage, View } from "react-native";
import Search from "../../screen/SearchScreen";

class SearchContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      txtsearchFriend: "",
      profileFriend: "",
      haveFriend: null,
    };
  }

  _searchFriend = async () => {
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    var docRef = db.collection("User");
    docRef
      .where("email", "==", this.state.txtsearchFriend)
      // .where("fullName", "==", this.state.txtsearchFriend)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          Alert.alert(
            "ไม่มีชื่อในระบบ",
            "กรุณากรอกชื่อจริงใหม่อีกครั้ง",
            [
              {
                text: "ยืนยัน",
                onPress: () => console.log("No matching Myfriend."),
              },
            ],
            { cancelable: false }
          );
          return;
        }

        snapshot.forEach((doc) => {
          // console.log(Keyuid);
          console.log(doc.id, "=>", doc.data());
          if (doc.id === Keyuid) {
            Alert.alert(
              "ไม่สามารถเพิ่มตัวเองเป็นเพื่อนได้",
              "กรุณากรอกชื่อจริงของเพื่อนใหม่อีกครั้ง",
              [
                {
                  text: "ยืนยัน",
                  onPress: () => console.log("No matching Myfriend."),
                },
              ],
              { cancelable: false }
            );
            return;
          } else {
            const friend = doc.data();
            this._checkFriend(friend);
          }
        });
      })
      .catch((err) => {
        console.log("Error getting documents", err);
      });
  };

  _checkFriend = async (friend) => {
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();

    //CheckFriend
    var docRef = db.collection("User").doc(Keyuid).collection("Friends");
    console.log("haveFriend :>> ");
    console.log("friend :>> ", friend.uid);
    docRef
      .where("uid", "==", friend.uid)
      .get()
      .then((snapshot) => {
        let isFriend = false;
        if (snapshot.empty) {
          console.log("อนุญาตให้เพิ่มเพื่อน.");
          isFriend = true;
        } else {
          console.log("เป็นเพื่อนของคุณแล้ว.");
          isFriend = false;
        }
        this.setState({
          haveFriend: isFriend,
          profileFriend: friend,
        });
      })
      .catch((err) => {
        console.log("Error getting documents", err);
      });
  };

  _addFriend = async () => {
    console.log("profileFriend add firiend :>> ", this.state.profileFriend);
    let Keyuid = await AsyncStorage.getItem("Key");
    console.log("Keyuid add firiend:>> ", Keyuid);
    const db = firebase.firestore();
    db.collection("/User")
      .doc(Keyuid)
      .collection("/Friends")
      .add(this.state.profileFriend);
    Alert.alert(
      "เพิ่มเพื่อนสำเร็จ",
      "",
      [
        {
          text: "ยืนยัน",
          onPress: () => {
            this.props.navigation.navigate("Profile");
          },
        },
      ],
      { cancelable: false }
    );
  };

  _onInputChange = (event) => {
    this.setState({
      txtsearchFriend: event,
      profileFriend: "",
    });
  };

  _setState = (obj) => {
    this.setState(obj);
  };

  render() {
    console.log("txtsearchFriend :>> ", this.state.txtsearchFriend);
    return (
      <View>
        <Search
          haveFriend={this.state.haveFriend}
          profileFriend={this.state.profileFriend}
          txtsearchFriend={this.state.txtsearchFriend}
          _onSummit={this.onSummit}
          _onInputChange={this._onInputChange}
          navigation={this.props.navigation}
          _searchFriend={this._searchFriend}
          _addFriend={this._addFriend}
          resultListFriend={this.resultListFriend}
        />
      </View>
    );
  }
}

export default SearchContainer;
