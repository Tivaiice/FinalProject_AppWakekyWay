import "@firebase/firestore";
import PolyLine from "@mapbox/polyline";
import "core-js/es6/map";
import "core-js/es6/symbol";
import "core-js/fn/symbol/iterator";
import * as Location from "expo-location";
import firebase from "firebase/app";
import "firebase/auth";
import moment from "moment";
import React from "react";
import { AsyncStorage } from "react-native";
import LocationFriend from "../../screen/LocationFriendScreen";
import { GMAP_KEY } from "./../../../config";

const apiKey = GMAP_KEY;

const updateLocation = async (Keyuid, addressId, data) => {
  //alert(data.latitude + "," + data.longitude);
  //alert(Keyuid + "--" + addressId);
  await myUpdateLatLag(addressId, data.latitude, data.longitude);
  let myKeyuid = await AsyncStorage.getItem("Key");
  const mydb = firebase.firestore();
  try {
    await mydb
      .collection("User")
      .doc(Keyuid)
      .collection("DetailsAddress")
      .doc(addressId)
      .get()
      .then(async function (doc) {
        //alert("->" + doc.data().destinationName);
        //await updateStart(Keyuid, addressId, doc.data().friends);
        let friends = doc.data().friends;
        updateData(Keyuid, addressId, friends, data.latitude, data.longitude);
        //alert(JSON.stringify(friends));
      });
  } catch (err) {
    // alert(err);
  }
};

const myUpdateLatLag = async (addressId, latitude, longitude) => {
  const mydb = firebase.firestore();
  let Keyuid = await AsyncStorage.getItem("Key");
  let address = await mydb
    .collection("User")
    .doc(Keyuid)
    .collection("DetailsAddress")
    .doc(addressId)
    .get();
  let getData = address.data();
  let destinationPlaceId = getData.destinationPlaceId;
  let destinationData = await getRouteTimeDesti(
    destinationPlaceId,
    latitude,
    longitude
  );
  await mydb
    .collection("User")
    .doc(Keyuid)
    .collection("DetailsAddress")
    .doc(addressId)
    .update({
      distance_value: destinationData.distance.value,
      distance: destinationData.distance.text,
      duration_value: destinationData.duration.value,
      duration: destinationData.duration.text,
      owner_locationlat: latitude,
      owner_locationlng: longitude,
    })
    .then(async function (doc) {});
};

const updateData = async (uid, Endpoint, arr, latitude, longitude) => {
  //alert(arr);
  let friends = [];
  let myKeyuid = await AsyncStorage.getItem("Key");
  arr.map((item) => {
    let obj = Object.assign({}, item);
    if (myKeyuid === item.uid) {
      obj.lat = latitude;
      obj.lng = longitude;
    }
    friends.push(obj);
  });

  //alert(JSON.stringify(friends));
  const db = firebase.firestore();
  let address = await db
    .collection("User")
    .doc(uid)
    .collection("DetailsAddress")
    .doc(Endpoint)
    .get();
  let getData = address.data();
  let destinationPlaceId = getData.destinationPlaceId;

  //alert(myKeyuid+"==="+ uid);
  //if (myKeyuid !== uid) {
  let destinationData = await getRouteTimeDesti(
    destinationPlaceId,
    latitude,
    longitude
  );
  let myData = await db
    .collection("User")
    .doc(myKeyuid)
    .collection("DetailsAddress")
    .get();
  for (const item of myData.docs) {
    let getMyData = item.data();
    if (address.id !== undefined) {
      if (getMyData.location_ref_id === address.id) {
        await db
          .collection("User")
          .doc(myKeyuid)
          .collection("DetailsAddress")
          .doc(item.id)
          .update({
            distance_value: destinationData.distance.value,
            distance: destinationData.distance.text,
            duration_value: destinationData.duration.value,
            duration: destinationData.duration.text,
            owner_locationlat: latitude,
            owner_locationlng: longitude,
          })
          .then((docRef) => {});
      }
    }
  }
  await db
    .collection("User")
    .doc(myKeyuid)
    .collection("DetailsAddress")
    .doc(address.id)
    .update({
      distance_value: destinationData.distance.value,
      distance: destinationData.distance.text,
      duration_value: destinationData.duration.value,
      duration: destinationData.duration.text,
    })
    .then((docRef) => {});

  //}
  await db
    .collection("User")
    .doc(uid)
    .collection("DetailsAddress")
    .doc(Endpoint)
    .update({
      friends: friends,
    })
    .then(() => {
      //alert("ok");
    });
};

