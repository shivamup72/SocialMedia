import React, { useEffect, useMemo, useState } from "react";
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Image,
    FlatList,
    Alert,
    Share,
} from "react-native";
import CustomText from "../../utils/CustomText";
import { normalize, RfH, RfW } from "../../utils/helper";
import {
    DarkColor,
    DarkColor20,
    DarkColor80,
    fonts,
    lightGray,
} from "../../utils/style/fonts";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
    GetCreateWorkSpaceApi,
    GetUserIdListingApi,
    GetWorkSpaceCode,
} from "../../Api/config/HomeApi";
import AsyncStorage1 from "../../Api/config/AsyncStorage";
import RNRestart from "react-native-restart";
import { useSettings } from "../../Api/context/SettingsContext";
import { useWebSocket } from "../../Api/context/WebSocketServices";
import SettingSvg from "../../assets/svg/material_symbols_settings_outline_rounded";
import DropDownSvgIcon from "../../assets/svg/DropDownSvg";
import DropUpSvg from "../../assets/svg/DropUpSvg";
import JoinHubSvg from "../../assets/svg/JoinHubSvg";
import ShareIconSvg from "../../assets/svg/ShareIconSvg";
import CreateHubSvgIcon from "../../assets/svg/CreateHubSvgIcon";
import SettingsModal from "./SettingsModal";

interface HubSectionProps {
    setRefresh?: () => void;
}

