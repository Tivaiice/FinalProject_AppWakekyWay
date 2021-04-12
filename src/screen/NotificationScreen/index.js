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
import Icon from "react-native-vector-icons/FontAwesome";
import Tabbar from "../../components/Tabbar";

const Notification = ({
  navigation,
  resultAddress,
  _setsignOutGoogle,
  photoUrl,
  fullName,
}) => {
  const [listlocation, setListlocation] = useState(resultAddress);

  let imageprofile =
    photoUrl !== "" ? { uri: photoUrl } : require("../../images/profile.png");

  useEffect(() => {
    setListlocation(resultAddress);
  }, [resultAddress]);

  // listlocation && console.log('listlocation :>> new ', listlocation);

  const renderItem = (data) => {
    return (
      <View style={styles.stylebg}>
        <TouchableOpacity
          style={{ flex: 0.9, margin: 10 }}
          onPress={() => {
            navigation.navigate("ShardPlace", {
              Endpoint: data.item.key,
              EndpointName: data.item.destinationName,
              EndpointAddress: data.item.end_address,
              EndpointLat: data.item.end_locationlat,
              EndpointLng: data.item.end_locationlng,
            });
          }}
        >
          <View style={{ flexDirection: "row", flex: 1 }}>
            <Text style={styles.txtDisDur} multiline={true}>
              {data.item.destinationName}
            </Text>
          </View>
          <View style={{ flexDirection: "row", flex: 1 }}>
            <Text style={styles.txtDisDur}>ระยะทาง {data.item.distance}</Text>
            <Text style={styles.txtDisDur}>เวลา {data.item.duration}</Text>
          </View>
        </TouchableOpacity>
        <View
          style={{ flex: 0.1, justifyContent: "center", alignItems: "center" }}
        >
          <TouchableOpacity
            onPress={() => {
              // alert(data.item.owner);
              navigation.navigate("LocationFriend", {
                endpointId: data.item.key,
                mapUserId: data.item.owner,
                viewMap: true,
              });
            }}
          >
            <Icon name="map-marker" size={30} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const deleteRow = (rowMap, rowKey) => {
    _delListAddress(rowKey);
    console.log("rowKey", rowKey);
    const newData = [...listlocation];
    const prevIndex = listlocation.findIndex((item) => item.key === rowKey);
    newData.splice(prevIndex, 1);
    setListlocation(newData);
  };

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => {
          Alert.alert(
            "ยืนยันการลบแจ้งเตือน",
            "",
            [
              {
                text: "ยืนยัน",
                onPress: () => deleteRow(rowMap, data.item.key),
              },
              {
                text: "ยกเลิก",
                onPress: () => console.log("ยกเลิกการลบแจ้งเตือน"),
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

  const _delListAddress = async (rowKey) => {
    console.log("rowKey is del :>> ", rowKey);
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    db.collection("User")
      .doc(Keyuid)
      .collection("DetailsAddress")
      .doc(rowKey)
      .delete();
    console.log(">> ลบรายการสำเร็จ <<");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#DADADA" }}>
      <View style={styles.stylebar}>
        <View style={{ flex: 0.8, flexDirection: "row", marginTop: -15 }}>
          <View style={{ flex: 5, alignSelf: "center" }}>
            <Image
              source={require("../../images/logowakeyways-new2.png")}
              style={styles.logo}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              Alert.alert(
                "ออกจากระบบ",
                "",
                [
                  {
                    text: "ใช่",
                    onPress: () => {
                      _setsignOutGoogle();
                      navigation.navigate("Login");
                    },
                  },
                  {
                    text: "ไม่",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "destructive",
                  },
                ],
                { cancelable: false }
              );
            }}
          >
            <Image
              source={require("../../images/logout.png")}
              style={{ width: 25, resizeMode: "contain", marginRight: 15 }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={{ flex: 0.9, margin: 10 }}
              onPress={() => {
                navigation.navigate("NotificationHistory");
              }}
            >
              <Image
                style={styles.profile}
                source={imageprofile}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 3, marginTop: Platform.OS === "ios" ? "5%" : "5%" }}
          >
            <Text style={styles.txtWelcome}>ยินดีต้อนรับ</Text>
            <Text style={styles.txtName}>{fullName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bar}>
        <Text style={styles.txtNotity}>รายการแจ้งเตือน</Text>
      </View>
      <SafeAreaView style={{ flex: 1, marginTop: 10 }}>
        <View style={styles.areanotifi}>
          <SwipeListView
            data={listlocation}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-75}
            previewRowKey={"0"}
            previewOpenValue={-150}
            previewOpenDelay={3000}
          />
        </View>
      </SafeAreaView>

      <View style={{ flex: 0.184 }}>
        <Tabbar navigation={navigation} col={"Notification"} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stylebg: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F1F2F6",
    borderRadius: 20,
    flexWrap: "wrap",
    marginBottom: 10,
    marginHorizontal: 15,
  },
  stylebar: {
    flex: 0.3,
    flexDirection: "column",
    backgroundColor: "#FFD428",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  logo: {
    width: 200,
    height: 60,
    resizeMode: "contain",
    marginTop: 10,
    marginHorizontal: 90,
  },
  bar: {
    flex: 0.07,
  },
  profile: {
    width: 65,
    height: 65,
    borderRadius: 40,
    marginHorizontal: 25,
  },
  areanotifi: {
    flex: 1,
  },
  txtWelcome: {
    fontSize: Platform.OS === "ios" ? 16 : 16,
    marginLeft: Platform.OS === "ios" ? 16 : 16,
    fontFamily: "PromptRegular",
    color: "#000000",
  },
  txtName: {
    fontSize: Platform.OS === "ios" ? 20 : 19,
    marginLeft: Platform.OS === "ios" ? 16 : 16,
    fontFamily: "PromptSemiBold",
    color: "#000000",
  },
  txtNotity: {
    fontSize: Platform.OS === "ios" ? 20 : 20,
    marginLeft: Platform.OS === "ios" ? 20 : 20,
    marginTop: Platform.OS === "ios" ? 5 : 5,
    fontFamily: "PromptSemiBold",
    color: "#000000",
  },
  txtDisDur: {
    fontSize: 18,
    fontFamily: "PromptLight",
    lineHeight: 25,
  },
  rowFront: {
    alignItems: "center",
    borderBottomColor: "black",
    justifyContent: "center",
    height: 100,
    paddingHorizontal: 20,
    marginVertical: 5,
  },
  rowBack: {
    alignItems: "center",
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 0,
    marginBottom: Platform.OS === "ios" ? 12 : 10,
  },
  backRightBtn: {
    backgroundColor: "#4285F4",
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 69,
  },
  backRightBtnLeft: {
    // right: 75,
  },
  backRightBtnRight: {
    backgroundColor: "#242A37",
    right: 20,
    borderRadius: 20,
  },
});

export default Notification;
