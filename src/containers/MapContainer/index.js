import React from "react";
import Map from "../../screen/MapScreen";

class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.chatGroupId = this.props.navigation.getParam("chatGroupId", undefined);
    this.state = {
      language: "script",
    };
  }

  componentDidMount() {
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
    //alert("chatGroupId:" + this.chatGroupId);
  }

  render() {
    return (
      <Map navigation={this.props.navigation} chatGroupId={this.chatGroupId} />
    );
  }
}

export default MapContainer;
