import { StyleSheet, Text, View, Image, FlatList, TextInput } from 'react-native' // Removed SafeAreaView
import React, { useState } from 'react'
import { fonts, mainWhiteColor, DarkColor, DarkColor60, DarkColor80 } from '../../../../utils/style/fonts';

const TaskCommentScreen = () => {
    const ProfileIcon = require('../../../../assets/Png/ProfileIcon.png');
    const ProfileIcon2 = require('../../../../assets/Png/ProfileIcon2.png');
    const [CommentInput, setCommentInput] = useState('');

    const commentsData = [
        { id: '1', name: 'Rakesh S', comment: 'Updates done from my side', avatar: ProfileIcon },
        { id: '2', name: 'Sam P', comment: '@Rakesh Need your side of updates', avatar: ProfileIcon2 },
        { id: '3', name: 'Priya M', comment: 'I have reviewed the changes. Looks good.', avatar: ProfileIcon2 },
        { id: '4', name: 'Rakesh S', comment: '@Sam P On it, will be done in an hour.', avatar: ProfileIcon },
        { id: '5', name: 'John Doe', comment: 'Can we schedule a follow-up call?', avatar: ProfileIcon2 },
        { id: '6', name: 'Jane Smith', comment: 'Great work team!', avatar: ProfileIcon2 },
        { id: '7', name: 'Rakesh S', comment: '@Priya M Thanks for the feedback!', avatar: ProfileIcon },
        { id: '8', name: 'Alex Ray', comment: 'The client has approved the first draft.', avatar: ProfileIcon2 },
        { id: '9', name: 'Sam P', comment: '@Rakesh Perfect, thank you!', avatar: ProfileIcon2 },
        { id: '10', name: 'Rakesh S', comment: 'All tasks completed.', avatar: ProfileIcon },
    ];


    const renderComment = ({ item }) => {
        const parts = item.comment.split(/(@\w+)/);
        return (
            <View style={styles.commentContainer}>
                <Image source={item.avatar} style={styles.avatar} />
                <View style={styles.commentTextContainer}>
                    <Text style={styles.commenterName}>{item.name}</Text>
                    <Text style={styles.commentText}>
                        {parts.map((part, index) =>
                            part.startsWith('@') ? (
                                <Text key={index} style={styles.mentionText}>{part} </Text>
                            ) : (
                                part
                            )
                        )}
                    </Text>
                </View>
            </View>
        );
    };


    return (
        <View style={styles.container}>

            <FlatList
                data={commentsData}
                renderItem={renderComment}
                keyExtractor={item => item.id}
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Comments</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Add your comment"
                            placeholderTextColor={DarkColor60}
                            multiline={true}
                            value={CommentInput}
                            onChangeText={setCommentInput}
                        />
                    </>
                }
                showsVerticalScrollIndicator={false}

            />

        </View>
    )
}

export default TaskCommentScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: mainWhiteColor,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    title: {
        fontSize: 18, // Adjusted for being an embedded component
        fontFamily: fonts.Bold,
        color: DarkColor,
        marginBottom: 15,
    },
    input: {
        height: 100,
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        textAlignVertical: 'top',
        fontSize: 16,
        fontFamily: fonts.Regular,
        color: DarkColor,
        marginBottom: 25,
    },
    commentContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    commentTextContainer: {
        flex: 1,
    },
    commenterName: {
        fontSize: 16,
        fontFamily: fonts.Bold,
        color: DarkColor,
        marginBottom: 4,
    },
    commentText: {
        fontSize: 16,
        fontFamily: fonts.Regular,
        color: DarkColor80,
        lineHeight: 22,
    },
    mentionText: {
        fontFamily: fonts.Bold,
        color: DarkColor,
    },
    // Removed separator style
})