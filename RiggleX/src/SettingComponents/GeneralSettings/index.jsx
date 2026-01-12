import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useRef } from 'react';
import {
  fonts,
  DarkColor,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor60,
} from '../../utils/style/fonts.jsx';
import ChatSettings from './ChatSettings/index';
import GeneralTimelySettings from './GeneralTimelySettings.jsx';
import LightDeleteSvg from '../../assets/svg/LightDeleteSvg.jsx';
import { useSettings } from '../../Api/context/SettingsContext.js';
import { LeaveWorkspaceApiId } from '../../Api/config/HomeApi.jsx';
import AsyncStorage1 from '../../Api/config/AsyncStorage.jsx';
import Toast from '../../Api/context/Toast.js';

const GeneralSettings = ({ navigation, route }) => {
  console.log(
    'route general Settings -=-=--=-=-=-=----->',
    JSON.stringify(route),
    '\n',
    '\n',
  );
  const { settings, SelectedMembers } = useSettings();
  const [isRescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [isDeleteMeetingModalVisible, setDeleteMeetingModalVisible] =
    useState(false);
  const sections = [
    {
      key: 'chatsettings',
      component: <ChatSettings />,
    },
    {
      key: 'generalTimelySettings',
      component: <GeneralTimelySettings />,
    },
  ];

  const toastRef = useRef(null);

  const handleLeaveHub = async () => {
    const formdata = new FormData();
    formdata.append('workspace_id', route?.params?.data?.id);
    const res = await LeaveWorkspaceApiId(formdata);
    if (res?.success) {
      await AsyncStorage1.removeItem('HubId');
      setDeleteMeetingModalVisible(false);
      navigation.navigate('HubListingScreen');
    } else {
      toastRef.current.show({
        type: 'error',
        message: res?.message,
      });

      setDeleteMeetingModalVisible(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: mainWhiteColor, padding: 16 }}>
      <StatusBar barStyle="dark-content" backgroundColor={mainWhiteColor} />
      <FlatList
        data={sections}
        keyExtractor={item => item.key}
        renderItem={({ item }) => <View>{item.component}</View>}
        ListFooterComponent={
          <>
            {SelectedMembers?.role !== 'admin' && (
              <TouchableOpacity
                style={{ marginTop: 15, flexDirection: 'row' }}
                onPress={() => {
                  setDeleteMeetingModalVisible(true);
                }}>
                <View style={{ marginRight: 10, marginTop: 4 }}>
                  <LightDeleteSvg width="18" height="18" />
                </View>
                <Text
                  style={{
                    color: 'red',
                    fontFamily: fonts.PoppinsSemiBold,
                    fontSize: 16,
                  }}>
                  Leave Hub
                </Text>
              </TouchableOpacity>
            )}
          </>
        }
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* <ConfirmationModal
        isVisible={isDeleteMeetingModalVisible}
        modalTitle="Leave the hub"
        modalMessage={`Are you sure you want to leave this ${route?.params?.data?.name} Hub?`}
        onClose={() => setDeleteMeetingModalVisible(false)}
        onConfirm={handleLeaveHub}
      /> */}

      <Toast ref={toastRef} />
    </View>
  );
};

export default GeneralSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mainWhiteColor,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: mainOrangeColor,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  cameraIconTouchable: {
    backgroundColor: mainOrangeColor,
    padding: 5,
    borderRadius: 15,
  },
  hubNameSection: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Add some space before the next component
  },
  hubNameInput: {
    color: DarkColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    borderBottomWidth: 0.5,
    borderColor: DarkColor60,
    padding: 5,
    width: '80%',
    textAlign: 'center',
  },
  hubNameText: {
    color: DarkColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  saveArrowIcon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
});
