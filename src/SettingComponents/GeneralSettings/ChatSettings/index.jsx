import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import DropDownSvgIcon from '../../../assets/svg/DropDownSvg';
import DropUpSvg from '../../../assets/svg/DropUpSvg';
import HRMSControlSvg from '../../../assets/svg/HRMSControlSvg';
import CustomDropdown from '../../../components/CustomDropdown';
import SettingsSwitch from '../../SettingsSwitch';
import {
  fonts,
  DarkColor80,
  DarkColor,
  mainOrangeColor,
  mainWhiteColor,
  DarkColor50,
  DarkColor60,
} from '../../../utils/style/fonts';
import { useSettings } from '../../../Api/context/SettingsContext';
import AccordionHeader from '../../CommonComponents/AccordionHeader/AccordionHeader';
import ChatSvgIcon from '../../../assets/Homeassets/svg/ChatSvgIcon';
import SettingLabel from '../../CommonComponents/SettingLabel';
import SectionTitle from '../../CommonComponents/SectionTitle';
import RadioButton from '../../../components/RadioButtonComponents/Radio';

const ChatSettings = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [value, setValue] = useState('');
  const { settings, updateSettings, isLoading } = useSettings();
  const [LastSeen, setLastSeen] = useState('');
  const [OnlineStatus, setOnlineStatus] = useState('');
  const [AllowBlockingUsers, setAllowBlockingUsers] = useState('');
  const [ReadReceipts, setReadReceipts] = useState(true);
  const [muteallchats, setMuteallchats] = useState(false);
  const [allowallchats, setAllowallchats] = useState(false);
  const [allowonlymentions, setAllowonlymentions] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={mainOrangeColor} />
      </View>
    );
  }

  const DataType = [
    { label: 'Wi-Fi only', value: 'wifi_only' },
    { label: 'Always', value: 'always' },
    { label: 'Never', value: 'never' },
  ];

  const handlePermissionChange = value1 => {
    setValue(value1);
    updateSettings({ admin: value1 === 'admin' });
  };

  return (
    <View style={[styles.container, { paddingBottom: isAccordionOpen ? 0 : 0 }]}>
      <AccordionHeader
        title="Chat Settings"
        isOpen={isAccordionOpen}
        onPress={() => setIsAccordionOpen(!isAccordionOpen)}
        icon={ChatSvgIcon}
        arrowColor={DarkColor}
      />

      {isAccordionOpen && (
        <>
          {/* <SectionTitle>Notifications</SectionTitle>
          <RadioButton
            selected={muteallchats}
            label="Mute all chats"
            onPress={() => {
              setAllowonlymentions(false);
              setAllowallchats(false);
              setMuteallchats(true);
            }}
          /> */}
          {/* <RadioButton
            selected={allowallchats}
            label="Allow for all"
            onPress={() => {
              setMuteallchats(false);
              setAllowallchats(true);
              setAllowonlymentions(false);
            }}
          />
          <RadioButton
            selected={allowonlymentions}
            label="Allow only for mentions"
            onPress={() => {
              setMuteallchats(false);
              setAllowallchats(false);
              setAllowonlymentions(true);
            }}
          /> */}

          {/* <SectionTitle>Chat Preferences</SectionTitle> */}
          {/* <SettingsSwitch
            label="Read Receipts"
            setIsEnabled={setReadReceipts}
            isEnabled={ReadReceipts}
          /> */}
          <SettingsSwitch
            label="Last Seen"
            setIsEnabled={setLastSeen}
            isEnabled={LastSeen}
          />
          <SettingsSwitch
            label="Online Status"
            setIsEnabled={setOnlineStatus}
            isEnabled={OnlineStatus}
          />
          {/* <SettingsSwitch
            label="Allow Blocking Users"
            setIsEnabled={setAllowBlockingUsers}
            isEnabled={AllowBlockingUsers}
          /> */}

          {/* <SettingLabel>Media Download</SettingLabel>

          <CustomDropdown
            data={DataType}
            placeholder="Select"
            value={value}
            onChange={handlePermissionChange}
          /> */}
        </>
      )}
    </View>
  );
};

export default ChatSettings;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    // paddingVertical: 6,
    paddingHorizontal: 16,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 1,
    marginTop: 15,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    marginTop: 15,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 12,
    color: DarkColor60,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
});
