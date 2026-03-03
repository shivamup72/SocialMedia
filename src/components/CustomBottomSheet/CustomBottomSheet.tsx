
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    Pressable
} from "react-native";
import { RfH, RfW, normalize } from "../../utils/helper";
import { fonts, mainOrangeColor, DarkColor, DarkColor50, DarkColor20 } from '../../utils/style/fonts';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomText from '../../utils/CustomText';


interface CustomBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

interface CreateFolderFormProps {
    onClose: () => void;
}


export const CreateFolderForm: React.FC<CreateFolderFormProps> = ({ onClose }) => {
    const [folderName, setFolderName] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState("");
    const colors = [
        mainOrangeColor,
        "#EB8F00",
        "#8384EF",
        "#57C84D",
        "#4DD6FC",
        "#DC4DFC",
        "#90FC4D",
    ];

    const handlePickImage = async () => {
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
            if (result.assets && result.assets.length > 0) {
                setImageUri(result.assets[0].uri || null);
            }
        } catch (e) {
            // handle error if needed
        }
    };

    return (
        <View>
            <CustomText style={styles.label}>Create Folder</CustomText>
            <View style={styles.inputBox}>
                <TextInput
                    placeholder="Folder Name"
                    style={styles.input}
                    placeholderTextColor={DarkColor50}
                    value={folderName}
                    onChangeText={setFolderName}
                    allowFontScaling={false}
                />
            </View>
            <CustomText style={[styles.label, { marginTop: RfH(20) }]}>Add Image
                <CustomText
                    style={{ color: DarkColor50, fontSize: normalize(12), fontFamily: fonts.PoppinsRegular }}>
                    (Optional)</CustomText>
            </CustomText>
            <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
                {imageUri ? (
                    <CustomText style={styles.uploadLink} ellipsizeMode="middle">Image Uploaded</CustomText>
                ) : (
                    <CustomText style={styles.uploadText}>Upload Image</CustomText>
                )}
            </TouchableOpacity>
            <View style={styles.colorHeaderRow}>
                <CustomText style={styles.colorHeaderLabel}>Color</CustomText>
                <View style={styles.colorHeaderDivider} />
            </View>
            <View style={styles.colorRow}>
                {colors.map((col, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedColor(col)}
                        style={[
                            styles.colorBox,
                            { borderColor: DarkColor20, borderLeftWidth: 2, borderLeftColor: col },
                        ]}
                    />
                ))}
            </View>
            <View style={[styles.colorHeaderDivider, { marginTop: RfH(25) }]} />
            <View style={{ flexDirection: 'row', marginTop: RfH(40), justifyContent: 'space-between', }}>
                <Pressable onPress={onClose}>
                    <View style={styles.cancelbtnsty}>
                        <CustomText style={styles.btntxtsty}>Cancel</CustomText>
                    </View>
                </Pressable>
                <Pressable onPress={onClose}>
                    <View style={[styles.cancelbtnsty, { backgroundColor: mainOrangeColor }]}>
                        <CustomText style={[styles.btntxtsty, { color: "#fff" }]}>Add</CustomText>
                    </View>
                </Pressable>
            </View>
        </View>
    );
};


const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({ visible, onClose, children }) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={modalStyles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={modalStyles.sheet}>
                            <View style={modalStyles.dragIndicatorContainer} />
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default CustomBottomSheet;


const styles = StyleSheet.create({
    colorHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: RfH(20),
        marginBottom: RfH(8),
    },
    colorHeaderLabel: {
        fontSize: normalize(16),
        fontFamily: fonts.PoppinsSemiBold,
        color: DarkColor,
        marginRight: RfW(12),
    },
    colorHeaderDivider: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: mainOrangeColor,
        borderStyle: 'dashed',
        marginTop: RfH(2),
    },
    label: {
        fontSize: normalize(16),
        fontFamily: fonts.PoppinsSemiBold,
        color: DarkColor,
        marginBottom: RfH(8),

    },
    inputBox: {
        borderWidth: 1,
        borderColor: mainOrangeColor,
        borderRadius: 4,
        paddingHorizontal: RfW(12),
        height: RfH(45),
        justifyContent: "center",
    },

    input: {
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsRegular,
        color: DarkColor,
    },

    uploadBox: {
        borderWidth: 1,
        borderColor: mainOrangeColor,
        borderRadius: 4,
        height: RfH(45),
        paddingHorizontal: RfW(12),
        flexDirection: "row",
        alignItems: "center",
    },


    uploadText: {
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsRegular,
        color: DarkColor50,
    },
    uploadLink: {
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsRegular,
        color: DarkColor,
        textDecorationLine: 'underline',
        flex: 1,
        flexWrap: 'wrap',
    },

    colorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: RfH(8),
    },

    colorBox: {
        width: RfW(30),
        height: RfH(27),
        borderRadius: 4,
        borderWidth: 0.5,
        marginRight: RfW(10),
        backgroundColor: "#fff",
    },
    cancelbtnsty: {
        borderWidth: 1,
        borderColor: mainOrangeColor,
        borderRadius: 8,
        paddingVertical: RfH(8),
        width: RfW(135)
    },
    btntxtsty: {
        textAlign: 'center',
        fontSize: normalize(16),
        fontFamily: fonts.PoppinsMedium,
        color: mainOrangeColor,
    }

});

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingVertical: RfH(20),
        width: '100%',
        alignItems: 'stretch',
        borderColor: mainOrangeColor,
        borderTopWidth: 2,
        paddingHorizontal: RfW(30),
        borderEndWidth: 2,
        borderLeftWidth: 2,

    },
    dragIndicatorContainer: {
        alignItems: 'center',
        marginBottom: RfH(12),
    },

});
