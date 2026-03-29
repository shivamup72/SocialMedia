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
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { generateKeyPair } from '../../utils/e2ee';

const AsyncStorage1 = {
  setItem: async (key, value) => {
    try {
      const data = typeof value === "string" ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, data);
    } catch (error) { }
  },

  getItem: async (key) => {
    try {
      const item = await AsyncStorage.getItem(key);

      if (!item) return null;

      try {
        return JSON.parse(item);
      } catch (e) {
        return item;
      }

    } catch (error) {
      return null;
    }
  },

  removeItem: async (key) => {
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

// export const setupUserKeys = async () => {

//   const existingSecret = await AsyncStorage1.getItem("secretKey");

//   if (existingSecret) {
//     console.log("Keys already exist");
//     return;
//   }

//   const keys = generateKeyPair();

//   if (!keys) {
//     console.log("Key generation failed");
//     return;
//   }

//   await AsyncStorage1.setItem("publicKey", keys.publicKey);
//   await AsyncStorage1.setItem("secretKey", keys.secretKey);

//   console.log("Keys generated and saved");

// };


export default AsyncStorage1;