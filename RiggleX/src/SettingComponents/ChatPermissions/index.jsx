import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import DropDownSvgIcon from '../../assets/svg/DropDownSvg';
import DropUpSvg from '../../assets/svg/DropUpSvg';
import HRMSControlSvg from '../../assets/svg/HRMSControlSvg';
import CustomDropdown from '../../components/CustomDropdown';
import SettingsSwitch from '../SettingsSwitch';
import {
  fonts,
  DarkColor80,
  DarkColor,
  mainOrangeColor,
  mainWhiteColor,
  DarkColor50,
  DarkColor60,
} from '../../utils/style/fonts';
import { useSettings } from '../../Api/context/SettingsContext';
import AccordionHeader from '../CommonComponents/AccordionHeader/AccordionHeader';
import ChatSvgIcon from '../../assets/Homeassets/svg/ChatSvgIcon';
import SettingLabel from '../CommonComponents/SettingLabel';
// import CustomDropdown from '../../components/CustomDropdown/index'

const ChatPermissions = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const { settings, updateSettings, isLoading } = useSettings();

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={mainOrangeColor} />
      </View>
    );
  }

  const handlePermissionChange = selectedItem => {
    const updatedSettings = {
      ...settings,
      selected_members: selectedItem.value === 'admin',
    };
    updateSettings(updatedSettings);
  };

  const DataType = [
    { label: 'All', value: 'all' },
    { label: 'Admins only', value: 'admin' },
  ];

  const currentValue = settings?.admin ? 'admin' : 'all';

  return (
    <View style={[styles.container, { paddingBottom: isAccordionOpen ? 8 : 0 }]}>
      <AccordionHeader
        title="Chat Permissions"
        isOpen={isAccordionOpen}
        onPress={() => setIsAccordionOpen(!isAccordionOpen)}
        icon={ChatSvgIcon}
        arrowColor={DarkColor}
      />

      {isAccordionOpen && (
        <>
          <SettingLabel>Who can create groups? </SettingLabel>

          <CustomDropdown
            data={DataType}
            placeholder="Select"
            value={currentValue}
            onChange={handlePermissionChange}
          />
        </>
      )}
    </View>
  );
};

export default ChatPermissions;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 16,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
