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
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View>
        {isOpen ? (
          <DropUpSvg width={15} height={15} color={arrowColor} />
        ) : (
          <DropDownSvgIcon width={15} height={15} color={arrowColor} />
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
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
  },
});

export default AccordionHeader;
