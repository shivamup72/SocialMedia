import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import CustomText from '../utils/CustomText';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
    DarkColor,
    fonts,
    mainOrangeColor,
    mainWhiteColor,
} from '../utils/style/fonts';
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

    useEffect(() => {
        if (visible) {
            fetchGalleryImages(selectedFilter);
        }
    }, [visible, selectedFilter]);

    const requestGalleryPermission = async () => {
        if (Platform.OS === 'android') {
            const apiLevel = Platform.constants?.Release
                ? parseInt(Platform.constants.Release, 10)
                : 0;

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

    const fetchGalleryImages = async (filterType = 'All') => {
        setLoading(true);

        const hasPerm = await requestGalleryPermission();
        if (!hasPerm) {
            Alert.alert('Permission required', 'Please allow gallery access.');
            setLoading(false);
            return;
        }

        try {
            const photos = await CameraRoll.getPhotos({
                first: 60,
                assetType: filterType, // All | Photos | Videos
            });

            setImages(
                photos.edges.map((edge, idx) => ({
                    id: edge.node.image.uri + idx,
                    uri: edge.node.image.uri,
                }))
            );
        } catch (e) {
            console.error('CameraRoll.getPhotos error:', e);
            Alert.alert(
                'Error',
                `Could not load gallery images.\n${e?.message || e}`
            );
        }

        setLoading(false);
    };

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
                        {FILTERS.map((filter) => (
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
                        keyExtractor={(item) => item.id}
                        numColumns={numColumns}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.imageWrapper}
                                onPress={() => onSelect(item)}
                            >
                                <Image source={{ uri: item.uri }} style={styles.image} />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.gallery}
                        ListEmptyComponent={
                            loading ? (
                                <CustomText style={styles.emptyText}>Loading...</CustomText>
                            ) : (
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