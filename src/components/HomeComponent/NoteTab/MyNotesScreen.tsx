import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";
import { normalize, RfH, RfW } from "../../../utils/helper";
import {
    DarkColor50,
    fonts,
} from "../../../utils/style/fonts";
import CustomText from "../../../utils/CustomText";

const folders = [
    {
        id: 1,
        title: "Work (2)",
        desc: "lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum",
        date: "Today",
        icon: require("../../../assets/Png/list1.webp"),
    },
    {
        id: 2,
        title: "Meetings (3)",
        desc: "lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum",
        date: "1 day ago",
        icon: require("../../../assets/Png/list2.webp"),
    },
    {
        id: 3,
        title: "Calls (1)",
        desc: "lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum",
        date: "1 day ago",
        icon: require("../../../assets/Png/list3.webp"),
    },
];

const notes = [
    { id: 10, title: "Title", date: "Today" },
    { id: 11, title: "Title", date: "Today" },
    { id: 12, title: "Title", date: "Today" },
];


type MyNotesScreenProps = {
    onFloatBtnPress?: () => void;
    setHideTabBar?: (hide: boolean) => void;
    isOverlayOpen?: boolean;
};

const MyNotesScreen: React.FC<MyNotesScreenProps> = ({ onFloatBtnPress, isOverlayOpen, setHideTabBar }) => {
    const [viewMode, setViewMode] = useState("FOLDER_GRID");

    const toggleViews = () => {
        setViewMode(viewMode === "FOLDER_GRID" ? "FOLDER_LIST" : "FOLDER_GRID");
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: RfW(8) }}>

            {/* HEADER */}
            {viewMode !== "NOTES_GRID" && (
                <View style={styles.header}>
                    <CustomText style={styles.headerTxt}>
                        FOLDERS ({folders.length})
                    </CustomText>

                    <TouchableOpacity onPress={toggleViews}>
                        <Image
                            source={
                                viewMode === "FOLDER_GRID"
                                    ? require("../../../assets/Png/menu.webp")
                                    : require("../../../assets/Png/listgrid.webp")
                            }
                            style={{ width: RfW(30), height: RfH(26), resizeMode: 'contain' }}
                        />
                    </TouchableOpacity>
                </View>
            )}

            {/* GRID VIEW */}
            {viewMode === "FOLDER_GRID" && (
                <FlatList
                    data={folders}
                    numColumns={2}
                    contentContainerStyle={{ paddingBottom: RfH(100) }}
                    renderItem={({ item }) => (
                        <View style={styles.folderGrid}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Image source={item.icon} style={styles.folderIcon} />
                                <CustomText style={styles.folderDateGrid}>
                                    {item.date}
                                </CustomText>
                            </View>
                            <CustomText style={styles.folderTitleGrid}>{item.title}</CustomText>
                            <CustomText style={styles.folderDescGrid}>{item.desc}</CustomText>
                        </View>
                    )}
                />
            )}

            {/* LIST VIEW */}
            {viewMode === "FOLDER_LIST" && (
                <FlatList
                    data={folders}
                    contentContainerStyle={{ paddingBottom: RfH(100) }}
                    renderItem={({ item }) => (
                        <View style={styles.folderList}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Image
                                    source={item.icon}
                                    style={styles.folderIconList}
                                />
                                <CustomText style={styles.folderDateList}>
                                    {item.date}
                                </CustomText>
                            </View>

                            <View
                                style={{
                                    flexDirection: "row",
                                    marginTop: RfH(8),
                                }}
                            >
                                <CustomText style={styles.folderTitleList}>
                                    {item.title}
                                </CustomText>
                                <CustomText style={styles.folderDescList}>{item.desc}</CustomText>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* NOTES GRID */}
            {viewMode === "NOTES_GRID" && (
                <FlatList
                    data={notes}
                    numColumns={2}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <View style={styles.noteCard}>
                            <CustomText style={styles.noteTitle}>{item.title}</CustomText>
                            <CustomText style={styles.noteEdit}>
                                Last edited {item.date}
                            </CustomText>
                        </View>
                    )}
                />
            )}

            {/* FLOAT BUTTON */}
            {!isOverlayOpen && (
                <TouchableOpacity
                    style={styles.plusBtn}
                    onPress={() => {
                        if (setHideTabBar) setHideTabBar(true);
                        if (onFloatBtnPress) onFloatBtnPress();
                    }}
                    activeOpacity={0.7}
                >
                    <Image
                        source={require("../../../assets/Png/floatbtn.webp")}
                        style={{ width: "100%", height: "100%" }}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default MyNotesScreen;

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: RfW(18),
        paddingVertical: RfH(15),
    },
    headerTxt: {
        fontSize: normalize(16),
        fontFamily: fonts.PoppinsMedium,
    },
    folderGrid: {
        width: "45%",
        padding: RfW(12),
        margin: RfW(8),
        borderRadius: RfW(12),
        borderWidth: RfW(1),
        backgroundColor: "#fff",
        borderColor: "#E0E0E0",
    },
    folderIcon: {
        width: RfW(28),
        height: RfW(28),
    },
    folderTitleGrid: {
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsMedium,
        marginTop: RfH(6),
    },
    folderDescGrid: {
        fontSize: normalize(9),
        color: DarkColor50,
        marginTop: RfH(4),
    },
    folderDateGrid: {
        fontSize: normalize(9),
        marginTop: RfH(6),
        color: DarkColor50,
    },
    folderList: {
        width: "92%",
        alignSelf: "center",
        padding: RfW(14),
        backgroundColor: "#fff",
        borderRadius: RfW(12),
        borderWidth: RfW(1),
        borderColor: "#ddd",
        marginVertical: RfH(6),
    },
    folderIconList: {
        width: RfW(30),
        height: RfW(30),
    },
    folderTitleList: {
        width: "25%",
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsMedium,
        marginRight: RfW(4),
    },
    folderDescList: {
        fontSize: normalize(10),
        color: DarkColor50,
        width: "70%",
    },
    folderDateList: {
        fontSize: normalize(10),
        color: DarkColor50,
    },
    noteCard: {
        width: "45%",
        padding: RfW(14),
        backgroundColor: "#fff",
        borderRadius: RfW(12),
        borderWidth: RfW(1),
        borderColor: "#ddd",
        margin: RfW(8),
    },
    noteTitle: {
        fontSize: normalize(14),
        fontFamily: fonts.PoppinsMedium,
    },
    noteEdit: {
        fontSize: normalize(10),
        marginTop: RfH(6),
        color: DarkColor50,
    },
    plusBtn: {
        position: "absolute",
        bottom: RfH(120),
        right: RfW(25),
        width: RfW(55),
        height: RfW(55),
    },
});
