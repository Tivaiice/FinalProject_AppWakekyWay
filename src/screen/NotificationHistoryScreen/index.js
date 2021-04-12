import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import moment from "moment";
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

const NotificationHistory = ({ navigation, resultAddress }) => {
  const [listlocation, setListlocation] = useState(resultAddress);

  useEffect(() => {
    setListlocation(resultAddress);
  }, [resultAddress]);

  //listlocation && console.log("listlocation :>> new ", listlocation);

  const renderItem = (data) => {
    return (
      <View style={styles.stylebg}>
        <View>
          <Text style={styles.txtNameDestination} multiline={true}>
            {data.item.destinationName}
          </Text>
          <View style={{ marginTop: 30 }}>
            <Text style={styles.txtDate} multiline={true}>
              {moment(data.item.timenow).format("MMM DD, YYYY")}
              {"  "}
              {moment(data.item.timenow).format("HH:mm")} -{" "}
              {moment(data.item.timenow)
                .add(data.item.duration_value, "seconds")
                .format("HH:mm")}
            </Text>
          </View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Text style={styles.txtDisDur2}>{data.item.distance}</Text>
            <Text style={styles.txtDisDur3}>{data.item.duration}</Text>
          </View>
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
            "ยืนยันการลบประวัติแจ้งเตือน",
            "",
            [
              {
                text: "ยืนยัน",
                onPress: () => deleteRow(rowMap, data.item.key),
              },
              {
                text: "ยกเลิก",
                onPress: () => console.log("ยกเลิกการลบประวัติแจ้งเตือน"),
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
      .collection("DetailsAddressHistory")
      .doc(rowKey)
      .delete();
    console.log(">> ลบรายการสำเร็จ <<");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFD428" }}>
      <View style={styles.bar}>
        <Text style={styles.txtNotityHis}>การเดินทางย้อนหลัง</Text>
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

      <View style={{ flex: 0.14 }}>
        <Tabbar navigation={navigation} col={"NotificationHistory"} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stylebg: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    flexWrap: "wrap",
    marginBottom: 10,
    marginHorizontal: 15,
    padding: 10,
  },
  stylebar: {
    flex: 0.3,
    flexDirection: "column",
    backgroundColor: "#FFD428",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  bar: {
    flex: 0.07,
  },
  areanotifi: {
    flex: 1,
  },
  txtNotityHis: {
    fontSize: Platform.OS === "ios" ? 20 : 20,
    marginLeft: Platform.OS === "ios" ? 20 : 20,
    marginTop: Platform.OS === "ios" ? 10 : 10,
    fontFamily: "PromptSemiBold",
    color: "#000000",
    alignSelf: "center",
  },
  txtNameDestination: {
    fontSize: 18,
    fontFamily: "PromptRegular",
    lineHeight: 25,
  },
  txtDate: {
    fontSize: 15,
    fontFamily: "PromptLight",
    lineHeight: 25,
  },
  txtDisDur2: {
    fontSize: 18,
    fontFamily: "PromptLight",
    lineHeight: 25,
    width: "50%",
  },
  txtDisDur3: {
    fontSize: 18,
    fontFamily: "PromptLight",
    lineHeight: 25,
    width: "50%",
    textAlign: "right",
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
    width: 70,
  },
  backRightBtnLeft: {
    // right: 75,
  },
  backRightBtnRight: {
    backgroundColor: "#242A37",
    right: 20,
    borderRadius: 0,
  },
});

export default NotificationHistory;
