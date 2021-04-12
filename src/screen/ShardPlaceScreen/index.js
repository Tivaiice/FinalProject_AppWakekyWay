import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import React, { useState } from "react";
import {
  AsyncStorage,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Checkbox } from "react-native-paper";
import Tabbar from "../../components/Tabbar";

class RenderItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      check: false,
    };
  }

  toggleCheck = () => {
    this.setState((prevState) => {
      const { check } = prevState;
      const { item, _setArrayUid } = this.props;
      _setArrayUid(item, check);
      return { check: !prevState.check };
    });
  };

  render() {
    const { check } = this.state;
    const { item } = this.props;

    let imageprofile =
      item.photoUrl !== ""
        ? { uri: item.photoUrl }
        : require("../../images/profile.png");

    return (
      <View style={styles.listcheckbox}>
        <View style={{ flex: 0.9, marginVertical: 15, marginLeft: 10 }}>
          <Checkbox
            status={check ? "checked" : "unchecked"}
            color="#FFD428"
            onPress={this.toggleCheck}
          />
        </View>
        <View style={{ flex: 2 }}>
          <Image
            style={styles.piclistFri}
            source={imageprofile}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 6 }}>
          <Text style={styles.txtFullNameShar}>{item.fullName}</Text>
        </View>
      </View>
    );
  }
}

const renderItems = (item, index, _setArrayUid) => {
  return <RenderItem item={item.item} _setArrayUid={_setArrayUid} />;
};

const ShardPlace = ({
  navigation,
  resultlistShard,
  Endpoint,
  EndpointName,
  EndpointAddress,
  EndpointLat,
  EndpointLng,
}) => {
  const [arrayUid, setArrayUid] = useState([]);

  const _setArrayUid = (item, check) => {
    if (!check) {
      setArrayUid([...arrayUid, item]);
    } else {
      setArrayUid(arrayUid.filter((value) => value.uid !== item.uid));
    }
  };

  const addMap = async (friendId, dataObj, profile) => {
    //alert(JSON.stringify(profile));
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    db.collection("Chat")
      .where("friendList", "array-contains", friendId)
      .get()
      .then(async function (doc) {
        if (!doc.empty) {
          let chk = true;
          let chatId = "";
          doc.docs.forEach(function (item) {
            //alert(item.ref.id);
            let docData = item.data();
            //alert(JSON.stringify(docData));
            docData.friend.map((data) => {
              if (data.uid === Keyuid) {
                chk = false;
                chatId = item.ref.id;
              }
            });
          });
          if (chk === true) {
            addChatRoom(dataObj, profile);
          } else {
            // alert("Add Map");
            addMapData(chatId, dataObj);
          }
        } else {
          addChatRoom(dataObj, profile);
        }
      })
      .catch(function (error) {
        alert("Error getting document:" + error);
      });
  };

  const addChatRoom = async (obj, profile) => {
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    let arrayFriend = [];
    arrayFriend.push(profile.uid);
    arrayFriend.push(Keyuid);
    ///alert(this.userChat);
    let myUser = firebase.auth().currentUser;
    await db
      .collection("Chat")
      .add({
        owner: Keyuid,
        friendList: arrayFriend,
        friend: [
          {
            chatId: "",
            firstname: profile.firstname,
            fullName: profile.fullName,
            photoUrl: profile.photoUrl,
            uid: profile.uid,
          },
          {
            chatId: "",
            firstname: myUser.displayName,
            fullName: myUser.displayName,
            photoUrl: myUser.photoURL,
            uid: myUser.uid,
          },
        ],
        messages: [obj],
      })
      .then((docRef) => {
        let userChat = obj;
        userChat.chatId = docRef.id;
      });
  };

  const addMapData = async (docId, msg) => {
    const db = firebase.firestore();
    db.collection("Chat")
      .doc(docId)
      .set(
        {
          messages: firebase.firestore.FieldValue.arrayUnion(msg),
        },
        { merge: true }
      );
  };

  const onShardPlaceFriend = async () => {
    //alert("ShardPlaceFriend");
    try {
      let Keyuid = await AsyncStorage.getItem("Key");
      const db = firebase.firestore();
      const profile = await firebase.auth().currentUser;
      //alert("profile:" + JSON.stringify(profile));
      let friendsArr = [];
      arrayUid.map((item) => {
        let obj = Object.assign({}, item);
        obj.start = false;
        obj.lat = null;
        obj.lng = null;
        friendsArr.push(obj);
      });

      friendsArr.push({
        email: profile.email,
        firstname: profile.displayName,
        fullName: profile.displayName,
        lat: null,
        lng: null,
        photoUrl: profile.photoURL,
        start: false,
        uid: profile.uid,
        noti1: false,
        noti2: false,
      });

      await db
        .collection("User")
        .doc(Keyuid)
        .collection("DetailsAddress")
        .doc(Endpoint)
        .update({
          friends: friendsArr,
          start: false,
        })
        .then(() => {
          //alert("Update");
        });

      arrayUid.map((item) => {
        let message = {
          _id: Keyuid,
          text: EndpointName + " " + EndpointAddress,
          endpointId: Endpoint,
          endpointName: EndpointName,
          endpointAddress: EndpointAddress,
          endpointLat: EndpointLat,
          endpointLng: EndpointLng,
          userId: Keyuid,
          createdAt: new Date(),
          user: {
            _id: profile.uid,
            name: profile.displayName,
            avatar: profile.photoURL,
            createdAt: new Date(),
          },
        };
        //alert(JSON.stringify(message));
        addMap(item.uid, message, item);
      });

      navigation.navigate("Chat", {
        shardFriend: arrayUid,
        Shardpoint: Endpoint,
        ShardEndpointId: Endpoint,
        ShardEndpointName: EndpointName,
        ShardEndpointAddress: EndpointAddress,
      });

      //arrayUid.map(item => alert("MyItem:" + JSON.stringify(item)));
      //alert("this.props:" + JSON.stringify(Endpoint));
    } catch (ere) {
      alert("Err:" + err);
    }
  };

  let btnShard =
    arrayUid == "" ? null : (
      <TouchableOpacity
        style={{ alignItems: "center", alignItems: "center" }}
        onPress={async () => {
          await onShardPlaceFriend();
        }}
      >
        <Image
          style={{ width: 300, height: 150, resizeMode: "contain" }}
          source={require("../../images/sendTo.png")}
        />
      </TouchableOpacity>
    );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.bararea}>
        <View style={{ flex: 0.2 }}>
          <View style={styles.boxleft}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                navigation.navigate("Notification");
              }}
            >
              <Image
                source={require("../../images/cancel.png")}
                style={{ width: 17, height: 17 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.barname}> แบ่งปัน </Text>
        </View>
        <View style={{ flex: 0.2 }} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <Text style={styles.txtListFriend}>รายชื่อเพื่อน</Text>
        <View style={styles.arealist}>
          <FlatList
            data={resultlistShard}
            renderItem={(item, index) => renderItems(item, index, _setArrayUid)}
            keyExtractor={(item, index) => index.toString()}
          />
          {btnShard}
        </View>
      </SafeAreaView>

      {/* Footer */}
      <View style={{ flex: 0.13 }}>
        <Tabbar navigation={navigation} col={"Notification"} />
      </View>
    </View>
  );
};

