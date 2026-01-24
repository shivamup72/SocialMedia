import { apiPost, apiGet, apiPatch } from '../context/apiServices';
import { apiDelete } from './apiFunctions';
import {
  UserActivityApi,
  CatchUpTodayApi,
  userListing,
  GroupIconapi,
  PrivateUserIconapi,
  CreateWorkSpaceApi,
  GenerateCodeApi,
  JoinHubByCodeApi,
  CalenderMeetingApi,
  TaskCalenderApi,
  LogoutApi,
  CreateWorkSpaceApiId,
  SettingsApi,
  FCMTokenApi,
  LineManagerCodeApi,
  LeaveWorkspaceApi,
} from './apiUrls';

// Leave workspace
export const LeaveWorkspaceApiId = async data => {
  console.log(
    'Calling LeaveWorkspaceApiId with params:',
    `${LeaveWorkspaceApi}?${data}`,
  );
  return apiPost(LeaveWorkspaceApi, data, true);
};

// Selected Members
export const PatchSelectedMembersApi = async (id, data) => {
  console.log('Calling PatchSelectedMembersApi with params:', data);
  return apiPatch(PatchSelectedMembersApi(id), data, true);
};

// Selected Members Get
export const GetSelectedMembersApi = async (id, data) => {
  console.log('Calling GetSelectedMembersApi with params:', data);
  return apiGet(PatchSelectedMembersApi(id), data);
};

export const PostUserActivityApi = async data => {
  console.log('Calling PostUserActivityApi with data:', data);
  // Replaced apiPost(..., ..., true) with the new signature where the 3rd param is isFormData
  return apiPost(UserActivityApi, data, true);
};

export const GetCatchUpTodayApi = async data => {
  console.log('Calling GetCatchUpTodayApi with params:', data);
  return apiGet(CatchUpTodayApi, data);
};

/**
 * Updates user details. Assumes apiUpdateForm was a PATCH request with form data.
 */
export const PatchUserDetailsapi = async data => {
  console.log('Calling PatchUserDetailsapi with data:', data);
  return apiPatch(userListing, data, true); // Assuming this is a PATCH with FormData
};

/**
 * Fetches the user listing.
 */
export const GetUserListingApi = async data => {
  console.log('Calling GetUserListingApi with params:', data);

  try {
    const response = await apiGet(userListing, data);
    return response;
  } catch (error) {
    console.error('Error in GetUserListingApi:', error);
    throw error;
  }
};

export const PatchUserIDListingApi = async (id, data) => {
  // const url = PrivateUserIconapi(id);
  console.log(
    `Calling PatchUserIDListingApi for ID ${id} with data:`,
    `${PrivateUserIconapi(id)}?${data}`,
  );
  return apiPatch(PrivateUserIconapi(id), data, true);
};

export const GetUserIdListingApi = async (id, data) => {
  console.log(
    'Calling GetUserIdListingApi with params:',
    PrivateUserIconapi(id),
    data,
    id,
    '\n',
  );
  return apiGet(PrivateUserIconapi(id), data);
};

export const PatchGroupIconapi = async (id, data) => {
  const url = GroupIconapi(id);
  console.log(`Calling PatchGroupIconapi for ID ${id} with data:`, url, data);
  return apiPatch(url, data, true);
};

/**
 * Updates a private user's icon. (Note: This seems duplicative of PatchUserIDListingApi)
 */
export const PatchPrivateUserIconapi = async (id, data) => {
  const url = PrivateUserIconapi(id);
  console.log(`Calling PatchPrivateUserIconapi for ID ${id} with data:`, data);
  return apiPatch(url, data, true);
};

// --- Workspace and Hubs ---

/**
 * Creates a new workspace. Assumes apiPostForm was a POST with form data.
 */
export const PostCreateWorkSpaceApi = async data => {
  console.log('Calling PostCreateWorkSpaceApi with data:', data);
  return apiPost(CreateWorkSpaceApi, data, true); // Replaced apiPostForm
};

/**
 * Fetches workspace data.
 */
export const GetCreateWorkSpaceApi = async data => {
  console.log(
    'Calling GetCreateWorkSpaceApi with params check -=-=-=-=-=-=----->',
    CreateWorkSpaceApi,
    data,
    '\n',
    '\n',
  );
  return apiGet(CreateWorkSpaceApi, data);
};

/**
 * Generates a workspace code. Assumes a POST request with form data.
 */
export const GetWorkSpaceCode = async data => {
  console.log(
    'Calling GetWorkSpaceCode with data:',
    `${GenerateCodeApi}?${data}`,
  );
  return apiPost(GenerateCodeApi, data, true); // Replaced apiPostForm
};

/**
 * Joins a hub using a code. Assumes a POST request with form data.
 */
export const PostJoinHubByCodeApi = async data => {
  console.log('Calling PostJoinHubByCodeApi with data:', data);
  return apiPost(JoinHubByCodeApi, data, true); // Replaced apiPostForm
};

// --- Calendar and Tasks ---

/**
 * Fetches calendar meetings.
 */
export const GetMeetingApi = async data => {
  console.log('Calling GetMeetingApi with params:', data);
  return apiGet(CalenderMeetingApi, data);
};

/**
 * Fetches calendar tasks.
 */
export const GetTaskCalenderApi = async data => {
  console.log('Calling GetTaskCalenderApi with params:', TaskCalenderApi, data);
  return apiGet(TaskCalenderApi, data);
};

export const PostLogoutApi = async data => {
  console.log('Calling PostLogoutApi');
  // Assumes the logout payload is JSON, so isFormData is false
  return apiPost(LogoutApi, data, false);
};

// Hub get api

export const GetCreateWorkSpaceApiId = async (id, data) => {
  console.log(
    'Calling GetCreateWorkSpaceApi with params:',
    `${CreateWorkSpaceApiId(id)}/${data}`,
  );
  return apiGet(CreateWorkSpaceApiId(id), data);
};

export const PatchCreateWorkSpaceApiId = async (id, data) => {
  console.log('Calling PatchCreateWorkSpaceApi with params:', data);
  return apiPatch(CreateWorkSpaceApiId(id), data, true);
};

// Settings patch api

export const PatchSettingsApi = async (id, data) => {
  console.log('Calling PatchSettingsApi with params:', data);
  return apiPatch(SettingsApi(id), data, true);
};

export const PatchFCMTokenApi = async data => {
  // console.log('Calling PatchFCMTokenApi with params:', data);
  console.log('FCMTokenApi', FCMTokenApi);
  return apiPost(FCMTokenApi, data, true);
};
