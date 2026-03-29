// import 'react-native-get-random-values';
// import nacl from 'tweetnacl';
// import * as naclUtil from 'tweetnacl-util';

// // ---------- Random ID Generator ----------
// const generateRandomId = () => {
//   return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
// };

// // ---------- Key Pair Generate ----------
// export const generateKeyPair = () => {
//   const keyPair = nacl.box.keyPair();

//   return {
//     publicKey: naclUtil.encodeBase64(keyPair.publicKey),
//     secretKey: naclUtil.encodeBase64(keyPair.secretKey),
//   };
// };

// // ---------- Encrypt Message ----------
// export const encryptMessage = (message, receiverPublicKey, senderSecretKey) => {
//   try {
//     const nonce = nacl.randomBytes(nacl.box.nonceLength);

//     const encrypted = nacl.box(
//       naclUtil.decodeUTF8(String(message)),
//       nonce,
//       naclUtil.decodeBase64(receiverPublicKey),
//       naclUtil.decodeBase64(senderSecretKey),
//     );

//     return {
//       ciphertext: naclUtil.encodeBase64(encrypted),
//       nonce: naclUtil.encodeBase64(nonce),
//       alg: 'XSalsa20-Poly1305',
//       version: 1,
//     };
//   } catch (error) {
//     console.log('Encrypt Error:', error);
//     return null;
//   }
// };

// // ---------- Decrypt Message ----------
// export const decryptMessage = (
//   ciphertext,
//   nonce,
//   senderPublicKey,
//   receiverSecretKey,
// ) => {
//   try {
//     const decrypted = nacl.box.open(
//       naclUtil.decodeBase64(ciphertext),
//       naclUtil.decodeBase64(nonce),
//       naclUtil.decodeBase64(senderPublicKey),
//       naclUtil.decodeBase64(receiverSecretKey),
//     );

//     if (!decrypted) return null;

//     return naclUtil.encodeUTF8(decrypted);
//   } catch (error) {
//     console.log('Decrypt Error:', error);
//     return null;
//   }
// };

// // ---------- Payload Builder ----------
// export const buildEncryptedPayload = ({
//   action,
//   message,
//   receiverPublicKey,
//   senderSecretKey,
//   extra = {},
// }) => {
//   const encrypted = encryptMessage(message, receiverPublicKey, senderSecretKey);

//   if (!encrypted) return null;

//   return {
//     id: generateRandomId(), // ✅ random message id
//     action,
//     timestamp: new Date().toISOString(),
//     ...extra,
//     encrypted,
//   };
// };
import 'react-native-get-random-values';
import nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import CryptoJS from 'crypto-js';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Base_url} from '../Api/config/apiUrls';

// ---------- Derive Workspace Key ----------
const deriveWorkspaceKeyBytes = async workspaceId => {
  const seed = `rigglex-workspace:${String(workspaceId)}`;

  const hash = CryptoJS.SHA256(seed).toString(CryptoJS.enc.Hex);

  const bytes = new Uint8Array(
    hash.match(/.{1,2}/g).map(byte => parseInt(byte, 16)),
  );

  return bytes;
};

// ---------- Generate Key Pair ----------
const generateKeyPair = () => {
  const keyPair = nacl.box.keyPair();

  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    secretKey: naclUtil.encodeBase64(keyPair.secretKey),
  };
};

// ---------- Wrap Workspace Key ----------
const wrapWorkspaceKey = (workspaceKey, receiverPublicKey, senderSecretKey) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);

  const encrypted = nacl.box(
    workspaceKey,
    nonce,
    naclUtil.decodeBase64(receiverPublicKey),
    naclUtil.decodeBase64(senderSecretKey),
  );

  return naclUtil.encodeBase64(encrypted);
};

// ---------- Main Function ----------
export const registerDeviceEncryptionKey = async () => {
  try {
    const wsId = await AsyncStorage.getItem('HubId');
    const token = await AsyncStorage.getItem('token');

    if (!wsId || !token) {
      console.log('WorkspaceId or token missing');
      return;
    }

    // Device ID
    const devId = await DeviceInfo.getUniqueId();
    const deviceId = String(devId);

    // Generate device keypair
    const keyPair = generateKeyPair();

    // Derive workspace key
    const workspaceKeyBytes = await deriveWorkspaceKeyBytes(wsId);

    // Wrap workspace key
    const wrapped = wrapWorkspaceKey(
      workspaceKeyBytes,
      keyPair.publicKey,
      keyPair.secretKey,
    );

    const payload = {
      workspace_id: String(wsId),
      device_id: deviceId,
      wrapped_workspace_key: String(wrapped),
    };

    console.log('E2EE Payload:', payload);

    const response = await fetch(
      `${Base_url}users/encryption-key/register-device-key/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Hub-ID': String(wsId),
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    console.log('E2EE API Response:', data);

    return data;
  } catch (error) {
    console.log('E2EE Error:', error);
  }
};
