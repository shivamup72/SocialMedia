import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import DropUpSvg from '../../../assets/svg/DropUpSvg';
import DropDownSvgIcon from '../../../assets/svg/DropDownSvg';
import {
  fonts,
  DarkColor,
  DarkColor60,
  mainOrangeColor,
} from '../../../utils/style/fonts';
import CustomText from '../../../utils/CustomText';

const AccordionHeader = ({
  title,
  isOpen,
  onPress,
  icon,
  iconColor,
  arrowColor,
}) => {
  const IconComponent = icon;

  return (
    <TouchableOpacity style={styles.header} onPress={onPress}>
      <View style={styles.row}>
        {IconComponent && (
          <IconComponent width={25} height={25} color={iconColor} />
        )}
        <CustomText style={styles.headerTitle}>{title}</CustomText>
      </View>
      <View>
        {isOpen ? (
          <DropUpSvg width={10} height={10} color={arrowColor} />
        ) : (
          <DropDownSvgIcon width={10} height={10} color={arrowColor} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
  },
});

export default AccordionHeader;
