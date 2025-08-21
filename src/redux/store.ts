import { configureStore } from '@reduxjs/toolkit';
import onboardingReducer from './onboardingSlice';
import chatbotReducer from './matchSlice';
export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    chatbot: chatbotReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
