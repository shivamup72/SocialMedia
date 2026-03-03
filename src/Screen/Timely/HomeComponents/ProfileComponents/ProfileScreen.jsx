import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { fonts, mainOrangeColor, DarkColor, DarkColor20, DarkColor50, mainOrange20, mainOrange50, mainWhiteColor, mainOrange92, DarkColor80, mainGrayColor } from '../../style/fonts'
import CustomText from '../../../../utils/CustomText'

const ProfileScreen = () => {
  return (
    <View style={{ backgroundColor: mainWhiteColor, flex: 1 }}>
      <CustomText style={{ color: 'red' }}>ProfileScreen</CustomText>
    </View>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({})