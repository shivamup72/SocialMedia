// Import all the URL endpoints
import {
  MyFolderApi,
  MyNotesApis,
  ConstantApi,
  MeetingCreatingApi,
  TaskCreatingApi,
  CalenderTaskApi,
  CalenderDataApi,
  CalenderSubTaskApi,
  CommentApi,
  TaskUpdateApi,
  TakeLeaveApi,
  ExpenseClaimApi,
  MyFolderApiId,
  MyNotesApisId,
  EditLeaveApi,
  ExpenseClaimApiId,
  MeetingUpdateApi,
} from './apiUrls';

// Import our new, centralized API functions from the apiService file
import { apiPost, apiGet, apiPatch, apiDelete } from '../context/apiServices';

// --- Folder APIs ---

export const GetMyFolderApi = async data => {
  // console.log('Calling GetMyFolderApi with params:', data);
  return apiGet(MyFolderApi, data);
};

// Assuming apiUpdate was a PATCH request with JSON data
export const PatchMyFolderApi = async (id, data) => {
  console.log(`Calling PatchMyFolderApi for ID ${id} with data:`, data);
  return apiPatch(MyFolderApiId(id), data, false); // isFormData = false
};

export const DeleteMyFolderApi = async (id, data) => {
  console.log(`Calling DeleteMyFolderApi for ID ${id}`);
  return apiDelete(MyFolderApiId(id), data);
};

// Assuming this POST sends JSON data
export const PostMyFolderApi = async data => {
  console.log('Calling PostMyFolderApi with data:', data);
  return apiPost(MyFolderApi, data, false); // isFormData = false
};

// --- Notes APIs ---

// Replaced manual axios call with our centralized apiDelete
export const DeleteMyNotesApiId = async (id, data) => {
  console.log(`Calling DeleteMyNotesApiId for ID ${id}`);
  return apiDelete(MyNotesApisId(id), data);
};

// Replaced manual axios call with our centralized apiPatch
export const PatchMyNotesApiId = async (id, data) => {
  console.log(
    `Calling PatchMyNotesApiId for ID ${MyNotesApisId(id)} with data:`,
    data,
    '\n',
    '\n',
  );
  return apiPatch(MyNotesApisId(id), data, false); // isFormData = false
};

// Assuming this POST sends JSON data
export const PostMyNotesApi = async data => {
  console.log('Calling PostMyNotesApi with data:', data);
  return apiPost(MyNotesApis, data, false); // isFormData = false
};

export const GetMyNotesApi = async data => {
  // console.log('Calling GetMyNotesApi with params:', data);
  return apiGet(MyNotesApis, data);
};

// --- General & Constant APIs ---

export const GetConstantApi = async data => {
  // console.log('Calling GetConstantApi with params:', data);
  return apiGet(ConstantApi, data);
};

// --- Meeting & Task Creation ---

// Replaced apiPostForm, indicating multipart/form-data
export const PostCreateMeetingApi = async data => {
  console.log('Calling PostCreateMeetingApi with raw data:', data);
  return apiPost(MeetingCreatingApi, data, false); // isFormData = true
};

// Patch Meeting
export const PatchMeetingApi = (id, data) => {
  console.log(`Calling PatchMeetingApi for ID ${id} with raw data:`, data);
  return apiPatch(MeetingUpdateApi(id), data, false); // isFormData = true
};

// Delete Meeting
export const DeleteMeetingApi = (id, data) => {
  console.log(`Calling DeleteMeetingApi for ID ${id}`, data);
  return apiDelete(MeetingUpdateApi(id), data); // isFormData = fals
};