const HubSection = ({ setRefresh }: HubSectionProps) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [showAll, setShowAll] = useState(false);
    const [workHubs, setWorkHubs] = useState<any[]>([]);
    console.log(JSON.stringify(workHubs), "workHubs in hub section");

    const [UserData, setUserData] = useState<any>(null);
    const [GetData, setGetData] = useState<any[]>([]);
    const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
    const [selectedHub, setSelectedHub] = useState<any>(null);
    const [HubName, setHubName] = useState("");
    const [expandedHubId, setExpandedHubId] = useState<string | null>(null);

    const { updateSettings, HubId } = useSettings();
    const { connect } = useWebSocket();

    const FetchData = async () => {
        try {
            const userData = await AsyncStorage1.getItem("userLoginResponse");
            setUserData(userData);

            const userId = userData?.data?.user?.id;
            if (userId) {
                const response = await GetUserIdListingApi(userId, {});
                if (response?.success) {
                    setGetData(response?.data || []);
                }
            }

            const hubname = await AsyncStorage1.getItem("HubName");
            setHubName(hubname || "");
        } catch (error) {
            console.log("User Details Error ==-=-==--->", error);
        }
    };

    useEffect(() => {
        FetchData();
    }, [isFocused]);

    useEffect(() => {
        const FetchHubs = async () => {
            try {
                const res = await GetCreateWorkSpaceApi({
                    page: 1,
                    page_size: 60,
                });

                console.log("GetCreateWorkSpaceApi ---->", JSON.stringify(res));

                if (res?.results && Array.isArray(res.results)) {
                    setWorkHubs(res.results);
                } else {
                    setWorkHubs([]);
                }
            } catch (error) {
                console.log("error Hub Listing", error);
                setWorkHubs([]);
            }
        };

        FetchHubs();
    }, [isFocused]);

    const uniqueWorkspaces = useMemo(() => {
        const map = new Map();

        workHubs.forEach((hub: any) => {
            const id = hub?.id?.toString();
            if (id && !map.has(id)) {
                map.set(id, hub);
            }
        });

        return Array.from(map.values());
    }, [workHubs]);

    const HandleCreateHubNavigation = () => {
        navigation.navigate("CreateHubScreensWithAcccount" as never);
    };

    const HandleJoinHubNavigation = () => {
        navigation.navigate("JoinHubScreen" as never);
    };

    const handleShareCode = async () => {
        const code = await AsyncStorage1.getItem("HubId");

        const formData = new FormData();
        formData.append("workspace_id", code);

        try {
            const response = await GetWorkSpaceCode(formData);
            console.log("response --=----->", response);

            if (response?.success && response?.data?.share_template) {
                const shareMessage = response.data.code;

                const result = await Share.share({
                    message: shareMessage,
                    title: "Join my Riggle Hub",
                });

                if (result.action === Share.sharedAction) {
                    if (result.activityType) {
                        console.log(`Shared via ${result.activityType}`);
                    } else {
                        console.log("Content shared successfully");
                    }
                } else if (result.action === Share.dismissedAction) {
                    console.log("Share dialog was dismissed");
                }
            } else {
                Alert.alert("Error", "You do not have permission to share this code.");
            }
        } catch (error) {
            console.log("error --=------>", error);
        }
    };

    const handleHubId = async (hub: any) => {
        try {
            let newSettingsData = {};
            if (hub?.hrms_settings && hub.hrms_settings.length > 0) {
                newSettingsData = hub.hrms_settings[0];
            }

            let newSelectedMembersData = [];
            if (hub?.members && hub.members.length > 0) {
                newSelectedMembersData = hub.members[0];
            }

            updateSettings({
                newSettings: newSettingsData,
                newSelectedMembers: newSelectedMembersData,
                newHubId: hub?.id,
            });

            await AsyncStorage1.setItem("HubName", JSON.stringify(hub?.name));
            await AsyncStorage1.setItem("HubId", String(hub?.id));

            RNRestart.Restart();
            connect();

            if (setRefresh) setRefresh();
        } catch (error) {
            console.log("handleHubId error ---->", error);
        }
    };


    // Find the current user id
    let userId = null;
    if (UserData && UserData.data && UserData.data.user && UserData.data.user.id) {
        userId = UserData.data.user.id;
    }
    // Check if user is admin in any workspace
    const isAdmin = useMemo(() => {
        return uniqueWorkspaces.some((hub: any) => hub?.members?.some((m: any) => m.user_id === userId && m.role === 'admin'));
    }, [uniqueWorkspaces, userId]);

    const renderHub = ({ item }: { item: any }) => {
        const selectedHubId = HubId ? HubId.toString() : null;
        const isSelected = item?.id?.toString() === selectedHubId;
        const isExpanded = expandedHubId === item?.id?.toString();
        const currentMember = item?.members?.find((m: any) => m.user_id === userId);
        const isHubAdmin = currentMember?.role === 'admin';

        return (
            <View>
                <TouchableOpacity
                    style={[
                        styles.hubRow,
                        {
                            backgroundColor: isSelected ? "#FFD9C2" : 'transparent',
                            borderColor: isSelected ? "transparent" : DarkColor20,
                            paddingVertical: isSelected ? RfH(1) : RfH(8),
                            // borderRadius: isSelected ? RfW(10) : 0,
                            paddingHorizontal: isSelected ? RfW(10) : RfW(10),
                        },
                    ]}
                    onPress={() => handleHubId(item)}
                >
                    <View style={{ flex: 1 }}>
                        <View style={styles.leftRow}>
                            <Image source={require("../../assets/Png/work.webp")} style={{ height: RfH(20), width: RfW(20) }} />
                            <CustomText style={[styles.hubName, { left: RfW(6) }]}>
                                {item?.name?.length > 30
                                    ? `${item.name.slice(0, 30)}...`
                                    : item?.name}
                            </CustomText>

                            <CustomText
                                style={[styles.hubName, { marginLeft: 8, color: DarkColor }]}
                            >
                                ({item?.members_count ?? 0})
                            </CustomText>
                        </View>
                    </View>

                    {isHubAdmin && (
                        <TouchableOpacity
                            onPress={() =>
                                setExpandedHubId(
                                    isExpanded ? null : item?.id?.toString()
                                )
                            }
                            style={styles.arrowButton}
                        >
                            {isExpanded ? (
                                <DropUpSvg width={16} height={16} color={DarkColor80} />
                            ) : (
                                <DropDownSvgIcon
                                    width={"14"}
                                    height={"14"}
                                    color={DarkColor80}
                                    fillOpacity={1}
                                />
                            )}
                        </TouchableOpacity>
                    )}

                    {/* {isSelected && (
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedHub(item);
                                setSettingsModalVisible(true);
                            }}
                            style={styles.settingsButton}
                        >
                            <SettingSvg width="20" height="20" />
                        </TouchableOpacity>
                    )} */}
                </TouchableOpacity>

                {isExpanded && (
                    <>
                        <TouchableOpacity
                            style={styles.footerRow}
                            onPress={handleShareCode}
                        >
                            <ShareIconSvg width={"18"} height={"18"} />
                            <CustomText style={[styles.footerText, { color: lightGray }]}>
                                Share Hub Code
                            </CustomText>
                        </TouchableOpacity>
                        {isSelected && (<TouchableOpacity
                            style={styles.footerRow}
                            onPress={() => {
                                setSelectedHub(item);
                                setSettingsModalVisible(true);
                            }}
                        >
                            <SettingSvg width="16" height="16" color={DarkColor80} />
                            <CustomText style={[styles.footerText, { color: lightGray }]}>
                                Hub Settings
                            </CustomText>
                        </TouchableOpacity>)}
                        <View style={styles.expandedInfo}>
                            <CustomText style={styles.statusText}>
                                Offline : {item?.offline_users_count ?? 0}
                            </CustomText>
                            <CustomText style={styles.statusText}>
                                Online : {item?.live_users_count ?? 0}
                            </CustomText>
                        </View>
                    </>
                )}
            </View>
        );
    };

    return (
        <>
            <View style={styles.mainCard}>
                <TouchableOpacity
                    onPress={() => setShowAll(!showAll)}
                    style={styles.headerRow}
                >
                    <CustomText style={styles.headerText}>Hub Details</CustomText>
                    {/* <Image
                        source={
                            showAll
                                ? require("../../assets/Png/arrowup.webp")
                                : require("../../assets/Png/arrowdwon.webp")
                        }
                        style={styles.headerArrow}
                    /> */}
                    {showAll ? (
                        <View style={{ bottom: RfH(4), right: RfW(4) }}>
                            <DropUpSvg width={16} height={16} color={DarkColor80} />
                        </View>
                    ) : (
                        <View style={{ bottom: RfH(4), right: RfW(4) }}>
                            <DropDownSvgIcon
                                width={16}
                                height={16}
                                color={DarkColor80}
                                fillOpacity={1}
                            />
                        </View>

                    )}
                </TouchableOpacity >

                {showAll && <View style={styles.sectionDivider} />
                }

                {
                    showAll && (
                        <FlatList
                            data={uniqueWorkspaces}
                            renderItem={renderHub}
                            keyExtractor={(item) => item?.id?.toString()}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View>
                                    <CustomText>
                                        No workspace found
                                    </CustomText>
                                </View>
                            }

                        />
                    )
                }
                <SettingsModal
                    navigation={navigation}
                    visible={isSettingsModalVisible}
                    onClose={() => setSettingsModalVisible(false)}
                    onCloseprofile={() => { }}
                    hubName={selectedHub?.name || ""}
                    SelectedHub={selectedHub}
                    userData={UserData}
                />
            </View >

            <View style={styles.footer}>
                {isAdmin && (
                    <TouchableOpacity
                        style={styles.footerRow}
                        onPress={HandleCreateHubNavigation}
                    >
                        <CreateHubSvgIcon width={"20"} height={"20"} />
                        <CustomText style={styles.footerText}>
                            Create a new hub
                        </CustomText>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.footerRow}
                    onPress={HandleJoinHubNavigation}
                >
                    <JoinHubSvg width={"20"} height={"20"} />
                    <CustomText style={styles.footerText}>Join another Hub</CustomText>
                </TouchableOpacity>


            </View>
        </>
    );
};


