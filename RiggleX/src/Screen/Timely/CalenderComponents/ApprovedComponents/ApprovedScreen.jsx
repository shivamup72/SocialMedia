import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import BackArrowSvg from '../../../../assets/svg/BackArrowSvg';
import { fonts, DarkColor, DarkColor60, mainWhiteColor, mainOrangeColor, DarkColor80, DarkColor50, DarkColor40, DarkColor30, DarkColor20 } from '../../../style/fonts';
// import CalenderSvg from '../../../assets/svg/CalenderSvg';
import Toast from '../../../../Api/context/Toast';
import { GetTakeLeaveApi, GetExpenseClaimApi } from '../../../../Api/config/TimelyApi';


const mockData = {
  leaves: {
    Pending: [
      {
        id: '1',
        name: 'Ajay Sharma',
        designation: 'Designation',
        avatar: 'https://i.pravatar.cc/150?u=ajay',
        appliedOn: '12 June, 2024',
        leaveType: 'On Job Training',
        duration: '12 Jun-13 Jun, 2024 (2 days)',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        status: 'Pending',
      },
      {
        id: '2',
        name: 'Priya Singh',
        designation: 'Frontend Developer',
        avatar: 'https://i.pravatar.cc/150?u=priya',
        appliedOn: '11 June, 2024',
        leaveType: 'Sick Leave',
        duration: '11 Jun, 2024 (1 day)',
        description: 'Feeling unwell, unable to work. dkod dkpd dmdkemd dkpd odjnd  wdoed djo doje eddd dod d ododnd oeoendn',
        status: 'Pending',
      },
    ],
    Approved: [
      {
        id: '3',
        name: 'Ajay Sharma',
        designation: 'Designation',
        avatar: 'https://i.pravatar.cc/150?u=ajay',
        appliedOn: '12 June, 2024',
        leaveType: 'On Job Training',
        duration: '12 Jun-13 Jun, 2024 (2 days)',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        remark: 'xyz',
        processedBy: 'Yash Jaiswal',
        status: 'Approved',
      },
    ],
    Rejected: [
      {
        id: '4',
        name: 'Sameer Khan',
        designation: 'Project Manager',
        avatar: 'https://i.pravatar.cc/150?u=sameer',
        appliedOn: '10 June, 2024',
        leaveType: 'Work From Home',
        duration: '10 Jun, 2024 (1 day)',
        description: 'Need to WFH due to personal reasons.',
        remark: 'Insufficient reason provided.',
        processedBy: 'Yash Jaiswal',
        status: 'Rejected',
      },
    ],
  },
  expense_claim: {
    Pending: [
      {
        id: '5',
        name: 'Riya Verma',
        designation: 'Marketing Manager',
        avatar: 'https://i.pravatar.cc/150?u=riya',
        appliedOn: '14 June, 2024',
        claimType: 'Travel',
        amount: '₹ 2,500',
        description: 'Client meeting travel expenses.',
        status: 'Pending',
      },
    ],
    Approved: [
      {
        id: '6',
        name: 'Karan Gupta',
        designation: 'Software Engineer',
        avatar: 'https://i.pravatar.cc/150?u=karan',
        appliedOn: '13 June, 2024',
        claimType: 'Food',
        amount: '₹ 800',
        description: 'Team lunch expense.',
        remark: 'Approved',
        processedBy: 'Yash Jaiswal',
        status: 'Approved',
      },
    ],
    Rejected: [
      {
        id: '7',
        name: 'Sneha Sharma',
        designation: 'HR Executive',
        avatar: 'https://i.pravatar.cc/150?u=sneha',
        appliedOn: '12 June, 2024',
        claimType: 'Others',
        amount: '₹ 1,200',
        description: 'Office supplies purchase.',
        remark: 'Please provide original bills.',
        processedBy: 'Yash Jaiswal',
        status: 'Rejected',
      },
    ],
  }
};



