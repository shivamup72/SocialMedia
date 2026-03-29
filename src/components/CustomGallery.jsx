import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Modal,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    PermissionsAndroid,
    Platform,
    Alert,
    ActivityIndicator,
    Text
} from 'react-native';

import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import { fonts } from '../utils/style/fonts';

const numColumns = 3;
const { width } = Dimensions.get('window');
const imageSize = width / numColumns - 8;

const FILTERS = [
    { label: 'All', value: 'All' },
    { label: 'Photos', value: 'Photos' },
    { label: 'Videos', value: 'Videos' },
];

// fallback function to get size
const getFileSize = async (uri) => {
    try {
        const stat = await RNFS.stat(uri);
        return stat.size;
    } catch (e) {
        console.log('Size error:', e);
        return 0;
    }
};

const CustomGallery = ({ visible, onClose, onSelect }) => {

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(true);

    // ================= Permission =================
    const requestGalleryPermission = async () => {

        if (Platform.OS === 'android') {

            try {

                if (Platform.Version >= 33) {

                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    );

                    return granted === PermissionsAndroid.RESULTS.GRANTED;

                } else {

                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                    );

                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }

            } catch (err) {
                console.log(err);
                return false;
            }
        }

        return true;
    };

    // ================= Fetch Gallery =================
    const fetchGalleryImages = useCallback(async (filterType = 'All', loadMore = false) => {

        if (loading) return;

        setLoading(true);

        const hasPerm = await requestGalleryPermission();

        if (!hasPerm) {
            Alert.alert('Permission required', 'Please allow gallery access.');
            setLoading(false);
            return;
        }

        try {

            const photos = await CameraRoll.getPhotos({
                first: 50,
                assetType: filterType,
                after: loadMore ? endCursor : undefined,
                include: ['filename', 'fileSize', 'imageSize', 'playableDuration'],
            });

            const newImages = photos.edges.map((edge, index) => ({
                id: edge.node.image.uri + index,
                uri: edge.node.image.uri,
                type: edge.node.type,
                file_name: edge.node.image.filename,
                file_size: edge.node.image.fileSize,
            }));

            setImages(prev =>
                loadMore ? [...prev, ...newImages] : newImages
            );

            setEndCursor(photos.page_info.end_cursor);
            setHasNextPage(photos.page_info.has_next_page);

        } catch (error) {

            console.log('Gallery error:', error);
            Alert.alert('Error', 'Unable to load gallery.');
        }

        setLoading(false);

    }, [endCursor, loading]);

    // ================= Load On Open =================
    useEffect(() => {
        if (visible) {
            setImages([]);
            setEndCursor(null);
            setHasNextPage(true);
            setLoading(true); // Reset loading state on open/filter change
            fetchGalleryImages(selectedFilter);
        } else {
            setLoading(false); // Hide loading when modal is closed
        }
    }, [visible, selectedFilter]);

    // ================= Render Item =================
    const renderItem = ({ item }) => (

        <TouchableOpacity
            style={styles.imageWrapper}
            onPress={async () => {

                let size = item.file_size;

                if (!size) {
                    size = await getFileSize(item.uri);
                }

                const fileData = {
                    uri: item.uri,
                    name: item.file_name || `media_${Date.now()}`,
                    size,
                    type: item.type?.includes('video') ? 'video/mp4' : 'image/jpeg',
                };

                onSelect(fileData);
                onClose();
            }}
        >

            <Image
                source={{ uri: item.uri }}
                style={styles.image}
            />

        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose}>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/multiply.png' }}
                                style={{ width: 24, height: 24 }}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Filter Bar */}
                    <View style={styles.filterBar}>
                        {FILTERS.map(filter => (
                            <TouchableOpacity
                                key={filter.value}
                                style={[
                                    styles.filterButton,
                                    selectedFilter === filter.value && styles.filterButtonActive,
                                ]}
                                onPress={() => setSelectedFilter(filter.value)}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        selectedFilter === filter.value && styles.filterTextActive,
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Gallery */}
                    <FlatList
                        data={images}
                        keyExtractor={item => item.id}
                        numColumns={numColumns}
                        renderItem={renderItem}
                        contentContainerStyle={styles.gallery}
                        onEndReached={() => {
                            if (hasNextPage) {
                                fetchGalleryImages(selectedFilter, true);
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            loading ? <ActivityIndicator size="small" /> : null
                        }
                    />
                </View>
            </View>
        </Modal>
    );

};

export default CustomGallery;

// ================= Styles =================
const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },

    container: {
        backgroundColor: '#fff',
        maxHeight: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    header: {
        padding: 16,
        alignItems: 'flex-end',
    },

    gallery: {
        padding: 4,
    },

    imageWrapper: {
        margin: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },

    image: {
        width: imageSize,
        height: imageSize,
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: '#f7f7f7',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#eee',
        marginHorizontal: 4,
        minWidth: 100,
        alignItems: 'center',

    },
    filterButtonActive: {
        backgroundColor: '#ff9800',
    },
    filterText: {
        color: '#333',
        fontFamily: fonts.PoppinsMedium,
        fontSize: 12,
    },
    filterTextActive: {
        color: '#fff',
        fontFamily: fonts.PoppinsMedium,
        fontSize: 12,
    },
});