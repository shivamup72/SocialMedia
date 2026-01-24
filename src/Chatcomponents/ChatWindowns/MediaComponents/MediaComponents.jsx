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
// --- SVG IMPORTS ---
import MicSvgIcon from '../../../assets/svg/MiciconSvg';
import AddMediaSvg from '../../../assets/svg/AddMediaSvg';
import MediaImage from '../../../assets/Png/media.png';
import EmojiImage from '../../../assets/Png/Emoji.webp';
import CameraImage from '../../../assets/Png/cameraoutLine.webp';
import SendSvgIcon from '../../../assets/svg/sendmsmArrowSvg';
import MicImage from '../../../assets/Png/mic.webp';
import PauseIcon from '../../../assets/Png/PauseImage.png';
import DeleteSvg from '../../../assets/svg/DeleteSvg';
import SendSmsSvg from '../../../assets/svg/sendmsmArrowSvg';
const inputBackgroundColor = '#F1F5F9';
const iconColor = '#334155';
const placeholderColor = '#94A3B8';
const audioRecorderPlayer = new AudioRecorderPlayer();
import LottieView from 'lottie-react-native';
import { useWebSocket } from '../../../Api/context/WebSocketServices';
import { RfH, RfW } from '../../../utils/helper';
import LottieEmojiPicker from '../LottieEmoji/LottieEmojiPicker';
import { launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';

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
  groupMembers = [], // Array of {id, name, profile_picture} for group members
}) => {
  // For @mention functionality
  const navigation = useNavigation();
  const [showMentionModal, setShowMentionModal] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  const [filteredMentions, setFilteredMentions] = useState([]);
  const [GroupMembers, setGroupMember] = useState([]);
  const textInputRef = useRef(null);
  // console.log(
  //   'selectedMessage MediaComponents -=----->',
  //   JSON.stringify(selectedMessage),
  //   editmessagestatus,
  // );

  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const { connect, sendMessage, lastMessage } = useWebSocket();
  const [selectedLottie, setSelectedLottie] = useState(null);

  const isTyping = typeof message === 'string' && message.trim().length > 0;

  useEffect(() => {
    if (editmessagestatus && selectedMessage && selectedMessage.content) {
      setMessage(selectedMessage.content);
    } else if (!editmessagestatus) {
      setMessage('');
    }
    setSelectedLottie(null);
  }, [editmessagestatus, selectedMessage]);

  // Lottie animation mapping for emoji keys
  const lottieMap = {
    smile: require('../../../assets/LottieEmoji/emoji1.json'),
    thumbsup: require('../../../assets/LottieEmoji/emoj2.json'),
    heart: require('../../../assets/LottieEmoji/emoji3.json'),
    // Add more if you add more to LOTTIE_EMOJIS
  };

  // Use the same emojiCharMap as LOTTIE_EMOJIS in LottieEmojiPicker
  const emojiCharMap = {
    smile: require('../../../assets/LottieEmoji/emoji1.json'),
    thumbsup: require('../../../assets/LottieEmoji/emoji1.json'),
    heart: require('../../../assets/LottieEmoji/emoji1.json'),
    // Add more if you add more to LOTTIE_EMOJIS
  };

  const handleSendText = () => {
    if (selectedLottie) {
      // Send the emoji key (not the lottie path) in the payload
      if (selectedLottie.key) {
        onSend({ content: '', lottie_emoji: selectedLottie.key });
      }
      setSelectedLottie(null);
      setMessage('');
      return;
    }
    if (typeof message === 'string' && message.trim().length > 0) {
      if (editmessagestatus && selectedMessage) {
        onEditMessage({
          messageId: selectedMessage.id,
          newContent: message.trim(),
        });
        setEditmessagestatus(false);
        setSelectedMessage(null);
      } else {
        onSend({ content: message.trim() });
      }
      setMessage('');
    }
  };
  // State for Lottie emoji picker
  const [showLottieEmojiPicker, setShowLottieEmojiPicker] = useState(false);

  // Open the Lottie emoji picker as a bottom sheet
  const handleEmojipicker = () => {
    setShowLottieEmojiPicker(true);
  };

  // Handle Lottie emoji selection: send immediately, no preview
  const handleLottieEmojiSelect = (emojiObj) => {
    setShowLottieEmojiPicker(false);
    if (emojiObj?.key) {
      // Build the same payload as normal text, including group/private info
      const payload = {
        content: '',
        lottie_emoji: emojiObj.key,
      };
      // Add group/private chat info if available
      if (isGroup && GroupId) {
        payload.group_id = GroupId;
        payload.is_group = true;
      }
      onSend(payload);
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
  // console.log('GroupMembers --=---->', JSON.stringify(GroupMembers));
  const handleSelectMention = user => {
    const textBefore = message.substring(0, mentionPosition.start);
    const textAfter = message.substring(mentionPosition.end);
    // if(user.name === ''){//}
    const mentionText = `${user.name || user.email.split('@')[0]} `;
    setMessage(textBefore + mentionText + textAfter);
    setShowMentionModal(false);
    setMentionSearch('');
  };

  // const renderMentionItem = ({ item }) => {
  //   const displayName = item.name || item.email.split('@')[0];
  //   const email = item.email;
  //   const isEmail = !item.name;

  //   return (
  //     <TouchableOpacity
  //       style={styles.mentionItem}
  //       onPress={() => handleSelectMention(item)}>
  //       <View style={styles.mentionAvatar}>
  //         {item.avatar ? (
  //           <Image
  //             source={{ uri: item.avatar }}
  //             style={{ width: 36, height: 36, borderRadius: 18 }}
  //           />
  //         ) : (
  //           <Avatar
  //             name={item.name || item.email.split('@')[0]}
  //             size={35}
  //             borderRadius={25}
  //             fontSize={15}
  //           />
  //         )}
  //       </View>
  //       <View>
  //         <Text style={styles.mentionName}>
  //           {displayName}
  //           {item.is_admin && ' 👑'}
  //         </Text>
  //         {!isEmail && <Text style={styles.mentionEmail}>{email}</Text>}
  //       </View>
  //     </TouchableOpacity>
  //   );
  // };

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
                <Text style={{ fontSize: 20, color: '#888' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TextInput
              ref={textInputRef}
              allowFontScaling={false}
              style={styles.textInput}
              placeholder={
                editmessagestatus ? 'Edit your message' : 'Write your message'
              }
              placeholderTextColor={placeholderColor}
              value={message}
              onChangeText={handleMessageChange}
              multiline
            />
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
            <Text style={styles.replyToText}>
              {editmessagestatus
                ? 'Editing message'
                : `Replying to ${selectedMessage?.isSender ? 'your message' : 'a message'
                }`}
            </Text>
            <Text style={styles.replyMessageText} numberOfLines={2}>
              {selectedMessage?.content}
            </Text>
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

          {!editmessagestatus && (
            <TouchableOpacity onPress={handleEmojipicker} style={styles.iconButton}>
              <Image
                source={EmojiImage}
                style={{ width: 26, height: 26, tintColor: iconColor }}
              />
            </TouchableOpacity>
          )}
          <View style={styles.inputContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              {selectedLottie ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <LottieView
                    source={selectedLottie.source}
                    autoPlay
                    loop
                    style={{ width: 44, height: 44 }}
                  />
                  <TouchableOpacity onPress={() => setSelectedLottie(null)} style={{ marginLeft: 8 }}>
                    <Text style={{ fontSize: 20, color: '#888' }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TextInput
                  ref={textInputRef || ''}
                  allowFontScaling={false}
                  style={[styles.textInput, { width: '100%', flex: 1 }]}
                  placeholder={
                    editmessagestatus ? 'Edit your message' : 'Write your message'
                  }
                  placeholderTextColor={placeholderColor}
                  value={message}
                  onChangeText={handleMessageChange}
                  multiline
                />
              )}
              {!editmessagestatus && (
                <TouchableOpacity style={[styles.iconButton, { right: 20 }]}>
                  <Image
                    source={MediaImage}
                    style={{ width: 19, height: 19, tintColor: iconColor }}
                  />
                </TouchableOpacity>)}
              {!editmessagestatus && (
                <TouchableOpacity style={[styles.iconButton, { right: 14 }]}>
                  <Image
                    source={CameraImage}
                    style={{ width: 19, height: 19, tintColor: iconColor }}
                  />
                </TouchableOpacity>)}
            </View>
            {/* Mention Suggestions Modal */}
            {/* {isGroup && showMentionModal && (
            <>
              <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={() => setShowMentionModal(false)}
              />
              <View style={styles.mentionModal}>
                <TextInput
                  style={styles.mentionSearch}
                  placeholder="Search group members..."
                  placeholderTextColor={DarkCOlor30}
                  value={mentionSearch}
                  onChangeText={setMentionSearch}
                  autoFocus={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.mentionListContainer}>
                  <FlatList
                    data={GroupMembers.filter(
                      member =>
                        member.name
                          ?.toLowerCase()
                          .includes(mentionSearch.toLowerCase()) ||
                        member.email
                          ?.toLowerCase()
                          .includes(mentionSearch.toLowerCase()),
                    )}
                    renderItem={renderMentionItem}
                    keyExtractor={item => item?.id?.toString()}
                    keyboardShouldPersistTaps="always"
                    style={styles.mentionList}
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={{ paddingBottom: 10 }}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    getItemLayout={(data, index) => ({
                      length: 60, // Height of each item
                      offset: 60 * index,
                      index,
                    })}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                  />
                </View>
              </View>
            </>
          )} */}
          </View>
          <View>
            {(isTyping || selectedLottie) ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendText}
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
      {/* Lottie Emoji Picker as bottom sheet */}
      <LottieEmojiPicker
        visible={showLottieEmojiPicker}
        onSelect={handleLottieEmojiSelect}
        onClose={() => setShowLottieEmojiPicker(false)}
        bottomSheet // Pass a prop to render as bottom sheet
      />
    </>
  );

  const renderRecordingUI = () => (
    <View style={styles.container}>
      <TouchableOpacity onPress={onCancelRecord} style={styles.iconButton}>
        <DeleteSvg color="red" width="18" height="18" />
      </TouchableOpacity>

      <View style={styles.recordingInfoContainer}>
        <Text style={styles.recordTimeText}>{recordTime}</Text>
        <Text style={styles.waveformText}>{''.padStart(20, '･･')}</Text>

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
