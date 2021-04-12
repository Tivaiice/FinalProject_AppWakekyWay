import * as React from "react";
import {
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";

const Search = ({
  navigation,
  _searchFriend,
  txtsearchFriend,
  _onInputChange,
  profileFriend,
  _addFriend,
  haveFriend,
  resultListFriend,
}) => {
  // console.log('haveFriend :>> ', haveFriend === false);

  let imageprofile =
    profileFriend.photoUrl !== ""
      ? { uri: profileFriend.photoUrl }
      : require("../../images/profile.png");

  if (profileFriend !== "") {
    Keyboard.dismiss();
  }
  let areaAddfriend =
    profileFriend !== "" ? (
      <SafeAreaView>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            style={{
              width: 120,
              height: 120,
              borderColor: "#000000",
              borderRadius: 60,
            }}
            source={imageprofile}
            resizeMode="contain"
          />
        </View>
        <View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginVertical: 5,
            }}
          >
            <Text
              style={{
                //fontFamily: "PromptLight",
                fontSize: 25,
                marginTop: 25,
              }}
            >
              {profileFriend.fullName}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    ) : null;

  let isbtnFriend;
  if (haveFriend !== null && profileFriend !== "") {
    if (haveFriend == false) {
      isbtnFriend = (
        <View style={{ flex: 2, alignItems: "center" }}>
          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={() => navigation.navigate("Profile")}
          >
            <Image
              style={{ width: 200, height: 100, resizeMode: "contain" }}
              source={require("../../images/isFriend.png")}
            />
          </TouchableOpacity>
        </View>
      );
    } else {
      isbtnFriend = (
        <TouchableOpacity style={{ alignItems: "center" }} onPress={_addFriend}>
          <Image
            style={{ width: 200, height: 100, resizeMode: "contain" }}
            source={require("../../images/addfriend.png")}
          />
        </TouchableOpacity>
      );
    }
  }

  return (
    <View style={{ height: "100%", width: "100%" }}>
      <View style={styles.barArea}>
        <View style={styles.barAreaLeft}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              navigation.navigate("Profile");
            }}
          >
            <Icon name="arrow-back" color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.barAreaMid}>
          <Text style={styles.txtAddFriend}>เพิ่มเพื่อน</Text>
        </View>
        <View style={{ flex: 0.2 }} />
      </View>
      <View style={styles.boxSearch}>
        <View style={styles.boxSearchLeft}>
          <TextInput
            style={{
              fontFamily: "PromptLight",
              fontSize: 14,
              paddingLeft: 20,
              marginTop: 5,
              width: "100%",
              color: "#FFFFFF",
            }}
            placeholder="ค้นหาชื่อเพื่อน"
            placeholderTextColor="#AFB1B4"
            maxLength={30}
            value={txtsearchFriend}
            onChangeText={_onInputChange}
            selectionColor={"#FFD428"}
            fontSize={20}
          />
        </View>
        <View style={styles.boxSearchRight}>
          <TouchableOpacity
            onPress={_searchFriend}
            style={{
              marginRight: 20,
              marginVertical: Platform.OS === "ios" ? 10 : 10,
            }}
          >
            <Image
              source={require("../../images/search.png")}
              style={{
                width: Platform.OS === "ios" ? 20 : 20,
                height: Platform.OS === "ios" ? 20 : 20,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            marginTop: "30%",
            height: "100%",
            width: "100%",
          }}
        >
          <View>
            {areaAddfriend}
            {isbtnFriend}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barArea: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    borderBottomColor: "#CACACA",
    borderBottomWidth: 2,
  },
  barAreaLeft: {
    alignItems: "center",
    flex: 0.2,
    marginVertical: 10,
  },
  barAreaMid: {
    flex: 1,
    alignItems: "center",
  },
  txtAddFriend: {
    fontSize: 18,
    marginTop: Platform.OS === "ios" ? 10 : 10,
    fontFamily: "PromptSemiBold",
    alignSelf: "center",
    color: "#000000",
  },
  boxSearch: {
    flexDirection: "row",
    backgroundColor: "#242A37",
    margin: 15,
    borderRadius: 20,
  },
  boxSearchLeft: {
    alignItems: "flex-start",
    flex: 0.9,
  },
  boxSearchRight: {
    alignItems: "flex-end",
    flex: 0.1,
  },
});

export default Search;
