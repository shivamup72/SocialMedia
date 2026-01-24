import React, { useEffect, useState } from 'react';
import { Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Keyboard, ToastAndroid } from 'react-native';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    TextInput,

} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import ImagePickerBottomSheet from './ImagePickerBottomSheet';
import { useIsFocused } from '@react-navigation/native';
import { normalize, RfH, RfW } from '../../utils/helper';
import CustomText from '../../utils/CustomText';
import {
    DarkColor,
    DarkColor80,
    fonts,
    mainOrange50,
    mainOrangeColor,
} from '../../utils/style/fonts';

import AsyncStorage1 from '../../Api/config/AsyncStorage';
import {
    GetUserIdListingApi,
    PatchUserIDListingApi,
} from '../../Api/config/HomeApi';

/* ---------------- TYPES ---------------- */

type User = {
    first_name?: string;
    last_name?: string;
    mobile?: string;
    email?: string;
    dob?: string;
    blood_group?: string;
    profile_picture?: any;
    profile_percentage?: number;
    [key: string]: any;
};

const fields: Array<[string, keyof User]> = [

    ['Email ID', 'email'],
    ['Mobile', 'mobile'],
    ['Date of Birth', 'dob'],
    ['Blood Group', 'blood_group'],
    ['Date of Joining', 'doj'],
    ['Emergency Contact', 'emergency_contact'],
    // ['Line Manager', 'line_manager'],
];

