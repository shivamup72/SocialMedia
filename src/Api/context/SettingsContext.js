import React, {createContext, useState, useEffect, useContext} from 'react';
import AsyncStorage1 from '../config/AsyncStorage';

const SettingsContext = createContext();

export const SettingsProvider = ({children}) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [SelectedMembers, setSelectedMembers] = useState([]);
  const [HubId, setHubId] = useState(null); // Keep this state

  useEffect(() => {
    const loadSettingsFromStorage = async () => {
      try {
        const settingsString = await AsyncStorage1.getItem('appSettings');
        if (settingsString) {
          setSettings(settingsString);
        }

        const selectedMembersString = await AsyncStorage1.getItem(
          'selectedMembers',
        );
        if (selectedMembersString) {
          setSelectedMembers(selectedMembersString);
        }

        const hubIdCheck = await AsyncStorage1.getItem('HubId');
        if (hubIdCheck) {
          setHubId(hubIdCheck);
        }
      } catch (error) {
        console.error('Failed to load settings from storage', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettingsFromStorage();
  }, []); // Empty dependency array means this runs once on mount

  // Modify updateSettings to also handle HubId updates
  const updateSettings = async ({
    newSettings,
    newSelectedMembers,
    newHubId, // Add newHubId parameter
  }) => {
    console.log(
      'Received newSettings, newSelectedMembers, newHubId in updateSettings:',
      newSettings,
      newSelectedMembers,
      newHubId,
    );
    try {
      if (newSelectedMembers !== undefined) {
        console.log(
          'newSelectedMembers in setings -=-=-=--->:',
          newSelectedMembers,
        );
        setSelectedMembers(newSelectedMembers);
        await AsyncStorage1.setItem(
          'selectedMembers',
          JSON.stringify(newSelectedMembers),
        );
      }

      if (newSettings !== undefined) {
        console.log('newSettings in setings -=-=-=--->:', newSettings);
        setSettings(newSettings);
        await AsyncStorage1.setItem('appSettings', JSON.stringify(newSettings));
      }

      if (newHubId !== undefined) {
        console.log(
          'Updating HubId in SettingsContext and AsyncStorage:',
          newHubId,
        );
        setHubId(newHubId);

        await AsyncStorage1.setItem('HubId', JSON.stringify(newHubId));
      }
    } catch (error) {
      console.error('Failed to save settings to storage', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{settings, updateSettings, isLoading, SelectedMembers, HubId}}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  return useContext(SettingsContext);
};
