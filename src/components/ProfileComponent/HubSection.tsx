import React, { useEffect, useState } from "react";
import {
    Modal,
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    Image,
    FlatList,
    Alert,
    Share
} from "react-native";
import CustomText from "../../utils/CustomText";
import { normalize, RfH, RfW } from "../../utils/helper";
import { DarkColor, DarkColor20, DarkColor80, fonts } from "../../utils/style/fonts";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { GetCreateWorkSpaceApi, GetUserIdListingApi, GetWorkSpaceCode } from "../../Api/config/HomeApi";
import AsyncStorage1 from "../../Api/config/AsyncStorage";
import RNRestart from 'react-native-restart';
import { useSettings } from "../../Api/context/SettingsContext";
import { useWebSocket } from "../../Api/context/WebSocketServices";
import SettingSvg from '../../assets/svg/material_symbols_settings_outline_rounded';
import CloseSvg from '../../assets/svg/CloseSvg';

import SettingsModal from './SettingsModal';
interface HubSectionProps {
    setRefresh?: () => void;
}

const HubSection = ({ setRefresh }: HubSectionProps) => {
    const navigation = useNavigation()
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [workHubs, setWorkHubs] = useState<any[]>([]);
    const [personalHubs, setPersonalHubs] = useState<any[]>([]);
    const [UserData, setUserData] = useState<any[]>([]);
    const [GetData, setGetData] = useState<any[]>([]);
    console.log(JSON.stringify(workHubs), "<<--workHubs--->>");

    const IsFocused = useIsFocused();
    const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
    const [selectedHub, setSelectedHub] = useState<any>(null);
    console.log(selectedHub, "<--selectedHub--->");

    const [HubName, setHubName] = useState('');

    // console.log(GetData, "<<--GetData--->>");
    // console.log(JSON.stringify(workHubs), "workHubs....");
    // console.log(JSON.stringify(personalHubs), "personalHubs....");
    const { settings, SelectedMembers, updateSettings, HubId } = useSettings();
    const { connect } = useWebSocket();
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


    const FetchData = async () => {
        try {
            const userData = await AsyncStorage1.getItem('userLoginResponse');
            setUserData(userData);

            const userId = userData?.data?.user?.id;

            const response = await GetUserIdListingApi(userId, {});
            if (response?.success) {
                setGetData(response?.data);
            }
            const hubname = await AsyncStorage1.getItem('HubName');
            setHubName(hubname);
        } catch (error) {
            console.log('User Details Error ==-=-==--->', error);
        }
    };
    useEffect(() => {
        FetchData();
    }, [IsFocused]);


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
        FetchHubs();
    }, [IsFocused]);

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
    // const openSettingsModal = hub.:any) => {
    //     setSelectedHub(hub);
    //     setSettingsModalVisible(true);
    // };
    // const closeSettingsModal = () => {
    //     setSettingsModalVisible(false);
    //     setSelectedHub(null);
    // };
    const handleHubId = async (hubId: any) => {
        // console.log('hubId --=--->', hubId, '\n', '\n');
        let newSettingsData = {};
        if (hubId.hrms_settings && hubId.hrms_settings.length > 0) {
            newSettingsData = hubId.hrms_settings[0];
        }

        let newSelectedMembersData = [];
        if (hubId.members && hubId.members.length > 0) {
            newSelectedMembersData = hubId.members[0];
        }

        updateSettings({
            newSettings: newSettingsData,
            newSelectedMembers: newSelectedMembersData,
            newHubId: hubId?.id,
        });

        await AsyncStorage1.setItem('HubName', JSON.stringify(hubId?.name));
        RNRestart.Restart();
        connect();
        if (setRefresh) setRefresh();
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

    const renderHub = ({ item }: { item: any }) => {
        console.log(item, "<<--item");

        // Use HubId from context for selection
        const selectedHubId = HubId ? HubId.toString() : null;
        // Find the full hub object from workHubs or personalHubs by id
        const fullHub = [...workHubs, ...personalHubs].find(hub => hub.id?.toString() === item.id?.toString());
        const isSelected = item.id?.toString() === selectedHubId;
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isSelected ? '#FFD9C2' : '#FFF',
                    paddingVertical: isSelected ? RfH(6) : RfH(12),
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 0.5,
                    marginVertical: RfH(6),
                    borderColor: isSelected ? 'transparent' : DarkColor20,
                }}
                onPress={() => handleHubId(item)}
            >
                <View
                    style={styles.hubItem}
                >
                    <View style={styles.leftRow}>
                        <CustomText style={styles.hubName}>{item.name}</CustomText>
                        <CustomText
                            style={[styles.hubName, { marginLeft: 8, color: DarkColor }]}
                        >
                            ({item.members_count})
                        </CustomText>
                    </View>
                </View>
                <View>
                    {isSelected && (
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedHub(fullHub || item);
                                setSettingsModalVisible(true);
                            }}
                            style={styles.settingsButton}
                        >
                            <SettingSvg width="20" height="20" />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

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
                                <CustomText style={styles.footerText}>Create a new hub</CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerRow} onPress={HandleJoinHubNavigation}>
                                <CustomText style={styles.footerText}>Join Hub</CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerRow} onPress={handleShareCode}>
                                <CustomText style={styles.footerText}>Share/Copy Riggle Hub code</CustomText>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Settings Modal */}
            <SettingsModal
                navigation={navigation}
                visible={isSettingsModalVisible}
                onClose={() => setSettingsModalVisible(false)}
                onCloseprofile={() => { }}
                hubName={selectedHub?.name || ''}
                SelectedHub={selectedHub}
                userData={UserData}
            />
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
    settingsButton: {
        marginLeft: 'auto',
        padding: 8,
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
