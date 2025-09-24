"use client";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import UserProvider from "./UserProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <UserProvider>
        <div>{children}</div>
      </UserProvider>
    </ReduxProvider>
  );
}
