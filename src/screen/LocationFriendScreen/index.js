import "@firebase/firestore";
import firebase from "firebase/app";
import "firebase/auth";
import moment from "moment";
import * as React from "react";
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
import MapFriend from "./../../components/MapFriend";

const onStart = async (Keyuid, addressId) => {
  let myKeyuid = await AsyncStorage.getItem("Key");
  const db = firebase.firestore();
  const profile = await firebase.auth().currentUser;
  //alert(Keyuid);
  console.log("start");
  await db
    .collection("User")
    .doc(Keyuid)
    .collection("DetailsAddress")
    .doc(addressId)
    .get()
    .then(async function (doc) {
      //alert("->" + doc.data().destinationName);
      await updateStart(Keyuid, addressId, doc.data().friends);
    });
};

const updateStart = async (uid, Endpoint, arr) => {
  //alert(arr);
  let friends = [];
  let start = true;
  let myKeyuid = await AsyncStorage.getItem("Key");
  arr.map((item) => {
    let obj = Object.assign({}, item);
    if (myKeyuid === item.uid) {
      obj.start = true;
    }
    friends.push(obj);
  });
  friends.map((item) => {
    if (item.start === false) {
      start = false;
    }
  });
  //alert(JSON.stringify(friends));
  let startDate = 0;
  if (start === true) {
    startDate = moment().valueOf();
  }

  const db = firebase.firestore();
  await db
    .collection("User")
    .doc(uid)
    .collection("DetailsAddress")
    .doc(Endpoint)
    .update({
      friends: friends,
      start: start,
      startDate: startDate,
    })
    .then(() => {
      //alert("Update");
    });
};

const LocationFriend = (props) => {
  if (props.viewMap === true) {
    //onStart(props.mapUserId, props.endpointId)
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#AEAEAE" }}>
      <View style={styles.areaBar}>
        <View style={{ flex: 0.2 }}>
          <View style={styles.boxleft}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                props.navigation.navigate("Notification");
              }}
            >
              <Icon name="arrow-back" color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.txtlatlng}>
            {props.viewMap !== true ? "ตำแหน่งของเพื่อน" : "ตำแหน่งของคุณ"}
          </Text>
        </View>
        <View style={{ flex: 0.2 }} />
      </View>

      <View style={{ flex: 1 }}>
        <MapFriend
          markers={props.coordinates}
          time_tamp={props.time_tamp}
          latitude={props.latitude}
          longitude={props.longitude}
          viewMap={props.viewMap}
          latitude_end={props.latitude_end}
          longitude_end={props.longitude_end}
        ></MapFriend>
      </View>
      <View style={styles.areaShowoption}>
        {props.openViewStartTime === true && (
          <View style={styles.boxDistanceandtimefriendTop}>
            <View style={{ flex: 3 }}>
              <Text style={styles.txtDistanceDurationfriend2TopThai}>
                ออกเดินทางเวลา
              </Text>
              <Text style={styles.txtDistanceDurationfriend1TopNumber}>
                {props.myStartTime}
              </Text>
            </View>
            <View
              style={{
                flex: 1.5,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../images/alarm.png")}
                style={{ width: 50, height: 50 }}
              />
            </View>
            <View style={{ flex: 3 }}>
              <Text style={styles.txtDistanceDurationfriend2TopThai}>
                ถึงจุดหมายเวลา
              </Text>
              <Text style={styles.txtDistanceDurationfriend1TopNumber}>
                {props.timeEndAll}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.boxDistanceandtimefriendBottom}>
          <View
            style={{ flex: 1, borderRadius: 15, backgroundColor: "#FFD428" }}
          >
            <Text style={styles.txtDistanceDurationfriend1BottomNumber}>
              {props.allDistance != undefined
                ? props.allDistance + " กม."
                : "0"}
            </Text>
            <Text style={styles.txtDistanceDurationfriend2BottomThai}>
              ระยะทางทั้งหมด
            </Text>
          </View>
          <View style={{ flex: 0.2 }} />
          <View
            style={{ flex: 1, borderRadius: 15, backgroundColor: "#FFD428" }}
          >
            <Text style={styles.txtDistanceDurationfriend1BottomNumber}>
              {props.allTime != undefined ? props.allTime + " นาที" : "0"}
            </Text>
            <Text style={styles.txtDistanceDurationfriend2BottomThai}>
              เวลาทั้งหมด
            </Text>
          </View>
        </View>
        {props.openBtnStart === true && (
          <TouchableOpacity
            onPress={async () => {
              await onStart(props.mapUserId, props.endpointId);
              // props.navigation.navigate("Notification");
            }}
          >
            <Image
              source={require("../../images/btn_start.png")}
              resizeMode={"contain"}
              style={{
                width: "92%",
                marginVertical: -70,
                alignSelf: "center",
              }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  areaBar: {
    flex: 0.11,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
  },
  boxleft: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 16 : 16,
  },
  txtlatlng: {
    fontSize: 20,
    marginTop: Platform.OS === "ios" ? 13 : 13,
    fontFamily: "PromptSemiBold",
    justifyContent: "center",
    alignItems: "center",
    color: "#000000",
  },
  areaShowoption: {
    flex: 0.55,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: "#FFFFFF",
    marginTop: -9,
    justifyContent: "space-around",
  },
  boxDistanceandtimefriendTop: {
    flexDirection: "row",
    borderRadius: 15,
    backgroundColor: "#FFD428",
    marginHorizontal: 20,
    marginTop: "3%",
  },
  txtDistanceDurationfriend1TopNumber: {
    alignSelf: "center",
    fontFamily: "PromptRegular",
    fontSize: 40,
    marginLeft: Platform.OS === "ios" ? 10 : 10,
    color: "#000000",
  },
  txtDistanceDurationfriend2TopThai: {
    alignSelf: "center",
    fontFamily: "PromptLight",
    fontSize: 18.5,
    color: "#625D5D",
  },
  boxDistanceandtimefriendBottom: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 2,
    marginBottom: 5,
  },
  txtDistanceDurationfriend1BottomNumber: {
    alignSelf: "center",
    fontFamily: "PromptRegular",
    fontSize: 28,
    marginLeft: Platform.OS === "ios" ? 10 : 10,
    color: "#000000",
  },
  txtDistanceDurationfriend2BottomThai: {
    alignSelf: "center",
    fontFamily: "PromptLight",
    fontSize: 17,
    color: "#625D5D",
  },
});

export default LocationFriend;
