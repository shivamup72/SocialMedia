import Sound from 'react-native-sound';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  Text,
  Image,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {
  mainWhiteColor,
  mainOrangeColor,
  DarkColor,
  fonts,
  DarkColor80,
  DarkCOlor30,
} from '../../../utils/style/fonts';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import CancelIcon from '../../../assets/svg/CloseSvg';
import Avatar from '../../../components/AvatarComponents/Avatar';
import DocumentPicker from 'react-native-document-picker';
// --- SVG IMPORTS ---
import MicSvgIcon from '../../../assets/svg/MiciconSvg';
import MediaImage from '../../../assets/Png/media.png';
import EmojiImage from '../../../assets/Png/Emoji.webp';
import CameraImage from '../../../assets/Png/cameraoutLine.webp';
import SendSvgIcon from '../../../assets/svg/sendmsmArrowSvg';
import MicImage from '../../../assets/Png/mic.webp';
import PauseIcon from '../../../assets/Png/PauseImage.png';
import DeleteSvg from '../../../assets/svg/DeleteSvg';
import SendSmsSvg from '../../../assets/svg/sendmsmArrowSvg';
import CameraPreviewModal from '../../../components/CameraPreviewModal';
import ShareContentBottomSheet from '../../../components/ShareContentBottomSheet';
import PreviewModal from '../../../components/PreviewModal';
import CustomGallery from '../../../components/CustomGallery';
const inputBackgroundColor = '#F1F5F9';
const iconColor = '#334155';
const placeholderColor = '#94A3B8';
const audioRecorderPlayer = new AudioRecorderPlayer();
import LottieView from 'lottie-react-native';
import { useWebSocket } from '../../../Api/context/WebSocketServices';
import { RfH, RfW } from '../../../utils/helper';
import LottieEmojiPicker from '../LottieEmoji/LottieEmojiPicker';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomText from '../../../utils/CustomText';

