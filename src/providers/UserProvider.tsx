"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { fetchCurrentUserSlice } from "@/redux/UserSlice";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { updateChatBotState } from "@/redux/chatSlice";

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const session = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.data?.accessToken) {
        try {
          const userData = await dispatch(fetchCurrentUserSlice()).unwrap();
          if (userData) {
            if (userData.smb) {
              dispatch(updateOnboarding({ id: Number(userData.smb) }));
            }
            // if (userData.lender) {
            //   dispatch(updateOnboarding({ id: Number(userData.lender) }));
            // }
            if (userData.session_id) {
              dispatch(updateChatBotState({ sessionID: userData.session_id }));
            }
          }
        } catch (error) {}
      }
    };

    fetchUserData();
  }, [pathname, session, dispatch]);

  return <>{children}</>;
};

export default UserProvider;
