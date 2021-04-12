/**
 * Footer Component
 */

import React, { Component } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

class Tabbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Tabnotification: 0,
      Tabchat: 0,
      Tabprofile: 0,
      Tabaddlocation: 0,
      TabnotificationHistory: 0,
    };
  }
  componentDidMount() {
    if (this.props.col == "Notification") {
      this.fnotification();
    }
    if (this.props.col == "Chat") {
      this.fchat();
    }
    if (this.props.col == "Profile") {
      this.fprofile();
    }
    if (this.props.col == "Map") {
      this.faddlocation();
    }
    if (this.props.col == "NotificationHistory") {
      this.fnotificationHistory();
    }
  }

  fnotification() {
    this.setState({ Tabnotification: 1 });
  }
  fchat() {
    this.setState({ Tabchat: 1 });
  }
  fprofile() {
    this.setState({ Tabprofile: 1 });
  }
  faddlocation() {
    this.setState({ Tabaddlocaiton: 1 });
  }
  fnotificationHistory() {
    this.setState({ TabnotificationHistory: 1 });
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            this.props.navigation.navigate("Notification");
          }}
          style={{
            flex: 1,
            backgroundColor: "#F1F2F6",
            borderTopLeftRadius: 18,
          }}
        >
          <View style={styles.boxTab}>
            {this.state.Tabnotification === 0 ? (
              <Image
                style={{ width: 40, height: 50 }}
                source={require("../../images/notification.png")}
                resizeMode={"contain"}
              />
            ) : (
              <Image
                style={{ width: 40, height: 50 }}
                source={require("../../images/notification-2.png")}
                resizeMode={"contain"}
              />
            )}
          </View>
        </TouchableOpacity>
        {/* --------------------------- */}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            this.props.navigation.navigate("Chat");
          }}
          style={{ flex: 1, backgroundColor: "#F1F2F6" }}
        >
          <View style={styles.boxTab}>
            {this.state.Tabchat === 0 ? (
              <Image
                style={{ width: 40, height: 50 }}
                source={require("../../images/message.png")}
                resizeMode="contain"
              />
            ) : (
              <Image
                style={{ width: 40, height: 50 }}
                source={require("../../images/message-2.png")}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
        {/* --------------------------- */}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            this.props.navigation.navigate("Map");
          }}
          style={{ flex: 1.2, backgroundColor: "#F1F2F6" }}
        >
          <View style={{ alignItems: "center", marginTop: -25 }}>
            <Image
              style={{ width: 90, height: 90 }}
              source={require("../../images/iconaddloca.png")}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        {/* --------------------------- */}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            this.props.navigation.navigate("Profile");
          }}
          style={{ flex: 1, backgroundColor: "#F1F2F6" }}
        >
          <View style={styles.boxTab}>
            {this.state.Tabprofile === 0 ? (
              <Image
                style={{ width: 40, height: 50 }}
                source={require("../../images/profile.png")}
                resizeMode="contain"
              />
            ) : (
              <Image
                style={{ width: 40, height: 50 }}
                source={require("../../images/profile-2.png")}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
        {/* --------------------------- */}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            this.props.navigation.navigate("NotificationHistory");
          }}
          style={{
            flex: 1,
            backgroundColor: "#F1F2F6",
            borderTopRightRadius: 18,
          }}
        >
          <View style={styles.boxTab}>
            {this.state.TabnotificationHistory === 0 ? (
              <Image
                style={{ width: 55, height: 55, marginTop: -2.5 }}
                source={require("../../images/history.png")}
                resizeMode="contain"
              />
            ) : (
              <Image
                style={{
                  width: 55,
                  height: 55,
                  marginRight: -2,
                  marginTop: -2,
                }}
                source={require("../../images/history-2.png")}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  boxTab: {
    alignItems: "center",
    marginTop: "10%",
  },
});

export default Tabbar;
