import AsyncStorage from '@react-native-async-storage/async-storage';

const AsyncStorage1 = {
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) { }
  },
  getItem: async key => {
    try {
      const item = await AsyncStorage.getItem(key);
      // console.log(item, key, "Token from AsyncStorage");
      try {
        return JSON.parse(item);
      } catch (e) {
        // If not JSON, return as string
        return item;
      }
    } catch (error) { }
  },
  removeItem: async key => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) { }
  },
  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) { }
  },
};

export default AsyncStorage1;
