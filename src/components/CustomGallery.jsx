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
} from 'react-native';
import CustomText from '../utils/CustomText';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { DarkColor, fonts, mainOrangeColor, mainWhiteColor } from '../utils/style/fonts';
import { RfH } from '../utils/helper';

const numColumns = 3;
const { width } = Dimensions.get('window');
const imageSize = width / numColumns - 8;

const FILTERS = [
    { label: 'All', value: 'All' },
    { label: 'Photos', value: 'Photos' },
    { label: 'Videos', value: 'Videos' },
];

const CustomGallery = ({ visible, onClose, onSelect }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(true);

    // =========================
    // Permission
    // =========================
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

    // =========================
    // Fetch Gallery (Pagination)
    // =========================
    const fetchGalleryImages = useCallback(
        async (filterType = 'All', loadMore = false) => {
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
                    first: 50, // batch size
                    assetType: filterType,
                    after: loadMore ? endCursor : undefined,
                });

                const newImages = photos.edges.map((edge, index) => ({
                    id: edge.node.image.uri + index,
                    uri: edge.node.image.uri,
                    type: edge.node.type,
                }));

                setImages(prev =>
                    loadMore ? [...prev, ...newImages] : newImages
                );

                setEndCursor(photos.page_info.end_cursor);
                setHasNextPage(photos.page_info.has_next_page);
            } catch (error) {
                console.log('Gallery Error:', error);
                Alert.alert('Error', 'Unable to load gallery.');
            }

            setLoading(false);
        },
        [endCursor, loading]
    );

    // =========================
    // Reset When Open / Filter Change
    // =========================
    useEffect(() => {
        if (visible) {
            setImages([]);
            setEndCursor(null);
            setHasNextPage(true);
            fetchGalleryImages(selectedFilter);
        }
    }, [visible, selectedFilter]);

    // =========================
    // Render Item
    // =========================
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.imageWrapper}
            onPress={() => onSelect(item)}
        >
            <Image source={{ uri: item.uri }} style={styles.image} />
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
                        <CustomText style={styles.title}>Gallery</CustomText>
                        <TouchableOpacity onPress={onClose}>
                            <CustomText style={styles.close}>×</CustomText>
                        </TouchableOpacity>
                    </View>

                    {/* Filter Bar */}
                    <View style={styles.filterBar}>
                        {FILTERS.map(filter => (
                            <TouchableOpacity
                                key={filter.value}
                                style={[
                                    styles.filterButton,
                                    selectedFilter === filter.value &&
                                    styles.filterButtonActive,
                                ]}
                                onPress={() => setSelectedFilter(filter.value)}
                            >
                                <CustomText
                                    style={[
                                        styles.filterText,
                                        selectedFilter === filter.value &&
                                        styles.filterTextActive,
                                    ]}
                                >
                                    {filter.label}
                                </CustomText>
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
                            loading ? <ActivityIndicator size="large" color={mainOrangeColor} /> : null
                        }
                        ListEmptyComponent={
                            !loading && (
                                <CustomText style={styles.emptyText}>
                                    No media found.
                                </CustomText>
                            )
                        }
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: mainWhiteColor,
        maxHeight: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: mainOrangeColor,
    },
    title: {
        fontSize: 18,
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
    },
    close: {
        fontSize: 32,
        color: '#333',
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
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
        minWidth: RfH(80),
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterButtonActive: {
        backgroundColor: mainOrangeColor,
        minWidth: RfH(80),
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterText: {
        color: DarkColor,
        fontFamily: fonts.PoppinsMedium,
        fontSize: RfH(14),
    },
    filterTextActive: {
        color: mainWhiteColor,
        fontFamily: fonts.PoppinsMedium,
        fontSize: RfH(14),
    },
    gallery: {
        padding: RfH(4),
    },
    imageWrapper: {
        margin: RfH(2),
        borderRadius: RfH(8),
        overflow: 'hidden',
    },
    image: {
        width: imageSize,
        height: imageSize,
        resizeMode: 'cover',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: RfH(40),
    },
});

export default CustomGallery;