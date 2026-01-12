// StackNavigation.js
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

// Import screens
// import SplashScreen from '../OnBoardingFlow/SplashScreen';
import NewLogin from '../OnBoardingFlow/newOnBoardingFlow/index';
import TabNavigation from './TabNavigation';
import ScreenWindows from '../Chatcomponents/ChatWindowns/ScreenWindows';
import ViewDetails from '../Chatcomponents/ChatWindowns/ViewDetails';
// import ThreadScreen from '../Chatcomponents/ChatWindowns/ThreadComponents/ThreadScreen';
import AddGroupMembersScreen from '../Chatcomponents/ChatWindowns/ViewDetailsDocuments/AddGroupMembersScreen';
import JoinHubScreen from '../OnBoardingFlow/JoinHubScreen';
import CreateHubScreen from '../OnBoardingFlow/CreateHubScreen';
import CallScreen from '../components/Screens/CallScreen';
import SettingComponents from '../SettingComponents';
import GeneralSettings from '../SettingComponents/GeneralSettings';
import HubListingScreen from '../OnBoardingFlow/HubListingComponents';
import JoinOrCreateHubScreen from '../OnBoardingFlow/JoinOrCreateHubComponents';
import StartComponents from '../Chatcomponents/ChatWindowns/StarComponets';
import CreateHubScreensWithAcccount from '../OnBoardingFlow/CreateHubScreens';
// import MembersStatusListing from '../HomeComponents/MembersListing/index';
import PinListingComponents from '../Chatcomponents/ChatWindowns/PinComponents';
import ThreadListingComponents from '../Chatcomponents/ChatWindowns/ThreadListingComponents';
import SplashScreen from '../OnBoardingFlow/SplashScreen';
import ThreadScreen from '../Chatcomponents/ChatWindowns/ThreadComponents/ThreadScreen';
import CalendarTab from '../components/HomeComponent/CalendarTab';
import AddNotesScreen from '../Screen/Timely/MyNotesComponents/AddNotes/AddNotesScreen';
import MyNoteScreen from '../Screen/Timely/MyNotesComponents/MyNoteScreen';
import TaskScreen from '../Screen/Timely/CalenderComponents/TaskComponents/TaskScreen';
import NewLeaveScreen from '../Screen/Timely/CalenderComponents/LeaveComponents/LeaveScreen';
import ExpenseClaimScreen from '../Screen/Timely/CalenderComponents/ExpenseClaimComponents/ExpenseClaimScreen';
import MeetingScreen from '../Screen/Timely/CalenderComponents/MeetingComponents/MeetingScreen';
import MyApprovalsScreen from '../Screen/Timely/CalenderComponents/ApprovedComponents/MyApprovalsScreen';
import ExpenseClaimHistory from '../Screen/Timely/CalenderComponents/ApprovedComponents/CalimHistoryComponents';
import EventTypeScreen from '../Screen/Timely/EventTypeComponents/EventTypeScreen';
import ScreenTimely from '../Screen/Timely/ScreenTimely';
import ScreenChat from '../Chatcomponents/ScreenChat';

const StackNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="SplashScreen">
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="Login" component={NewLogin} />
      <Stack.Screen name="Home" component={TabNavigation} />
      <Stack.Screen name="ChatWindows" component={ScreenWindows} />
      <Stack.Screen name="ChatViewDetails" component={ViewDetails} />
      <Stack.Screen name="ThreadScreen" component={ThreadScreen} />
      <Stack.Screen
        name="AddGroupMembersScreen"
        component={AddGroupMembersScreen}
      />
      <Stack.Screen name="JoinHubScreen" component={JoinHubScreen} />
      <Stack.Screen name="CreateHubScreen" component={CreateHubScreen} />
      <Stack.Screen name="CallScreen" component={CallScreen} />
      <Stack.Screen name="SettingComponents" component={SettingComponents} />
      <Stack.Screen name="GeneralSettings" component={GeneralSettings} />
      <Stack.Screen name="HubListingScreen" component={HubListingScreen} />
      <Stack.Screen
        name="JoinOrCreateHubScreen"
        component={JoinOrCreateHubScreen}
      />
      <Stack.Screen name="StartComponents" component={StartComponents} />
      <Stack.Screen
        name="CreateHubScreensWithAcccount"
        component={CreateHubScreensWithAcccount}
      />
      {/* <Stack.Screen
        name="MembersStatusListing"
        component={MembersStatusListing}
      /> */}
      <Stack.Screen
        name="PinListingComponents"
        component={PinListingComponents}
      />
      <Stack.Screen
        name="ThreadListingComponents"
        component={ThreadListingComponents}
      />
      <Stack.Screen name="CalendarTab" component={CalendarTab} />
      <Stack.Screen name="AddNotesScreen" component={AddNotesScreen} />
      <Stack.Screen name="MyNoteScreen" component={MyNoteScreen} />
      <Stack.Screen name="TaskScreen" component={TaskScreen} />
      <Stack.Screen name="LeaveScreen" component={NewLeaveScreen} />
      <Stack.Screen name="ExpenseClaimScreen" component={ExpenseClaimScreen} />
      <Stack.Screen name="MeetingScreen" component={MeetingScreen} />
      <Stack.Screen name="MyApprovalsScreen" component={MyApprovalsScreen} />
      <Stack.Screen name="EventTypeScreen" component={EventTypeScreen} />

      <Stack.Screen
        name="ExpenseClaimHistory"
        component={ExpenseClaimHistory}
      />
    </Stack.Navigator>
  );
};

export default StackNavigation;
