import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';

import React, { useState, useEffect } from 'react';
import { mainOrangeColor, fonts, mainWhiteColor } from '../../../../utils/style/fonts';
import { PostMyFolderApi, PatchMyFolderApi } from '../../../../Api/config/TimelyApi';
import { RfH } from '../../../../utils/helper';
import CustomText from '../../../../utils/CustomText';
const mainBackgroundColor = 'rgba(60, 75, 85, 0.85)';

const AddWorkComponents = ({
  visible,
  onClose,
  onOpenFolder,
  onCloseFolder,
  showFolderModal,
  onCreateFolder,
  setRefreshing,
  editingData,
  edit,
}) => {
  // console.log('editing data ==------>', editingData);

  const [folderName, setFolderName] = useState(
    edit === 'edit' ? editingData?.name : '',
  );
  const [selectedColor, setSelectedColor] = useState('#FC8C4D');
  const [selectedIcon, setSelectedIcon] = useState('social');

  const colors = [
    '#90FC4D',
    '#DC4DFC',
    '#4DD6FC',
    '#8384EF',
    '#27B324',
    '#EB8F00',
    '#FC8C4D',
  ];

  useEffect(() => {
    const EditDatamatch = () => {
      setSelectedColor(editingData?.color);
      setSelectedIcon(editingData.icon_type);
      setFolderName(editingData?.name);
    };
    const NullData = () => {
      setSelectedColor('#FC8C4D');
      setSelectedIcon('social');
      setFolderName('');
    };
    if (edit === 'edit') {
      EditDatamatch();
    } else {
      NullData();
    }
  }, [edit, editingData]);

  const handleEditFolder = async () => {
    try {
      const Data = {
        name: folderName,
        color: selectedColor,
        // icon_type: selectedIcon,
      };

      setRefreshing(true);

      const response = await PatchMyFolderApi(editingData?.id, Data);

      if (response.success) {
        setFolderName('');
        setSelectedColor('#FC8C4D');
        console.log('Edit folder res --=------>', response);
        onClose();

        if (onCreateFolder) {
          onCreateFolder(folderName, selectedColor);
        }
      }
    } catch (err) {
      console.log('handleEdit folder err ==------===>', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !selectedColor) {
      Alert.alert('Error', 'Please enter a folder name.');
      return;
    }
    try {
      if (edit === 'edit') {
        handleEditFolder();
        return;
      }
      const Data = {
        name: folderName,
        color: selectedColor,
      };
      setRefreshing(true);
      const response = await PostMyFolderApi(Data);
      console.log('Create folder res --=------>', response);

      // setFolderName('edit');
      setFolderName('');
      setSelectedColor('#FC8C4D');

      // Close the modal first
      onClose();

      // Trigger data refresh in parent
      if (onCreateFolder) {
        onCreateFolder(folderName, selectedColor);
      }
    } catch (error) {
      console.log('error', error);
      Alert.alert('Error', 'Failed to create folder. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  if (!visible) {
    return null;
  }

  const handleCancelManage = () => {
    onClose();
    if (edit === 'edit') {
      setFolderName(editingData?.name);
      setSelectedColor(editingData?.color);
    } else {
      setFolderName('');
      setSelectedColor('#FC8C4D');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CustomText style={styles.modalTitle}>
                {edit === 'edit' ? 'Edit Folder' : 'Create Folder'}
              </CustomText>
            </View>
            <View style={styles.inputContainer}>
              <CustomText style={styles.label}>Folder Name</CustomText>
              <TextInput
                style={[styles.input, { borderColor: selectedColor }]}
                value={folderName}
                onChangeText={setFolderName}
                placeholder="Enter folder name"
                placeholderTextColor="#999"
                allowFontScaling={false}
              />
            </View>

            {/* <View style={styles.colorContainer}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.dottedLine} />
              <View style={styles.colorPalette}>
                {colors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorOption,
                      {borderColor: color},
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}>
                    {selectedColor === color && (
                      <View
                        style={[styles.colorSelected, {backgroundColor: color}]}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View> */}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelManage}>
                <CustomText style={styles.cancelButtonText} allowFontScaling={false}>Cancel</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleCreateFolder}>
                <CustomText style={styles.addButtonText} allowFontScaling={false}>
                  {edit === 'edit' ? 'Update' : 'Add'}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddWorkComponents;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: mainBackgroundColor,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: Platform.OS === 'ios' ? 'center' : 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 20 : 0,
    borderBottomRightRadius: Platform.OS === 'ios' ? 20 : 0,
    padding: 20,
    paddingBottom: RfH(30),
    borderTopWidth: 3,
    borderColor: mainOrangeColor,
    borderLeftWidth: 1,
    borderRightWidth: 1
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: '#333',
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: '#333',
  },
  colorContainer: {
    marginBottom: 30,
  },
  dottedLine: {
    borderStyle: 'dashed',
    borderWidth: 1,
    // borderRadius: 0.5,
    borderColor: mainOrangeColor,
    marginVertical: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 2,
  },
  colorSelected: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: mainOrangeColor,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: mainOrangeColor,
  },
  cancelButtonText: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
  },
  addButtonText: {
    color: 'white',
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    alignItems: 'flex-end',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  optionText: {
    color: mainWhiteColor,
    fontSize: 22,
    fontFamily: fonts.PoppinsSemiBold,
    marginRight: 16,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: mainOrangeColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  iconContainer: {
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 20,
  },
  icon: {
    width: 32,
    height: 32,

    // tintColor: mainWhiteColor,
  },
});
