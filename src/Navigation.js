import { createAppContainer, createSwitchNavigator } from "react-navigation";
import Chat2 from "./components/Chat2";
import ChatGroupRoom from "./components/ChatGroupRoom";
import ChatContainer from "./containers/ChatContainer";
import CreateGroupContainer from "./containers/CreateGroupContainer";
import LocationFriendContainer from "./containers/LocationFriendContainer";
import LoginContainer from "./containers/LoginContainer";
import MapContainer from "./containers/MapContainer";
import NotificationContainer from "./containers/NotificationContainer";
import NotificationHistoryContainer from "./containers/NotificationHistoryContainer";
import ProfileContainer from "./containers/ProfileContainer";
import SearchContainer from "./containers/SearchContainer";
import ShardPlaceContainer from "./containers/ShardPlaceContainer";
import SplashScreen from "./SplashScreen";

const SwitchNav = createSwitchNavigator(
  {
    SplashScreen,
    Login: LoginContainer,
    Notification: NotificationContainer,
    Chat: ChatContainer,
    Profile: ProfileContainer,
    Search: SearchContainer,
    CreateGroup: CreateGroupContainer,
    Map: MapContainer,
    ShardPlace: ShardPlaceContainer,
    Chat2: Chat2,
    ChatGroupRoom: ChatGroupRoom,
    LocationFriend: LocationFriendContainer,
    NotificationHistory: NotificationHistoryContainer,
  },
  {
    initialRouteName: "SplashScreen",
  }
);

export default createAppContainer(SwitchNav);