const ApprovalCard = ({ item, filterType }) => {
  const isPending = item.status === 'Pending';
  const isApproved = item.status === 'Approved';
  const isExpenseClaim = filterType === 'expense_claim';

  const statusBadgeStyle = isApproved
    ? styles.approvedBadge
    : styles.rejectedBadge;
  const statusBadgeTextStyle = isApproved
    ? styles.approvedBadgeText
    : styles.rejectedBadgeText;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.designation}>{item.designation}</Text>
        </View>
        <Text style={styles.appliedDate}>Applied on{'\n'}{item.appliedOn}</Text>
      </View>

      <View style={styles.cardBody}>
        {isExpenseClaim ? (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Claim Type</Text>
              <Text style={styles.detailValue}>{item.claimType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>{item.amount}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Leave Type</Text>
              <Text style={styles.detailValue}>{item.leaveType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Leave Duration</Text>
              <Text style={styles.detailValue}>{item.duration}</Text>
            </View>
          </>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description</Text>
          <Text style={styles.detailValue}>{item.description}</Text>
        </View>
        {!isPending && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Remark</Text>
            <Text style={styles.detailValue}>{item.remark}</Text>
          </View>
        )}
      </View>

      {isPending ? (
        <View style={styles.buttonContainer}>
          {isExpenseClaim &&
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.approveButton}>
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.statusBadge, statusBadgeStyle]}>
          <Text style={statusBadgeTextStyle}>
            {item.status} by: {item.processedBy}
          </Text>
        </View>
      )}
    </View>
  );
};


const ApprovalsScreen = ({ navigation }) => {

  const [activeTab, setActiveTab] = useState('Pending');
  const [filterType, setFilterType] = useState('leaves');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [LeaveData, setLeaveData] = useState([]);
  const [ExpenseData, setExpenseData] = useState([]);

  const filterOptions = [
    { label: 'Leaves', value: 'leaves' },
    { label: 'Expense Claim', value: 'expense_claim' },
  ];


  const toastRef = useRef(null);


  useEffect(() => {
    const FetchData = async () => {
      try {

        if (filterType === 'leaves') {

          if (LeaveData.length === 0) {
            const res = await GetTakeLeaveApi({});
            setLeaveData(res?.results);
            console.log('\n', 'res  Take Leave Api', JSON.stringify(res), '\n', '\n');
          }
        } else {
          if (ExpenseData.length === 0) {
            const resExpense = await GetExpenseClaimApi({});
            setExpenseData(resExpense?.results);
            console.log('\n', 'res  Expense Claim Api', JSON.stringify(resExpense), '\n', '\n');
          }
        }
      } catch (error) {
        // console.log('Error fetching data:', error);
      }
    }

    FetchData();
  }, [filterType])


  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };


  const listData = useMemo(() => {

    if (mockData[filterType] && mockData[filterType][activeTab]) {
      return mockData[filterType][activeTab];
    }
    return [];
  }, [activeTab, filterType]);



  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={mainWhiteColor} barStyle="dark-content" />
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowSvg />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Approvals</Text>
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
            {/* <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <CalenderSvg width={20} height={20} color={DarkColor60} />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['Pending', 'Approved', 'Rejected'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content List */}
        <FlatList
          data={listData}
          renderItem={({ item }) => <ApprovalCard item={item} filterType={filterType} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        />

        <Toast toastRef={toastRef} />

        {/* Date Picker Modal */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: mainWhiteColor,
  },
  container: {
    flex: 1,
  },
  // Header Styles
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
    borderColor: DarkColor40,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 0,
    borderWidth: 0.5,
    borderColor: DarkColor40,
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
  // Tab Styles
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
  // List Styles
  listContentContainer: {
    padding: 16,
  },
  // Card Styles
  card: {
    backgroundColor: mainWhiteColor,
    borderRadius: 4,
    padding: 16,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
  },
  designation: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
  },
  appliedDate: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    textAlign: 'right',
  },
  cardBody: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor60,
    width: '40%',
  },
  detailValue: {
    fontSize: 10,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    width: '60%',
    textAlign: 'left',
  },
  // Action Styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: DarkColor60,
    alignItems: 'center',
    marginRight: 8,
  },
  editButtonText: {
    color: DarkColor80,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: mainOrangeColor,
    alignItems: 'center',
    marginRight: 8,
  },
  rejectButtonText: {
    color: mainOrangeColor,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
  },
  approveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: mainOrangeColor,
    alignItems: 'center',
    marginLeft: 8,
  },
  approveButtonText: {
    color: mainWhiteColor,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
  },
  statusBadge: {
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  approvedBadge: {
    backgroundColor: '#E0F2F1',
  },
  approvedBadgeText: {
    color: '#00796B',
    fontFamily: fonts.PoppinsMedium,
  },
  rejectedBadge: {
    backgroundColor: '#FFEBEE',
  },
  rejectedBadgeText: {
    color: '#D32F2F',
    fontFamily: fonts.PoppinsMedium,
  },
});

export default ApprovalsScreen;