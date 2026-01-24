import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import React, { useState } from 'react';
import FilterSvg from '../../../../assets/svg/FilterSvg';
import {
  DarkColor,
  DarkColor60,
  mainOrangeColor,
  fonts,
  DarkColor80,
} from '../../../../utils/style/fonts';
import CloseSvg from '../../../../assets/svg/CloseSvg';

const FilterComponents = ({ setFilterValue, selectedFilter }) => {
  const [isMenuVisible, setMenuVisible] = useState(false);

  const menuItems = ['Today', 'Yesterday', 'This Week', 'This Month'];

  const handleMenuItemPress = item => {
    setMenuVisible(false);
    console.log('Selected:', item);
    setFilterValue(item);
  };

  const handleClearFilter = () => {
    setMenuVisible(false);
    setFilterValue('');
  };

  // console.log(isMenuVisible)

  const renderFilterMenu = position => (
    <Modal
      transparent={true}
      visible={isMenuVisible}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
      statusBarTranslucent={true}>
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setMenuVisible(false)}>
        <View
          style={[
            styles.menuContainer,
            {
              position: 'absolute',
              top: position.y + (position?.height + 30),
              right:
                position.x > 0
                  ? windowWidth - position.x - (position?.width || 0) - 10
                  : 10,
            },
          ]}>
          <View style={styles.triangle} />
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handleMenuItemPress(item)}
              style={styles.menuItemContainer}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.menuItem,
                  selectedFilter === item && styles.menuItemSelected,
                ]}>
                {item}
              </Text>
              {selectedFilter === item && (
                <Pressable
                  onPress={e => {
                    e.stopPropagation();
                    handleClearFilter();
                  }}
                  style={styles.closeButton}>
                  <CloseSvg width={14} height={14} color={mainOrangeColor} />
                </Pressable>
              )}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  const buttonRef = React.useRef(null);
  const [buttonPosition, setButtonPosition] = React.useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const measureButton = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setButtonPosition({ x, y, width, height });
      });
    }
  };

  return (
    <View>
      <TouchableOpacity
        ref={buttonRef}
        onLayout={measureButton}
        onPress={() => {
          measureButton();
          setMenuVisible(true);
        }}>
        <FilterSvg
          width="22"
          height="22"
          color={selectedFilter ? mainOrangeColor : DarkColor60}
        />
      </TouchableOpacity>
      {renderFilterMenu(buttonPosition)}
    </View>
  );
};

export default FilterComponents;

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  triangle: {
    position: 'absolute',
    top: -7,
    right: 10,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 10,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  menuItem: {
    fontSize: 12,
    paddingVertical: 5,
    paddingHorizontal: 5,
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
    flex: 1,
  },
  menuItemSelected: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsSemiBold,
  },
  closeButton: {
    padding: 5,
    marginLeft: 5,
  },
});
