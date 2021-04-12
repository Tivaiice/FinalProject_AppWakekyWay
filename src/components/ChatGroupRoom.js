import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import React from "react";
import {
  AsyncStorage,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { Bubble, GiftedChat, Send } from "react-native-gifted-chat";
import MapView, { Marker } from "react-native-maps";
import { GMAP_KEY } from "../../config";

const apiKey = GMAP_KEY;

class ChatGroupRoom extends React.Component {
  constructor(props) {
    super(props);
    this.unSubscription;
    this.dbRef;
    this.dbRefUser;
    this.dbRefCheck;
    this.dbRefUserCheck;
    this.userChat = this.props.navigation.getParam("userChat", undefined);
    this.groupId = this.userChat.groupId;
    this.state = {
      messages: [],
      user: null,
      userChat: null,
    };
  }

  componentDidMount() {
    this.getChatMsg();
    const { uid, fullName, firstname, photoUrl } = this.userChat;
    this.setState({
      userChat: {
        _id: uid,
        name: fullName,
        avatar: photoUrl,
        namechat: firstname,
      },
      user: this.user(),
    });
  }

  componentWillUnmount() {
    this.unSubscription;
  }

  setNameCheck = () => {
    const { uid: currentUid } = firebase.auth().currentUser;
    const { uid } = this.userChat;
    this.dbRefUser.set(this.setArrayUser(currentUid));
    this.dbRefUserCheck.set(this.setArrayUser(uid));
  };

  setArrayUser = (newUid) => {
    const {
      uid: currentUid,
      displayName,
      photoURL,
    } = firebase.auth().currentUser;
    const { uid, fullName, firstname, photoUrl } = this.userChat;
    const arrayUser = [
      {
        _id: uid,
        name: fullName,
        namechat: firstname,
        avatar: photoUrl,
      },
      {
        _id: currentUid,
        name: displayName,
        namechat: displayName,
        avatar: photoURL,
      },
      { isOwn: newUid },
    ];
    return arrayUser;
  };

  subScriptionMessage = () => {
    this.unSubscription = this.dbRef.on("child_added", (snapshot) => {
      this.setState((previousState) => ({
        messages: GiftedChat.append(previousState.messages, snapshot.val()),
      }));
    });
  };

  setDatabaseRefUser = () => {
    const roomName = this.getRoomname(this.user()._id, this.userChat.uid);
    this.dbRefUser = firebase.database().ref(`${roomName}/user`);
  };

  setDatabaseRef = () => {
    const roomName = this.getRoomname(this.user()._id, this.userChat.uid);
    this.dbRef = firebase.database().ref(`${roomName}/messages`);
  };

  setDatabaseRefUserCheck = () => {
    const roomName = this.getRoomnameCheck(this.user()._id, this.userChat.uid);
    this.dbRefUserCheck = firebase.database().ref(`${roomName}/user`);
  };

  setDatabaseRefCheck = () => {
    const roomName = this.getRoomnameCheck(this.user()._id, this.userChat.uid);
    this.dbRefCheck = firebase.database().ref(`${roomName}/messages`);
  };

  getRoomname = (userUid, userChatUid) => {
    return userUid + userChatUid;
  };

  getRoomnameCheck = (userUid, userChatUid) => {
    return userChatUid + userUid;
  };

  user = () => {
    const { uid, displayName, photoURL } = firebase.auth().currentUser;
    return {
      _id: uid,
      name: displayName,
      avatar: photoURL,
      createdAt: new Date(),
    };
  };

  onSend = (messages = []) => {
    const message = messages[0];
    message.createdAt = new Date().getTime();
    const db = firebase.firestore();
    db.collection("ChatGroup")
      .doc(this.groupId)
      .set(
        {
          messages: firebase.firestore.FieldValue.arrayUnion(message),
        },
        { merge: true }
      );
  };

  getChatMsg = async () => {
    //alert(this.groupId);
    let Keyuid = await AsyncStorage.getItem("Key");
    const mydb = firebase.firestore();
    let docRef = mydb.collection("ChatGroup").doc(this.groupId);
    docRef.onSnapshot(async (doc) => {
      let messages = this.state.messages;
      let msg = [];
      if (doc.data().messages !== undefined) {
        msg = doc.data().messages;
      }
      if (messages.length > 0 && msg.length > 0) {
        messages.push(msg[msg.length - 1]);
      } else {
        messages = msg;
      }
      this.setState({ messages: messages });
    });
  };

  sortByKey = (array, key) => {
    return array.sort(function (a, b) {
      var x = a[key];
      var y = b[key];
      return x < y ? -1 : x > y ? 1 : 0;
    });
  };

  renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{ margin: 5 }}>
          <Image
            source={require("../images/sendchat.png")}
            style={{ height: 35, width: 35 }}
            resizeMode={"contain"}
          />
        </View>
      </Send>
    );
  };

  renderBubble = (props) => {
    const { currentMessage } = props;
    if (currentMessage.endpointLat && currentMessage.endpointLng) {
      return (
        <View
          style={{
            height: 150,
            width: 220,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            underlayColor={"#FFFFFF"}
            onPress={() => {
              //alert("Go to Room  Chat");
              this.props.navigation.navigate("LocationFriend", {
                endpointId: currentMessage.endpointId,
                mapUserId: currentMessage.userId,
              });
            }}
          >
            <MapView
              style={{
                height: 150,
                width: 220,
              }}
              region={{
                latitude: currentMessage.endpointLat,
                longitude: currentMessage.endpointLng,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
              loadingBackgroundColor={"yellow"}
              showsMyLocationButton={true}
              showsUserLocation={true}
            >
              <Marker
                coordinate={{
                  latitude: currentMessage.endpointLat,
                  longitude: currentMessage.endpointLng,
                }}
                title={currentMessage.endpointName}
                description={currentMessage.endpointAddress}
              >
                <Image
                  source={require("../images/markerdes.png")}
                  style={{ width: 35, height: 35, alignSelf: "center" }}
                  resizeMode={"cover"}
                />
              </Marker>
            </MapView>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#AFB1B4",
          },
          left: {
            backgroundColor: "#FFD428",
          },
        }}
        textStyle={{
          right: {
            color: "#000000",
          },
        }}
      />
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.areabar}>
          <View style={{ flex: 0.2 }}>
            <View style={styles.areabarbox1}>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  this.props.navigation.navigate("Notification");
                }}
              >
                <Icon name="arrow-back" color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.areabarbox2}>
            <Text style={styles.txtbar}>{this.userChat.fullName}</Text>
          </View>
          <View style={{ flex: 0.2 }}>
            <View style={styles.areabarbox3}>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  this.props.navigation.navigate("Map", {
                    chatGroupId: this.groupId,
                  });
                }}
              >
                <Image
                  source={require("../images/maplist2.png")}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <GiftedChat
            alwaysShowSend={true}
            messages={this.state.messages}
            onSend={(messages) => this.onSend(messages)}
            user={this.user()}
            showUserAvatar={true}
            placeholder=" พิมพ์ข้อความ..."
            scrollToBottom
            renderBubble={this.renderBubble}
            renderUsernameOnMessage={true}
            renderSend={this.renderSend}
            selectionColor={"red"}
            inverted={false}
          />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  areabar: {
    flex: 0.08,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#CACACA",
  },
  areabarbox1: {
    alignItems: "center",
    marginVertical: Platform.OS === "ios" ? 17 : 17,
  },
  areabarbox2: {
    flex: 1,
    alignItems: "center",
  },
  areabarbox3: {
    alignItems: "center",
    marginVertical: Platform.OS === "ios" ? 14 : 15,
  },
  txtbar: {
    fontSize: 27,
    marginTop: Platform.OS === "ios" ? 9 : 9,
    fontFamily: "PromptRegular",
    justifyContent: "center",
    alignItems: "center",
    color: "#000000",
  },
});
export default ChatGroupRoom;
