import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { RfH, RfW } from '../../utils/helper'
import CustomText from '../../utils/CustomText'
import LeftArrowSvg from '../../assets/svg/LeftArrowSvg'
// import LeftArrowSvg from '../../assets/svg/LeftArrowSvg'
import { DarkColor, DarkColor80, fonts, mainOrange10, mainOrange20 } from '../../utils/style/fonts'

const UserManagementflow = () => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.header} activeOpacity={0.7}>
                <View style={styles.headerLeft}>
                    <Image source={require('../../assets/Png/usermanagment.png')} style={styles.headerIcon} />
                    <CustomText style={styles.headerTitle}>User Management (90)</CustomText>
                </View>
                <View>
                    <LeftArrowSvg color={DarkColor80} height={`${RfH(10)}`} width={`${RfW(10)}`} />
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default UserManagementflow

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: RfH(6),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 1,
        marginTop: RfH(15),
    },
    headerTitle: {
        marginLeft: RfW(10),
        fontSize: 16,
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
    },

    label: {
        fontSize: 14,
        color: DarkColor80,
        fontFamily: fonts.PoppinsRegular,
        marginBottom: RfH(6),
        marginTop: RfH(10)
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: RfW(16),
        backgroundColor: mainOrange10,
        paddingVertical: RfH(6)
        // marginBottom: 16,
    },
    headerIcon: {
        height: RfH(24),
        width: RfH(24)
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        // gap: 8,
    },


})