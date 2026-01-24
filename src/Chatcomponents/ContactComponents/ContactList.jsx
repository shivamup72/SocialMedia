import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Contacts from 'react-native-contacts';
import { DarkColor, DarkColor80, fonts } from '../../utils/style/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';


const DUMMY_AVATARS = [
  'https://i.imgur.com/uDb2e0v.png',
  'https://i.imgur.com/8z2h814.png',
  'https://i.imgur.com/A5hA5sC.png',
  'https://i.imgur.com/zvygC22.png',
];

const ContactItem = React.memo(({ id, name, avatar, onPress }) => {
  const handlePress = () => onPress(id);

  return (
    <TouchableOpacity style={styles.contactItem} onPress={handlePress}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <Text allowFontScaling={false} style={styles.contactName}>
        {name}
      </Text>
    </TouchableOpacity>
  );
});

// --- Main Component ---
const ContactsListScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    // The logic to load contacts remains the same.
    const loadContacts = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Contacts permission denied');
          setLoading(false);
          setPermissionError(true);
          return;
        }
      }

      Contacts.getAll()
        .then(fetchedContacts => {
          const processedContacts = fetchedContacts
            .filter(c => c.givenName || c.familyName)
            .map((contact, index) => ({
              id: contact.recordID,
              name: `${contact.givenName || ''} ${contact.familyName || ''
                }`.trim(),
              avatar: DUMMY_AVATARS[index % DUMMY_AVATARS.length],
            }));

          processedContacts.sort((a, b) => a.name.localeCompare(b.name));
          setContacts(processedContacts);
        })
        .catch(e => {
          console.error('Failed to get contacts', e);
          setPermissionError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    loadContacts();
  }, []);

  const handleContactPress = useCallback(contactId => {
    console.log('Pressed contact with ID:', contactId);
    // Add navigation or other actions here
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <ContactItem
        id={item.id}
        name={item.name}
        avatar={item.avatar}
        onPress={handleContactPress}
      />
    ),
    [handleContactPress],
  );

  // A stable function for extracting keys.
  const keyExtractor = useCallback(item => item.id, []);

  const ITEM_HEIGHT = 79;
  const getItemLayout = useCallback(
    (data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#555" />
        <Text allowFontScaling={false} style={styles.infoText}>
          Loading Contacts...
        </Text>
      </View>
    );
  }

  if (permissionError) {
    return (
      <View style={styles.centered}>
        <Text allowFontScaling={false} style={styles.infoText}>
          Permission to access contacts was denied.
        </Text>
        <Text allowFontScaling={false} style={styles.infoText}>
          Please enable it in your phone settings.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text allowFontScaling={false} style={styles.headerText}>
        Contacts
      </Text>

      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text allowFontScaling={false} style={styles.infoText}>
              No contacts found on this device.
            </Text>
          </View>
        )}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  headerText: {
    fontSize: 18,
    fontFamily: fonts.PoppinsSemiBold,
    color: DarkColor,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27, // Half of width/height for a perfect circle
    marginRight: 20,
    backgroundColor: '#f0f0f0',
  },
  contactName: {
    fontSize: 14,
    color: DarkColor80,
    fontFamily: fonts.PoppinsMedium,
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F6F6',

    marginLeft: 94,
  },
});

export default ContactsListScreen;
