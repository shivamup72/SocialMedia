import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import HRMSControlSvg from '../../assets/svg/HRMSControlSvg';
import CustomDropdown from '../../components/CustomDropdown';
import SettingsSwitch from '../SettingsSwitch';
import AccordionHeader from '../CommonComponents/AccordionHeader/AccordionHeader';

import Toast from '../../Api/context/Toast';

import {
  fonts,
  DarkColor,
  DarkColor60,
  mainOrangeColor,
} from '../../utils/style/fonts';

import SettingLabel from '../CommonComponents/SettingLabel';
import { useSettings } from '../../Api/context/SettingsContext';
import SectionTitle from '../CommonComponents/SectionTitle';

import { PatchSettingsApi } from '../../Api/config/HomeApi';

const HRMSControls = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const toastRef = useRef(null);

  const { settings, updateSettings, isLoading } = useSettings();

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={mainOrangeColor} />
      </View>
    );
  }

  if (!settings) {
    return null;
  }

  const handleSettingChange = async (field, value) => {
    const formData = new FormData();

    formData.append(field, value);

    console.log('formData -=-=-=-=>', formData, '\n');

    const res = await PatchSettingsApi(settings?.id, formData);
    // console.log('res handle settings -=-=-=-=>', res, '\n');
    // if (res.success) {
    //   toastRef.current.show({
    //     type: 'success',
    //     message: res?.message,
    //   });
    // } else {
    //   toastRef.current.show({
    //     type: 'error',
    //     message: res?.message,
    //   });
    //   return;
    // }

    // console.log('res handle settings -=-=-=-=>', res);
    const updatedSettings = {
      ...settings,
      [field]: value,
    };
    console.log('\n', '\n', 'updatedSettings -=-=-=-=>', updatedSettings, '\n');

    updateSettings({ newSettings: updatedSettings });
  };

  const timeData = [
    { label: '11:59 PM', value: '23:59:59' },
    { label: '10:00 PM', value: '22:00:00' },
    { label: '09:00 PM', value: '21:00:00' },
    { label: '08:00 PM', value: '20:00:00' },
    { label: '07:00 PM', value: '19:00:00' },
    { label: '06:00 PM', value: '18:00:00' },
    { label: '05:00 PM', value: '17:00:00' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: isAccordionOpen ? 8 : 0 }]}>
      <AccordionHeader
        title="HRMS Controls"
        isOpen={isAccordionOpen}
        onPress={() => setIsAccordionOpen(!isAccordionOpen)}
        icon={HRMSControlSvg}
        arrowColor={DarkColor}
      />

      {isAccordionOpen && (
        <>
          <SettingsSwitch
            label="HRMS Needed ?"
            isEnabled={settings.add_hrms}
            setIsEnabled={newValue => handleSettingChange('add_hrms', newValue)}
          />
          {settings.add_hrms && (
            <>
              <SettingsSwitch
                label="Show Leave Balance"
                isEnabled={settings.manage_leaves_wfh_balance}
                setIsEnabled={newValue =>
                  handleSettingChange('manage_leaves_wfh_balance', newValue)
                }
              />
              <SettingsSwitch
                label="Expense Claim Needed?"
                isEnabled={settings.expense_claim}
                setIsEnabled={newValue =>
                  handleSettingChange('expense_claim', newValue)
                }
              />

              <SectionTitle>Work Log Settings</SectionTitle>
              {console.log(
                'settings -=-=-=-=>',
                settings.start_day_end_day,
                '\n',
              )}
              <SettingsSwitch
                label="Start Day / End Day Log"
                isEnabled={settings.start_day_end_day}
                setIsEnabled={newValue =>
                  handleSettingChange('start_day_end_day', newValue)
                }
              />

              {settings.start_day_end_day && (
                <>
                  <SettingLabel>Auto End Day At</SettingLabel>
                  <CustomDropdown
                    data={timeData}
                    placeholder="Select time"
                    value={settings.auto_end_time}
                    onChange={item => {
                      handleSettingChange('auto_end_time', item.value);
                    }}
                  />

                  <SectionTitle>Selfie Log</SectionTitle>
                  <SettingsSwitch
                    label="Start of Day"
                    isEnabled={settings.start_selfie}
                    setIsEnabled={newValue =>
                      handleSettingChange('start_selfie', newValue)
                    }
                  />
                  <SettingsSwitch
                    label="End of Day"
                    isEnabled={settings.end_selfie}
                    setIsEnabled={newValue =>
                      handleSettingChange('end_selfie', newValue)
                    }
                  />

                  <View style={styles.separator} />

                  <SettingsSwitch
                    label="Location Tracking"
                    isEnabled={settings.location_tracking}
                    setIsEnabled={newValue =>
                      handleSettingChange('location_tracking', newValue)
                    }
                  />
                </>
              )}
            </>
          )}
        </>
      )}

      <Toast ref={toastRef} />
    </View>
  );
};

export default HRMSControls;

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
