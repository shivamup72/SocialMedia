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
import CalenderSvg from '../../../assets/svg/CalenderSvg';

const GeneralTimelySettings = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [value, setValue] = useState('');
  const [value1, setValue1] = useState('');
  const [TaskNotifications, setTaskNotifications] = useState('');
  const [DefaultValue, setDefaultValue] = useState('');
  const { settings, updateSettings, isLoading } = useSettings();
  const [TaskCompleted, setTaskCompleted] = useState(false);
  const [Alert, setAlert] = useState(false);
  const [Push, setPush] = useState(false);

  const DataType = [
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    // {label: 'Never', value: 'never'},
  ];

  const DataType1 = [
    { label: 'Day', value: 'day' },
    { label: 'Month', value: 'month' },
    { label: 'Week', value: 'week' },
  ];

  const handlePermissionChange = value1 => {
    setValue(value1);
    updateSettings({ admin: value1 === 'admin' });
  };

  const handleTaskNotifications = valuetask => {
    console.log('taks -=-=-=-=----->', valuetask);
    setTaskNotifications(valuetask.value);
  };

  const handleDefaultNofitions = valueDefault => {
    console.log('defualr -=-=-=------->', valueDefault);
    setDefaultValue(valueDefault.value);
  };

  return (
    <View style={[styles.container, { paddingBottom: isAccordionOpen ? 8 : 0 }]}>
      <AccordionHeader
        title=" Timely / Calendar Settings"
        isOpen={isAccordionOpen}
        onPress={() => setIsAccordionOpen(!isAccordionOpen)}
        icon={CalenderSvg}
        arrowColor={DarkColor}
      />

      {isAccordionOpen && (
        <>
          <SectionTitle>Calendar</SectionTitle>
          <SettingLabel>Week Start Day</SettingLabel>
          <CustomDropdown
            data={DataType}
            placeholder="Select"
            value={value}
            onChange={handlePermissionChange}
          />

          <SettingLabel>Default View</SettingLabel>

          <CustomDropdown
            data={DataType1}
            placeholder="Select"
            value={value1}
            onChange={handleDefaultNofitions}
          />

          <SettingLabel>Add Calendar</SettingLabel>
          <View style={styles.separator} />

          <SectionTitle>Task</SectionTitle>
          <SettingsSwitch
            label="Show Completed Tasks"
            setIsEnabled={setTaskCompleted}
            isEnabled={TaskCompleted}
          />

          <SectionTitle>Task Notifications</SectionTitle>
          <SettingLabel>Default Reminder</SettingLabel>
          <CustomDropdown
            data={DataType1}
            placeholder="Select"
            value={DefaultValue}
            onChange={handleTaskNotifications}
            dropdownPosition="top"
          />

          <SettingsSwitch
            label="Alert"
            setIsEnabled={setAlert}
            isEnabled={Alert}
          />
          <SettingsSwitch
            label="Push"
            setIsEnabled={setPush}
            isEnabled={Push}
          />
        </>
      )}
    </View>
  );
};

export default GeneralTimelySettings;

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
