import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { BackHandler } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import BackArrowSvg from '../../../../assets/svg/BackArrowSvg';
import {
  fonts,
  DarkColor,
  DarkColor60,
  mainWhiteColor,
  mainOrangeColor,
  DarkColor80,
  DarkColor50,
} from '../../../../utils/style/fonts';
import Toast from '../../../../Api/context/Toast';
import {
  GetTakeLeaveApi,
  GetExpenseClaimApi,
  DeleteLeaveApi,
  DeleteExpenseClaimApi,
} from '../../../../Api/config/TimelyApi';
import Loader from '../../../../utils/Loader/loader';
import { formatDate, formatDateInMonth } from '../../../../utils/CommonUtils';
import { useIsFocused } from '@react-navigation/native';
import LightDeleteSvg from '../../../../assets/svg/LightDeleteSvg';
import EditLinePencilIcon from '../../../../assets/svg/ri_edit_line';
import ConfirmationModal from '../../ReuseableComponents/ReuseableComponents';
// import NullCommonComponent from '../../../components/NullCommonComponents/NullCommonComponents';
import EmptyListComponents from '../../../../components/EmptyListComponents/index';
import { SwipeListView } from 'react-native-swipe-list-view';

import { FormatYYYYMMDDToDDMMYYYYY } from '../../../../utils/CommonUtils';
import CustomText from '../../../../utils/CustomText';
const ApprovalCard = ({ navigation, item, filterType }) => {
  const isApproved = item.status === 'approved';
  const isExpenseClaim = filterType === 'expense_claim';

  const statusBadgeStyle = isApproved
    ? styles.approvedBadge
    : styles.rejectedBadge;
  const statusBadgeTextStyle = isApproved
    ? styles.approvedBadgeText
    : styles.rejectedBadgeText;

  const handleEditLeaveNavigation = () => {
    navigation.navigate('LeaveScreen', { item: item, isEdit: true });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        {isExpenseClaim ? (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ExpenseClaimHistory', { item: item });
            }}>
            <View style={styles.detailRow}>
              <CustomText allowFontScaling={false} style={styles.detailLabel}>
                Expense Date
              </CustomText>
              <CustomText allowFontScaling={false} style={styles.detailValue}>
                {FormatYYYYMMDDToDDMMYYYYY(item.expense_date)}
              </CustomText>
            </View>
            <View style={styles.detailRow}>
              <CustomText allowFontScaling={false} style={styles.detailLabel}>
                Amount
              </CustomText>
              <CustomText allowFontScaling={false} style={styles.detailValue}>
                {item.total_amount}
              </CustomText>
            </View>
            {/* {console.log('Expense Claim Item', item,'\n')}
            <View style={styles.detailRow}>
              <CustomText allowFontScaling={false} style={styles.detailLabel}>
                Description
              </CustomText>
              <CustomText allowFontScaling={false} style={styles.detailValue}>
                {item?.description}
              </CustomText>
            </View> */}
            {item.status !== 'pending' && (
              <View style={styles.detailRow}>
                <CustomText allowFontScaling={false} style={styles.detailLabel}>
                  Remark
                </CustomText>
                <CustomText
                  allowFontScaling={false}
                  style={styles.detailValue}
                  numberOfLines={4}>
                  {item?.remark}
                </CustomText>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (item.status === 'pending') {
                handleEditLeaveNavigation();
              }
            }}>
            <View style={styles.detailRow}>
              <CustomText allowFontScaling={false} style={styles.detailLabel}>
                Leave Type
              </CustomText>
              <CustomText allowFontScaling={false} style={styles.detailValue}>
                {item.leave_type === 'full_day' ? 'Full Day' : 'Half Day'}
              </CustomText>
            </View>

            <View style={styles.detailRow}>
              <CustomText allowFontScaling={false} style={styles.detailLabel}>
                Leave Duration
              </CustomText>
              <CustomText allowFontScaling={false} style={styles.detailValue}>
                {formatDateInMonth(item.start_date)} -{' '}
                {formatDateInMonth(item.end_date)}
              </CustomText>
            </View>

            <View style={styles.detailRow}>
              <CustomText allowFontScaling={false} style={styles.detailLabel}>
                Reason
              </CustomText>
              <CustomText
                allowFontScaling={false}
                style={styles.detailValue}
                numberOfLines={4}>
                {item.reason}
              </CustomText>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {item?.status !== 'pending' && (
        <View style={[styles.statusBadge, statusBadgeStyle]}>
          <CustomText allowFontScaling={false} style={statusBadgeTextStyle}>
            {item?.status === 'approved' ? 'Approved' : 'Rejected'} by:{' '}
            {(() => {
              const user =
                item.status === 'approved'
                  ? item.approved_by
                  : item.rejected_by;
              const name = `${user?.first_name || ''} ${user?.last_name || ''
                }`.trim();
              return name || user?.email || '';
            })()}
          </CustomText>
        </View>
      )}

      <View style={{ position: 'absolute', right: 10, top: 10 }}>
        <CustomText
          allowFontScaling={false}
          style={{
            color: DarkColor50,
            fontSize: 9,
            fontFamily: fonts.PoppinsRegular,
          }}>
          {formatDate(item?.created_at)}
        </CustomText>
      </View>
    </View>
  );
};


const MyApprovalsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [filterType, setFilterType] = useState('leaves');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [LeaveData, setLeaveData] = useState([]);
  const [ExpenseData, setExpenseData] = useState([]);
  const [Loader1, setLoader] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const [ItemId, setItemId] = useState(null);

  const isFocused = useIsFocused();

  const filterOptions = [
    { label: 'Leaves', value: 'leaves' },
    { label: 'Expense Claim', value: 'expense_claim' },
  ];
  const toastRef = useRef(null);
  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      return true; // Prevent default behavior (app close)
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [navigation]);

  const FetchData = useCallback(async () => {
    try {
      setLoader(true);
      if (filterType === 'leaves') {
        const res = await GetTakeLeaveApi({ self: true });
        setLeaveData(res?.results || []);
      } else {
        const resExpense = await GetExpenseClaimApi({ self: true });
        console.log(
          'Expense Claim Data',
          JSON.stringify(resExpense?.results || []),
        );
        setExpenseData(resExpense?.results || []);
      }
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoader(false);
    }
  }, [filterType]);

  useFocusEffect(
    useCallback(() => {
      FetchData();
    }, [FetchData]),
  );

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleEdit = item => {
    if (filterType === 'leaves' && item.status === 'pending') {
      navigation.navigate('LeaveScreen', { item: item, isEdit: true });
    } else {
      navigation.navigate('ExpenseClaimScreen', {
        DataList: item,
        isEdit: true,
      });
    }
  };

  const HandleDeleteApis = async Id => {
    if (filterType === 'leaves') {
      try {
        const res = await DeleteLeaveApi(ItemId, {});
        if (res?.success) {
          console.log('Leave deleted successfully', res);

          setDeleteModalVisible(false);
          FetchData();
        } else {
          toastRef.current.show({
            type: 'error',
            message: res?.message,
          });
        }
      } catch (error) {
        console.log('Error deleting leave:', error);
        // toastRef.current?.showToast('Failed to delete leave.');
      }
    } else {
      try {
        const res = await DeleteExpenseClaimApi(ItemId, {});
        if (res?.success) {
          console.log('Expense Claim deleted successfully', res);
          setDeleteModalVisible(false);
          FetchData();
        } else {
          toastRef.current.show({
            type: 'error',
            message: res?.message,
          });
        }
      } catch (error) {
        console.log('Error deleting Expense Claim:', error);
      }
    }
  };

  const handleDelete = async itemId => {
    console.log('Deleting item:', itemId);
    setItemId(itemId);
    setDeleteModalVisible(true);
  };

  const renderHiddenItem = (data, rowMap) => {
    // We only show the swipe options for items that are 'pending'
    if (data.item.status !== 'pending') {
      return null; // Return null to show no hidden buttons for approved/rejected items
    }

    return (
      <View
        style={{
          backgroundColor: '#e0e0e0',
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
          borderRadius: 4,
        }}>
        <View style={styles.rowBack}>
          {/* EDIT BUTTON */}
          <TouchableOpacity
            style={[styles.backRightBtn, styles.backRightBtnLeft]}
            onPress={() => {
              handleEdit(data.item);
              rowMap[data.item.id]?.closeRow();
            }}>
            <EditLinePencilIcon
              width={22}
              height={22}
              color={mainOrangeColor}
            />
          </TouchableOpacity>

          {/* DELETE BUTTON */}
          <TouchableOpacity
            style={[styles.backRightBtn, styles.backRightBtnRight]}
            onPress={() => {
              handleDelete(data.item.id);
              rowMap[data.item.id]?.closeRow(); // Close the row after action
            }}>
            <LightDeleteSvg width={22} height={22} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filteredData = React.useMemo(() => {
    const data = filterType === 'leaves' ? LeaveData : ExpenseData;
    return (
      data?.filter(item => {
        if (activeTab === 'Pending') return item?.status === 'pending';
        if (activeTab === 'Approved') return item?.status === 'approved';
        if (activeTab === 'Rejected') return item?.status === 'rejected';
        return true;
      }) || []
    );
  }, [LeaveData, ExpenseData, filterType, activeTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={mainWhiteColor} barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowSvg />
          </TouchableOpacity>
          <CustomText style={styles.headerTitle}>
            {filterType === 'leaves' ? 'Leaves' : 'Expense Claim'}
          </CustomText>
          <View style={styles.headerControls}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              containerStyle={styles.dropdownContainer}
              data={filterOptions}
              maxHeight={210}
              labelField="label"
              valueField="value"
              placeholder="Leaves"
              value={filterType}
              onChange={item => setFilterType(item.value)}
              itemTextStyle={styles.itemTextStyle}
            />
          </View>
        </View>

        <View style={styles.tabContainer}>
          {['Pending', 'Approved', 'Rejected'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}>
              <CustomText
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </CustomText>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <SwipeListView
          data={filteredData}
          renderItem={({ item }) => (
            <ApprovalCard
              navigation={navigation}
              item={item}
              filterType={filterType}
            />
          )}
          keyExtractor={item => item.id.toString()}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-150} // Increased from -75 to accommodate two 75px buttons
          disableRightSwipe
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyListComponents text="No Data Found" type={1} />
          }
          // stopLeftSwipe is a more reliable prop to prevent opening too far
          stopLeftSwipe={-150}
          // use friction to make the swipe feel better
          friction={9}
        />

        <Toast toastRef={toastRef} />

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
      <Loader status={Loader1} />

      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        title="Delete "
        message="Are you sure you want to delete this?"
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={HandleDeleteApis}
      />
    </SafeAreaView>
  );
};

// --- MODIFIED ---
// Added new styles for the swipe-to-delete feature
const styles = StyleSheet.create({
  //... all your existing styles (safeArea, container, header, etc.)
  safeArea: {
    flex: 1,
    backgroundColor: mainWhiteColor,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 18,
    color: DarkColor,
    marginLeft: 16,
    flex: 1,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: {
    width: 120,
    height: 35,
    borderColor: DarkColor80,
    // borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 0,
    borderWidth: 0.5,
  },
  dropdownContainer: {
    borderRadius: 4,
    marginTop: 4,
  },
  placeholderStyle: {
    fontSize: 12,
    color: DarkColor60,
  },
  selectedTextStyle: {
    fontSize: 12,
    color: DarkColor80,
  },
  itemTextStyle: {
    fontSize: 12,
    color: DarkColor80,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    paddingVertical: 15,
    alignItems: 'center',
    flex: 1,
  },
  tabText: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 16,
    color: DarkColor60,
  },
  activeTabText: {
    color: mainOrangeColor,
  },
  activeTabIndicator: {
    height: 3,
    width: '100%',
    backgroundColor: mainOrangeColor,
    position: 'absolute',
    bottom: -1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  listContentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: mainWhiteColor, // Important for the hidden item not to show through
    borderRadius: 4,
    marginBottom: 16,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 16,
    paddingHorizontal: 10,
  },
  cardBody: {
    marginBottom: 0,
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    width: '40%',
  },
  detailValue: {
    fontSize: 12,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    width: '60%',
    textAlign: 'left',
  },
  statusBadge: {},
  approvedBadge: {
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    paddingVertical: 10,
  },
  approvedBadgeText: {
    color: '#00796B',
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
  },
  rejectedBadge: {
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    paddingVertical: 10,
  },
  rejectedBadgeText: {
    color: '#D32F2F',
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
  },
  rowBack: {
    flex: 1,
    marginBottom: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align buttons to the right
    paddingRight: 15, // Add some padding
  },
  backRightBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 45,
    height: 45,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  backRightBtnLeft: {
    borderColor: mainOrangeColor,
    borderWidth: 0.5,
  },
  backRightBtnRight: {
    borderColor: 'red',
    borderWidth: 0.5,
  },
  backTextWhite: {
    color: '#FFF',
    fontFamily: fonts.PoppinsRegular,
    fontSize: 12,
  },
  // --- Ensure your card has a background color ---
  // card: {
  //   backgroundColor: mainWhiteColor, // This is crucial so hidden items don't show through
  //   borderRadius: 4,
  //   padding: 16,
  //   paddingHorizontal: 10,
  //   marginBottom: 16,
  //   borderTopWidth: 0.5,
  //   borderBottomWidth: 0.5,
  //   borderColor: '#e0e0e0',
  // },
});

export default MyApprovalsScreen;
