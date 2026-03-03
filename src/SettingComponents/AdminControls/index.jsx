import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import CustomText from '../../utils/CustomText';
import { RfH, RfW } from '../../utils/helper';
import { DarkColor, DarkColor50, DarkColor60, DarkColor80, fonts } from '../../utils/style/fonts';
import DropUpSvg from '../../assets/svg/DropUpSvg';
import DropDownSvgIcon from '../../assets/svg/DropDownSvg';

const AdminControls = () => {
  const [invitePermission, setInvitePermission] = useState('admin_coadmin');
  const [expanded, setExpanded] = useState(false);

  // Placeholder for dropdown logic
  const handleSelectCoAdmin = () => {
    // TODO: Implement co-admin selection logic
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded((prev) => !prev)} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/Png/panelsetting.png')} style={styles.headerIcon} />
          <CustomText style={styles.headerTitle}>Admin Controls</CustomText>
        </View>
        <View>
          {expanded ? (
            <DropUpSvg width={14} height={14} color={DarkColor80} />
          ) : (
            <DropDownSvgIcon width={14} height={14} color={DarkColor80} />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <>
          {/* Add Co-Admin Dropdown */}
          <CustomText style={styles.label}>Add Co-Admin</CustomText>
          <TouchableOpacity style={styles.dropdown} onPress={handleSelectCoAdmin} activeOpacity={0.7}>
            <CustomText style={styles.dropdownText}>Select</CustomText>
            <DropDownSvgIcon width={10} height={10} color={DarkColor80} />
          </TouchableOpacity>
          {/* TODO: Show dropdown options here when implementing selection */}

          {/* Invite & Sharing Controls */}
          <CustomText style={styles.sectionTitle}>Invite & Sharing Controls</CustomText>

          {/* Radio Buttons for Permissions */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setInvitePermission('admin')}
            activeOpacity={0.7}
          >
            <CustomText style={styles.radioText}>Admin only</CustomText>
            <View style={styles.radioOuter}>
              {invitePermission === 'admin' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setInvitePermission('admin_coadmin')}
            activeOpacity={0.7}
          >
            <CustomText style={styles.radioText}>Admin & Co-admin only</CustomText>
            <View style={styles.radioOuter}>
              {invitePermission === 'admin_coadmin' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default AdminControls;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: RfH(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 15,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 16,
  },
  headerIcon: {
    height: RfH(24),
    width: RfH(24)
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 8,
  },

  headerTitle: {
    marginLeft: RfW(10),
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
  },

  label: {
    fontSize: 14,
    color: DarkColor80,
    fontFamily: fonts.PoppinsRegular,
    marginBottom: RfH(6),
    marginTop: RfH(10)
  },

  dropdown: {
    borderWidth: 1,
    borderColor: DarkColor50,
    borderRadius: 6,
    paddingVertical: RfH(12),
    paddingHorizontal: RfW(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dropdownText: {
    color: DarkColor60,
    fontSize: 12,
    fontFamily: fonts.PoppinsRegular,
  },

  sectionTitle: {
    marginTop: RfH(10),
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: DarkColor,
    // marginBottom: 10,
  },

  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: RfH(10),
  },

  radioText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: DarkColor80
  },

  radioOuter: {
    width: RfW(12),
    height: RfH(12),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioInner: {
    width: RfW(12),
    height: RfH(12),
    borderRadius: 6,
    backgroundColor: '#FF8C42',
  },
});