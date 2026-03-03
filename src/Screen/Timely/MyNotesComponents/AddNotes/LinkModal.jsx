import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  mainOrangeColor,
  mainWhiteColor,
  DarkColor,
  DarkColor50,
  fonts,
} from '../../../../utils/style/fonts';

const LinkModal = ({ visible, onClose, onAddLink }) => {
  const [url, setUrl] = useState('');

  const handleAdd = () => {
    if (url) {
      onAddLink(url);
      setUrl('');
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Add Link</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            placeholderTextColor={DarkColor50}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={onClose}>
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonAdd]}
              onPress={handleAdd}>
              <Text style={styles.textStyle}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: mainWhiteColor,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: DarkColor50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontFamily: fonts.PoppinsRegular,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonClose: {
    backgroundColor: '#f2f2f2',
  },
  buttonAdd: {
    backgroundColor: mainOrangeColor,
  },
  textStyle: {
    color: DarkColor,
    fontFamily: fonts.PoppinsMedium,
    textAlign: 'center',
  },
});

export default LinkModal;