import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native';
import { DarkColor, DarkColor20, DarkColor60, DarkColor80, fonts, mainWhiteColor } from '../../utils/style/fonts';
import { RfH } from '../../utils/helper';
import DropDownSvgIcon from '../../assets/svg/DropDownSvg';
import CustomText from '../../utils/CustomText';


const themes = ['Light', 'Dark', 'System Default'];
const languages = ['English', 'Hindi', 'Spanish'];

const AppSettings = () => {
    const [selectedTheme, setSelectedTheme] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const renderItem = (item, onSelect) => (
        <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
                onSelect(item);
            }}>
            <CustomText style={styles.dropdownItemText}>{item}</CustomText>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CustomText style={styles.heading}>App Settings</CustomText>

            <View style={styles.card}>
                {/* THEME */}
                <CustomText style={styles.label}>App Theme</CustomText>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowThemeModal(true)}>
                    <CustomText style={styles.dropdownText}>
                        {selectedTheme || 'Select'}
                    </CustomText>
                    <DropDownSvgIcon width={10} height={10} color={DarkColor60} />
                </TouchableOpacity>

                {/* LANGUAGE */}
                <CustomText style={[styles.label, { marginTop: 10 }]}>
                    App Language
                </CustomText>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowLanguageModal(true)}>
                    <CustomText style={styles.dropdownText}>
                        {selectedLanguage || 'Select'}
                    </CustomText>
                    <DropDownSvgIcon width={10} height={10} color={DarkColor60} />
                </TouchableOpacity>
            </View>

            {/* THEME MODAL */}
            <Modal visible={showThemeModal} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setShowThemeModal(false)}>
                    <View style={styles.modalBox}>
                        <FlatList
                            data={themes}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) =>
                                renderItem(item, (value) => {
                                    setSelectedTheme(value);
                                    setShowThemeModal(false);
                                })
                            }
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* LANGUAGE MODAL */}
            <Modal visible={showLanguageModal} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setShowLanguageModal(false)}>
                    <View style={styles.modalBox}>
                        <FlatList
                            data={languages}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) =>
                                renderItem(item, (value) => {
                                    setSelectedLanguage(value);
                                    setShowLanguageModal(false);
                                })
                            }
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default AppSettings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: RfH(10)
    },
    heading: {
        fontSize: 16,
        marginBottom: 4,
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 1,
    },
    label: {
        fontSize: 16,
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
    },
    dropdown: {
        height: 34,
        borderWidth: 1,
        borderColor: '#CFCFCF',
        borderRadius: 4,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: RfH(4)
    },
    dropdownText: {
        fontSize: 12,
        color: DarkColor60,
        fontFamily: fonts.PoppinsRegular,
    },
    arrow: {
        fontSize: 18,
        color: '#888',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
    },
    dropdownItem: {
        paddingVertical: 12,
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
});