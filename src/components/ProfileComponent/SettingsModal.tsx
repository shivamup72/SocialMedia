import React from "react";
import { Modal, TouchableOpacity, Text, View, StyleSheet } from "react-native";
import SettingSvg from '../../assets/svg/material_symbols_settings_outline_rounded';
import CloseSvg from '../../assets/svg/CloseSvg';
import { useSettings } from '../../Api/context/SettingsContext';
import AsyncStorage1 from "../../Api/config/AsyncStorage";

interface SettingsModalProps {
    navigation: any;
    visible: boolean;
    onClose: () => void;
    onCloseprofile?: () => void;
    hubName: string;
    SelectedHub: any;
    userData: any;
}

const SettingsModal = ({ navigation, visible, onClose, onCloseprofile, hubName, SelectedHub, userData }: SettingsModalProps) => {
    console.log('SelectedHub in SettingsModal:', SelectedHub);

    const { updateSettings } = useSettings();

    console.log(updateSettings, 'update settings function');


    const handleAdminSettingsNavigation = async () => {
        const newSettings: any = {};
        if (SelectedHub?.hrms_settings && SelectedHub.hrms_settings.length > 0) {
            const hubSettings = SelectedHub.hrms_settings[0];
            Object.assign(newSettings, hubSettings);
        }
        updateSettings(newSettings);
        await AsyncStorage1.setItem('selectedMembers', JSON.stringify(SelectedHub?.members?.[0]));
        onClose();
        onCloseprofile && onCloseprofile();
        navigation.navigate('SettingComponents', {
            hubName: hubName,
            id: Array.isArray(SelectedHub) ? SelectedHub[0]?.id : SelectedHub?.id,
            logo: SelectedHub?.logo,
        });
    };

    const handleGeneralSettingsNavigation = () => {
        onClose();
        onCloseprofile && onCloseprofile();
        navigation.navigate('GeneralSettings', {
            hubName: hubName,
            data: SelectedHub,
        });
    };
    if (!visible) return null;
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={settingsModalStyles.settingsOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity style={settingsModalStyles.closeButton} onPress={onClose}>
                    <CloseSvg width={"24"} height={"24"} color={'#222'} />
                </TouchableOpacity>
                <View style={settingsModalStyles.settingsModalContent}>
                    <View style={settingsModalStyles.settingsContainer}>
                        <TouchableOpacity style={settingsModalStyles.settingOption} onPress={handleGeneralSettingsNavigation}>
                            <SettingSvg width="24" height="24" color={'#222'} />
                            <Text style={settingsModalStyles.settingText}>General Settings</Text>
                        </TouchableOpacity>
                        {/* Improved role check for Hub Admin Settings button (supports array/object) */}
                        {(() => {
                            let showAdminButton = false;
                            if (SelectedHub && Array.isArray(SelectedHub.members)) {
                                showAdminButton = SelectedHub.members.some(member => member.role === 'admin');
                            }
                            return showAdminButton ? (
                                <TouchableOpacity style={settingsModalStyles.settingOption} onPress={handleAdminSettingsNavigation}>
                                    <SettingSvg width="24" height="24" color={'#222'} />
                                    <Text style={settingsModalStyles.settingText}>Hub Admin Settings</Text>
                                </TouchableOpacity>
                            ) : null;
                        })()}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const settingsModalStyles = StyleSheet.create({
    settingsOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    settingsModalContent: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
        position: 'relative',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    closeButton: {
        backgroundColor: '#fff',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 10,
    },
    settingsContainer: {
        width: '100%',
    },
    settingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    settingText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#222',
        marginLeft: 15,
        marginTop: 5,
    },
});

export default SettingsModal;