export default ShardPlace;

const styles = StyleSheet.create({
  logo: {
    flex: 0.075,
    backgroundColor: "#0000A0",
    justifyContent: "center",
    alignItems: "center",
  },
  piclistFri: {
    width: 50,
    height: 50,
    borderRadius: 40,
    marginLeft: 10,
    marginVertical: 10,
  },
  txtFullNameShar: {
    fontFamily: "PromptRegular",
    fontSize: 18,
    marginTop: Platform.OS === "ios" ? 20 : 20,
    marginLeft: 5,
  },
  bararea: {
    flex: 0.09,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: "#CFCFCF",
  },
  barname: {
    fontSize: 19,
    marginTop: Platform.OS === "ios" ? 15 : 15,
    fontFamily: "PromptSemiBold",
    alignSelf: "center",
    color: "#000000",
  },
  arealist: {
    flex: 1,
  },
  boxleft: {
    alignItems: "center",
    marginVertical: Platform.OS === "ios" ? 18 : 18,
  },
  txtListFriend: {
    fontFamily: "PromptRegular",
    fontSize: 14,
    color: "#000000",
    alignSelf: "flex-start",
    marginVertical: Platform.OS === "ios" ? 5 : 5,
    marginHorizontal: Platform.OS === "ios" ? 20 : 20,
  },
  listcheckbox: {
    flexDirection: "row",
    height: 70,
    marginTop: 2,
    borderBottomWidth: 5,
    borderColor: "#F1F2F6",
    backgroundColor: "#FFFFFF",
  },
});
