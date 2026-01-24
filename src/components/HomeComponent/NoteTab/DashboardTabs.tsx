import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { normalize, RfH, RfW } from '../../../utils/helper';
import { fonts, mainOrangeColor, mainWhiteColor } from '../../../utils/style/fonts';
import CustomText from '../../../utils/CustomText';

// ⭐ Updated Tabs (Menu removed)
const tabs = ["My Notes", "Calendar", "Home"];

interface Props {
    onChange?: (tab: string) => void;
}

const DashboardTabs: React.FC<Props> = ({ onChange }) => {
    const [activeTab, setActiveTab] = useState("My Notes");

    const handlePress = (tab: string) => {
        setActiveTab(tab);
        onChange && onChange(tab);
    };

    return (
        <View style={styles.tabContainer}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={styles.tab}
                    onPress={() => handlePress(tab)}
                >

                    <CustomText
                        style={[
                            styles.tabText,
                            activeTab === tab && styles.activeTabText
                        ]}
                    >
                        {tab}
                    </CustomText>
                    {activeTab === tab && (
                        <View style={styles.activeLine} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default DashboardTabs;

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: mainWhiteColor,
        shadowColor: mainOrangeColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
        height: RfH(50),
    },

    tab: {
        flex: 1,
        // alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        position: 'relative',
    },

    tabText: {
        fontSize: normalize(14),
        color: '#6A6A6A',
        fontFamily: fonts.PoppinsMedium,
        alignSelf: 'center'
    },

    activeTabText: {
        color: mainOrangeColor,
    },

    activeLine: {
        position: 'absolute',
        bottom: RfH(-10),
        width: "80%",
        height: 2,
        backgroundColor: mainOrangeColor,
        borderRadius: 10,
        alignSelf: 'center'
    },
});
