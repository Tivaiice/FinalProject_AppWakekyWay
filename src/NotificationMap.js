import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import moment from "moment";
import { AsyncStorage } from "react-native";
import { GMAP_KEY } from "./../config";

const apiKey = GMAP_KEY;

export const chkLocation = async (lat, lng) => {
  console.log("check");
  const KeyUid = await AsyncStorage.getItem("Key");
  const db = firebase.firestore();
  if (KeyUid !== undefined && KeyUid !== null) {
    await db
      .collection("User")
      .get()
      .then(async (querySnapshot) => {
        querySnapshot.docs.forEach(async (doc) => {
          let docId = doc.id;
          await getMap(KeyUid, docId, lat, lng);
        });
      });
  }
};

const getMap = async (KeyUid, docId, lat, lng) => {
  const db = firebase.firestore();
  await db
    .collection("User")
    .doc(docId)
    .collection("DetailsAddress")
    .get()
    .then(async (querySnapshot) => {
      querySnapshot.docs.forEach(async (doc) => {
        let update = false;
        let docAddressId = doc.id;
        let friends = doc.data().friends;
        let destinationPlaceId = doc.data().destinationPlaceId;
        let notify = doc.data().notify;
        let owner = doc.data().owner;
        let myObj = {};
        let friendIndex = null;
        let updateLocation = false;
        let start_go = doc.data().start;
        let owner_noti = false;
        let owner_noti_status = doc.data().owner_noti;
        let owner_noti_status2 = doc.data().owner_noti2;
        //console.log("friends:" + JSON.stringify(friends));
        if (KeyUid === owner) {
          await OwerUpdate(KeyUid, docAddressId, {
            owner_locationlat: lat,
            owner_locationlng: lng,
          });
        }
        console.log("lat-:" + lat + " lng-:" + lng);
        if (doc.data().friends !== undefined) {
          if (friends.length > 0) {
            friends.map(async (item, index) => {
              if (item.uid === KeyUid) {
                friendIndex = index;
                if (item.noti2 === false) {
                  update = true;
                }
                let copyData = Object.assign({}, friends[index]);
                copyData.lat = lat;
                copyData.lng = lng;
                copyData.distance = null;
                copyData.distance_value = null;
                copyData.duration = null;
                copyData.distance_value = null;
                friends[index] = copyData;
                myObj = copyData;
                if (KeyUid === owner) {
                  updateLocation = true;
                }
              }
            });
          } else {
            update = true;
            owner_noti = true;
          }
        } else {
          update = true;
          owner_noti = true;
        }

        if (update === true) {
          try {
            let dataObjUpdate = await chkDistance(
              destinationPlaceId,
              lat,
              lng,
              notify,
              friends,
              docAddressId,
              myObj,
              start_go,
              owner_noti,
              KeyUid,
              owner_noti_status,
              owner_noti_status2,
              KeyUid
            );

            if (friends !== undefined) {
              friends[friendIndex] = dataObjUpdate;
            } else {
              friends = [];
            }

            //console.log("key-"+KeyUid+">"+updateLocation);
            await updateLocationData(
              docId,
              docAddressId,
              friends,
              myObj,
              updateLocation
            );
          } catch (err) {
            console.log(err);
          }
        }
      });
    });
};

const updateLocationData = async (
  docId,
  docAddressId,
  friends,
  myObj,
  updateLocation
) => {
  let dataUpdate = {};
  if (friends !== null) {
    dataUpdate.friends = friends;
  }
  if (updateLocation === true) {
    dataUpdate.distance = myObj.distance;
    dataUpdate.distance_value = myObj.distance_value;
    //dataUpdate.owner_locationlat = myObj.owner_locationlat;
    //dataUpdate.owner_locationlng = myObj.owner_locationlng;
  }
  const db = firebase.firestore();
  await db
    .collection("User")
    .doc(docId)
    .collection("DetailsAddress")
    .doc(docAddressId)
    .set(dataUpdate, { merge: true })
    .then(function () {
      /*console.log(JSON.stringify(dataUpdate)+"Document successfully written!--"+moment().format('YYYY-MM-DD h:mm:ss'));*/
    });
};

