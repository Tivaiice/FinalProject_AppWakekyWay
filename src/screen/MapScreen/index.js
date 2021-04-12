import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import moment from "moment";
import React, { useState } from "react";
import {
  AsyncStorage,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import GoogleMap from "./GoogleMap";

const apiKey = "AIzaSyBnfM4fPxyvgMQzt2fheScqbNQXnofFEks";

const Map = ({ props, navigation, chatGroupId }) => {
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [notify, setNotify] = useState("1");
  const [addressObj, setAddressObj] = useState({});
  const timeNow_milliseconds = moment().valueOf();
  const timeNoew_date = moment(timeNow_milliseconds).format("MMM DD, YYYY");
  console.log("วันที่จ้าาา milliseconds  ===>> " + timeNow_milliseconds);
  console.log("วันที่จ้าาา Date ============>> " + timeNoew_date);
  // console.log('distance', distance)
  // console.log('duration', duration)
  const setAddress = async (dataObj) => {
    setAddressObj(dataObj);
  };

  const isNumeric = (checknum) => {
    return /^\d+$/.test(checknum);
  };

  const saveAddress = async () => {
    //console.log("notif:" + notify + ">" + addressObj.destinationName);
    //alert(addressObj.destinationName);
    if (
      isNumeric(notify) == true &&
      notify != 0 &&
      addressObj.destinationName != "" &&
      addressObj.destinationName !== undefined
    ) {
      let Keyuid = await AsyncStorage.getItem("Key");
      let dataObj = Object.assign({}, addressObj);
      dataObj.notify = parseInt(notify);
      dataObj.owner = Keyuid;
      dataObj.owner_noti = false;
      dataObj.owner_noti2 = false;
      dataObj.show = true;
      dataObj.timenow = timeNow_milliseconds;

      //alert(JSON.stringify(addressObj));
      // alert(JSON.stringify(dataObj));
      try {
        const db = await firebase.firestore();
        ///alert("addGroup-->" + chatGroupId);
        db.collection("User")
          .doc(Keyuid)
          .collection("DetailsAddress")
          .add(dataObj)
          .then(async function (docRef) {
            if (chatGroupId !== undefined) {
              //alert("addGroup-->" + docRef.id);
              await addGroupChat(docRef.id, dataObj, chatGroupId);
            }
          });

        db.collection("User")
          .doc(Keyuid)
          .collection("DetailsAddressHistory")
          .add(dataObj)
          .then(async function (docRef) {});

        if (chatGroupId === undefined) {
          navigation.navigate("Notification");
        } else {
          const profile = await firebase.auth().currentUser;
          navigation.navigate("ChatGroupRoom", {
            userChat: {
              uid: profile.uid,
              fullName: profile.fullName,
              photoUrl: profile.photoUrl,
              firstname: profile.fullName,
              groupId: chatGroupId,
            },
          });
        }
      } catch (err) {
        // alert(err);
      }
    } else {
      alert("กรอกข้อมูลไม่ถูกต้อง กรุณากรอกข้อมูลใหม่อีกครั้ง");
    }
  };

  const addGroupChat = async (docId, obj, chatGroupId) => {
    try {
      let Keyuid = await AsyncStorage.getItem("Key");
      const mydb = firebase.firestore();
      let docRef = mydb.collection("ChatGroup").doc(chatGroupId);
      docRef.get().then(async (doc) => {
        let friends = doc.data().friends;
        let friendsArr = [];
        for (let i = 0; i < friends.length; i++) {
          let item = friends[i];
          friendsArr.push({
            email: item.email,
            firstname: item.fullName,
            fullName: item.fullName,
            lat: null,
            lng: null,
            photoUrl: item.photoUrl,
            start: false,
            uid: item.uid,
            noti1: false,
            noti2: false,
          });
        }
        //alert("friendsArr:" + docId);
        const db = firebase.firestore();
        await db
          .collection("User")
          .doc(Keyuid)
          .collection("DetailsAddress")
          .doc(docId)
          .update({ friends: friendsArr })
          .then(() => {
            //alert("Update");
            addMapData(docId, obj, chatGroupId);
          });
      });
    } catch (err) {
      // alert("err:" + err);
    }
  };

  const addMapData = async (docId, dataObj, chatGroupId) => {
    let Keyuid = await AsyncStorage.getItem("Key");
    const profile = await firebase.auth().currentUser;
    let message = {
      _id: Keyuid,
      text: dataObj.destinationName,
      destinationPlaceId: dataObj.destinationPlaceId,
      endpointId: docId,
      endpointName: dataObj.destinationName,
      endpointAddress: dataObj.end_address,
      endpointLat: dataObj.end_locationlat,
      endpointLng: dataObj.end_locationlng,
      userId: Keyuid,
      createdAt: new Date(),
      user: {
        _id: profile.uid,
        name: profile.displayName,
        avatar: profile.photoURL,
        createdAt: new Date(),
      },
    };
    const db = firebase.firestore();
    //alert(chatGroupId);
    db.collection("ChatGroup")
      .doc(chatGroupId)
      .set(
        {
          messages: firebase.firestore.FieldValue.arrayUnion(message),
        },
        { merge: true }
      );
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ flex: 0.14, backgroundColor: "#FFFFFF", flexDirection: "row" }}
      >
        <View style={styles.boxleft}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              navigation.navigate("Notification");
            }}
          >
            <Icon name="arrow-back" color="#000000" />
          </TouchableOpacity>
        </View>
        <View style={styles.boxMed}>
          <Text style={styles.txtMap}>แผนที่</Text>
        </View>
        <View style={{ flex: 0.2 }} />
      </View>

      <View style={{ flex: 1 }}>
        <GoogleMap
          distance={distance}
          setDistance={setDistance}
          duration={duration}
          setDuration={setDuration}
          setAddress={setAddress}
        />
      </View>

      <View style={{ flex: 0.6 }}>
        <View style={styles.boxbgArea}>
          <Text style={styles.txtThai}>ระยะทางแจ้งเตือน</Text>
          <TextInput
            style={{
              height: 25,
              width: 40,
              backgroundColor: "#FFFFFF",
              borderRadius: 5,
              marginTop: Platform.OS === "ios" ? 7 : 7,
            }}
            //autoCapitalize='none'
            //autoCorrect={false}
            maxLength={2}
            keyboardAppearance={"dark"}
            keyboardType="numeric"
            autoCompleteType={"cc-number"}
            value={notify}
            onChangeText={(val) => setNotify(val)}
          />
          <Text style={styles.txtThai}>กิโลเมตร(KM)</Text>
        </View>
        <View style={styles.boxAreaShow}>
          <View style={styles.boxDistanceandtime}>
            <Image
              source={require("../../images/dashboard.png")}
              style={{ width: 55, height: 55, marginTop: 5 }}
            />
            <Text style={styles.txtDistanceDurationMe1}>{distance} </Text>
            <Text style={styles.txtDistanceDurationMe2}>ระยะทางทั้งหมด</Text>
          </View>
          <View style={styles.boxDistanceandtime}>
            <Image
              source={require("../../images/clock.png")}
              style={{ width: 45, height: 45, marginTop: 9 }}
            />
            <Text style={styles.txtDistanceDurationMe1}>{duration} </Text>
            <Text style={styles.txtDistanceDurationMe2}>เวลาทั้งหมด</Text>
          </View>
        </View>

        <View style={styles.boxBtn}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              saveAddress();
            }}
          >
            <Image
              source={require("../../images/btn_add.png")}
              style={{ width: 165, height: 100, marginTop: -22 }}
              resizeMode={"contain"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              navigation.navigate("Notification");
            }}
          >
            <Image
              source={require("../../images/btn_cancal.png")}
              style={{ width: 165, height: 100, marginTop: -22 }}
              resizeMode={"contain"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  boxleft: {
    alignItems: "center",
    flex: 0.2,
    marginVertical: Platform.OS === "ios" ? 20 : 18,
  },
  boxMed: {
    flex: 1,
    alignItems: "center",
  },
  destinationInput: {
    height: 50,
    fontSize: 20,
    padding: 10,
    //fontFamily: "PromptLight",
    backgroundColor: "white",
  },
  txtMap: {
    fontSize: 30,
    marginTop: Platform.OS === "ios" ? 8 : 8,
    fontFamily: "PromptSemiBold",
    justifyContent: "center",
    alignItems: "center",
    color: "#000000",
  },
  boxbgArea: {
    width: "89%",
    height: 40,
    backgroundColor: "#AFB1B4",
    borderRadius: 5,
    marginHorizontal: 20,
    marginTop: 10,
    justifyContent: "space-evenly",
    flexDirection: "row",
  },
  txtThai: {
    marginTop: Platform.OS === "ios" ? 10 : 10,
    fontFamily: "PromptLight",
    fontSize: 14,
  },
  txtDistanceDurationMe1: {
    fontFamily: "PromptRegular",
    fontSize: 20,
    marginLeft: Platform.OS === "ios" ? 10 : 10,
    color: "#000000",
  },
  txtDistanceDurationMe2: {
    fontFamily: "PromptLight",
    fontSize: 18,
    color: "#625D5D",
  },
  boxAreaShow: {
    flex: 1.5,
    flexDirection: "row",
    padding: 10,
    marginVertical: 5,
  },
  boxDistanceandtime: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#FFD428",
    marginHorizontal: 10,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
  },
  boxBtn: {
    flex: 0.8,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

export default Map;
