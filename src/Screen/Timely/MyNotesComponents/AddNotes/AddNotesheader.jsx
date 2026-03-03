import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import BackArrowSvg from '../../../../assets/svg/BackArrowSvg';
// import MaterialSymbolsFolderOutline from '../../../assets/AssestsComponents/svg/material_symbols_folder_outline';
import { fonts, mainWhiteColor, DarkColor } from '../../../../utils/style/fonts';
import CustomText from '../../../../utils/CustomText';

const AddNotesheader = ({ navigation, Type, FolderName }) => {
  const handlenavigations = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={handlenavigations}>
          <BackArrowSvg width={18} height={18} />
        </TouchableOpacity>
        <CustomText style={[styles.headerText, { marginLeft: 16 }]}>{Type}</CustomText>
      </View>
      <View style={styles.rightSection}>
        <CustomText style={[styles.folderText, { marginLeft: 8 }]}>{FolderName}</CustomText>
      </View>
    </View>
  );
};

export default AddNotesheader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: mainWhiteColor,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontFamily: fonts.PoppinsSemiBold,

    color: DarkColor,
    marginTop: 5,
  },
  folderText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    marginTop: 5,
  },
});
