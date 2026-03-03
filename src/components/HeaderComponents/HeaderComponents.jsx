import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import React, { useRef } from 'react';
import BackArrow from '../../assets/svg/BackArrowSvg';
import { fonts } from '../../utils/style/fonts';
import EditLinePencilIcon from '../../assets/svg/ri_edit_line';
import LightDeleteSvg from '../../assets/svg/LightDeleteSvg';
import { DeleteMeetingApi, DeleteTaskApi } from '../../Api/config/TimelyApi';
import Toast from '../../Api/context/Toast';
import CustomText from '../../utils/CustomText';
const HeaderComponents = ({ navigation, Type, DataList }) => {
  const HandleBack = () => {
    navigation.goBack();
  };

  const toastRef = useRef(null);

  const handleExpenseClaimHistory = () => {
    navigation.navigate('ExpenseClaimScreen', {
      DataList: DataList,
      isEdit: true,
    });
  };

  const handleTaskEditNavigation = () => {
    navigation.navigate('TaskScreen', {
      isEdit: true,
      EditData: DataList,
    });
  };

  const handleMeetingNavigation = () => {
    navigation.navigate('MeetingScreen', {
      isEdit: true,
      EditData: DataList,
    });
  };

  const handleDeleteMeeting = async () => {
    try {
      const response = await DeleteMeetingApi(DataList.id, {});
      console.log('response --=-=--=>', response);
      if (response?.success) {
        navigation.goBack();
      } else {
        toastRef.current.show({
          type: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      toastRef.current.show({
        type: 'error',
        message: error?.data?.message,
      });
    }
  };

  const handleTaskDelete = async () => {
    try {
      // console.log('res handle Task delete --------->');
      const response = await DeleteTaskApi(DataList.id, {});
      console.log('response --=-=--=>', response);
      if (response?.success) {
        navigation.goBack();
      } else {
        toastRef.current.show({
          type: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      toastRef.current.show({
        type: 'error',
        message: error?.data?.message,
      });
    }
  };

  return (
    <View style={styles.containercheck}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'space-between',
        }}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ paddingTop: 5, paddingRight: 15 }}
            onPress={HandleBack}>
            <BackArrow width={'18'} height={'18'} />
          </TouchableOpacity>

          <CustomText style={styles.title}>{Type} </CustomText>
        </View>

        {Type === 'Expense Claim History' && (
          <TouchableOpacity
            style={{ marginTop: 5 }}
            onPress={handleExpenseClaimHistory}>
            <EditLinePencilIcon />
          </TouchableOpacity>
        )}

        {(Type === 'Task' || Type === 'Meeting') && (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={Type === 'Task' ? handleTaskDelete : handleDeleteMeeting}
              style={{ marginTop: 2, marginRight: 10 }}>
              <LightDeleteSvg width="20" height="20" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 5 }}
              onPress={
                Type === 'Task'
                  ? handleTaskEditNavigation
                  : handleMeetingNavigation
              }>
              <EditLinePencilIcon />
            </TouchableOpacity>
          </View>
        )}

        {/* {Type === 'Meeting' && (
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={handleDeleteMeeting}
              style={{marginTop: 2, marginRight: 10}}>
              <LightDeleteSvg width="20" height="20" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{marginTop: 5}}
              onPress={handleMeetingNavigation}>
              <EditLinePencilIcon />
            </TouchableOpacity>
          </View>
        )} */}
      </View>
      <Toast ref={toastRef} />
    </View>
  );
};

export default HeaderComponents;

const styles = StyleSheet.create({
  containercheck: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    // paddingVertical: 10,
    height: 60,
    backgroundColor: '#ffffff',
    shadowColor: 'red',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,

    elevation: 5,
  },
  title: {
    fontSize: 19,
    // fontWeight: '600',
    color: '#263238',
    fontFamily: fonts.PoppinsMedium,
  },
});
