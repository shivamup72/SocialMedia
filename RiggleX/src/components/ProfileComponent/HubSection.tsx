import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    Alert,
    Share
} from "react-native";
import { normalize, RfH, RfW } from "../../utils/helper";
import CustomText from "../../utils/CustomText";
import { DarkColor, fonts } from "../../utils/style/fonts";
import { useNavigation } from "@react-navigation/native";
import { GetCreateWorkSpaceApi, GetWorkSpaceCode } from "../../Api/config/HomeApi";
import AsyncStorage1 from "../../Api/config/AsyncStorage";

const HubSection = () => {
    const navigation = useNavigation()
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [workHubs, setWorkHubs] = useState([]);
    const [personalHubs, setPersonalHubs] = useState([]);
    console.log(JSON.stringify(workHubs), "workHubs....");
    console.log(JSON.stringify(personalHubs), "personalHubs....");

    const onToggle = (id: string) => {
        setExpandedGroup(expandedGroup === id ? null : id);
    };

    const HandleCreateHubNavigation = () => {
        navigation.navigate('CreateHubScreensWithAcccount' as never);
    };

    const HandleJoinHubNavigation = () => {
        navigation.navigate('JoinHubScreen' as never);
        // navigation.navigate('CreateHubScreensWithAcccount');
    };

    useEffect(() => {
        const FetchHubs = async () => {
            try {
                const res = await GetCreateWorkSpaceApi({
                    page: 1,
                    page_size: 60,
                });
                console.log('GetCreateWorkSpaceApi ---->', res);
                if (res?.results) {
                    setWorkHubs(res.results);
                    setPersonalHubs(
                        res.results.filter((hub: any) => hub && hub.type === 'personal')
                    );
                } else {
                    setWorkHubs([]);
                    setPersonalHubs([]);
                }
            } catch (error) {
                console.log('error Hub Listing', error);
            }
        };

        FetchHubs(); // ✅ CALL HERE
    }, []); // ✅ empty dependency = run once


    const handleShareCode = async () => {
        const code = await AsyncStorage1.getItem('HubId');

        const formData = new FormData();
        formData.append('workspace_id', code);

        try {
            const response = await GetWorkSpaceCode(formData);
            // console.log('\n', 'response --=----->', response, '\n');

            if (response?.success && response?.data?.share_template) {
                const shareMessage = response.data.code;

                const result = await Share.share({
                    message: shareMessage,
                    title: 'Join my Riggle Hub',
                });

                if (result.action === Share.sharedAction) {
                    if (result.activityType) {
                        console.log(`Shared via ${result.activityType}`);
                    } else {
                        console.log('Content shared successfully');
                    }
                } else if (result.action === Share.dismissedAction) {
                    console.log('Share dialog was dismissed');
                }
            } else {
                Alert.alert(
                    'Error',
                    'Could not retrieve a shareable code. Please try again.',
                );
            }
        } catch (error) {
            console.log('error --=------>', error);
        }
    };

    const DATA = [
        {
            id: "1",
            group: "Work",
            icon: require("../../assets/Png/work.webp"),
            hubs: workHubs.map((hub: any) => ({
                id: hub.id?.toString() ?? '',
                name: hub.name,
                members_count: hub.members_count,
                // Optionally add icons if available in hub object
            })),
        },
        {
            id: "2",
            group: "Personal",
            icon: require("../../assets/Png/personal.webp"),
            hubs: personalHubs.map((hub: any) => ({
                id: hub.id?.toString() ?? '',
                name: hub.name,
                members_count: hub.members_count,
            })),
        },
    ];

    const renderHub = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.hubItem}>
            <View style={styles.leftRow}>
                {/* Optionally show icon if available: item.icons && <Image source={item.icons} style={styles.groupIcon} /> */}
                <CustomText style={styles.hubName}>{item.name}</CustomText>
                <CustomText style={[styles.hubName, { marginLeft: 8, color: '#888' }]}>({item.members_count} members)</CustomText>
            </View>
        </TouchableOpacity>
    );

    const renderGroup = ({ item }: { item: any }) => (
        <View style={styles.groupContainer}>

            <TouchableOpacity
                onPress={() => onToggle(item.id)}
                style={styles.groupHeader}
            >
                <View style={styles.leftRow}>
                    <Image source={item.icon} style={styles.groupIcon} />
                    <CustomText style={styles.groupTitle}>{item.group}</CustomText>
                </View>

                {/* <Image
                    source={
                        expandedGroup === item.id
                            ? require("../../assets/Png/arrowup.webp")
                            : require("../../assets/Png/arrowdwon.webp")
                    }
                    style={styles.arrowIcon}
                /> */}
            </TouchableOpacity>

            {expandedGroup === item.id && (
                <FlatList
                    data={item.hubs}
                    renderItem={renderHub}
                    keyExtractor={(hub) => hub.id}
                />
            )}

            <View style={styles.groupDivider} />
        </View>
    );


    return (
        <View style={styles.mainCard}>

            {/* Hub Details Row (Expandable) */}
            <TouchableOpacity
                onPress={() => setShowAll(!showAll)}
                style={styles.headerRow}
            >
                <CustomText style={styles.headerText}>Hub Details</CustomText>

                <Image
                    source={
                        showAll
                            ? require("../../assets/Png/arrowup.webp")
                            : require("../../assets/Png/arrowdwon.webp")
                    }
                    style={styles.headerArrow}
                />
            </TouchableOpacity>

            {showAll && <View style={styles.sectionDivider} />}

            {showAll && (
                <FlatList
                    data={DATA}
                    renderItem={renderGroup}
                    keyExtractor={(item) => item.id}
                    ListFooterComponent={
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.footerRow} onPress={HandleCreateHubNavigation}>
                                {/* <Image source={require('../../assets/Png/createhub.webp')} style={styles.footerIcon} /> */}
                                <CustomText style={styles.footerText}>Create a new hub</CustomText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.footerRow} onPress={HandleJoinHubNavigation}>
                                {/* <Image source={require('../../assets/images/joinhub.webp')} style={styles.footerIcon} /> */}
                                <CustomText style={styles.footerText}>Join Hub</CustomText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.footerRow} onPress={handleShareCode}>
                                {/* <Image source={require('../../assets/images/share.webp')} style={styles.footerIcon} /> */}
                                <CustomText style={styles.footerText}>Share/Copy Riggle Hub code</CustomText>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

        </View>
    );
};

