import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import userReducer from './slices/user.slice';
import { api } from './slices/api.slice';
import { setupInterceptors } from '@/axios/instances';

const rootReducer = combineReducers({
  user: userReducer,
  [api.reducerPath]: api.reducer,
});

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage,
    whitelist: ['user'], // Only persist the user slice
  },
  rootReducer
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
  devTools: true,
});

export const persistor = persistStore(store);
setupInterceptors(store);
export default store;