// Get  Meeting
export const GetMeetingApiById = (id, data) => {
  const url = new URL(MeetingUpdateApi(id));
  const params = new URLSearchParams(data);

  console.log(' Patch Meeting Api =====>', `${url}?${params}`);

  return new Promise((resolve, reject) => {
    apiGet(MeetingUpdateApi(id), data, true)
      .then(res => {
        resolve(res);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const PostCreateTaskApi = async data => {
  console.log('Calling PostCreateTaskApi with data:', data);
  return apiPost(TaskCreatingApi, data, false);
};

//  Get task dasta
export const PatchTaskApi = async (id, data) => {
  console.log('Calling GetTaskApi with params:', data);
  return apiPatch(TaskUpdateApi(id), data, false);
};

export const DeleteTaskApi = async (id, data) => {
  console.log(`Calling DeleteTaskApi for ID ${id}`, data);
  return apiDelete(TaskUpdateApi(id), data);
};

// --- Calendar & Task Data ---

export const GetCalenderDataApi = async data => {
  console.log('Calling GetCalenderDataApi with params:', CalenderDataApi, data);
  return apiGet(CalenderDataApi, data);
};

export const GetTaskApiListingData = async data => {
  console.log(
    'Calling GetTaskApiListingData with params:',
    CalenderTaskApi,
    data,
  );
  return apiGet(CalenderTaskApi, data);
};

export const GetTaskAllData = async (id, data) => {
  console.log(`Calling GetTaskAllData for ID ${id} with params:`, data);
  return apiGet(CalenderSubTaskApi(id), data);
};

// --- Comment APIs ---

export const GetCommentApi = async data => {
  console.log('Calling GetCommentApi with params:', data);
  return apiGet(CommentApi, data);
};

export const PostCommentApi = async data => {
  console.log(
    'Calling PostCommentApi with form data:',
    CommentApi,
    data,
    '\n',
    '\n',
  );
  return apiPost(CommentApi, data, true); // isFormData = true
};

// Replaced apiUpdateForm, indicating a PATCH with multipart/form-data
export const PatchTaskUpdateApi = async (id, data) => {
  console.log(`Calling PatchTaskUpdateApi for ID ${id} with form data:`, data);
  return apiPatch(TaskUpdateApi(id), data, true);
};

// Get api Task Update
export const GetTaskUpdateApi = async (id, data) => {
  console.log(`Calling GetTaskUpdateApi for ID ${id} with params:`, data);
  return apiGet(TaskUpdateApi(id), data);
};

// --- Leave APIs ---

export const GetTakeLeaveApi = async data => {
  console.log('Calling GetTakeLeaveApi with params:', data);
  return apiGet(TakeLeaveApi, data);
};

// Assuming this POST sends JSON data
export const PostTakeLeaveApi = async data => {
  console.log('Calling PostTakeLeaveApi with data:', data);
  return apiPost(TakeLeaveApi, data, false); // isFormData = false
};

// Assuming apiUpdate was a PATCH with JSON data
export const PatchEditLeaveApi = async (id, data) => {
  console.log(`Calling PatchEditLeaveApi for ID ${id} with data:`, data);
  return apiPatch(EditLeaveApi(id), data, false);
};

// Delete Leave
export const DeleteLeaveApi = async (id, data) => {
  console.log(`Calling DeleteLeaveApi for ID ${id}`);
  return apiDelete(EditLeaveApi(id), data);
};

export const GetExpenseClaimApi = async data => {
  console.log('Calling GetExpenseClaimApi with params:', ExpenseClaimApi, data);
  return apiGet(ExpenseClaimApi, data);
};

// Replaced manual axios call with our centralized apiPost
export const PostExpenseClaimApi = async data => {
  console.log('Calling PostExpenseClaimApi with data:', ExpenseClaimApi, data);
  return apiPost(ExpenseClaimApi, data, false);
};

// Replaced manual axios call with our centralized apiPatch
export const PatchExpenseClaimApi = async (id, data) => {
  console.log(`Calling PatchExpenseClaimApi for ID ${id} with data:`, data);
  return apiPatch(ExpenseClaimApiId(id), data, false); // isFormData = false
};

// Delete Expense Claim
export const DeleteExpenseClaimApi = async (id, data) => {
  console.log(`Calling DeleteExpenseClaimApi for ID ${id}`);
  return apiDelete(ExpenseClaimApiId(id), data);
};