export default HubSection;

const styles = StyleSheet.create({
    mainCard: {
        backgroundColor: "#F9F9F9",
        padding: RfW(14),
        borderRadius: 10,
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    headerArrow: {
        width: RfW(16),
        height: RfH(10),
        bottom: RfH(4)
    },

    headerText: {
        fontFamily: fonts.PoppinsMedium,
        fontSize: normalize(16),
        marginBottom: RfH(6),
        color: DarkColor,
    },

    groupContainer: {
        marginTop: RfH(6),
        paddingVertical: RfH(6),
    },

    groupHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: RfH(6),
    },

    groupIcon: {
        width: RfW(17),
        height: RfH(17),
        marginRight: RfW(10),
    },

    groupTitle: {
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsSemiBold,
        color: DarkColor,
    },

    arrowIcon: {
        height: RfH(10),
        width: RfW(16),
    },

    hubItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: "#FFF2EE",
        borderRadius: 10,
        marginVertical: 4,
    },

    leftRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    hubName: {
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
    },

    footer: {
        paddingTop: RfH(10),
    },

    footerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },

    footerIcon: {
        width: RfW(20),
        height: RfH(20),
        marginRight: RfW(12),
    },

    footerText: {
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
    },

    sectionDivider: {
        height: 1,
        backgroundColor: "#E5E5E5",
    },

    groupDivider: {
        height: 1,
        backgroundColor: "#EFEFEF",
        marginTop: RfH(8),
    },
});
