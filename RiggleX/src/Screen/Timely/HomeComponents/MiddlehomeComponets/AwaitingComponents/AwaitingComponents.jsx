import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { fonts,mainOrangeColor,DarkColor,DarkColor20,DarkColor50,mainOrange20,mainOrange50,mainWhiteColor,mainOrange92,DarkColor80,mainGrayColor } from '../../../style/fonts';

const AwaitingComponents = () => {
  const DocumentsImage = require('../../../assets/Png/WaitingIconSvg.png');
  const profile1 = require('../../../assets/Png/ProfileIcon.png');
  const profile2 = require('../../../assets/Png/ProfileIcon2.png');

  
  const dummyData = [
    {
      id: 1,
      name: 'Sachin Verma',
      type: 'leave',
      dateRange: 'May 25, 2025 - May 27, 2025',
      amount: null,
      profileImage: profile1
    },
    {
      id: 2,
      name: 'Ishaan Sharma',
      type: 'expense',
      dateRange: null,
      amount: '₹ 2,000',
      profileImage: profile2
    },
    {
      id: 3,
      name: 'Priya Singh',
      type: 'leave',
      dateRange: 'June 1, 2025 - June 3, 2025',
      amount: null,
      profileImage: profile1
    },
    {
      id: 4,
      name: 'Rahul Kumar',
      type: 'expense',
      dateRange: null,
      amount: '₹ 1,500',
      profileImage: profile2
    },
    {
      id: 5,
      name: 'Anita Patel',
      type: 'leave',
      dateRange: 'June 5, 2025 - June 7, 2025',
      amount: null,
      profileImage: profile1
    },
    {
      id: 6,
      name: 'Vikram Mehta',
      type: 'expense',
      dateRange: null,
      amount: '₹ 3,200',
      profileImage: profile2
    },
    {
      id: 7,
      name: 'Sneha Gupta',
      type: 'leave',
      dateRange: 'June 10, 2025 - June 12, 2025',
      amount: null,
      profileImage: profile1
    },
    {
      id: 8,
      name: 'Arjun Reddy',
      type: 'expense',
      dateRange: null,
      amount: '₹ 2,800',
      profileImage: profile2
    },
    {
      id: 9,
      name: 'Kavya Nair',
      type: 'leave',
      dateRange: 'June 15, 2025 - June 17, 2025',
      amount: null,
      profileImage: profile1
    },
    {
      id: 10,
      name: 'Rohit Sharma',
      type: 'expense',
      dateRange: null,
      amount: '₹ 4,500',
      profileImage: profile2
    }
  ];

  const renderCard = ({ item }) => {
    const isLeave = item.type === 'leave';
    const cardStyle = isLeave ? styles.leaveCard : styles.expenseCard;
    const borderColor = isLeave ? '#4DD0E1' : '#FF8A65';

    return (
      <View style={[styles.card, cardStyle, { borderLeftColor: borderColor }]}>
        <View style={styles.cardHeader}>
          <Image source={item.profileImage} style={styles.profileImage} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            {isLeave ? (
              <Text style={styles.dateRange}>{item.dateRange}</Text>
            ) : (
              <Text style={styles.amount}>Amount: {item.amount}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.approveButton}>
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={DocumentsImage} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Awaiting your action (4)</Text>
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4DD0E1' }]} />
          <Text style={styles.legendText}>Leaves</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF8A65' }]} />
          <Text style={styles.legendText}>Expense Claims</Text>
        </View>
      </View>

      <FlatList
        data={dummyData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

export default AwaitingComponents;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    marginVertical:15,
    borderRadius:20,
    // paddingHorizontal:10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily:fonts.PoppinsSemiBold,
    color:DarkColor,
  },
  legend: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginStart:20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: DarkColor,
    fontFamily:fonts.PoppinsRegular,
  },
  flatListContainer: {
    paddingHorizontal: 20,
    paddingBottom:10,
  },
  separator: {
    width: 15,
  },
  card: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaveCard: {
    borderLeftColor: '#4DD0E1',
  },
  expenseCard: {
    borderLeftColor: '#FF8A65',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontFamily :fonts.PoppinsSemiBold,
    color: DarkColor80,
    marginBottom: 1,
  },
  dateRange: {
    fontSize: 10,
    color: DarkColor,
    fontFamily:fonts.PoppinsMedium,
  },
  amount: {
    fontSize: 10,
    color: DarkColor,
    fontFamily:fonts.PoppinsMedium,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    backgroundColor: mainOrangeColor,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.45,
  },
  approveButtonText: {
    color: mainWhiteColor,
    fontSize: 12,
    fontFamily:fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: mainOrangeColor,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.45,
  },
  rejectButtonText: {
    color: mainOrangeColor,
    fontSize: 12,
    fontFamily:fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
});