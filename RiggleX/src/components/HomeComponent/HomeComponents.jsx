import { StyleSheet, View, StatusBar, FlatList, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import HeaderComponents from './TimelyHeader/Header';
import { fonts, mainOrangeColor, mainWhiteColor } from '../../utils/style/fonts';
import ScreenView from '../../utils/ScreenView';
import CustomText from '../../utils/CustomText';
import { normalize, RfW } from '../../utils/helper';
import CustomBottomSheet from '../CustomBottomSheet/CustomBottomSheet';
import MyNotesScreen from './NoteTab/MyNotesScreen';
import DashboardTabs from './NoteTab/DashboardTabs';
import CalendarTab from './CalendarTab';


const HomeComponents = ({ navigation, setHideTabBar }) => {
  const [DataList, setDataList] = useState([]);
  const [Refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState("My Notes");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Ensure tab bar always hides when bottom sheet is open
  useEffect(() => {
    if (setHideTabBar) setHideTabBar(isBottomSheetOpen);
  }, [isBottomSheetOpen, setHideTabBar]);

  const renderScreen = () => {
    switch (activeTab) {
      case "My Notes":
        return (
          <MyNotesScreen
            onFloatBtnPress={() => {
              setIsOverlayOpen(true);
              if (setHideTabBar) setHideTabBar(true);
            }}
            isOverlayOpen={isOverlayOpen}
            setHideTabBar={setHideTabBar}
          />
        );
      case "Calendar":
        return (
          <CalendarTab />
        );
      case "Home":
        return (
          <View style={styles.centerBox}>
            <CustomText style={styles.mainText}>Home Screen</CustomText>
          </View>
        );
    }
  };

  return (
    <ScreenView>
      <StatusBar backgroundColor={mainWhiteColor} barStyle="dark-content" />
      <HeaderComponents
        navigation={navigation}
        DataListTask={DataList}
        Refresh={Refresh}
        setRefresh={setRefresh}
      />
      <View style={{ marginHorizontal: RfW(6) }}>
        <DashboardTabs onChange={(tab) => setActiveTab(tab)} />
      </View>

      {renderScreen()}

      {/* Overlay rendered at the root level for full screen coverage */}
      {isOverlayOpen && (
        <TouchableOpacity
          style={overlayStyle.overlay}
          activeOpacity={1}
          onPress={() => {
            setIsOverlayOpen(false);
            if (setHideTabBar) setHideTabBar(false);
          }}
        >
          <View style={overlayStyle.menuBox}>
            <TouchableOpacity
              style={overlayStyle.menuItem}
              activeOpacity={0.8}
              onPress={() => {
                setIsOverlayOpen(false);
                setIsBottomSheetOpen(true);
                if (setHideTabBar) setHideTabBar(true);
              }}
            >
              <CustomText style={overlayStyle.menuTxt}>Create Folder</CustomText>
              <Image source={require('../../assets/Png/CreateFoldar.webp')} style={overlayStyle.imgstyle} />
            </TouchableOpacity>
            <TouchableOpacity style={[overlayStyle.menuItem, { alignSelf: 'flex-end' }]} activeOpacity={0.8}>
              <CustomText style={overlayStyle.menuTxt}>Add Note</CustomText>
              <Image source={require('../../assets/Png/AddNote.png')} style={overlayStyle.imgstyle} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* CustomBottomSheet for Create Folder */}
      <CustomBottomSheet
        visible={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          if (setHideTabBar) setHideTabBar(false);
        }}
      />
    </ScreenView>
  );
};

export default HomeComponents;

const styles = StyleSheet.create({
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },

  mainText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    color: '#0D1D32',
  },

  subText: {
    fontSize: 14,
    color: '#7A7A7A',
    marginTop: 5,
  },
});

const overlayStyle = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(38, 50, 56, 0.7)',
    zIndex: 100,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  menuBox: {
    marginBottom: 40,
    right: 30,
    position: 'absolute',
    bottom: 50,
    alignItems: 'center'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  menuTxt: {
    fontSize: normalize(16),
    color: mainWhiteColor,
    marginRight: 12,
    fontFamily: fonts.PoppinsMedium
  },
  imgstyle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  menuIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
