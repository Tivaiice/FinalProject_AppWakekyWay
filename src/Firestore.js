import firebase from "firebase/app";
import "firebase/auth";
import { AsyncStorage } from "react-native";

export const getFirestorData = async () => {
  let myKeyuid = await AsyncStorage.getItem("Key");
  myKeyuid = "XXXXXXXXXXXXXXXXXXXXXXXX";
  console.log("myKeyuid=" + myKeyuid);
  const mydb = firebase.firestore();
  try {
    let myData = await mydb
      .collection("User")
      .doc(myKeyuid)
      .collection("DetailsAddress")
      .get();
    for (const item of myData.docs) {
      let getMyData = item.data();

      if (getMyData.location_ref_id !== undefined) {
        await getCount(myKeyuid, getMyData.location_ref_id);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const getCount = async (userId, ref_id) => {
  const mydb = firebase.firestore();
  let n = [];
  try {
    let myData = await mydb
      .collection("User")
      .doc(userId)
      .collection("DetailsAddress")
      .get();
    for (const item of myData.docs) {
      let getMyData = item.data();
      if (getMyData.location_ref_id !== undefined) {
        if (getMyData.location_ref_id == ref_id) {
          n.push(item.id);
        }
      }
    }
    if (n.length > 1) {
      for (let x = 1; x < n.length; x++) {
        //console.log(">>"+n[x]);
        await mydb
          .collection("User")
          .doc(userId)
          .collection("DetailsAddress")
          .doc(n[x])
          .delete();
      }
    }
  } catch (err) {
    console.log("err99", err);
  }
};

export const getFirestorDataH = async () => {
  let myKeyuid = await AsyncStorage.getItem("Key");
  // console.log("myKeyuid=" + myKeyuid);
  const mydb = firebase.firestore();
  try {
    let myData = await mydb
      .collection("User")
      .doc(myKeyuid)
      .collection("DetailsAddressHistory")
      .get();
    for (const item of myData.docs) {
      let getMyData = item.data();

      if (getMyData.location_ref_id !== undefined) {
        await getCountH(myKeyuid, getMyData.location_ref_id);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const getCountH = async (userId, ref_id) => {
  const mydb = firebase.firestore();
  let n = [];
  try {
    let myData = await mydb
      .collection("User")
      .doc(userId)
      .collection("DetailsAddressHistory")
      .get();
    for (const item of myData.docs) {
      let getMyData = item.data();
      if (getMyData.location_ref_id !== undefined) {
        if (getMyData.location_ref_id == ref_id) {
          n.push(item.id);
        }
      }
    }
    if (n.length > 1) {
      for (let x = 1; x < n.length; x++) {
        //console.log(">>"+n[x]);
        await mydb
          .collection("User")
          .doc(userId)
          .collection("DetailsAddress")
          .doc(n[x])
          .delete();
      }
    }
  } catch (err) {
    console.log("err99", err);
  }
};
