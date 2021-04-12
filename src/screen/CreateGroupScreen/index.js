import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import React, { useState } from "react";
import {
  AsyncStorage,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { Checkbox } from "react-native-paper";
import { SafeAreaView } from "react-navigation";

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
            style={styles.picListFriend}
            source={imageprofile}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 6 }}>
          <Text style={styles.txtFullName}>{item.fullName}</Text>
        </View>
      </View>
    );
  }
}

const renderItems = (item, index, _setArrayUid) => {
  return <RenderItem item={item.item} _setArrayUid={_setArrayUid} />;
};

const CreateGroup = ({ navigation, resultlistfriendGroup }) => {
  const [arrayUid, setArrayUid] = useState([]);
  const [groupName, setGroupName] = useState("");

  const _setArrayUid = (item, check) => {
    if (!check) {
      setArrayUid([...arrayUid, item]);
    } else {
      setArrayUid(arrayUid.filter((value) => value.uid !== item.uid));
    }
  };

  const _createGroupChat = async () => {
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    let arrayFriend = [];
    arrayUid.map((item) => {
      arrayFriend.push(item.uid);
    });

    let myUser = firebase.auth().currentUser;
    arrayUid.push({
      email: myUser.email,
      firstname: myUser.displayName,
      fullName: myUser.displayName,
      photoUrl: myUser.photoURL,
      uid: myUser.uid,
    });

    arrayFriend.push(Keyuid);
    let avatar = [];
    // avatar[0] = "http://www.webappthai.com/images/teamwork-1.png";
    // avatar[1] = "http://www.webappthai.com/images/teamwork-2.png";
    // avatar[3] = "http://www.webappthai.com/images/teamwork-3.png";
    // avatar[4] = "http://www.webappthai.com/images/teamwork-4.png";
    // avatar[5] = "http://www.webappthai.com/images/teamwork-5.png";
    avatar[0] = "https://i.postimg.cc/5tPZ69BZ/teamwork-1.png";
    avatar[1] = "https://i.postimg.cc/prj7GDwH/teamwork-2.png";
    avatar[3] = "https://i.postimg.cc/G3TZmCH5/teamwork-3.png";
    avatar[4] = "https://i.postimg.cc/MTvgRktX/teamwork-4.png";
    avatar[5] = "https://i.postimg.cc/MTNNmsr5/teamwork-5.png";

    let m = Math.random() * 5;

    await db
      .collection("ChatGroup")
      .add({
        friends: arrayUid,
        groupName: groupName,
        owner: Keyuid,
        friendList: arrayFriend,
        avatar: avatar[parseInt(m)],
      })
      .then(() => {
        //alert("Update");
      });
    navigation.navigate("Chat");
    //navigation.navigate("Chat", { shardFriend: arrayUid });
  };

  let btnOk =
    arrayUid == "" ? null : (
      <TouchableOpacity
        style={{ alignItems: "center", alignItems: "center" }}
        onPress={async () => {
          await _createGroupChat();
        }}
      >
        <Image
          style={{ width: 300, height: 150, resizeMode: "contain" }}
          source={require("../../images/btn_okay.png")}
        />
      </TouchableOpacity>
    );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.barArea}>
        <View style={{ flex: 0.5 }}>
          <View style={styles.barAreaLeft}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                navigation.navigate("Chat");
              }}
            >
              <Icon name="arrow-back" color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.txtcreateGroup}>สร้างกลุ่ม</Text>
        </View>
        <View style={{ flex: 0.5 }} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flex: 0, flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Image
              source={require("../../images/picture.png")}
              style={styles.stylepic}
            />
          </View>
          <View style={styles.boxNameGroup}>
            <Text style={styles.txtNameGroup}>ชื่อกลุ่มของคุณ</Text>
            <View style={styles.boxInputName}>
              <TextInput
                style={styles.nameGroup}
                // placeholder="ตั้งชื่อกลุ่ม"
                // placeholderTextColor="#AFB1B4"
                maxLength={20}
                onChangeText={(val) => setGroupName(val)}
                keyboardType={"default"}
                selectionColor={"#FFD428"}
                color="#000000"
                fontSize={20}
              />
            </View>
          </View>
        </View>
        <View style={{ flex: 0.9 }}>
          <Text style={styles.txtlistFriend}>รายชื่อเพื่อน</Text>
        </View>
        <SafeAreaView style={styles.areaList}>
          <View style={{ flex: 1, marginTop: Platform.OS === "ios" ? 20 : 20 }}>
            <FlatList
              data={resultlistfriendGroup}
              renderItem={(item, index) =>
                renderItems(item, index, _setArrayUid)
              }
              keyExtractor={(item, index) => index.toString()}
            />
            {btnOk}
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stylepic: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    alignSelf: "center",
    marginVertical: Platform.OS === "ios" ? 20 : 20,
  },
  txtcreateGroup: {
    fontSize: 19,
    fontFamily: "PromptSemiBold",
    alignSelf: "center",
    color: "#000000",
    marginTop: Platform.OS === "ios" ? 20 : 20,
  },
  txtlistFriend: {
    fontSize: 18,
    fontFamily: "PromptSemiBold",
    color: "#000000",
    marginVertical: Platform.OS === "ios" ? 10 : 10,
    marginLeft: Platform.OS === "ios" ? 20 : 20,
  },
  picListFriend: {
    width: 50,
    height: 50,
    borderRadius: 40,
    marginLeft: 10,
    marginVertical: 10,
  },
  txtFullName: {
    fontFamily: "PromptRegular",
    fontSize: 18,
    marginTop: Platform.OS === "ios" ? 20 : 20,
    marginLeft: Platform.OS === "ios" ? 5 : 5,
  },
  barArea: {
    flex: 0.09,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: "#CACACA",
  },
  barAreaLeft: {
    alignItems: "flex-start",
    marginVertical: Platform.OS === "ios" ? 20 : 20,
    marginLeft: "15%",
  },
  boxNameGroup: {
    flex: 2,
    flexDirection: "column",
    marginTop: 15,
  },
  txtNameGroup: {
    color: "#AFB1B4",
    fontFamily: "PromptRegular",
    fontSize: 14,
  },
  boxInputName: {
    borderBottomWidth: 1,
    borderColor: "#CACACA",
    marginRight: 30,
  },
  nameGroup: {
    height: 45,
    fontFamily: "PromptLight",
    fontSize: 16,
  },
  areaList: {
    flex: 10,
    backgroundColor: "#FFD428",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
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

export default CreateGroup;