const ProfileCard = ({ setHideTabBar }: { setHideTabBar?: (hide: boolean) => void }) => {
    // Blood group dropdown state
    const bloodGroups = [
        'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
    ];
    const [showBloodDropdown, setShowBloodDropdown] = useState(false);
    // Validation state for required fields
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // Regex for 10-digit mobile numbers starting with 6-9
    const mobileRegex = /^[6-9][0-9]{9}$/;
    const isFocused = useIsFocused();
    // Ensure BottomTab always shows when keyboard is dismissed
    useEffect(() => {
        if (!setHideTabBar) return;
        const showSub = Keyboard.addListener('keyboardDidHide', () => {
            setHideTabBar(false);
        });
        return () => {
            showSub.remove();
        };
    }, [setHideTabBar]);

    /* ---------------- STATES ---------------- */
    const [expanded, setExpanded] = useState(false);
    const [editable, setEditable] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentDateField, setCurrentDateField] = useState<null | 'dob' | 'doj'>(null);
    const [userId, setUserId] = useState<number | null>(null);

    const [userData, setUserData] = useState<User>({});
    const [formData, setFormData] = useState<User>({});

    console.log(userData, "profile userData");


    const [profileImg, setProfileImg] = useState<any>(
        require('../../assets/Png/ProfileIcon.png'),
    );
    const [showImagePicker, setShowImagePicker] = useState(false);

    /* ---------------- GET USER DATA ---------------- */

    const fetchUserData = async () => {
        try {
            const stored = await AsyncStorage1.getItem('userLoginResponse');
            const parsed =
                typeof stored === 'string' ? JSON.parse(stored) : stored;

            const id = parsed?.data?.user?.id;
            if (!id) return;

            setUserId(id);

            const response = await GetUserIdListingApi(id, {});
            if (response?.success) {
                setUserData(response.data);
                setFormData({ ...response.data, profile_picture: null });

                if (response.data?.profile_picture) {
                    setProfileImg({ uri: response.data.profile_picture });
                } else {
                    setProfileImg(
                        require('../../assets/Png/ProfileIcon.png'),
                    );
                }
            }
        } catch (error) {
            console.log('Fetch profile error:', error);
        }
    };

    useEffect(() => {
        if (isFocused) fetchUserData();
    }, [isFocused]);

    /* ---------------- IMAGE PICKER ---------------- */

    const pickImageFromGallery = () => {
        setShowImagePicker(false);
        launchImageLibrary({ mediaType: 'photo' }, res => {
            if (!res.didCancel && res.assets?.length) {
                const img = res.assets[0];
                setProfileImg({ uri: img.uri });
                setFormData(prev => ({
                    ...prev,
                    profile_picture: {
                        uri: img.uri,
                        name: img.fileName || 'profile.jpg',
                        type: img.type || 'image/jpeg',
                    },
                }));
            }
        });
    };

    const pickImageFromCamera = async () => {
        setShowImagePicker(false);
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'App needs camera access to take photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    ToastAndroid.show('Camera permission is required to take photos.', ToastAndroid.LONG);
                    return;
                }
            } catch (err) {
                ToastAndroid.show('Failed to request camera permission.', ToastAndroid.LONG);
                return;
            }
        }
        launchCamera({ mediaType: 'photo' }, res => {
            if (!res.didCancel && res.assets?.length) {
                const img = res.assets[0];
                setProfileImg({ uri: img.uri });
                setFormData(prev => ({
                    ...prev,
                    profile_picture: {
                        uri: img.uri,
                        name: img.fileName || 'profile.jpg',
                        type: img.type || 'image/jpeg',
                    },
                }));
            }
        });
    };

    /* ---------------- INPUT CHANGE ---------------- */

    const handleChange = (key: keyof User, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    /* ---------------- SAVE PROFILE ---------------- */

    const handleSaveProfile = async () => {
        // Validate required fields
        let errors: { [key: string]: string } = {};
        if (!formData.first_name || !formData.first_name.trim()) {
            errors.first_name = 'First name is required.';
        }
        if (!formData.last_name || !formData.last_name.trim()) {
            errors.last_name = 'Last name is required.';
        }
        // Check for any existing validation errors (including mobile, emergency_contact, etc.)
        const hasValidationErrors = Object.values({ ...validationErrors, ...errors }).some(
            (msg) => msg && msg.length > 0
        );
        setValidationErrors(prev => ({ ...prev, ...errors }));
        if (hasValidationErrors) {
            // Do not proceed if there are validation errors
            ToastAndroid.show('Please fix the highlighted errors before updating.', ToastAndroid.LONG);
            return;
        }
        if (!userId) return;
        try {
            const form = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    form.append(key, formData[key]);
                }
            });
            if (formData.profile_picture?.uri) {
                form.append('profile_picture', formData.profile_picture);
            }
            await PatchUserIDListingApi(userId, form);
            ToastAndroid.show('Profile updated successfully', ToastAndroid.LONG);
            setEditable(false);
            fetchUserData();
        } catch (error) {
            ToastAndroid.show('Failed to update profile', ToastAndroid.LONG);
        }
    };

    /* ---------------- UI DATA ---------------- */

    const fullName = [userData.first_name, userData.last_name]
        .filter(Boolean)
        .join(' ');

    /* ---------------- RENDER ---------------- */

    return (
        <View>
            {/* PROGRESS */}
            <View style={{ bottom: RfH(20) }}>
                <View style={styles.progressBackground}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(
                                    100,
                                    userData.profile_percentage || 0,
                                )}%`,
                            },
                        ]}
                    />
                </View>
                <CustomText style={styles.valueText}>
                    {userData.profile_percentage || 0}% Profile completed
                </CustomText>
            </View>

            {/* CARD */}
            <View style={styles.profileCard}>
                {/* IMAGE */}
                <View style={styles.profileImageWrapper}>
                    <TouchableOpacity onPress={editable ? () => setShowImagePicker(true) : undefined}>
                        <View style={styles.profileImgBorder}>
                            <Image source={profileImg} style={styles.profileImg} />
                        </View>
                    </TouchableOpacity>
                    <ImagePickerBottomSheet
                        visible={showImagePicker}
                        onClose={() => setShowImagePicker(false)}
                        onPickGallery={pickImageFromGallery}
                        onPickCamera={pickImageFromCamera}
                    />

                    <TouchableOpacity
                        style={styles.editBtnWrapper}
                        onPress={async () => {
                            if (editable) {
                                // Validate required fields before save and collapse
                                let errors: { [key: string]: string } = {};
                                if (!formData.first_name || !formData.first_name.trim()) {
                                    errors.first_name = 'First name is required.';
                                }
                                if (!formData.last_name || !formData.last_name.trim()) {
                                    errors.last_name = 'Last name is required.';
                                }
                                setValidationErrors(errors);
                                if (Object.keys(errors).length > 0) {
                                    // Do not save or collapse if validation fails
                                    return;
                                }
                                await handleSaveProfile();
                                setExpanded(false);
                            } else {
                                setEditable(true);
                                setExpanded(true);
                                setFormData({ ...userData, profile_picture: null });
                            }
                        }}>
                        <View style={styles.editBtn}>
                            <Text style={styles.editIcon}>
                                {editable ? '✔' : '✎'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* HEADER */}
                <TouchableOpacity
                    style={styles.headerRow}
                    onPress={() => setExpanded(!expanded)}>
                    <CustomText style={[styles.name, { flex: 1, textAlign: 'center' }]}>
                        {fullName || 'No Name'}
                    </CustomText>
                    <Image
                        source={
                            expanded
                                ? require('../../assets/Png/arrowup.webp')
                                : require('../../assets/Png/arrowdwon.webp')
                        }
                        style={styles.arrowIcon}
                    />
                </TouchableOpacity>

                {/* DETAILS */}
                {expanded && (
                    <View style={styles.detailsWrapper}>
                        {/* Editable First Name and Last Name fields at the top */}
                        {editable && (
                            <View style={styles.valueRow}>
                                <View>
                                    <CustomText style={[styles.label, { bottom: RfH(8) }]}>First Name <Text style={{ color: 'red' }}>*</Text></CustomText>
                                    <TextInput
                                        value={formData.first_name || ''}
                                        onChangeText={t => {
                                            handleChange('first_name', t.replace(/\s/g, ''));
                                            if (!t.trim()) {
                                                setValidationErrors(prev => ({ ...prev, first_name: 'First name is required.' }));
                                            } else {
                                                setValidationErrors(prev => ({ ...prev, first_name: '' }));
                                            }
                                        }}
                                        style={[styles.inputBox, { bottom: RfH(12), color: '#000' }]}
                                        onFocus={() => setHideTabBar && setHideTabBar(true)}
                                        onBlur={() => setHideTabBar && setHideTabBar(false)}
                                    />
                                    {validationErrors.first_name ? (
                                        <CustomText style={{ color: 'red', fontSize: 11 }}>{validationErrors.first_name}</CustomText>
                                    ) : null}
                                </View>
                                <View>
                                    <CustomText style={[styles.label, { bottom: RfH(8) }]}>Last Name <Text style={{ color: 'red' }}>*</Text></CustomText>
                                    <TextInput
                                        value={formData.last_name || ''}
                                        onChangeText={t => {
                                            handleChange('last_name', t.replace(/\s/g, ''));
                                            if (!t.trim()) {
                                                setValidationErrors(prev => ({ ...prev, last_name: 'Last name is required.' }));
                                            } else {
                                                setValidationErrors(prev => ({ ...prev, last_name: '' }));
                                            }
                                        }}
                                        style={[styles.inputBox, { bottom: RfH(12), color: '#000' }]}
                                        onFocus={() => setHideTabBar && setHideTabBar(true)}
                                        onBlur={() => setHideTabBar && setHideTabBar(false)}
                                    />
                                    {validationErrors.last_name ? (
                                        <CustomText style={{ color: 'red', fontSize: 11, bottom: 4 }}>{validationErrors.last_name}</CustomText>
                                    ) : null}
                                </View>
                            </View>
                        )}
                        {/* ...existing code for other fields... */}
                        {fields.map(([label, key]) => (
                            <View key={key} style={styles.valueRow}>
                                <CustomText style={styles.label}>{label}:</CustomText>
                                {/* Custom dropdown for blood group */}
                                {editable && key === 'blood_group' ? (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.inputBox, { bottom: RfH(12), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                                            onPress={() => setShowBloodDropdown(true)}
                                        >
                                            <CustomText style={{ color: DarkColor, fontSize: normalize(12), fontFamily: fonts.PoppinsRegular }}>
                                                {formData.blood_group || 'Select Blood Group'}
                                            </CustomText>
                                            <Image
                                                source={require('../../assets/Png/arrowdwon.webp')}
                                                style={{ width: 16, height: 10, marginLeft: 8 }}
                                            />
                                        </TouchableOpacity>
                                        {/* Modal Dropdown */}
                                        <Modal
                                            visible={showBloodDropdown}
                                            transparent
                                            animationType="fade"
                                            onRequestClose={() => setShowBloodDropdown(false)}
                                        >
                                            <TouchableWithoutFeedback onPress={() => setShowBloodDropdown(false)}>
                                                <View style={styles.modalOverlay}>
                                                    <View style={styles.modalDropdownContainer}>
                                                        <ScrollView showsVerticalScrollIndicator={false}>
                                                            {bloodGroups.map(bg => (
                                                                <TouchableOpacity
                                                                    key={bg}
                                                                    style={styles.dropdownItem}
                                                                    onPress={() => {
                                                                        handleChange('blood_group', bg);
                                                                        setShowBloodDropdown(false);
                                                                    }}
                                                                >
                                                                    <CustomText style={{ color: DarkColor, fontSize: normalize(12), fontFamily: fonts.PoppinsRegular, padding: 8 }}>{bg}</CustomText>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </ScrollView>
                                                    </View>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </Modal>
                                    </>
                                ) : editable && (key === 'dob' || key === 'doj') ? (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.inputBox, { bottom: RfH(12) }]}
                                            onPress={() => {
                                                setCurrentDateField(key as 'dob' | 'doj');
                                                setShowDatePicker(true);
                                            }}>
                                            <CustomText style={[styles.valueText, {}]}>
                                                {formData[key] ? dayjs(formData[key]).format('DD-MM-YYYY') : ''}
                                            </CustomText>
                                        </TouchableOpacity>
                                        {showDatePicker && currentDateField === key && (
                                            <DateTimePicker
                                                value={formData[key] ? new Date(formData[key]) : new Date()}
                                                mode="date"
                                                onChange={(e, date) => {
                                                    setShowDatePicker(false);
                                                    setCurrentDateField(null);
                                                    if (date) {
                                                        handleChange(
                                                            key,
                                                            date.toISOString().split('T')[0],
                                                        );
                                                    }
                                                }}
                                                maximumDate={new Date()}
                                            />
                                        )}
                                    </>
                                ) : editable && (key === 'mobile' || key === 'emergency_contact') ? (
                                    <>
                                        <TextInput
                                            value={formData[key] as string}
                                            keyboardType="number-pad"
                                            maxLength={10}
                                            style={[styles.inputBox, { bottom: RfH(12) }]}
                                            onChangeText={t => {
                                                // Only allow numbers
                                                let num = t.replace(/[^0-9]/g, '');
                                                // Only allow up to 10 digits
                                                if (num.length > 10) num = num.slice(0, 10);
                                                handleChange(key, num);
                                                // Validation
                                                if (num.length === 0) {
                                                    setValidationErrors(prev => ({ ...prev, [key]: `${label} is required.` }));
                                                } else if (!/^[6-9]/.test(num)) {
                                                    setValidationErrors(prev => ({ ...prev, [key]: `${label} must start with 6-9.` }));
                                                } else if (num.length !== 10) {
                                                    setValidationErrors(prev => ({ ...prev, [key]: `${label} must be 10 digits.` }));
                                                } else {
                                                    setValidationErrors(prev => ({ ...prev, [key]: '' }));
                                                }
                                            }}
                                            onFocus={() => setHideTabBar && setHideTabBar(true)}
                                            onBlur={() => setHideTabBar && setHideTabBar(false)}
                                        />
                                        {validationErrors[key] ? (
                                            <CustomText style={{ color: 'red', fontSize: 11, bottom: RfH(10) }}>{validationErrors[key]}</CustomText>
                                        ) : null}
                                    </>
                                ) : editable ? (
                                    <TextInput
                                        value={formData[key] as string}
                                        onChangeText={t => handleChange(key, t)}
                                        style={[styles.inputBox, { bottom: RfH(12) }]}
                                        onFocus={() => setHideTabBar && setHideTabBar(true)}
                                        onBlur={() => setHideTabBar && setHideTabBar(false)}
                                    />
                                ) : (
                                    <CustomText style={[styles.valueText, { bottom: RfH(8) }]}>
                                        {key === 'blood_group'
                                            ? userData.blood_group || 'N/A'
                                            : (key === 'dob' || key === 'doj') && userData[key]
                                                ? dayjs(userData[key]).format('DD-MM-YYYY')
                                                : userData[key] || 'N/A'}
                                    </CustomText>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

export default ProfileCard;


const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalDropdownContainer: {
        width: '70%',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: mainOrange50,
        paddingVertical: 8,
        elevation: 10,
        maxHeight: 300,
    },
    dropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileCard: {
        backgroundColor: '#fff',
        padding: RfH(15),
        borderRadius: RfH(12),
        borderColor: mainOrangeColor,
        borderWidth: 1,
        marginBottom: RfH(20),
        borderBottomWidth: 4,
        paddingHorizontal: RfW(20),
        position: "relative"
    },
    profileImgBorder: {
        width: RfW(116),
        height: RfH(116),
        borderRadius: RfH(58),
        borderWidth: 2,
        borderColor: '#FF7F50',
        overflow: 'hidden',
    },
    progressContainer: {
        paddingRight: RfW(10),
        // flexDirection: 'row'
    },
    progressBackground: {
        width: '80%',
        height: RfH(8),
        backgroundColor: '#E9ECEF',
        borderRadius: RfH(10),
        overflow: 'hidden',
        marginBottom: RfH(5),
    },
    progressFill: {
        width: '50%',
        height: '100%',
        backgroundColor: 'green',
        borderRadius: RfH(10),
    },
    profileImg: {
        width: '100%',
        height: '100%',
        borderRadius: RfH(58),
    },

    editIcon: {
        color: '#fff',
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsMedium
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        marginBottom: 5,
    },

    name: {
        fontSize: normalize(16),
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
        alignSelf: 'center',
    },

    arrowIcon: {
        height: RfH(10),
        width: RfW(16),
    },

    detailsWrapper: {
        marginTop: 12,
    },

    label: {
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor80,
        fontSize: normalize(12),
        lineHeight: normalize(16),
        marginTop: RfH(4),
    },

    valueText: {
        fontSize: normalize(12),
        color: DarkColor80,
        fontFamily: fonts.PoppinsRegular,
        lineHeight: normalize(16),
        marginTop: RfH(4),
    },

    inputBox: {
        borderWidth: 0.59,
        borderColor: mainOrange50,
        marginTop: RfH(8),
        borderRadius: 5,
        paddingHorizontal: RfH(8),
        fontSize: normalize(12),
        justifyContent: 'center',
        height: RfH(40),
        color: DarkColor
    },
    valueRow: {
        paddingHorizontal: 10,
        gap: 8,
    },
    profileImageWrapper: {
        alignSelf: 'center',
        marginBottom: RfH(20),
        position: 'relative',
        width: RfW(116),
        height: RfH(116),
    },

    editBtnWrapper: {
        position: 'absolute',
        bottom: RfH(2),
        right: RfH(2),
    },

    editBtn: {
        backgroundColor: mainOrangeColor,
        width: RfH(30),
        height: RfH(30),
        borderRadius: RfH(50),
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },

    editImage: {
        width: RfH(32),
        height: RfH(32),
        borderRadius: RfH(50),
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },

});
