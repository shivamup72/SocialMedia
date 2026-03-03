import React from 'react';
import { TouchableOpacity, Image, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomText from '../../utils/CustomText';
import { DarkColor, fonts, mainOrangeColor, RedColor } from '../../utils/style/fonts';
import { normalize, RfH, RfW } from '../../utils/helper';

type MenuItem = {
    icon: any;
    title: string;
};

type MenuListProps = {
    data: MenuItem[];
    onLogout: () => void;
    onDeleteAccount: () => void;
};

const MenuList: React.FC<MenuListProps> = ({
    data,
    onLogout,
    onDeleteAccount,
}) => {
    const navigation = useNavigation();
    return (
        <View style={{ marginVertical: RfH(0), paddingBottom: RfH(10) }}>
            {data.map((item, index) => {
                const isLogout = item.title === 'Logout';
                const isDelete = item.title === 'Delete Account';
                const isGeneralSettings = item.title === 'General Settings';

                const handlePress = () => {
                    if (isLogout) onLogout();
                    else if (isDelete) onDeleteAccount();
                    else if (isGeneralSettings) navigation.navigate('GeneralSettings' as never);
                };

                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={handlePress}>
                        <View style={styles.menuRow}>
                            <Image
                                source={item.icon}
                                style={[
                                    styles.menuIcon,
                                    isLogout && {
                                        tintColor: mainOrangeColor,
                                        height: RfH(16),
                                        width: RfW(17),
                                        resizeMode: 'contain',
                                        marginLeft: RfW(1),
                                    },
                                    isDelete && {
                                        tintColor: mainOrangeColor,
                                        height: RfH(16),
                                        width: RfW(17),
                                        marginLeft: RfW(1),
                                        // resizeMode: 'contain',
                                    },
                                ]}
                            />
                            <CustomText
                                style={[
                                    styles.menuText,
                                    (isLogout || isDelete) && { color: RedColor },
                                    (isLogout && { left: RfW(1) })
                                ]}>
                                {item.title}
                            </CustomText>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View >
    );
};

export default MenuList;

const styles = StyleSheet.create({
    menuItem: {
        paddingVertical: RfH(14),
        borderBottomWidth: 0.6,
        borderColor: mainOrangeColor,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        width: RfW(20),
        height: RfH(20),
        marginRight: RfW(10),
    },
    menuText: {
        fontSize: normalize(12),
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
    },
});
