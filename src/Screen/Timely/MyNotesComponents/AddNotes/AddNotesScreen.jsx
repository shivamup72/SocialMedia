import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import {
  fonts,
  mainWhiteColor,
  mainOrangeColor,
  mainOrange80,
  DarkColor,
  DarkColor50,
} from '../../../../utils/style/fonts';
import AddNotesheader from './AddNotesheader';
import { PostMyNotesApi, PatchMyNotesApiId } from '../../../../Api/config/TimelyApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import debounce from 'lodash.debounce';
import ScreenView from '../../../../utils/ScreenView';
import SendSvgIcon from '../../../../assets/svg/MiciconSvg';
import { RfH, RfW } from '../../../../utils/helper';

import { BackHandler } from 'react-native';

const AddNotesScreen = ({ navigation, route }) => {
  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      return true; // Prevent default behavior (exit app)
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [navigation]);
  const id = route.params?.id;
  let EditStatus = route?.params?.Edit === true ? true : false;
  const iconColor = '#334155';
  const [title, setTitle] = useState(route?.params?.noteData?.title || '');
  const richText = useRef(null);
  const [note, setNote] = useState(
    route?.params?.Edit === true ? route?.params?.noteData?.text : '',
  );

  // Always get Notesid from route.params.noteData.id if editing
  const Notesid = EditStatus && route?.params?.noteData?.id ? route.params.noteData.id : null;

  const [isLinkModalVisible, setLinkModalVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');


  // Save new note
  const handleSave = async () => {
    try {
      if (!title.trim() && !note.trim()) {
        console.log('No content to save');
        return;
      }
      const object = {
        title: title,
        text: note.trim() || '<div></div>',
        folder: id,
      };
      await PostMyNotesApi(object)
        .then(res => {
          console.log('Note added successfully', res);
          navigation.goBack();
        })
        .catch(err => {
          console.log('err on add notes screen', err);
        });
    } catch (err) {
      console.log('err on add notes screen', err);
    }
  };

  // Update existing note
  const handleUpdate = async () => {
    try {
      const updateId = route?.params?.noteData?.id;
      console.log('Updating note with ID:', updateId);

      // if (!updateId || !title.trim()) {
      //   console.log('No Notesid for update or empty title');
      //   return;
      // }
      const object = {
        text: note.trim() || '<div></div>',
        folder: id,
        title: title,
      };
      await PatchMyNotesApiId(updateId, object)
        .then(res => {
          console.log('Note updated successfully', res);
          navigation.goBack();
        })
        .catch(err => {
          console.log('err on edit notes screen', err);
        });
    } catch (err) {
      console.log('err on edit notes screen', err);
    }
  };

  // Function to handle link insertion from modal
  // const handleInsertLink = () => {
  //   if (linkUrl && richText.current) {
  //     richText.current.insertLink(linkText || linkUrl, linkUrl);
  //     setLinkModalVisible(false);
  //     setLinkUrl('');
  //     setLinkText('');
  //   }
  // };

  const handleAddMedia = async () => {
    // ... (your existing handleAddMedia code is fine)
    // console.log('media documents -=-=-=-=-=----->', selectedMessage);
  };

  return (
    <ScreenView>
      <StatusBar backgroundColor={mainWhiteColor} barStyle={'dark-content'} />
      <AddNotesheader
        navigation={navigation}
        Type={route?.params?.Edit ? 'Edit Note' : 'Note'}
        FolderName={route?.params?.name}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View style={styles.rowContainer}>
            <View style={styles.orangeBar} />
            <View style={styles.noteContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.titleInput, styles.h1Title]}
                    placeholder="Title"
                    placeholderTextColor={DarkColor50}
                    value={title}
                    onChangeText={setTitle}
                    multiline={true}
                    numberOfLines={2}
                    maxLength={100}
                    textAlignVertical="top"
                    selectionColor={mainOrangeColor}
                    allowFontScaling={false}
                  />
                </View>
                <TouchableOpacity onPress={handleAddMedia} style={styles.iconButton}>
                  <SendSvgIcon width={16} height={16} color={mainWhiteColor} fontWeight="600" />
                </TouchableOpacity>
              </View>

              <RichEditor
                ref={richText}
                style={styles.noteInput}
                initialContentHTML={note}
                onChange={descriptionText => {
                  setNote(descriptionText);
                }}
                placeholder="Note down a quick thought"
                editorStyle={{
                  backgroundColor: mainWhiteColor,
                  color: DarkColor,
                  placeholderColor: DarkColor50,
                  contentCSSText: `font-family: ${fonts.PoppinsRegular};`,
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(EditStatus || Notesid) ? handleUpdate : handleSave}
            style={styles.closeButton}
          >
            <CustomText
              allowFontScaling={false}
              style={styles.insertButtonText}
            >
              {(EditStatus || Notesid) ? 'Update' : 'Save'}
            </CustomText>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenView >
  );
};

export default AddNotesScreen;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 2,
    paddingBottom: 80,
  },
  orangeBar: {
    // width: '2%',
    // backgroundColor: mainOrangeColor,
    // borderRadius: 4,
    // marginLeft: 0,
    // height: 150,
  },
  noteContainer: {
    flex: 1,
    backgroundColor: mainWhiteColor,
    borderRadius: 10,
    width: '90%',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: mainOrange80,
  },
  titleInput: {
    fontSize: 22,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    paddingVertical: 8,
  },
  h1Title: {
    fontSize: 28,
    fontWeight: fonts.PoppinsSemiBold,
    lineHeight: 36,
    width: '94%',
    color: DarkColor,
    fontFamily: fonts.PoppinsBold,
  },
  toolbarContainer: {
    backgroundColor: mainWhiteColor,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconButton: {
    padding: 10,
    top: RfH(10),
    backgroundColor: mainOrangeColor,
    height: RfH(32),
    width: RfH(32),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarButtonText: {
    fontSize: 20,
    fontWeight: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
  toolbarButton: {
    backgroundColor: 'transparent',
    marginHorizontal: 8,
  },
  toolbarButtonSelected: {
    backgroundColor: mainOrangeColor,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  // Modal styles
  modalContainer: {
    justifyContent: 'center',
    margin: 20,
  },
  modalContent: {
    backgroundColor: mainWhiteColor,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    // marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
    marginBottom: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  insertButton: {
    backgroundColor: mainOrangeColor,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: DarkColor,
    fontFamily: fonts.PoppinsMedium,
  },
  insertButtonText: {
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsSemiBold,
  },
  noteInput: {
    // minHeight: 250,
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'right',
  },
  closeButton: {
    position: 'absolute',
    bottom: RfH(20),
    right: RfW(16),
    height: RfH(44),
    width: RfW(110),
    backgroundColor: mainOrangeColor,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // shadow (Android)
    elevation: 6,
    // shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  insertButtonText: {
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
  }
});
