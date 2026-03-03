import React, { useState, useEffect, memo, useMemo } from 'react';
import { FlatList } from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import CloseSvg from '../../../../assets/svg/CloseSvg';
import Avatar from '../../../../components/AvatarComponents/Avatar';
import { fonts, DarkColor60, DarkColor } from '../../../../utils/style/fonts';
import AsyncStorage1 from '../../../../Api/config/AsyncStorage';
import CustomText from '../../../../utils/CustomText';

const ReactionDetailsModal = memo(
  ({ isVisible, onClose, reactions, onRemoveReaction, isGroup, messageItem }) => {
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedEmoji, setSelectedEmoji] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await AsyncStorage1.getItem('userLoginResponse');
          setCurrentUserId(res?.data?.user?.id);
        } catch (err) {
          console.log('Error fetching user data in ReactionDetailsModal', err);
        }
      };
      fetchData();
    }, []);


    // Always call hooks in the same order, never conditionally
    const hasReactions = Array.isArray(reactions) && reactions.length > 0;
    const hasMessage = !!messageItem && !!messageItem.id;


    // Reset selectedEmoji if modal is closed or data is invalid
    useEffect(() => {
      if (!isVisible || !hasReactions || !hasMessage) {
        setSelectedEmoji(null);
      }
    }, [isVisible, hasReactions, hasMessage]);

    if (!hasReactions || !hasMessage) {
      return null;
    }

    const reactionsByEmoji = useMemo(() => {
      return reactions.reduce((acc, reaction) => {
        const emoji = reaction?.reaction;
        const userId = reaction?.id;
        const userName = reaction?.name || reaction?.email;
        const userAvatar = reaction?.avatar;
        const userEmail = reaction?.email;
        const reactionId = reaction?.reaction_id;

        if (!acc[emoji]) {
          acc[emoji] = {
            count: 0,
            users: [],
          };
        }
        acc[emoji].count++;

        acc[emoji].users.push({
          id: userId,
          name: userName || 'User',
          avatar: userAvatar,
          email: userEmail,
          reaction_id: reactionId,
          reaction_emoji: emoji,
        });

        return acc;
      }, {});
    }, [reactions]);

    const displayedUserReactions = useMemo(() => {
      if (selectedEmoji) {
        return reactionsByEmoji[selectedEmoji]?.users || [];
      }
      return Object.values(reactionsByEmoji).flatMap(data => data.users);
    }, [selectedEmoji, reactionsByEmoji]);

    const handleRemoveReaction = async (reactionUserDetail) => {
      if (!onRemoveReaction || !messageItem) return;
      const payload = {
        action: 'remove_reaction',
        message_id: messageItem?.id,
        reaction_id: reactionUserDetail?.reaction_id,
        user_id: reactionUserDetail?.id, // Add user_id for local filter
        reaction: reactionUserDetail?.reaction_emoji, // Add reaction for local filter
        is_group: isGroup ? true : false,
      };
      console.log('Remove payload:', payload);
      await onRemoveReaction(payload);
      if (onClose) onClose();
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}>
        <TouchableOpacity style={modalStyles.modalOverlay} onPress={onClose} activeOpacity={0.9}></TouchableOpacity>
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <CustomText style={modalStyles.modalTitle}>
              {reactions.length}{' '}
              {reactions.length === 1 ? 'Reaction' : 'Reactions'}
            </CustomText>
            <TouchableOpacity
              style={modalStyles.closeButton}
              onPress={onClose}>
              <CloseSvg width={25} height={25} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.reactionTabs}>
            <FlatList
              data={[{ key: 'all', emoji: 'All', count: reactions.length }, ...Object.entries(reactionsByEmoji).map(([emoji, data]) => ({ key: emoji, emoji, count: data.count }))]}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    modalStyles.reactionTab,
                    (selectedEmoji === item.emoji || (item.key === 'all' && !selectedEmoji)) && modalStyles.selectedTab,
                  ]}
                  onPress={() => item.key === 'all' ? setSelectedEmoji(null) : setSelectedEmoji(item.emoji)}>
                  <CustomText style={modalStyles.reactionTabEmoji}>{item.emoji}</CustomText>
                  <CustomText style={modalStyles.reactionTabCount}>{item.count}</CustomText>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ alignItems: 'center' }}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 44 }}
            />
          </View>
          <View style={{ maxHeight: 360 }}>
            {displayedUserReactions.length > 0 ? (
              <FlatList
                data={displayedUserReactions}
                keyExtractor={(reactionUser, index) => `${reactionUser.id}-${reactionUser.reaction_id || index}`}
                style={[modalStyles.usersList, { flexGrow: 1 }]} // Removed maxHeight and height to allow FlatList to use flex for scrolling
                contentContainerStyle={{ flexGrow: 1 }}
                renderItem={({ item: reactionUser, index }) => (
                  <View style={modalStyles.userRow}>
                    <View style={modalStyles.userInfo}>
                      {reactionUser.avatar ? (
                        <Avatar
                          avatarUri={reactionUser.avatar}
                          name={reactionUser.name || 'User'}
                          email={reactionUser.email || ''}
                          size={40}
                          borderRadius={20}
                          fontSize={18}
                        />
                      ) : (
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: '#e0e0e0',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <CustomText style={{ fontSize: 18, color: '#555', fontWeight: 'bold' }}>
                            {(() => {
                              if (!reactionUser.name) return 'U';
                              const parts = reactionUser.name.trim().split(' ');
                              if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
                              return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                            })()}
                          </CustomText>
                        </View>
                      )}
                      <CustomText style={modalStyles.userName}>
                        {String(currentUserId) === String(reactionUser.id) ? 'You' : reactionUser.name || reactionUser.email}
                      </CustomText>
                    </View>
                    <View style={modalStyles.userReactionDetails}>
                      {String(currentUserId) === String(reactionUser.id) && (
                        <TouchableOpacity
                          style={modalStyles.removeButton}
                          onPress={() => handleRemoveReaction(reactionUser)}>
                          <CustomText style={modalStyles.removeButtonText}>Remove</CustomText>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
                keyboardShouldPersistTaps="always"
                removeClippedSubviews={true}
              // windowSize={10}
              // initialNumToRender={10}
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <CustomText style={{ color: '#888', fontSize: 16 }}>No reactions found.</CustomText>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  },
);

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '60%',
    paddingBottom: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DarkColor,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  reactionTabs: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  reactionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  selectedTab: {
    backgroundColor: '#e3f3ff',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  reactionTabEmoji: {
    fontSize: 15,
    marginRight: 6,
    color: DarkColor,
  },
  reactionTabCount: {
    fontSize: 13,
    color: DarkColor60,
    fontWeight: '600',
  },
  usersList: {
    width: '100%',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f5f5f5',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: DarkColor,
    marginLeft: 10,
  },
  userReactionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userReactionEmoji: {
    fontSize: 20,
    marginRight: 15,
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
  },
  removeButtonText: {
    color: DarkColor,
    fontSize: 13,
    fontFamily: fonts.PoppinsRegular,
    marginTop: 2,
  },
});

export default ReactionDetailsModal;
