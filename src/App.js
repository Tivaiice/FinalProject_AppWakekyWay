import "core-js/es6/map";
import "core-js/es6/symbol";
import "core-js/fn/symbol/iterator";
import * as BackgroundFetch from "expo-background-fetch";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import * as TaskManager from "expo-task-manager";
import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
  YellowBox,
} from "react-native";
import StackNavigation from "./Navigation";
import { chkLocation } from "./NotificationMap";

YellowBox.ignoreWarnings([""]);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const styles = StyleSheet.create({
  statusBar: {
    backgroundColor: "#FFD428",
    height: Constants.statusBarHeight,
  },
});

const LOCATION_TASK_NAME = "background-location-task";

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const startLocation = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    try {
      if (status === "granted") {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 2500,
          distanceInterval: 5,
          showsBackgroundLocationIndicator: false,
        });
      }
    } catch (err) {
      // alert(err);
    }
  };

  const registerTaskAsync = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(TASK_NAME_FETCH, {
        minimumInterval: 1,
      });
    } catch (err) {
      console.log("err:", err);
    }
    console.log("task registered 2");
  };

  useEffect(() => {
    StatusBar.setBarStyle("light-content", true);

    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(response);
      }
    );
    startLocation();
    registerTaskAsync();
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.statusBar} />
      <StackNavigation />
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      //alert("Failed to get push token for push notification!");
      return;
    }
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      //console.log(token);
      await updateToken(token);
    } catch (err) {
      console.log("err-token", err);
    }
  } else {
    // alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

async function updateToken(token) {
  let KeyUid = await AsyncStorage.getItem("Key");
  const db = firebase.firestore();
  if (token !== undefined) {
    await db
      .collection("User")
      .doc(KeyUid)
      .set(
        {
          noti_token: token,
        },
        { merge: true }
      )
      .then(function () {
        //alert("Document successfully written!");
      });
  }
}

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  console.log("-");

  if (error) {
    // Error occurred - check `error.message` for more details.
    console.log("error:" + error);
    return;
  }
  console.log("999");
  if (data) {
    const { locations } = data;
    // do something with the locations captured in the background
    //console.log("locations:", JSON.stringify(locations));

    if (locations[0].coords) {
      console.log(
        "latitude:" +
          locations[0].coords.latitude +
          " longitude:" +
          locations[0].coords.longitude
      );

      chkLocation(locations[0].coords.latitude, locations[0].coords.longitude);
    }
  } else {
    console.log("no data:");
  }
});

//////
BackgroundFetch.setMinimumIntervalAsync(1);

const TASK_NAME_FETCH = "test-background-fetch";

TaskManager.defineTask(TASK_NAME_FETCH, async ({ data, error }) => {
  console.log("background fetch running");
  chkTimeNoti();
  if (error) {
    // Error occurred - check `error.message` for more details.
    console.log("error:" + error);
    return;
  }
  try {
    return BackgroundFetch.Result.NewData;
  } catch (err) {
    console.log("err:", err);
  }
});
console.log("task defined");

export const chkTimeNoti = async () => {
  const KeyUid = await AsyncStorage.getItem("Key");
  const db = firebase.firestore();
  if (KeyUid !== undefined && KeyUid !== null) {
    await db
      .collection("User")
      .doc(KeyUid)
      .collection("DetailsAddress")
      .get()
      .then(async (querySnapshot) => {
        querySnapshot.docs.forEach(async (doc) => {
          let docId = doc.id;
          let dataDoc = doc.data();
          if (dataDoc.startDate !== undefined) {
            console.log("startDate in mill      " + moment(dataDoc.startDate));
            // Check Noti Real Time
            // if (dataDoc.myTimeStart !== undefined) {
            // console.log("dataDoc.myTimeStart => " + dataDoc.myTimeStart);
            console.log("moment new Date()      " + moment(new Date()));
            console.log(
              "dataDoc.startDate => " +
                moment(dataDoc.startDate).format("YYYYMMDDHHmm") +
                // console.log(
                //   "dataDoc.myTimeStart => " +
                //     dataDoc.myTimeStart +
                " === " +
                moment(new Date()).format("YYYYMMDDHHmm")
            );
            let d = moment(dataDoc.startDate).format("YYYYMMDDHHmm");
            // let dTimeStart = dataDoc.myTimeStart;
            let t = moment(new Date()).format("YYYYMMDDHHmm");
            // if(ddTimeStart == t) {
            if (d === t) {
              console.log("d:" + t + "==" + d);
              await pushNotiUser(KeyUid);
              console.log("sendNoti2");
              await db
                .collection("User")
                .doc(KeyUid)
                .collection("DetailsAddress")
                .doc(docId)
                .set(
                  {
                    startDateStatus: true,
                  },
                  { merge: true }
                )
                .then(function () {
                  console.log("startDateStatus=OK!");
                });
            }
          }
        });
      });
  }
};

const pushNotiUser = async (uid) => {
  const db = firebase.firestore();
  await db
    .collection("User")
    .doc(uid)
    .get()
    .then(async (doc) => {
      let token = doc.data().noti_token;
      let dataUser = doc.data();
      let msg = dataUser.fullName + " เริ่มออกเดินทางได้";
      console.log("token:" + token);
      await pushNotiServerTo(token, msg, msg);
      //await saveLog(item.uid, token, "เช็คส่ง Noti ได้ไหม");
    });
};

const pushNotiServerTo = async (token, title, msg) => {
  let url = "https://exp.host/--/api/v2/push/send";
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      host: "exp.host",
      accept: "application/json",
      "accept-encoding": "gzip, deflate",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      to: token,
      sound: "default",
      title: title,
      body: msg,
    }),
  });
  //console.log("res=" + JSON.stringify(response.json()));
};
//////