const ChatInputBar = ({
  onSend,
  selectedMessage,
  ReplyCheck,
  setReplyCheck,
  isGroup,
  GroupId,
  setSelectedMessage,
  setEditmessagestatus,
  editmessagestatus,
  onEditMessage,
  groupMembers = [],
  onMediaSent,
}) => {
  const [GroupMembers, setGroupMember] = useState([]);
  const textInputRef = useRef(null);
  const route = useRoute()
  const conversationId = route?.params?.conversationId;

  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [sending, setSending] = useState(false);
  const { connect, sendMessage, lastMessage } = useWebSocket();
  const [selectedLottie, setSelectedLottie] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [previewModal, setPreviewModal] = useState({ visible: false, type: null, file: null });
  const [showCustomGallery, setShowCustomGallery] = useState(false);

  const isTyping = typeof message === 'string' && message.trim().length > 0;

  useEffect(() => {
    if (editmessagestatus && selectedMessage && selectedMessage.content) {
      setMessage(selectedMessage.content);
      // Focus the TextInput when entering edit mode
      setTimeout(() => {
        if (textInputRef.current && typeof textInputRef.current.focus === 'function') {
          textInputRef.current.focus();
        }
      }, 100);
    } else if (!editmessagestatus) {
      setMessage('');
    }
    setSelectedLottie(null);
  }, [editmessagestatus, selectedMessage]);

  // No manual emoji-to-Lottie mapping needed. EmojiSelector will handle emoji input.

  const splitEmojis = (str) => {
    if (!str) return [];
    const emojiRegex = /\p{Extended_Pictographic}/gu;
    return str.match(emojiRegex) || [];
  };

  const getLottieUrlForEmoji = (emoji) => {
    if (!emoji) return null;
    const codePoints = [];
    for (const symbol of [...emoji]) {
      const code = symbol.codePointAt(0).toString(16);
      codePoints.push(code);
    }
    const unicodeStr = codePoints.join('-');
    return `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicodeStr}/lottie.json`;
  };

  const handleSendText = () => {
    if (sending) return; // Prevent double send
    setSending(true);
    if (selectedLottie) {
      // Send the emoji key (not the lottie path) in the payload
      if (selectedLottie.key) {
        onSend({ content: '', lottie_emoji: getLottieUrlForEmoji(selectedLottie.key) });
      }
      setSelectedLottie(null);
      setMessage('');
      setSending(false);
      return;
    }
    if (typeof message === 'string' && message.trim().length > 0) {
      if (editmessagestatus && selectedMessage) {
        // Call onEditMessage with the new content
        onEditMessage({ messageId: selectedMessage.id, newContent: message.trim() });
        setEditmessagestatus(false);
        setSelectedMessage(null);
      } else {
        // Send as a new message
        onSend({ content: message.trim() });
      }
      setSending(false);
      setMessage('');
    } else {
      setSending(false);
    }
  };
  // State for Lottie emoji picker
  const [showLottieEmojiPicker, setShowLottieEmojiPicker] = useState(false);

  const handleSendPreview = (fileWithCaption) => {
    console.log("sending preview bjbjbjbjbjbjbbjjbbjbjb", onSend, fileWithCaption);
    setPreviewModal({ visible: false, type: null, file: null });
  };
  // Open the Lottie emoji picker as a bottom sheet
  const handleCancelPreview = () => {
    setPreviewModal({ visible: false, type: null, file: null });
  };
  const handleEmojipicker = () => {
    setShowLottieEmojiPicker(true);
  };

  // Render EmojiSelector inside the LottieEmojiPicker modal
  const renderLottieEmojiPicker = () => (
    <LottieEmojiPicker
      visible={showLottieEmojiPicker}
      onSelect={handleLottieEmojiSelect}
      onClose={() => setShowLottieEmojiPicker(false)}
      bottomSheet
    >
      <EmojiSelector
        category={Categories.all}
        showSearchBar={false}
        showTabs={true}
        showHistory={true}
        KeyboardAvoidingViewBehavior={Platform.OS === 'ios' ? 'padding' : undefined}
        columns={8}
        onEmojiSelected={emoji => {
          // You can map emoji to lottie if needed, or just pass emoji
          handleLottieEmojiSelect({ key: emoji });
        }}
        tabStyle={{ height: 160, fontSize: 30 }}
        tabIconStyle={{ fontSize: 60 }}
        style={{ height: 300 }}
      />
    </LottieEmojiPicker>
  );

  // Handle emoji selection: send as text in payload
  const handleLottieEmojiSelect = (emojiObj) => {
    setShowLottieEmojiPicker(false);
    if (emojiObj?.key) {
      // Send emoji as text content
      const payload = {
        content: emojiObj.key,
      };
      if (isGroup && GroupId) {
        payload.group_id = GroupId;
        payload.is_group = true;
      }
      onSend(payload);
      // playSendSound();
    }
    setSelectedLottie(null);
    setMessage('');
  };

  const startActualRecording = async () => {
    try {
      setIsRecording(true);

      const result = await audioRecorderPlayer.startRecorder();

      audioRecorderPlayer.addRecordBackListener(e => {
        setRecordTime(
          audioRecorderPlayer.mmss(Math.floor(e.currentPosition / 1000)),
        );
        return;
      });
      console.log('Started recording:', result);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Could not start recording.');
      setIsRecording(false);
    }
  };

  const onStartRecord = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
          await startActualRecording();
        } else {
          console.log('Permissions denied');
          Alert.alert(
            'Permissions Required',
            'Please grant permissions to record audio.',
          );
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    } else {
      await startActualRecording();
    }
  };

  const onPauseRecord = async () => {
    try {
      await audioRecorderPlayer.pauseRecorder();
      setIsPaused(true);
      console.log('Recording paused');
    } catch (err) {
      console.error('Failed to pause recorder', err);
    }
  };

  const onResumeRecord = async () => {
    try {
      await audioRecorderPlayer.resumeRecorder();
      setIsPaused(false);
      console.log('Recording resumed');
    } catch (err) {
      console.error('Failed to resume recorder', err);
    }
  };

  const onSendRecord = async () => {
    try {
      const resultUri = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      setIsRecording(false);
      setIsPaused(false);

      console.log('Sending recording. File URI:', resultUri);
      // onSend({type: 'audio', content: {uri: resultUri, duration: recordTime}});
      setRecordTime('00:00');
    } catch (error) {
      console.error('Failed to stop and send recorder', error);
    }
  };

  const onCancelRecord = async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setIsPaused(false);
      setRecordTime('00:00');
      console.log('Recording cancelled');
    } catch (error) {
      console.error('Failed to cancel recorder', error);
    }
  };

  const handleMessageChange = text => {
    setMessage(text);
  };

  useEffect(() => {
    if (
      lastMessage?.data &&
      lastMessage?.message === 'Group profile retrieved'
    ) {
      setGroupMember(lastMessage?.data?.members?.items);
    }
  }, [lastMessage]);

  const renderEditDefaultInput = () => (
    <View style={styles.editContainer}>
      <View style={styles.editHeader}>
        <TouchableOpacity
          onPress={() => setEditmessagestatus(false)}
          style={styles.closeButton}>
          <CancelIcon width={20} height={20} color="#666" />
        </TouchableOpacity>
      </View>
      <View style={styles.editContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {selectedLottie ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <LottieView
                source={selectedLottie.source}
                autoPlay
                loop
                style={{ width: 44, height: 44 }}
              />
              <TouchableOpacity onPress={() => setSelectedLottie(null)} style={{ marginLeft: 8 }}>
                <CustomText style={{ fontSize: 20, color: '#888' }}>✕</CustomText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.textInput, { width: '100%', flex: 1, maxHeight: 120 }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <CustomText style={{ fontSize: 14, fontFamily: fonts.PoppinsRegular, color: DarkColor }}>{message}</CustomText>
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderDefaultInput = () => (
    <>
      {ReplyCheck && (
        <View
          style={[
            styles.replyContainer,
            selectedMessage?.isSender
              ? styles.replyContainerRight
              : styles.replyContainerLeft,
          ]}>
          <View style={styles.replyContent}>
            <CustomText style={styles.replyToText}>
              {editmessagestatus
                ? 'Editing message'
                : `Replying to ${selectedMessage?.isSender ? 'your message' : 'a message'
                }`}
            </CustomText>
            <CustomText style={styles.replyMessageText} numberOfLines={2}>
              {selectedMessage?.content}
            </CustomText>
          </View>
          <TouchableOpacity
            style={{ top: 5, right: 5, position: 'absolute' }}
            onPress={() => {
              setSelectedMessage(null);
              setReplyCheck(false);
              setEditmessagestatus(false);
            }}>
            <CancelIcon width={20} height={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}
      {editmessagestatus && renderEditDefaultInput()}
      <View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >


          <View style={[styles.inputContainer, { flexDirection: 'row', alignItems: 'center', width: '100%' }]}>
            {/* {!editmessagestatus && (
              <TouchableOpacity onPress={handleEmojipicker} style={styles.iconButton}>
                <Image
                  source={EmojiImage}
                  style={{ width: 26, height: 26, tintColor: iconColor }}
                />
              </TouchableOpacity>
            )} */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', flex: 1 }}>
              {selectedLottie ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <LottieView
                    source={selectedLottie.source}
                    autoPlay
                    loop
                    style={{ width: 44, height: 44 }}
                  />
                  <TouchableOpacity onPress={() => setSelectedLottie(null)} style={{ marginLeft: 8 }}>
                    <CustomText style={{ fontSize: 20, color: '#888' }}>✕</CustomText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TextInput
                  ref={textInputRef}
                  allowFontScaling={false}
                  style={[styles.textInput, { width: '90%', flex: 1, maxHeight: 100, right: RfW(10) }]}
                  placeholder={
                    editmessagestatus ? 'Edit your message' : 'Write your message'
                  }
                  placeholderTextColor={placeholderColor}
                  value={message}
                  onChangeText={handleMessageChange}
                  multiline
                  onFocus={() => typeof setHideTabBar === 'function' && setHideTabBar(true)}
                  onBlur={() => typeof setHideTabBar === 'function' && setHideTabBar(false)}
                />
              )}
              {/* Always show media icon, hide camera icon only when typing */}
              {!editmessagestatus && (
                <>
                  <TouchableOpacity style={[styles.iconButton, { right: 20 }]} onPress={() => setShowShareSheet(true)}>
                    <Image
                      source={MediaImage}
                      style={{ width: 19, height: 19, tintColor: iconColor }}
                    />
                  </TouchableOpacity>
                  {!isTyping && (
                    <TouchableOpacity
                      style={[styles.iconButton, { right: 14 }]}
                      onPress={() => {
                        setShowCameraModal(true);
                      }}
                    >
                      <Image
                        source={CameraImage}
                        style={{ width: 19, height: 19, tintColor: iconColor }}
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
          <View>
            {(isTyping || selectedLottie) ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendText}
                disabled={sending}
              >
                {editmessagestatus ? (
                  <SendSmsSvg color="#ffffff" width={20} height={20} />
                ) : (
                  <SendSvgIcon color="#ffffff" width={20} height={20} />
                )}
              </TouchableOpacity>
            ) : (
              !editmessagestatus && (
                <TouchableOpacity
                  onPress={onStartRecord}
                  style={styles.iconButton}>
                  <Image
                    source={MicImage}
                    style={{ width: 30, height: 30, }}
                  />
                </TouchableOpacity>
              )
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
      {/* Lottie Emoji Picker as bottom sheet with EmojiSelector */}
      {renderLottieEmojiPicker()}
      {/* WhatsApp-style Preview Modal */}
      <PreviewModal
        visible={previewModal.visible}
        file={previewModal.file}
        type={previewModal.type}
        onSend={handleSendPreview}
        onCancel={handleCancelPreview}
        conversation_id={conversationId}
        recipient_id={GroupId}
        is_group={isGroup}
        onMediaSent={onMediaSent}
      />
      {/* Camera Preview Modal */}
      <CameraPreviewModal
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onConfirm={handleSendCameraPhoto}
      />

      <ShareContentBottomSheet
        visible={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        onSelect={handleShareSelect}
      />
      <CustomGallery
        visible={showCustomGallery}
        onClose={() => setShowCustomGallery(false)}
        onSelect={handleCustomGallerySelect}
      />
    </>
  );

  const handleSendCameraPhoto = (photo) => {
    if (photo?.path) {
      // You can adjust payload as needed for your chat logic
      // onSend({ type: 'image', uri: photo.path });
      console.log("sending photo");

    }
    setShowCameraModal(false);
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      // For Android 13+ (API 33+), request READ_MEDIA_IMAGES
      const apiLevel = Platform.constants?.Release ? parseInt(Platform.constants.Release, 10) : 0;
      if (apiLevel >= 13) {
        const granted = await PermissionsAndroid.request(
          'android.permission.READ_MEDIA_IMAGES'
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const handleShareSelect = async (key) => {
    console.log('Selected:', key); // Debug log
    setShowShareSheet(false);
    try {
      if (key === 'camera') {
        launchCamera({ mediaType: 'photo', includeBase64: false }, (response) => {
          if (response.assets && response.assets.length > 0) {
            setPreviewModal({ visible: true, type: 'image', file: response.assets[0] });
          }
        });
      } else if (key === 'media') {
        const hasPerm = await requestGalleryPermission();
        if (!hasPerm) {
          Alert.alert('Permission required', 'Please allow gallery access.');
          return;
        }
        setShowCustomGallery(true);
      } else if (key === 'documents') {
        const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.allFiles] });
        setPreviewModal({ visible: true, type: 'document', file: res });
      } else if (key === 'audio') {
        const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.audio] });
        setPreviewModal({ visible: true, type: 'audio', file: res });
      }
      // Add location logic if needed
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick file.');
      }
    }
  };

  const handleCustomGallerySelect = (item) => {
    setShowCustomGallery(false);
    setPreviewModal({ visible: true, type: 'image', file: item });
  };

  const renderRecordingUI = () => (
    <View style={styles.container}>
      <TouchableOpacity onPress={onCancelRecord} style={styles.iconButton}>
        <DeleteSvg color="red" width="18" height="18" />
      </TouchableOpacity>

      <View style={styles.recordingInfoContainer}>
        <CustomText style={styles.recordTimeText}>{recordTime}</CustomText>
        <CustomText style={styles.waveformText}>{''.padStart(20, '･･')}</CustomText>

        <TouchableOpacity onPress={isPaused ? onResumeRecord : onPauseRecord}>
          {isPaused ? (
            <MicSvgIcon width={28} height={28} color="red" />
          ) : (
            <View>
              <Image
                source={PauseIcon}
                style={{
                  width: 32,
                  height: 32,
                  borderWidth: 1,
                  borderColor: 'red',
                  borderRadius: 16,
                }}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.sendRecordButton} onPress={onSendRecord}>
        <SendSvgIcon color="#ffffff" width={20} height={20} />
      </TouchableOpacity>


    </View>
  );
  return <>{isRecording ? renderRecordingUI() : renderDefaultInput()}</>;
};
export default ChatInputBar;

const styles = StyleSheet.create({
  // Mention styles
  mentionModal: {
    position: 'absolute',
    bottom: 60,
    width: RfW(280),
    backgroundColor: mainWhiteColor,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1000,
    overflow: 'hidden',
    paddingVertical: RfH(10),
    alignSelf: 'center',
  },
  mentionSearch: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    color: DarkColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
  },
  mentionListContainer: {
    flex: 1,
  },
  previewBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#111',
  },
  mentionList: {
    width: '100%',
    minHeight: RfH(100),
  },
  mentionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    minHeight: RfH(60),
  },
  mentionAvatar: {
    width: RfW(36),
    height: RfH(36),
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: mainOrangeColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mentionName: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    marginBottom: 2,
  },
  mentionEmail: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80,
  },

  // Overlay for modal
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    alignSelf: 'flex-start',
  },
  // Existing styles
  editContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 12,
    maxHeight: RfH(280),
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 3,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  editContent: {
    marginBottom: 2,
    justifyContent: 'flex-end',
    // flex: 1,
  },
  messageText: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor
  },
  originalMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  editInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: mainOrangeColor,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: mainOrangeColor,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 5,
    marginTop: 8,
    borderRadius: 4,
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
    borderRightWidth: 0.5,
    borderRightColor: '#e0e0e0',
  },
  replyContainerRight: {
    borderLeftColor: mainOrangeColor,
  },
  replyContainerLeft: {
    borderLeftColor: DarkColor,
  },
  replyContent: {
    flex: 1,
    marginRight: 8,
  },
  replyToText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'Poppins-Medium',
  },
  replyMessageText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  cancelButton: {
    padding: 4,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: inputBackgroundColor,
    borderRadius: 25,
    marginHorizontal: 8,
  },
  textInput: {
    minHeight: 45,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 1,
    fontSize: 16,
    color: '#000',
    left: 1
  },
  sendButton: {
    backgroundColor: mainOrangeColor,
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
    paddingTop: 1,
  },
  iconButton: {
    padding: 8,
    paddingRight: 0,
  },
  // Recording UI Styles
  recordingInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  recordTimeText: {
    fontSize: 16,
    color: iconColor,
    fontWeight: '500',
  },
  waveformText: {
    color: iconColor,
    letterSpacing: 1,
  },
  sendRecordButton: {
    backgroundColor: '#10B981',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
