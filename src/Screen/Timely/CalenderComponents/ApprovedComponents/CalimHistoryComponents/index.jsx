// import {StyleSheet, Text, View} from 'react-native';
// import React from 'react';
// import HeaderComponents from '../../../../components/HeaderComponents/HeaderComponents';

// const ExpenseClaimHistory = ({navigation, route}) => {
//   const {item} = route?.params;

//   console.log('item expense claim history', item, '\n', '\n', '\n');

//   return (
//     <View style={{flex: 1, backgroundColor: '#ffffff'}}>
//       <HeaderComponents
//         Type={'Expense Claim History'}
//         navigation={navigation}
//       />
//     </View>
//   );
// };

// export default ExpenseClaimHistory;

// const styles = StyleSheet.create({});

////
//
///////

import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
// import HeaderComponents from '../../../../components/HeaderComponents/HeaderComponents';
import {
  fonts,
  DarkColor,
  DarkColor50,
  DarkColor60,
  DarkColor80,
} from '../../../../../utils/style/fonts';
import {
  formatDateTimeWithTime,
  formatDateInMonth,
} from '../../../../../utils/CommonUtils';
import CustomText from '../../../../../utils/CustomText';

const ExpenseClaimCard = ({ item, expense_date }) => (
  <View style={styles.cardContainer}>
    <View style={styles.topContainer}>
      <View style={styles.dateInfo}>
        <CustomText style={styles.dateLabel}>Claim date</CustomText>
        <CustomText style={styles.dateValue}>{formatDateInMonth(expense_date)}</CustomText>
        <CustomText style={[styles.dateLabel, { marginTop: 4 }]}>Applied On:</CustomText>
        <CustomText style={styles.dateValue}>
          {formatDateInMonth(item?.created_at)}
        </CustomText>
      </View>
    </View>

    <View style={styles.detailsContainer}>
      <View style={styles.detailRow}>
        <CustomText style={styles.detailLabel}>Expense Claim</CustomText>
        <CustomText style={styles.detailValue}>{item?.expense_type}</CustomText>
      </View>
      <View style={styles.detailRow}>
        <CustomText style={styles.detailLabel}>Amount</CustomText>
        <CustomText style={styles.detailValueAmount}>{item?.amount}</CustomText>
      </View>

      <View style={styles.detailRow}>
        <CustomText style={styles.detailLabel}>Description</CustomText>
        <CustomText style={styles.detailValue} numberOfLines={4}>
          {item?.description}
        </CustomText>
      </View>
    </View>
  </View>
);

const ExpenseClaimHistory = ({ navigation, route }) => {
  console.log(
    '\n',
    '\n',
    'item expense claim history',
    route?.params?.item,
    '\n',
    '\n',
  );

  return (
    <View style={styles.container}>
      {/* <HeaderComponents
        Type={'Expense Claim History'}
        navigation={navigation}
        DataList={route?.params?.item}
      /> */}
      <FlatList
        data={route?.params?.item?.expense_items}
        renderItem={({ item }) => (
          <ExpenseClaimCard
            item={item}
            expense_date={route?.params?.item?.expense_date}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
};

export default ExpenseClaimHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContentContainer: {
    padding: 16,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d3d3d3',
    marginRight: 12,
    // A simple blue placeholder similar to the image
    backgroundColor: '#4A90E2',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  initials: {
    fontSize: 14,
    color: '#666',
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 10,
    color: DarkColor50,
    fontFamily: fonts.PoppinsMedium,
  },
  dateValue: {
    fontSize: 11,
    color: DarkColor,
    fontFamily: fonts.PoppinsSemiBold,
  },
  detailsContainer: {
    // Using flexbox to create the layout
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: DarkColor,
    width: 130, // Fixed width for alignment
    fontFamily: fonts.PoppinsSemiBold,
  },
  detailValue: {
    fontSize: 12,
    color: DarkColor60,
    flex: 1,
    fontFamily: fonts.PoppinsMedium,
  },
  detailValueAmount: {
    fontSize: 12,
    color: DarkColor,
    fontFamily: fonts.PoppinsMedium,
  },
  pdfIcon: {
    width: 16,
    height: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginRight: 12,
  },
  rejectButtonText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  approveButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
