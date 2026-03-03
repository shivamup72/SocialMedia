import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
    Switch,
} from 'react-native';
import React, { useState } from 'react';
import { DarkColor, DarkColor80, fonts, mainOrangeColor, mainWhiteColor } from '../../utils/style/fonts';
import { RfH, RfW } from '../../utils/helper';
import CustomText from '../../utils/CustomText';
import DropUpSvg from '../../assets/svg/DropUpSvg';
import DropDownSvg from '../../assets/svg/DropDownSvg';
import CustomSwitch from './CustomSwitch';

const AdminPrivacy = () => {
    const [expanded, setExpanded] = useState(true);

    const [settings, setSettings] = useState({
        save: false,
        export: false,
        screenshot: false,
        screenshare: false,
    });

    const toggleSwitch = key => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity
                style={styles.header}
                onPress={() => setExpanded(prev => !prev)}
                activeOpacity={0.7}
            >
                <View style={styles.headerLeft}>
                    <Image
                        source={require('../../assets/Png/panelsetting.png')}
                        style={styles.headerIcon}
                    />
                    <CustomText style={styles.headerTitle}>
                        Privacy And Sharing
                    </CustomText>
                </View>

                {expanded ? (
                    <DropUpSvg width={14} height={14} color={DarkColor80} />
                ) : (
                    <DropDownSvg width={14} height={14} color={DarkColor80} />
                )}
            </TouchableOpacity>

            {/* Content */}
            {expanded && (
                <View style={styles.content}>
                    <CustomText style={styles.sectionTitle}>
                        Media Sharing Controls
                    </CustomText>

                    <SettingRow
                        label="Allow save"
                        value={settings.save}
                        onToggle={() => toggleSwitch('save')}
                    />
                    <SettingRow
                        label="Allow export"
                        value={settings.export}
                        onToggle={() => toggleSwitch('export')}
                    />
                    <SettingRow
                        label="Allow screenshots"
                        value={settings.screenshot}
                        onToggle={() => toggleSwitch('screenshot')}
                    />
                    <SettingRow
                        label="Allow screen share"
                        value={settings.screenshare}
                        onToggle={() => toggleSwitch('screenshare')}
                    />
                </View>
            )}
        </View>
    );
};

/* 🔹 Reusable Row */
const SettingRow = ({ label, value, onToggle }) => {
    return (
        <View style={styles.row}>
            <CustomText style={styles.rowLabel}>{label}</CustomText>
            <CustomSwitch value={value} onToggle={onToggle} />
        </View>
    );
};

export default AdminPrivacy;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: RfH(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 5,
        marginTop: 15,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    headerIcon: {
        height: RfH(22),
        width: RfH(22),
    },

    headerTitle: {
        marginLeft: RfW(10),
        fontSize: 16,
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
    },

    content: {
        marginTop: RfH(14),
    },

    sectionTitle: {
        fontSize: 15,
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
        marginBottom: RfH(8),
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: RfH(6),
    },

    rowLabel: {
        fontSize: 14,
        fontFamily: fonts.PoppinsRegular,
        color: DarkColor80,
    },
});