const getRouteTimeDesti = async (destinationPlaceId, latitude, longitude) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}&language=th`
  );
  const json = await response.json();
  if (json.routes != undefined) {
    if (json.routes[0].legs !== undefined) {
      return json.routes[0].legs[0];
    }
  } else {
    //alert("NoData");
  }
};

const chkMap = async (uid, location_ref_id) => {
  try {
    let status = true;
    const db = await firebase.firestore();
    let data = await db
      .collection("User")
      .doc(uid)
      .collection("DetailsAddress")
      .get()
      .then();
    for (const item of data.docs) {
      let getData = item.data();
      if (getData.location_ref_id !== undefined) {
        if (getData.location_ref_id === location_ref_id) {
          status = false;
        }
      }
      if (getData.owner === uid) {
        status = false;
      }
    }
    return status;
  } catch (err) {
    //alert(err);
    return false;
  }
};

const addMapToFriend = async (friend, data) => {
  const db = await firebase.firestore();
  friend.map(async (item) => {
    let chk = await chkMap(item.uid, data.location_ref_id);
    if (chk === true) {
      let myObjData = Object.assign({}, data);
      myObjData.owner = item.uid;
      await db
        .collection("User")
        .doc(item.uid)
        .collection("DetailsAddress")
        .add(myObjData)
        .then(async function (docRef) {
          //alert("Insert Ok");
        });

      await db
        .collection("User")
        .doc(item.uid)
        .collection("DetailsAddressHistory")
        .add(myObjData)
        .then(async function (docRef) {
          //alert("Insert Ok");
        });
    }
  });
};

class LocationFriendContainer extends React.Component {
  constructor(props) {
    super(props);
    this.endpointId = this.props.navigation.getParam("endpointId", undefined);
    this.mapUserId = this.props.navigation.getParam("mapUserId", undefined);
    this.viewMap = this.props.navigation.getParam("viewMap", undefined);
    if (this.viewMap === undefined) {
      this.viewMap = false;
    }
    //alert(this.mapUserId+"-"+this.endpointId+"-"+this.viewMap)
    this.state = {
      load: true,
      time_tamp: Date.now(),
      latitude: null,
      longitude: null,
      coordinates: [],
      latitude_end: null,
      longitude_end: null,
      polyline: [],
      allDistance: 0,
      allTime: 0,
      timeEndAll: "00:00",
      myStartTime: "00:00",
      openViewStartTime: false,
      openBtnStart: false,
      myLatitude: null,
      myLongitude: null,
    };

    this.mapView = null;
  }

  async componentDidMount() {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      //alert("Permission to access location was denied");
    }

    let locations = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Lowest, distanceInterval: 2000 },
      async (loc) => {
        this.setState({
          myLatitude: loc.coords.latitude,
          myLongitude: loc.coords.longitude,
        });
        await updateLocation(this.mapUserId, this.endpointId, loc.coords);
      }
    );

    let fAllDistance = 0;
    let fAllTime = 0;

    let Keyuid = await AsyncStorage.getItem("Key");
    let openViewStartTime = false;
    let openBtnStart = false;
    const db = firebase.firestore();
    let docRef = db
      .collection("User")
      .doc(this.mapUserId)
      .collection("DetailsAddress")
      .doc(this.endpointId);
    docRef.onSnapshot(async (doc) => {
      fAllDistance = 0;
      fAllTime = 0;
      let destinationName = doc.data().destinationName;
      let destinationPlaceId = doc.data().destinationPlaceId;
      let latitude = doc.data().end_locationlat;
      let longitude = doc.data().end_locationlng;
      let latitude_end = doc.data().end_locationlat;
      let longitude_end = doc.data().end_locationlng;
      let friends = doc.data().friends;
      let start = doc.data().start;
      let notify = doc.data().notify;
      let coordinates = [];
      let countFriend = 0;
      let ref_id = null;
      if (start === true) {
        openViewStartTime = true;
        let dataAllObj = doc.data();
        let myObjData = Object.assign({}, dataAllObj);
        myObjData.main_owner_id = this.mapUserId;
        myObjData.location_ref_id = doc.id;
        myObjData.distance = null;
        myObjData.distance_value = null;
        myObjData.duration = null;
        myObjData.duration_value = null;
        ref_id = myObjData.location_ref_id;
        await addMapToFriend(friends, myObjData);
      }

      if (doc.data().location_ref_id !== undefined) {
        openBtnStart = true;
      } else {
        if (friends !== undefined) {
          if (friends.length > 0) {
            openBtnStart = true;
          }
        }
      }

      try {
        friends.map((item) => {
          if (
            (item.lat !== null && item.lng !== null && start === true) ||
            (item.lat !== null && item.lng !== null && this.viewMap === true)
          ) {
            if (Keyuid === item.uid) {
              latitude = item.lat;
              longitude = item.lng;
            }
            let obj = {
              destinationPlaceId: destinationPlaceId,
              latitude: item.lat,
              longitude: item.lng,
              title: item.fullName,
              markerDistance: item.distance,
              markerDuration: item.duration,
              description: "",
              notify: notify,
              route: [],
            };
            coordinates.push(obj);
          }

          if (
            item.distance_value !== undefined &&
            item.distance_value !== null
          ) {
            fAllDistance = fAllDistance + item.distance_value;
          }

          if (
            item.duration_value !== undefined &&
            item.duration_value !== null
          ) {
            fAllTime = fAllTime + item.duration_value;
          }

          if (
            (item.distance_value !== undefined &&
              item.distance_value !== null) ||
            (item.duration_value !== undefined && item.duration_value !== null)
          ) {
            countFriend = countFriend + 1;
          }
        });
      } catch (err) {
        //alert(err);
      }

      let mapOne = false;
      if (coordinates.length > 0) {
        if (this.viewMap === true) {
          mapOne = true;
        } else {
          //alert(coordinates.length);
          let coordinates2 = await this.getRouteArray(coordinates);
          this.setState({ coordinates: coordinates2 });
        }
      } else if (this.viewMap === true) {
        if (
          doc.data().owner_locationlat !== undefined &&
          doc.data().owner_locationlng !== undefined
        ) {
          mapOne = true;
        }
      }

      if (mapOne === true) {
        let owner_locationlat = doc.data().owner_locationlat;
        let owner_locationlng = doc.data().owner_locationlng;
        console.log("owner_locationlat=" + owner_locationlat);

        let obj = {
          destinationPlaceId: destinationPlaceId,
          latitude: owner_locationlat,
          longitude: owner_locationlng,
          title: "",
          description: "",
          markerDistance: "",
          markerDuration: "",
          notify: 9999999999,
          route: [],
        };
        let coordinates_two = [];
        coordinates_two.push(obj);

        if (start === true) {
          for (const friend of friends) {
            let myData = await db
              .collection("User")
              .doc(friend.uid)
              .collection("DetailsAddress")
              .get();
            let location_id = "";
            for (const item of myData.docs) {
              let getMyData = item.data();
              if (item.id === ref_id) {
                let okObj = {
                  destinationPlaceId: getMyData.destinationPlaceId,
                  latitude: getMyData.owner_locationlat,
                  longitude: getMyData.owner_locationlng,
                  title: "",
                  description: "",
                  markerDistance: "",
                  markerDuration: "",
                  notify: 9999999999,
                  route: [],
                };
                coordinates_two.push(okObj);
                ////

                let allDistance = 0;
                let allTime = 0;
                if (this.state.myLatitude !== null) {
                  let destinationData = await getRouteTimeDesti(
                    getMyData.destinationPlaceId,
                    this.state.myLatitude,
                    this.state.myLongitude
                  );
                  let distance = destinationData.distance;
                  let duration = destinationData.duration;
                  allDistance = distance.value / 1000;
                  allDistance = allDistance.toFixed(2);
                  allTime = duration.value / 60;
                  allTime = allTime.toFixed(2);
                  this.setState({
                    allDistance: allDistance,
                    allTime: allTime,
                  });
                }
                ////
              }
            }
            ///
          }
        }
        //alert(coordinates_two);
        let coordinates3 = await this.getRouteArray(coordinates_two);
        this.setState({ coordinates: coordinates3 });
      }

      let allDistance = this.state.allDistance;
      let allTime = this.state.allDistance;

      if (this.viewMap === true) {
        if (
          doc.data().distance_value !== null &&
          doc.data().duration_value !== null
        ) {
          allDistance = doc.data().distance_value / 1000;
          allTime = doc.data().duration_value / 60;
          allDistance = allDistance.toFixed(2);
          allTime = allTime.toFixed(2);
        }
      } else {
        allDistance = fAllDistance / 1000;
        allTime = fAllTime / 60;
        allDistance = allDistance.toFixed(2);
        allTime = allTime.toFixed(2);
      }

      if (countFriend > 0) {
        allDistance = parseFloat(allDistance) / countFriend;
        allTime = parseFloat(allTime) / countFriend;
        allDistance = allDistance.toFixed(2);
        allTime = allTime.toFixed(2);
      }

      this.setState({
        latitude: latitude,
        longitude: longitude,
        latitude_end: latitude_end,
        longitude_end: longitude_end,
        openViewStartTime: openViewStartTime,
        openBtnStart: openBtnStart,
        //allDistance: allDistance,
        //allTime: allTime
      });
    });

    this.getMyDistance();
    this.calTime();
  }

  async getRouteArray(coordinates) {
    let dataArr = [];
    for (let i = 0; i < coordinates.length; i++) {
      let route = [];
      if (
        coordinates[i].latitude !== null &&
        coordinates[i].longitude !== null
      ) {
        route = await this.getRouteDirections(
          coordinates[i].destinationPlaceId,
          coordinates[i].latitude,
          coordinates[i].longitude,
          coordinates[i].notify
        );
      }
      let dataObj = Object.assign({}, coordinates[i]);
      dataObj.route = route;
      dataArr.push(dataObj);
    }
    return dataArr;
  }

  async getRouteDirections(destinationPlaceId, latitude, longitude, notify) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}&language=th`
      );
      console.log(
        `URL:https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}&language=th`
      );
      const json = await response.json();
      if (json.routes != undefined) {
        if (json.routes.length > 0) {
          if (json.routes[0].overview_polyline !== undefined) {
            const points = PolyLine.decode(
              json.routes[0].overview_polyline.points
            );
            const pointCoords = points.map((point) => {
              return { latitude: point[0], longitude: point[1] };
            });
            return pointCoords;
          }
        } else {
          //alert("NoData");
        }
      }
    } catch (error) {
      alert(error);
    }
  }

  async getMyDistance() {
    let addressId;
    let Keyuid = await AsyncStorage.getItem("Key");
    const db = firebase.firestore();
    let doc = await db
      .collection("User")
      .doc(this.mapUserId)
      .collection("DetailsAddress")
      .doc(this.endpointId)
      .get();
    let docData = doc.data();
    addressId = docData.destinationPlaceId;
    if (docData.owner === Keyuid) {
      let docRef = db
        .collection("User")
        .doc(this.mapUserId)
        .collection("DetailsAddress")
        .doc(this.endpointId);
      docRef.onSnapshot(async (doc) => {
        let mySnap = doc.data();
        let allDistance = 0;
        let allTime = 0;
        if (mySnap.distance_value !== null) {
          allDistance = mySnap.distance_value / 1000;
          allDistance = allDistance.toFixed(2);
          allTime = mySnap.duration_value / 60;
          allTime = allTime.toFixed(2);
          this.setState({
            allDistance: allDistance,
            allTime: allTime,
          });
        }
      });
    } else {
      let myData = await db
        .collection("User")
        .doc(Keyuid)
        .collection("DetailsAddress")
        .get();
      let location_id = "";
      for (const item of myData.docs) {
        let getMyData = item.data();
        if (getMyData.location_ref_id === this.endpointId) {
          location_id = item.id;
        }
      }

      try {
        let docRef = db
          .collection("User")
          .doc(Keyuid)
          .collection("DetailsAddress")
          .doc(location_id);
        docRef.onSnapshot(async (doc) => {
          let mySnap = doc.data();
          let allDistance = 0;
          let allTime = 0;
          if (mySnap.distance_value !== null) {
            allDistance = mySnap.distance_value / 1000;
            allDistance = allDistance.toFixed(2);
            allTime = mySnap.duration_value / 60;
            allTime = allTime.toFixed(2);
            this.setState({
              allDistance: allDistance,
              allTime: allTime,
            });
          }
        });
      } catch (err) {
        let myLatitude = this.state.myLatitude;
        let myLongitude = this.state.myLongitude;
        let allDistance = 0;
        let allTime = 0;
        let obj = {
          destinationPlaceId: addressId,
          latitude: myLatitude,
          longitude: myLongitude,
          title: "",
          description: "",
          markerDistance: "",
          markerDuration: "",
          notify: 9999999999,
          route: [],
        };
        let coordinates_two = [];
        coordinates_two.push(obj);
        let coordinates2 = await this.getRouteArray(coordinates_two);
        this.setState({ coordinates: coordinates2 });
        let destinationData = await getRouteTimeDesti(
          addressId,
          myLatitude,
          myLongitude
        );
        let distance = destinationData.distance;
        let duration = destinationData.duration;
        allDistance = distance.value / 1000;
        allDistance = allDistance.toFixed(2);
        allTime = duration.value / 60;
        allTime = allTime.toFixed(2);
        this.setState({
          allDistance: allDistance,
          allTime: allTime,
        });
      }
    }
  }

  async calTime() {
    let Keyuid = await AsyncStorage.getItem("Key");
    let TimeArr = [];
    let uidArr = [];
    const db = firebase.firestore();
    let doc = await db
      .collection("User")
      .doc(this.mapUserId)
      .collection("DetailsAddress")
      .doc(this.endpointId)
      .get();
    let docData = doc.data();
    let startDate = docData.startDate; //เวลาเริ่มเดินทาง
    let friends = docData.friends;
    let myTime = docData.duration_value; //ระยะเวลาทั้งหมด
    friends.map((item) => {
      if (item.uid !== this.mapUserId) {
        uidArr.push(item.uid);
      }
    });
    if (
      docData.location_ref_id !== undefined &&
      docData.main_owner_id !== undefined
    ) {
      let mainDoc = await db
        .collection("User")
        .doc(docData.main_owner_id)
        .collection("DetailsAddress")
        .doc(docData.location_ref_id)
        .get();
      let mainDocData = mainDoc.data();
      TimeArr.push(mainDocData.duration_value);
      console.log("docData.location_ref_id ::>>>> " + docData.location_ref_id);
      console.log("TimeArr + mainDocData.duration_value ::>>>>>>> ", TimeArr);
    }
    //Add time ของเครื่อง
    TimeArr.push(docData.duration_value);
    console.log("TimeArr1 ::>>>>>>> ", TimeArr);
    await Promise.all(
      uidArr.map(async (item) => {
        let myData = await db
          .collection("User")
          .doc(item)
          .collection("DetailsAddress")
          .get();

        for (const item of myData.docs) {
          let getMyData = item.data(); //ของเรา
          let docItemId = item.id;
          console.log("Keyuid 8989898989= " + Keyuid);
          console.log("docItemId (const item of myData.docs){" + docItemId);
          if (getMyData.location_ref_id !== undefined) {
            if (getMyData.location_ref_id === this.endpointId) {
              TimeArr.push(getMyData.duration_value);
              if (getMyData.owner === Keyuid) {
                //alert(getMyData.duration_value);
                myTime = getMyData.duration_value;
              }
            }
          } else {
            if (docItemId === this.endpointId) {
              TimeArr.push(getMyData.duration_value);
            }
          }
        }
      })
    );
    let maxTime = Math.max(...TimeArr);
    let timeAdd = moment(startDate).add(maxTime, "seconds");
    let myTimeStart = moment(timeAdd).subtract(myTime, "seconds");
    this.setState({
      timeEndAll: moment(timeAdd).format("H:mm"),
      myStartTime: moment(myTimeStart).format("H:mm"),
    });

    console.log("TimeArr2 ::>>>>>>> ", TimeArr);
    console.log("maxTime :: >>>" + maxTime);
    console.log("timeAdd :: >>>" + timeAdd);
    console.log("myTimeStart :: >>>" + myTimeStart);
    console.log("myTimeStart :: >>>" + moment(myTimeStart).format("H:mm"));
    console.log("timeEndAll :: >>>" + moment(timeAdd).format("H:mm"));

    await db
      .collection("User")
      .doc(Keyuid)
      .collection("DetailsAddress")
      .doc(this.endpointId)
      .set(
        {
          myTimeStart: moment(myTimeStart).format("YYYYMMDDHHmm"),
        },
        { merge: true }
      )
      .then(() => {
        console.log("UpdatemyTimeStart");
      });
  }

  async myGetDirections2(destinationPlaceId, latitude, longitude) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}&language=th`
      );
      alert(
        `URL:https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}&language=th`
      );
    } catch (error) {
      alert(error);
    }
  }

  onMapPress = (e) => {
    if (this.state.coordinates.length == 2) {
      this.setState({
        coordinates: [e.nativeEvent.coordinate],
      });
    } else {
      this.setState({
        coordinates: [...this.state.coordinates, e.nativeEvent.coordinate],
      });
    }
  };

  onReady = (result) => {
    this.mapView.fitToCoordinates(result.coordinates, {
      edgePadding: {
        right: width / 20,
        bottom: height / 20,
        left: width / 20,
        top: height / 20,
      },
    });
  };

  onError = (errorMessage) => {
    // Alert.alert("123-" + errorMessage);
  };

  render() {
    return (
      <LocationFriend
        navigation={this.props.navigation}
        onMapPress={this.props.onMapPress}
        onReady={this.props.onReady}
        onError={this.props.onError}
        coordinates={this.state.coordinates}
        polyline={this.state.polyline}
        time_tamp={this.state.time_tamp}
        latitude={this.state.latitude}
        longitude={this.state.longitude}
        endpointId={this.endpointId}
        mapUserId={this.mapUserId}
        viewMap={this.viewMap}
        latitude_end={this.state.latitude_end}
        longitude_end={this.state.longitude_end}
        allDistance={this.state.allDistance}
        allTime={this.state.allTime}
        timeEndAll={this.state.timeEndAll}
        myStartTime={this.state.myStartTime}
        openViewStartTime={this.state.openViewStartTime}
        openBtnStart={this.state.openBtnStart}
      />
    );
  }
}

export default LocationFriendContainer;
