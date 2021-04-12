import PolyLine from "@mapbox/polyline";
import "firebase/auth";
import "firebase/firestore";
import _ from "lodash";
import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, Polyline } from "react-native-maps";
import { GMAP_KEY } from "./../../../config";

const apiKey = GMAP_KEY;

export default class MapFriend extends Component {
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

  async componentDidMount() {
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

    let pointCoords = [];
    for (let i = 0; i < this.props.markers.length; i++) {
      let route = await this.getRouteDirections(
        this.props.markers[i].latitude,
        this.props.markers[i].longitude
      );
      pointCoords.push(route);
    }
    //alert(JSON.stringify(pointCoords));
    this.setState({ pointCoords: pointCoords });
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.time_tamp !== props.time_tamp) {
      let pointCoords = [];
      for (let i = 0; i < nextProps.markers.length; i++) {
        let route = await this.getRouteDirections(
          nextProps.markers[i].latitude,
          nextProps.markers[i].longitude
        );
        pointCoords.push(route);
      }
      //alert(JSON.stringify(pointCoords));
      this.setState({ pointCoords: pointCoords });
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

  async getRouteDirections(latitude, longitude) {
    // const destinationPlaceId = "ChIJX2AoriCQ4jAR7aglJz3j6YI";
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}&language=th`
      );

      const json = await response.json();
      //console.log("map:" + JSON.stringify(json));
      if (json.routes !== undefined) {
        if (json.routes.length > 0) {
          const points = PolyLine.decode(
            json.routes[0].overview_polyline.points
          );
          const pointCoords = points.map((point) => {
            return { latitude: point[0], longitude: point[1] };
          });
          return pointCoords;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={(map) => {
            this.map = map;
          }}
          style={styles.map}
          region={{
            latitude: this.props.latitude,
            longitude: this.props.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          loadingBackgroundColor={"yellow"}
          showsMyLocationButton={true}
          showsUserLocation={true}
        >
          {this.props.markers.map((marker, index) => (
            <Polyline
              key={index}
              coordinates={marker.route}
              strokeWidth={3}
              strokeColor="salmon"
            />
          ))}

          {this.props.markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
            >
              <Image
                source={require("../../images/place.png")}
                style={styles.picMarker}
              />
              <Callout tooltip>
                {marker.title !== null && marker.title !== "" ? (
                  <View style={styles.markerCallOut}>
                    <Text>{marker.title}</Text>
                    <Text>ใช้เวลา ​: {marker.markerDuration}</Text>
                    <Text>ระยะทาง : {marker.markerDistance}</Text>
                  </View>
                ) : null}
              </Callout>
            </Marker>
          ))}
          {this.props.latitude_end !== null &&
            this.props.longitude_end !== null && (
              <Marker
                coordinate={{
                  latitude: this.props.latitude_end,
                  longitude: this.props.longitude_end,
                }}
              >
                <Image
                  source={require("../../images/markerdes.png")}
                  style={styles.picMarker}
                  resizeMode={"cover"}
                />
                <Callout tooltip>
                  <View style={styles.markerCallOutFinish}>
                    <Text> จุดหมาย </Text>
                  </View>
                </Callout>
              </Marker>
            )}
        </MapView>
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
  suggestions: {
    backgroundColor: "white",
    padding: 5,
    marginHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 20,
    fontFamily: "PromptLight",
  },
  markerCallOut: {
    alignItems: "center",
    width: 175,
    backgroundColor: "#FFFFFFFF",
    borderRadius: 10,
  },
  markerCallOutFinish: {
    alignItems: "center",
    width: 70,
    backgroundColor: "#FFFFFFFF",
    borderRadius: 20,
  },
  picMarker: {
    width: 25,
    height: 25,
    alignSelf: "center",
  },
});