const chkDistance = async (
  destinationPlaceId,
  lat,
  lng,
  notify,
  friends,
  docId,
  Myobj,
  start_go,
  owner_noti,
  owner_uid,
  owner_noti_status,
  owner_noti_status2,
  KeyUid
) => {
  let return_data = Object.assign({}, Myobj);
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lng}&destination=place_id:${destinationPlaceId}&key=${apiKey}&language=th`
    );

    const json = await response.json();
    //console.log("json:" + JSON.stringify(json));

    if (json.routes != undefined) {
      let n = json.routes[0].legs[0].distance.value / 1000;
      console.log("##################################################");
      //console.log("distance == " + n);
      console.log("notify=" + notify.toFixed(2));
      console.log("n=" + n.toFixed(2));
      console.log("Myobj.noti1=" + Myobj.noti1);
      console.log("start_go=" + start_go);
      console.log("owner_noti=" + owner_noti);

      if (
        parseFloat(notify.toFixed(2)) >= parseFloat(n.toFixed(2)) &&
        Myobj.noti1 === false &&
        start_go === true &&
        owner_noti === false
      ) {
        ///ใกล้ถึงจุดหมาด
        console.log("Send-1");
        pushNoti(friends, "การเดินทาง", Myobj.fullName + " ใกล้ถึงจุดหมายแล้ว");
        return_data.noti1 = true;
      } else if (
        parseFloat(n.toFixed(2)) <= 1 &&
        Myobj.noti2 === false &&
        start_go === true &&
        owner_noti === false
      ) {
        ///ถึงจุดหมายแล้ว
        console.log("Send-2");
        pushNoti(friends, "การเดินทาง", Myobj.fullName + " ถึงจุดหมายแล้ว");
        return_data.noti2 = true;
      } else if (
        parseFloat(n.toFixed(2)) <= parseFloat(notify.toFixed(2)) &&
        owner_noti === true &&
        owner_noti_status === false
      ) {
        if (owner_noti_status === false) {
          pushNotiOwer(
            owner_uid,
            "การเดินทาง",
            "คุณใกล้ถึงจุดหมายแล้ว",
            docId,
            0
          );
        }
      } else if (parseFloat(n.toFixed(2)) < 1.0 && owner_noti === true) {
        console.log("vvvv");
        if (owner_noti_status2 === false) {
          console.log("zzz");
          pushNotiOwer(owner_uid, "การเดินทาง", "คุณถึงจุดหมายแล้ว", docId, 1);
        }
      }
      //
      return_data.distance = json.routes[0].legs[0].distance.text;
      return_data.distance_value = json.routes[0].legs[0].distance.value;
      return_data.duration = json.routes[0].legs[0].duration.text;
      return_data.duration_value = json.routes[0].legs[0].duration.value;
      //
      if (
        return_data.distance !== undefined &&
        return_data.distance_value !== undefined
      ) {
        try {
          await OwerUpdate(KeyUid, docId, {
            distance: return_data.distance,
            distance_value: return_data.distance_value,
            duration: return_data.duration,
            duration_value: return_data.duration_value,
          });
        } catch (e) {}
      }
      //
    }
  } catch (error) {
    console.error(error);
  }
  return return_data;
};

const pushNoti = async (friends, title, msg) => {
  friends.map(async (item) => {
    const db = firebase.firestore();
    await db
      .collection("User")
      .doc(item.uid)
      .get()
      .then(async (doc) => {
        let docAddressId = doc.id;
        let token = doc.data().noti_token;
        await pushNotiServer(token, title, msg);
        await saveLog(item.uid, token, "เช็คส่ง Noti ได้ไหม");
      });
  });
};

export const pushNotiServer = async (token, title, msg) => {
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
  console.log("res=" + JSON.stringify(response.json()));
};

const pushNotiOwer = async (uid, title, msg, docAddressId, status) => {
  const db = firebase.firestore();
  await db
    .collection("User")
    .doc(uid)
    .get()
    .then(async (doc) => {
      //let docAddressId = doc.id;
      let token = doc.data().noti_token;
      //console.log("token:" + token);
      await pushNotiServer(token, title, msg);
      await pushNotiOwerUpdate(uid, docAddressId, status);
      await saveLog(uid, token, "เช็คว่า ส่่ง NoTi ได้ไหมแบบเดี่ยว");
    });
};

const pushNotiOwerUpdate = async (uid, addressId, status) => {
  //console.log("uid:" + uid + " addressId:" + addressId);
  const db = firebase.firestore();
  let dataUpdate = { owner_noti: true };
  if (status == 1) {
    dataUpdate = { owner_noti2: true };
  }
  await db
    .collection("User")
    .doc(uid)
    .collection("DetailsAddress")
    .doc(addressId)
    .update(dataUpdate)
    .then(function () {
      console.log("pushNotiOwerUpdate update uid:" + addressId);
    });
};

const saveLog = async (uid, token, comment) => {
  //console.log("Insert Log");
  const db = firebase.firestore();
  let data = {
    uid: uid,
    token: token,
    time_day: moment().format("YYYY-MM-DD h:mm:ss"),
    comment: comment,
  };
  await db
    .collection("logs")
    .add(data)
    .then(function () {
      console.log("Save Log");
    });
};

const OwerUpdate = async (uid, addressId, dataObj) => {
  const db = firebase.firestore();
  await db
    .collection("User")
    .doc(uid)
    .collection("DetailsAddress")
    .doc(addressId)
    .update(dataObj)
    .then(function () {
      console.log("Update lat lng:");
    });
};