export default HubSection;

const styles = StyleSheet.create({
    mainCard: {
        backgroundColor: "#F9F9F9",
        paddingVertical: RfH(6),
        // paddingHorizontal: RfW(12),
        borderRadius: 10,
        marginBottom: RfH(10),
        marginHorizontal: RfW(12),
        justifyContent: 'center',
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        top: RfH(4),
        paddingHorizontal: RfW(12),
    },
    expandedInfo: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginRight: RfW(10),
        marginTop: RfH(4),
        marginBottom: RfH(4),
    },

    headerArrow: {
        width: RfW(20),
        height: RfH(20),
        bottom: RfH(4),
        right: RfW(4)
    },
    statusText: {
        color: DarkColor,
        fontSize: 12,
        marginLeft: 12,
        fontFamily: fonts.PoppinsRegular,
    },
    headerText: {
        fontFamily: fonts.PoppinsSemiBold,
        fontSize: normalize(12),
        marginBottom: RfH(6),
        color: DarkColor,
    },
    settingsButton: {
        marginLeft: 'auto',
        padding: 8,
    },
    arrowButton: {
        width: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    groupContainer: {
        marginTop: RfH(6),
        paddingVertical: RfH(6),
    },
    hubRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: RfH(36),
        // paddingHorizontal: RfW(10),
        // borderRadius: RfW(10),
        // borderWidth: 0.5,
        // marginVertical: RfH(4),
    },
    leftRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
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
    hubName: {
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
    },

    footer: {
        paddingTop: RfH(0),
        paddingHorizontal: RfW(12)
    },

    footerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: RfW(10),
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
        left: RfW(10)
    },

    sectionDivider: {
        // height: 1,
        // backgroundColor: "#E5E5E5",
    },

    groupDivider: {
        height: 1,
        backgroundColor: "#EFEFEF",
        marginTop: RfH(8),
    },
});
