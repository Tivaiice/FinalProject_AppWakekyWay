/**
 *	Notificationcontainer
 */

import * as firebase from "firebase";
import React from "react";
import { AsyncStorage } from "react-native";
import NotificationHistory from "../../screen/NotificationHistoryScreen";
import { getFirestorDataH } from "./../../Firestore";

class NotificationHistoryContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: "script",
      loadingFont: true,
      distancelo: null,
      durationlo: null,
      end_address: null,
      distanceH: "0 กม.",
      distanceH_Value: null,
      durationH: "0 นาที",
      durationH_Value: null,
      idDocHistory: null,
      idPlaceHistory: null,
    };
  }

  async componentDidMount() {
    await this._chkNull();
    this._getlistAddress();
  }

  componentWillUnmount() {
    this._getlistAddress();
  }

  _chkNull = async () => {
    console.log("====================Run _checkNull=====================");
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    await db
      .collection("User")
      .doc(Keyuid)
      .collection("DetailsAddressHistory")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          console.log("No matching documents.");
          return;
        }
        querySnapshot.docs.forEach((doc) => {
          const dataValue = doc.data();
          dataValue.key = doc.id;
          const datadis_Null = doc.data().distance_value;
          const datadur_Null = doc.data().duration_value;
          const dataPlaceIDH = doc.data().destinationPlaceId;
          if (datadis_Null == null && datadur_Null == null) {
            // console.log(dataValue);
            // console.log(dataValue.key);
            this.setState({
              idDocHistory: dataValue.key,
              idPlaceHistory: dataPlaceIDH,
            });
            console.log(this.state.idDocHistory);
            console.log(this.state.idPlaceHistory);
          } else {
            console.log("Not Null");
          }
        });
      });
    this._chklistAdd();
  };

  _chklistAdd = async () => {
    console.log("====================Run _chklistNotNull=====================");
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    await db
      .collection("User")
      .doc(Keyuid)
      .collection("DetailsAddress")
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.docs.forEach((doc) => {
            const newdata = doc.data();
            const dataPlaceIDAD = doc.data().destinationPlaceId;
            newdata.key = doc.id;
            var lifi = newdata.friends;
            if (this.state.idPlaceHistory == dataPlaceIDAD) {
              console.log(this.state.idPlaceHistory);
              console.log(dataPlaceIDAD);
              // console.log(newdata);
              var disHis = doc.data().distance;
              var disHis_V = doc.data().distance_value;
              var durHis = doc.data().duration;
              var durHis_V = doc.data().duration_value;
              console.log("==================================");
              if (disHis !== null && disHis_V !== null) {
                this.setState({
                  distanceH: disHis,
                  distanceH_Value: disHis_V,
                  durationH: durHis,
                  durationH_Value: durHis_V,
                });
                console.log(this.state.distanceH);
                console.log(this.state.durationH);
              }
            } else {
              //Check lifi
              console.log(lifi);
              lifi.map((item) => {
                if (item.uid == Keyuid) {
                  this.setState({
                    distanceH: item.distance,
                    distanceH_Value: item.distance_value,
                    durationH: item.duration,
                    durationH_Value: item.duration_value,
                  });
                }
              });
              console.log(this.state.distanceH);
              console.log(this.state.durationH);
            }
          });
          this._changeValue();
        } else {
          console.log("DetailsAddress No such document!!!");
        }
      });
  };

  _changeValue = async () => {
    console.log("====================Run _changeValue=====================");
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    this.state.idDocHistory && console.log(this.state.idDocHistory);
    if (this.state.idDocHistory !== null && this.state.undefined !== null) {
      await db
        .collection("User")
        .doc(Keyuid)
        .collection("DetailsAddressHistory")
        .doc(this.state.idDocHistory)
        .update({
          distance: this.state.distanceH,
          distance_value: this.state.distanceH_Value,
          duration: this.state.durationH,
          duration_value: this.state.durationH_Value,
        })
        .then(async function (doc) {
          console.log("changeValue Sucess!!!!");
        });
    }
  };

  _getlistAddress = async () => {
    try {
      await getFirestorDataH();
    } catch (err) {
      console.log("ERR:", err);
    }
    const listAddress = [];
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    db.collection("User")
      .doc(Keyuid)
      .collection("DetailsAddressHistory")
      .orderBy("timenow")
      .get()
      .then((querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
          const newdata = doc.data();
          newdata.key = doc.id;
          if (newdata.show === true) {
            listAddress.push(newdata);
          }
        });
        this.setState({
          resultAddress: listAddress,
        });
      });
    return listAddress;
  };

  _clearAsyncStorage = async () => {
    try {
      let Keyuid = await AsyncStorage.getItem("Key");
      console.log("user logged out by :>> ", Keyuid);
      await AsyncStorage.clear();
      Keyuid = await AsyncStorage.getItem("Key");
      console.log("Good Bye !!", Keyuid);
    } catch (error) {
      // alert("Failed to clear the async storage.");
    }
  };

  render() {
    // this.state.resultAddress && console.log(this.state.resultAddress);
    return (
      <NotificationHistory
        resultAddress={this.state.resultAddress}
        distancelo={this.state.distancelo}
        durationlo={this.state.durationlo}
        end_addreslo={this.state.end_addreslo}
        navigation={this.props.navigation}
      />
    );
  }
}

export default NotificationHistoryContainer;
