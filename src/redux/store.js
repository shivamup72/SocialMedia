// src/redux/store.js
import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import sqliteStorage from '../utils/sqliteStorage';
import authReducer from './slices/authSlice';
import replyCountReducer from './slices/replyCountSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  replyCount: replyCountReducer,
});

const persistConfig = {
  key: 'root',
  storage: sqliteStorage,
  whitelist: ['auth', 'replyCount'], // auth and replyCount will persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
