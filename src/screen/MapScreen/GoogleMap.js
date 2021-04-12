import PolyLine from "@mapbox/polyline";
import "firebase/auth";
import "firebase/firestore";
import _ from "lodash";
import React, { Component } from "react";
import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { GMAP_KEY } from "./../../../config";

const apiKey = GMAP_KEY;

export default class GoogleMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      latitude: 0,
      longitude: 0,
      destination: "",
      predictions: [],
      pointCoords: [],
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
  }
  componentDidMount() {
    //Get current location and set initial region to this
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
  }

  async getRouteDirections(destinationPlaceId, destinationName) {
    const { setDistance, setDuration, setAddress } = this.props;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}&language=th`
      );

      console.log(
        `map-> https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}`
      );

      const json = await response.json();

      let points = null;
      let pointCoords = null;
      if (json.routes[0].overview_polyline !== undefined) {
        points = PolyLine.decode(json.routes[0].overview_polyline.points);
        pointCoords = points.map((point) => {
          return { latitude: point[0], longitude: point[1] };
        });
      }

      this.setState({
        pointCoords,
        predictions: [],
        destination: destinationName,
      });
      Keyboard.dismiss();
      if (pointCoords !== null) {
        this.map.fitToCoordinates(pointCoords);
      }

      //
      console.log("distance text", json.routes[0].legs[0].distance.text);
      console.log("duration text", json.routes[0].legs[0].duration.text);
      // console.log('start_address:', json.routes[0].legs[0].start_address);
      // console.log('start_locationlat:', json.routes[0].legs[0].start_location.lat);
      // console.log('start_locationlng: ',json.routes[0].legs[0].start_location.lng),
      // console.log('end_address : ',json.routes[0].legs[0].end_addres);
      // console.log('end_locationlat :', json.routes[0].legs[0].end_location.lat);
      // console.log('end_locationlng :', json.routes[0].legs[0].end_location.lng);

      setDistance(json.routes[0].legs[0].distance.text);
      setDuration(json.routes[0].legs[0].duration.text);
      if (setAddress !== undefined) {
        setAddress({
          start_address: json.routes[0].legs[0].start_address,
          start_locationlat: json.routes[0].legs[0].start_location.lat,
          start_locationlng: json.routes[0].legs[0].start_location.lng,
          end_address: json.routes[0].legs[0].end_address,
          end_locationlat: json.routes[0].legs[0].end_location.lat,
          end_locationlng: json.routes[0].legs[0].end_location.lng,
          distance: json.routes[0].legs[0].distance.text,
          duration: json.routes[0].legs[0].duration.text,
          distance_value: json.routes[0].legs[0].distance.value,
          duration_value: json.routes[0].legs[0].duration.value,
          destinationPlaceId: destinationPlaceId,
          destinationName: destinationName,
          start: false,
        });
      }
      /*
      let Keyuid = await AsyncStorage.getItem("Key");
      const db = firebase.firestore();
      db.collection("User")
        .doc(Keyuid)
        .collection("DetailsAddress")
        .doc()
        .set(
          {
            start_address: json.routes[0].legs[0].start_address,
            start_locationlat: json.routes[0].legs[0].start_location.lat,
            start_locationlng: json.routes[0].legs[0].start_location.lng,
            end_address: json.routes[0].legs[0].end_address,
            end_locationlat: json.routes[0].legs[0].end_location.lat,
            end_locationlng: json.routes[0].legs[0].end_location.lng,
            distance: json.routes[0].legs[0].distance.text,
            duration: json.routes[0].legs[0].duration.text
          },
          { merge: true }
        );
        */
    } catch (error) {
      console.error(error);
    }
  }

  async onChangeDestination(destination) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}
    &input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=2000&language=th`;
    console.log(apiUrl);
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions,
      });
      // console.log(json);
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    let marker = null;

    if (this.state.pointCoords.length > 1) {
      marker = (
        <Marker
          coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]}
        >
          <Image
            source={require("../../images/markerdes.png")}
            style={{ width: 35, height: 35, alignSelf: "center" }}
            resizeMode={"cover"}
          />
        </Marker>
      );
    } else {
      marker = (
        <Marker
          coordinate={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
          }}
        >
          <Image
            source={require("../../images/markerdes.png")}
            style={{ width: 35, height: 35, alignSelf: "center" }}
            resizeMode={"cover"}
          />
        </Marker>
      );
    }

    const predictions = this.state.predictions.map((prediction) => (
      <TouchableHighlight
        onPress={() =>
          this.getRouteDirections(
            prediction.place_id,
            prediction.structured_formatting.main_text
          )
        }
        key={prediction.id}
      >
        <View style={styles.boxSuggestions}>
          <Text style={styles.suggestions}>
            {prediction.structured_formatting.main_text}
          </Text>
        </View>
      </TouchableHighlight>
    ));
    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={(map) => {
            this.map = map;
          }}
          style={styles.map}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          loadingBackgroundColor={"yellow"}
          showsMyLocationButton={true}
          showsUserLocation={true}
        >
          <Polyline
            coordinates={this.state.pointCoords}
            strokeWidth={4}
            strokeColor="tomato"
          />
          {marker}
        </MapView>
        <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              borderRadius: 40,
              backgroundColor: "#FFFFFF",
            }}
          >
            <Image
              source={require("../../images/logoWWsmall.png")}
              style={{ width: 25, height: 25, marginTop: 8, marginLeft: 10 }}
              resizeMode={"contain"}
            />
            <TextInput
              placeholder="ค้นหาสถานที่"
              placeholderTextColor="#AFB1B4"
              keyboardType={"default"}
              selectionColor={"#FF8900"}
              fontSize={15}
              style={styles.destinationInput}
              value={this.state.destination}
              clearButtonMode="always"
              onChangeText={(destination) => {
                console.log("ค้นหาสถานที่:" + destination);
                this.setState({ destination, predictions: [] });
                //this.onChangeDestinationDebounced(destination);
              }}
            />
            <TouchableOpacity
              style={{
                width: 25,
                height: 25,
                marginTop: 8,
                marginRight: 10,
              }}
              onPress={() => {
                console.log("ค้นหาสถานที่:" + this.state.destination);
                this.onChangeDestinationDebounced(this.state.destination);
              }}
            >
              <Image
                source={require("../../images/search-b.png")}
                style={{ width: 20, height: 20 }}
                resizeMode={"contain"}
              />
            </TouchableOpacity>
          </View>
        </View>
        {predictions}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  destinationInput: {
    height: 40,
    width: "77%",
    borderRadius: 20,
    marginHorizontal: 10,
  },
  boxSuggestions: {
    borderBottomWidth: 1,
    borderBottomColor: "#AFB1B4",
    backgroundColor: "#FFFFFF",
    marginHorizontal: Platform.OS === "ios" ? 10 : 10,
  },
  suggestions: {
    padding: 5,
    marginHorizontal: 10,
    fontSize: 14,
    fontFamily: "PromptLight",
  },
});
