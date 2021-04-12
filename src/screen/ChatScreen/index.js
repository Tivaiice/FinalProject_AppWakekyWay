import * as firebase from "firebase";
import React, { useEffect, useState } from "react";
import {
  Alert,
  AsyncStorage,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import Tabbar from "../../components/Tabbar";

const Chat = ({ navigation }) => {
  let unSubscript;
  const [uid, setUid] = useState("");
  const [listchat, setListchat] = useState([]);
  const [groupListchat, setGroupListchat] = useState([]);
  useEffect(() => {
    getUid();
    getChatDataList();
    return () => {
      unSubscript;
      setListchat([]);
      setGroupListchat([]);
    };
  }, []);

  const getChatDataList = async () => {
    await getGroupChat();
    await getListChat();
  };

  const getGroupChat = async () => {
    let keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    await db
      .collection("ChatGroup")
      .where("friendList", "array-contains", keyuid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
          let msgList = "";
          if (doc.data().messages !== undefined) {
            let m = doc.data().messages;
            //alert(JSON.stringify(m));
            msgList = m[m.length - 1].text;
          }
          let avatar = "http://www.webappthai.com/images/teamwork-1.png";
          if (doc.data().avatar !== undefined) {
            avatar = doc.data().avatar;
          }
          const chat = {
            uid: doc.id,
            groupId: doc.id,
            name: doc.data().groupName,
            avatar: avatar,
            namechat: "",
            type: "group",
            n: doc.data().friendList.length,
            msgEnd: msgList,
          };
          setGroupListchat((prevList) => [...prevList, chat]);
        });
      });
  };

  const getListChat = async () => {
    let keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    await db
      .collection("Chat")
      .where("friendList", "array-contains", keyuid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
          let name = doc.data().friend[0].fullName;
          let avatar = doc.data().friend[0].photoUrl;
          let namechat = doc.data().friend[0].fullName;
          let uid = doc.data().friend[0].uid;
          let msgList = "";
          if (doc.data().messages !== undefined) {
            let m = doc.data().messages;
            msgList = m[m.length - 1].text;
          }
          if (uid === keyuid) {
            name = doc.data().friend[1].fullName;
            avatar = doc.data().friend[1].photoUrl;
            namechat = doc.data().friend[1].fullName;
            uid = doc.data().friend[1].uid;
          }
          const chat = {
            uid: doc.id,
            chatId: doc.id,
            name: name,
            avatar: avatar,
            namechat: "",
            type: "",
            msgEnd: msgList,
          };
          setListchat((prevList) => [...prevList, chat]);
        });
      });
  };

  const getUid = async () => {
    const Keyuid = await AsyncStorage.getItem("Key");
    setUid(Keyuid);
  };

  const renderItem = ({ item, index }) => {
    return (
      <View>
        <TouchableHighlight
          style={styles.rowFront}
          underlayColor={"#FFFFFF"}
          onPress={() => {
            console.log("Go to Room  Chat");
            navigation.navigate("Chat2", {
              userChat: {
                uid: item.uid,
                fullName: item.name,
                photoUrl: item.avatar,
                firstname: item.name,
                chatId: item.chatId,
              },
            });
            console.log("chat.item.key", item);
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 0.4 }}>
              <Image style={styles.picFriend} source={{ uri: item.avatar }} />
            </View>
            <View style={{ flex: 1, flexDirection: "column" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.txtFriendName}>{item.name}</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  marginRight: Platform.OS === "ios" ? 30 : 20,
                }}
              >
                <Text numberOfLines={1} style={styles.txtMessage}>
                  {item.msgEnd}
                </Text>
              </View>
            </View>
          </View>
        </TouchableHighlight>
      </View>
    );
  };

  const renderItemGroup = ({ item, index }) => {
    return (
      <TouchableHighlight
        style={styles.rowFront}
        underlayColor={"#FFFFFF"}
        onPress={() => {
          console.log("Go to Room  Chat Group");
          navigation.navigate("ChatGroupRoom", {
            userChat: {
              uid: item.uid,
              fullName: item.name,
              photoUrl: item.avatar,
              firstname: item.name,
              groupId: item.groupId,
            },
          });
          console.log("chat.item.key", item);
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 0.4 }}>
            <Image
              style={styles.picFriend}
              source={{
                uri: item.avatar,
              }}
            />
          </View>
          <View style={{ flex: 1, flexDirection: "column" }}>
            <View>
              <Text style={styles.txtFriendName}>{item.name}</Text>
            </View>
            <View>
              <Text style={styles.txtMessage}>{item.msgEnd}</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  const deleteRow = (rowMap, rowKey) => {
    _delChatfriend(rowMap, rowKey);
    //alert("del " + JSON.stringify(rowMap));
    if (rowMap.item.groupId !== undefined) {
      const newData = [...groupListchat];
      const prevIndex = groupListchat.findIndex((item) => item.key === rowKey);
      newData.splice(prevIndex, 1);
      setGroupListchat(newData);
    } else if (rowMap.item.chatId !== undefined) {
      const newData = [...listchat];
      const prevIndex = listchat.findIndex((item) => item.key === rowKey);
      newData.splice(prevIndex, 1);
      setListchat(newData);
    }
  };

  const renderHiddenItem = (data, rowMap, rowKey) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => {
          Alert.alert(
            "ยืนยันการลบแชท",
            "",
            [
              { text: "ยืนยัน", onPress: () => deleteRow(data, data.item.key) },
              {
                text: "ยกเลิก",
                onPress: () => console.log("ยืนยันการลบแชท"),
                style: "destructive",
              },
            ],
            { cancelable: false }
          );
        }}
      >
        <Image
          source={require("../../images/bin.png")}
          style={{ width: 30, height: 45 }}
          resizeMode={"cover"}
        />
      </TouchableOpacity>
    </View>
  );

  const _delChatfriend = async (item, rowKey) => {
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();

    if (item.item.groupId !== undefined) {
      db.collection("ChatGroup").doc(item.item.groupId).delete();
    } else if (item.item.chatId !== undefined) {
      db.collection("Chat").doc(item.item.chatId).delete();
    }
    //alert(JSON.stringify(item));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFD428" }}>
      {/* bar */}
      <View style={{ flex: 0.09, flexDirection: "row" }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.txtMsg}>ข้อความ</Text>
        </View>
      </View>
      {/* bar */}
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.areachat}>
          <View style={{ marginTop: 30 }} />
          {groupListchat.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <SwipeListView
                data={groupListchat}
                renderItem={renderItemGroup}
                renderHiddenItem={renderHiddenItem}
                rightOpenValue={-75}
                previewRowKey={"0"}
                previewOpenValue={-40}
                previewOpenDelay={0}
                previewOpenDelay={3000}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          )}
          {groupListchat.length > 0 && (
            <View style={{ borderColor: "#F1F1F1", borderWidth: 2 }}></View>
          )}
          <View style={{ marginTop: 10 }}>
            <SwipeListView
              data={listchat}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-75}
              previewRowKey={"0"}
              previewOpenValue={-40}
              previewOpenDelay={0}
              previewOpenDelay={3000}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </SafeAreaView>
      <View style={{ flex: 0.1, backgroundColor: "#FFFFFF" }}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            navigation.navigate("CreateGroup");
          }}
        >
          <Image
            source={require("../../images/addMutichat.png")}
            style={{
              height: 53,
              width: 55,
              alignSelf: "flex-end",
              marginRight: Platform.OS === "ios" ? 8 : 8,
            }}
          />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 0.157, backgroundColor: "#FFFFFF" }}>
        <Tabbar navigation={navigation} col={"Chat"} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  areachat: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  picFriend: {
    width: 50,
    height: 50,
    marginHorizontal: 10,
    borderRadius: 30,
  },
  txtFriendName: {
    fontSize: 16,
    fontFamily: "PromptRegular",
  },
  txtMessage: {
    fontSize: 14,
    fontFamily: "PromptRegular",
  },
  txtMsg: {
    fontSize: 18,
    marginVertical: Platform.OS === "ios" ? 10 : 10,
    fontFamily: "PromptSemiBold",
    alignSelf: "center",
    color: "#000000",
  },
  rowFront: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#CACACA",
    borderBottomWidth: 2,
    justifyContent: "center",
    height: 70,
    marginTop: -2,
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
  },
  backRightBtnLeft: {
    backgroundColor: "#FFFFFF",
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: "#242A37",
    right: 0,
  },
});

export default Chat;
