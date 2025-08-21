"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestOtpAPI } from "./utils/api";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";

const Page = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const signal = new AbortController().signal;
  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtpAPI({ email, otp_type: "EMAIL" }, signal);
      if (res.status !== "success") {
        toast.error(res.data);
        return;
      }
      setStep(2);
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        otp_code: otp,
        callbackUrl: "/",
      });

      if (!res) {
        toast.error("No response from server");
        return;
      }

      if (res.error) {
        toast.error(res.error);
        return;
      }

      router.push("/onboardingA");
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-[90%] max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://i.imgur.com/PVh4nsr.png"
            alt="Logo"
            className="w-28 mb-4"
          />
          <h1 className="text-xl font-bold">
            {step === 1 ? "Enter your Email" : "Verify OTP"}
          </h1>
          <p className="text-gray-600 text-sm">
            {step === 1
              ? "We will send you an OTP to login."
              : `Enter the 6-digit OTP sent to ${email}`}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full rounded-2xl px-4 py-2 font-medium text-black transition ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-gray-600 hover:text-white"
              }`}
            >
              {loading ? "Sending OTP..." : "Proceed"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="otp"
                className="block text-base font-medium text-gray-700"
              >
                OTP
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-base tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className={`w-full rounded-2xl px-4 py-2 font-medium text-black transition ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-gray-600 hover:text-white"
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <p
              onClick={() => setStep(1)}
              className="text-sm text-blue-600 hover:underline cursor-pointer text-center"
            >
              Change Email
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Page;
