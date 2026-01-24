// export const Base_url = 'https://r-one.stag.api.riggleapp.in/api/';
export const Base_url = 'https://r-one.stag.api.riggleapp.in/api/';

export const getApiURL1 = endpoint => Base_url + endpoint;

export const LoginApi = getApiURL1('users/auth/login/');
export const CreateAccountApi = getApiURL1('users/auth/signup/');
export const RefreshTokenApi = getApiURL1('users/auth/token/refresh/');
export const UserActivityApi = getApiURL1('users/users/activity/');
export const CatchUpTodayApi = getApiURL1('users/dashboard/catch-ups-today/');

export const userListing = getApiURL1('users/users/');
export const PrivateUserIconapi = id => getApiURL1(`users/users/${id}/`);
export const GroupIconapi = id => getApiURL1(`chats/group/${id}/`);

// My Folder Api
export const MyFolderApi = getApiURL1('task_manager/folders/');
export const MyFolderApiId = id => getApiURL1(`task_manager/folders/${id}/`);
export const MyNotesApis = getApiURL1('task_manager/notes/');

// Notes patch id
export const MyNotesApisId = id => getApiURL1(`task_manager/notes/${id}/`);

// Create WorkSpace
export const CreateWorkSpaceApi = getApiURL1('users/workspaces/');
export const CreateWorkSpaceApiId = id => getApiURL1(`users/workspaces/${id}/`);

// Generate code of Workspace
export const GenerateCodeApi = getApiURL1('users/workspaces/generate-code/');

// Join Hub by code
export const JoinHubByCodeApi = getApiURL1(
  'users/workspace-members/join-by-code/',
);

// Meeting Creating api
export const MeetingCreatingApi = getApiURL1('task_manager/meetings/');

// Meeting Update api
export const MeetingUpdateApi = id =>
  getApiURL1(`task_manager/meetings/${id}/`);

// Constant Api
export const ConstantApi = getApiURL1('task_manager/calender/constants/');

// task manager api
export const TaskCreatingApi = getApiURL1('task_manager/tasks/');
export const TaskUpdateApi = id => getApiURL1(`task_manager/tasks/${id}/`);

// calender task && meeting api
export const CalenderDataApi = getApiURL1('task_manager/calender/');
export const CalenderTaskApi = getApiURL1('task_manager/calender/events/');
export const CalenderMeetingApi = getApiURL1('task_manager/calender/meetings/');
export const TaskCalenderApi = getApiURL1('task_manager/calender/tasks/');

// calender subtask api
export const CalenderSubTaskApi = id => getApiURL1(`task_manager/tasks/${id}`);

// task Comment api
export const CommentApi = getApiURL1('task_manager/comments/');

// Logout api
export const LogoutApi = getApiURL1('users/auth/logout/');

// Leave api
export const TakeLeaveApi = getApiURL1('extras/leave-requests/');
export const EditLeaveApi = id => getApiURL1(`extras/leave-requests/${id}/`);

// Expense Claim api
export const ExpenseClaimApi = getApiURL1('extras/expense-claims/');

// Expense Claim update api
export const ExpenseClaimApiId = id =>
  getApiURL1(`extras/expense-claims/${id}/`);

// Settins api
export const SettingsApi = id => getApiURL1(`extras/hrms-settings/${id}/`);

// FCM token api
export const FCMTokenApi = getApiURL1('users/fcm-token/');

// Line manager code
export const LineManagerCodeApi = id =>
  getApiURL1(`users/workspace-members/${id}/`);

// Leave workspace api
export const LeaveWorkspaceApi = getApiURL1('users/auth/leave-workspace/');
