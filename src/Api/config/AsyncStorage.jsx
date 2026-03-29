// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { generateKeyPair } from '../../utils/e2ee';

// const AsyncStorage1 = {
//   setItem: async (key, value) => {
//     try {
//       await AsyncStorage.setItem(key, value);
//     } catch (error) { }
//   },
//   getItem: async key => {
//     try {
//       const item = await AsyncStorage.getItem(key);
//       // console.log(item, key, "Token from AsyncStorage");
//       try {
//         return JSON.parse(item);
//       } catch (e) {
//         // If not JSON, return as string
//         return item;
//       }
//     } catch (error) { }
//   },
//   removeItem: async key => {
//     try {
//       await AsyncStorage.removeItem(key);
//     } catch (error) { }
//   },
//   clear: async () => {
//     try {
//       await AsyncStorage.clear();
//     } catch (error) { }
//   },
// };

// export const setupUserKeys = async () => {

//   const existingSecret = await AsyncStorage1.getItem("secretKey");

//   if (existingSecret) {
//     console.log("Keys already exist");
//     return;
//   }

//   const keys = generateKeyPair();

//   await AsyncStorage1.setItem("publicKey", keys.publicKey);
//   await AsyncStorage1.setItem("secretKey", keys.secretKey);

//   console.log("Keys generated and saved");
// };

// export default AsyncStorage1;
import sqliteStorage from '../../utils/sqliteStorage';

const AsyncStorage1 = {
  setItem: async (key, value) => {
    try {
      await sqliteStorage.setItem(key, value);
    } catch (error) {
      console.error('[AsyncStorage1] setItem error:', error);
    }
  },

  getItem: async (key) => {
    try {
      const item = await sqliteStorage.getItem(key);
      try {
        return JSON.parse(item);
      } catch (e) {
        // If not JSON, return as string
        return item;
      }
    } catch (error) {
      console.error('[AsyncStorage1] getItem error:', error);
      return null;
    }
  },

  getAllKeys: async () => {
    try {
      return await sqliteStorage.getAllKeys();
    } catch (error) {
      console.error('[AsyncStorage1] getAllKeys error:', error);
      return [];
    }
  },

  removeItem: async (key) => {
    try {
      await sqliteStorage.removeItem(key);
    } catch (error) {
      console.error('[AsyncStorage1] removeItem error:', error);
    }
  },

  clear: async () => {
    try {
      await sqliteStorage.clear();
    } catch (error) {
      console.error('[AsyncStorage1] clear error:', error);
    }
  },
};

export default AsyncStorage1;