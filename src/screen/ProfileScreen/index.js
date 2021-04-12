import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  AsyncStorage,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import Tabbar from "../../components/Tabbar";

const Profile = ({ navigation, fullName, photoUrl, email, resultlist }) => {
  let imageprofile =
    photoUrl !== "" ? { uri: photoUrl } : require("../../images/profile.png");

  const [listData, setListData] = useState(resultlist);

  useEffect(() => {
    setListData(resultlist);
  }, [resultlist]);

  const createRoom = async (dataObj) => {
    let KeyUid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    db.collection("Chat")
      .where("friendList", "array-contains", KeyUid)
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
              if (data.uid === dataObj.uid) {
                chk = false;
                chatId = item.ref.id;
              }
            });
          });
          if (chk === true) {
            addChatRoom(dataObj);
          } else {
            let userChat = dataObj;
            userChat.chatId = chatId;
            navigation.navigate("Chat2", { userChat: userChat });
          }
        } else {
          addChatRoom(dataObj);
        }
      })
      .catch(function (error) {
        // alert("Error getting document:" + error);
      });
  };

  const addChatRoom = async (obj) => {
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    let arrayFriend = [];
    arrayFriend.push(obj.uid);
    arrayFriend.push(Keyuid);
    ///alert(this.userChat);
    let myUser = firebase.auth().currentUser;
    await db
      .collection("Chat")
      .add({
        owner: Keyuid,
        friendList: arrayFriend,
        friend: [
          obj,
          {
            chatId: "",
            firstname: myUser.displayName,
            fullName: myUser.displayName,
            photoUrl: myUser.photoURL,
            uid: myUser.uid,
          },
        ],
      })
      .then((docRef) => {
        //this.chatId = docRef.id;
        let userChat = obj;
        userChat.chatId = docRef.id;
        navigation.navigate("Chat2", { userChat: userChat });
      });
  };

  const renderItem = (data, rowKey) => (
    <View style={styles.listFriend}>
      <View style={{ flex: 0.2, padding: 5 }}>
        <Image style={styles.picFriend} source={{ uri: data.item.photoUrl }} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txtlistFriend}>{data.item.fullName}</Text>
      </View>
      <View style={{ flex: 0.2 }}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            console.log("Go to Room  Chat");
            console.log("data.item.key", data.item);
            //alert(JSON.stringify(data.item));
            createRoom(data.item);
          }}
        >
          <Image
            source={require("../../images/chat.png")}
            style={{ height: 30, width: 30, marginVertical: 15 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const deleteRow = (rowMap, rowKey) => {
    _delfriend(rowMap, rowKey);
    const newData = [...listData];
    const prevIndex = listData.findIndex((item) => item.key === rowKey);
    newData.splice(prevIndex, 1);
    setListData(newData);
  };

  const renderHiddenItem = (data, rowMap, rowKey) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => {
          Alert.alert(
            "คุณต้องการลบเพื่อน",
            "",
            [
              { text: "ใช่", onPress: () => deleteRow(data, data.item.key) },
              {
                text: "ไม่",
                onPress: () => console.log("ยกเลิกการลบเพื่อน"),
                style: "destructive",
              },
            ],
            { cancelable: false }
          );
        }}
      >
        <Image
          source={require("../../images/bin.png")}
          style={{ width: 25, height: 40 }}
        />
      </TouchableOpacity>
    </View>
  );

  const _delfriend = async ({ item }, rowKey) => {
    let Keyuid = await AsyncStorage.getItem("Key");
    console.log("Keyuid", Keyuid);
    console.log("item.uid", item.uid);
    const db = firebase.firestore();
    db.collection("User")
      .doc(Keyuid)
      .collection("Friends")
      .doc(rowKey)
      .delete();
    firebase
      .database()
      .ref(Keyuid + item.uid)
      .remove();
    console.log(">> ลบเพื่อนสำเร็จ <<");
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "#FFD428" }}>
          <Text style={styles.txtbar}> ข้อมูลส่วนตัว</Text>
        </View>
        <View style={{ backgroundColor: "#F9F9F9" }}>
          <View style={styles.boxProfile}>
            <Image
              style={styles.picProfile}
              source={imageprofile}
              resizeMode="contain"
            />
            <Text style={styles.txtFullName}>{fullName}</Text>
            <Text style={styles.txtEmail}>{email}</Text>
          </View>
        </View>
        <View style={{ flex: 2, backgroundColor: "#F9F9F9" }}>
          <Text style={styles.txtbarfriend}> รายชื่อเพื่อน </Text>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
              <SwipeListView
                data={listData}
                renderItem={renderItem}
                renderHiddenItem={renderHiddenItem}
                rightOpenValue={-75}
                previewRowKey={"0"}
                previewOpenValue={-40}
                previewOpenDelay={0}
                previewOpenDelay={3000}
              />
            </View>
          </SafeAreaView>
        </View>
      </View>
      <View style={{ flex: 0.091, backgroundColor: "#F9F9F9" }}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            navigation.navigate("Search");
          }}
        >
          <Image
            source={require("../../images/add-friend.png")}
            style={styles.btnAddFriend}
          />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 0.145 }}>
        <Tabbar navigation={navigation} col={"Profile"} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  txtbar: {
    fontSize: 20,
    marginVertical: Platform.OS === "ios" ? 30 : 30,
    alignSelf: "center",
    fontFamily: "PromptSemiBold",
    color: "#000000",
  },
  txtname: {
    //fontFamily: "PromptLight",
    fontSize: 22,
    alignSelf: "center",
    marginBottom: "5%",
  },
  boxProfile: {
    width: Platform.OS === "ios" ? 350 : 350,
    height: Platform.OS === "ios" ? 180 : 180,
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
    borderRadius: 20,
    marginTop: -60,
  },
  picProfile: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginVertical: 15,
  },
  txtFullName: {
    fontFamily: "PromptRegular",
    fontSize: 20,
    alignSelf: "center",
  },
  txtEmail: {
    fontFamily: "PromptLight",
    fontSize: 18,
    alignSelf: "center",
    color: "#AFB1B4",
  },
  btnAddFriend: {
    height: 55,
    width: 55,
    alignSelf: "flex-end",
    marginRight: Platform.OS === "ios" ? 8 : 8,
    marginTop: -1,
  },
  listFriend: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginTop: 2,
    borderBottomWidth: 1,
    borderColor: "#CFCFCF",
  },
  txtlistFriend: {
    fontSize: 19,
    fontFamily: "PromptRegular",
    alignSelf: "flex-start",
    marginTop: Platform.OS === "ios" ? 15 : 15,
    marginLeft: Platform.OS === "ios" ? 19 : 25,
  },
  picFriend: {
    width: 50,
    height: 50,
    borderRadius: 40,
    marginHorizontal: 20,
  },
  txtbarfriend: {
    fontFamily: "PromptSemiBold",
    color: "#000000",
    fontSize: 18,
    marginLeft: 15,
    marginBottom: 10,
  },
  container: {
    backgroundColor: "#F9F9F9",
    flex: 1,
  },
  rowFront: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#CACACA",
    borderBottomWidth: 2,
    justifyContent: "center",
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
    marginTop: 2,
  },
  backRightBtnRight: {
    backgroundColor: "#FF3043",
    right: 0,
  },
});

export default Profile;
