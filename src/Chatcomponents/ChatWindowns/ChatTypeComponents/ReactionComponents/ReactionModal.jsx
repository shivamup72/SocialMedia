import React, { useState, useEffect, memo, useMemo } from 'react';
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
        <Pressable style={modalStyles.modalOverlay} onPress={onClose}>
          <Pressable style={modalStyles.modalContent} onPress={() => { }}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>
                {reactions.length}{' '}
                {reactions.length === 1 ? 'Reaction' : 'Reactions'}
              </Text>
              <TouchableOpacity
                style={modalStyles.closeButton}
                onPress={onClose}>
                <CloseSvg width={25} height={25} />
              </TouchableOpacity>
            </View>

            <View style={modalStyles.reactionTabs}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    modalStyles.reactionTab,
                    !selectedEmoji && modalStyles.selectedTab,
                  ]}
                  onPress={() => setSelectedEmoji(null)}>
                  <Text style={modalStyles.reactionTabEmoji}>All</Text>
                  <Text style={modalStyles.reactionTabCount}>
                    {reactions.length}
                  </Text>
                </TouchableOpacity>

                {Object.entries(reactionsByEmoji).map(([emoji, data]) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      modalStyles.reactionTab,
                      selectedEmoji === emoji && modalStyles.selectedTab,
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}>
                    <Text style={modalStyles.reactionTabEmoji}>{emoji}</Text>
                    <Text style={modalStyles.reactionTabCount}>
                      {data.count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ScrollView style={modalStyles.usersList}>
              {displayedUserReactions.map((reactionUser, index) => (
                <View
                  key={`${reactionUser.id}-${reactionUser.reaction_id || index
                    }`}
                  style={modalStyles.userRow}>
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
                        <Text style={{ fontSize: 18, color: '#555', fontWeight: 'bold' }}>
                          {(() => {
                            if (!reactionUser.name) return 'U';
                            const parts = reactionUser.name.trim().split(' ');
                            if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
                            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                          })()}
                        </Text>
                      </View>
                    )}
                    <Text style={modalStyles.userName}>
                      {String(currentUserId) === String(reactionUser.id) ? 'You' : reactionUser.name || reactionUser.email}
                    </Text>
                  </View>
                  <View style={modalStyles.userReactionDetails}>
                    {String(currentUserId) === String(reactionUser.id) && (
                      <TouchableOpacity
                        style={modalStyles.removeButton}
                        onPress={() => handleRemoveReaction(reactionUser)}>
                        <Text style={modalStyles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
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
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '70%',
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
    maxHeight: 'auto',
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
