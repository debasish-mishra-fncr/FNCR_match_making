"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { fetchCurrentUserSlice } from "@/redux/UserSlice";
import { signOut, useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { updateChatBotState } from "@/redux/chatSlice";
import { setTokens } from "@/app/utils/apiHelper";
import { useRouter } from "next/navigation";

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.data?.error === "RefreshAccessTokenError") {
      signOut();
    }
    const fetchUserData = async () => {
      if (session?.data?.accessToken) {
        try {
          setTokens({
            accessToken: session.data.accessToken as string,
            refreshToken: session.data.refreshToken as string,
          });
          const userData = await dispatch(fetchCurrentUserSlice()).unwrap();
          if (userData) {
            if (userData.smb) {
              dispatch(updateOnboarding({ id: Number(userData.smb) }));
            }
            if (
              userData.onboarding_status === "COMPLETED" &&
              pathname !== "/matches"
            ) {
              router.push("/matches");
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
