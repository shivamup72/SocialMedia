import axios from 'axios';
import {Base_url} from './apiUrls';
import AsyncStorage1 from './AsyncStorage';

import RNFetchBlob from 'rn-fetch-blob';

// STEP 1 → Request Upload URL
export const requestUploadURL = async ({
  fileName,
  contentType,
  fileSize,
  conversationId,
  isGroup = false,
}) => {
  const token = await AsyncStorage1.getItem('token');

  const response = await axios.post(
    `${Base_url}chats/media/request-upload/`,
    {
      file_name: fileName,
      content_type: contentType,
      file_size: Number(fileSize),
      conversation_id: Number(conversationId),
      is_group: isGroup,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

// STEP 2 → Upload file to S3 using rn-fetch-blob
export const uploadFileToS3 = async (
  uploadUrl,
  fileUri,
  contentType,
  fileSize,
) => {
  try {
    const res = await RNFetchBlob.fetch(
      'PUT',
      uploadUrl,
      {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
      },
      RNFetchBlob.wrap(fileUri),
    );
    if (res.info().status !== 200 && res.info().status !== 201) {
      throw new Error('S3 Upload Failed');
    }
    return true;
  } catch (error) {
    console.log('uploadFileToS3 error', error);
    throw error;
  }
};

// STEP 3 → Confirm Upload
export const confirmUpload = async ({attachmentId, s3Key, isGroup = false}) => {
  const token = await AsyncStorage1.getItem('token');

  const response = await axios.post(
    `${Base_url}chats/media/confirm-upload/`,
    {
      attachment_id: attachmentId,
      s3_key: s3Key,
      is_group: isGroup,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
// STEP 4 → Request Download URL
export const requestDownloadURL = async ({attachmentId, isGroup = false}) => {
  const token = await AsyncStorage1.getItem('token');
  const formData = new FormData();
  formData.append('attachment_id', attachmentId);
  formData.append('is_group', isGroup ? 'true' : 'false');
  const response = await axios.post(
    `${Base_url}chats/media/request-download/`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};
