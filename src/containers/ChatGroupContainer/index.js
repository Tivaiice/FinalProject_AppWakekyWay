import "firebase/auth";
import "firebase/firestore";
import React from "react";
import Chat from "../../screen/ChatScreen";

class ChatGroupContainer extends React.Component {
  constructor(props) {
    super(props);
    this.shardFriend = this.props.navigation.getParam("shardFriend", undefined);
    this.Shardpoint = this.props.navigation.getParam("Shardpoint", undefined);
    this.state = {
      messages: [],
    };
  }

  async componentDidMount() {
    this.setToSend();
  }

  setToSend = async () => {
    this.shardFriend &&
      console.log("List to shardFriend ====>", this.shardFriend);
    this.Shardpoint && console.log("Shardpoint ======>", this.Shardpoint);
  };

  render() {
    return <Chat navigation={this.props.navigation} />;
  }
}

export default ChatGroupContainer;
