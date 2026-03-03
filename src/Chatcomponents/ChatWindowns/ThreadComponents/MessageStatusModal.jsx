import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { DarkColor, fonts } from '../../../utils/style/fonts';
import ReadChatReactionSvg from '../../../assets/svg/ReadChatReactionSvg';
import DeliveredChatReactionSvg from '../../../assets/svg/DeliveredChatReactionSvg';
import NotSendChatReactionSvg from '../../../assets/svg/NotSendChatReactionSvg';
import SendChatRectionSvg from '../../../assets/svg/SendChatRectionSvg';
import { ExportformatTime } from '../../../utils/CommonUtils';
import CustomText from '../../../utils/CustomText';

export const MessageStatusModal = ({ visible, onClose, statusList }) => {
  const sortOrder = {
    read: 1,
    delivered: 2,
    sent: 3,
    not_sent: 4,
  };

  const sortedStatusList = [...(statusList || [])].sort(
    (a, b) => (sortOrder[a?.status] || 99) - (sortOrder[b?.status] || 99),
  );

  // console.log(sortedStatusList, "sortedStatusList==================");


  const renderStatusItem = ({ item }) => (
    <View style={styles.statusItem}>
      <View>
        <CustomText style={styles.recipientName}>
          {item?.recipient?.name || item?.recipient?.email}
        </CustomText>
        <CustomText style={styles.recipientName}>
          {ExportformatTime(item?.updated_at)}
        </CustomText>
      </View>

      {item?.status === 'read' ? (
        <ReadChatReactionSvg />
      ) : item?.status === 'delivered' ? (
        <DeliveredChatReactionSvg color={DarkColor} />
      ) : item?.status === 'sent' ? (
        <SendChatRectionSvg color={DarkColor} width="9" height="9" />
      ) : (
        <NotSendChatReactionSvg color={DarkColor} width="10" height="10" />
      )}
    </View>
  );

  // console.log('sortedStatusList length -=-=-=---->', sortedStatusList.length);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.touchableOverlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <CustomText style={styles.modalTitle}>Message Info</CustomText>
          <View style={styles.statusList}>
            <FlatList
              data={sortedStatusList}
              renderItem={renderStatusItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recipientName: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor,
  },
  statusText: {
    fontSize: 13,
    fontFamily: fonts.PoppinsMedium,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  readStatus: {
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  deliveredStatus: {
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
});
