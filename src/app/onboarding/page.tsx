"use client";
import { useState, useEffect, ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FiLogOut } from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchSmbInfo,
  completeAdditionalDataUploadSMBRedux,
  updateCurrentStep,
} from "@/redux/onboardingSlice";
import Lottie from "lottie-react";
import loadingAnimation from "@/app/utils/loading.json";
import { processChat } from "../utils/api";
import {
  COLLATERAL_CODES,
  INDUSTRIES,
  PRODUCT_CODES,
  StepProps,
  US_STATES,
} from "@/types/oboardingTypes";
import { fetchBotResponse } from "@/redux/chatSlice";
import {
  UserData,
  updateCurrentUserRedux,
  updateUserFields,
} from "@/redux/UserSlice";

// Step 1: Website Form Component
const WebsiteFormStep = ({ onNext, onBack }: StepProps) => {
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentuser, loading: currentUserLoading } = useSelector(
    (state: RootState) => state.user
  );

  const validateWebsite = (value: string) => {
    if (!value) return "Website URL is required";

    const urlPattern =
      /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z]{2,})(\.[a-z]{2,})?([\/?#].*)?$/i;

    if (!urlPattern.test(value.trim()))
      return "Please enter a valid website URL";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateWebsite(website);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await dispatch(fetchSmbInfo(website)).unwrap();

      const updatePayload: Partial<UserData> = {
        user_type: res.user_type,
        ...(res.user_type === "lender"
          ? { lender: res.smb }
          : { smb: res.lender }),
      };
      if (res.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }
      await dispatch(
        updateCurrentUserRedux({
          id: currentuser?.id,
          ...(currentuser?.user_type === "lender"
            ? { lender: res.id }
            : { smb: res.id }),
        })
      ).unwrap();
      dispatch(updateUserFields(updatePayload));

      onNext();
    } catch (err: unknown) {
      toast.error((err as string) || "Failed to fetch SMB info");
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100"
    >
      {/* Question Header */}
      <div className="mb-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight"
        >
          Please share your company website.
        </motion.h1>
      </div>

      {/* Website Input */}
      <div className="mb-12">
        <input
          type="text"
          placeholder="https://yourcompany.com"
          value={website}
          onChange={(e) => {
            setWebsite(e.target.value);
            if (error) setError(null);
          }}
          className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 transition-all duration-200 text-lg bg-white ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-[#D7E1A4] focus:border-[#D7E1A4] focus:ring-[#D7E1A4]"
          }`}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm font-medium mt-2 ml-2"
          >
            {error}
          </motion.p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="px-8 py-4 rounded-xl bg-[#D7E1A4] text-gray-600 font-semibold hover:cursor-pointer disabled:opacity-50"
        >
          {loading ? "Processing..." : "Continue →"}
        </motion.button>
      </div>
    </motion.form>
  );
};

// Step 2: Questions Component (placeholder for now)
const QuestionsStep = ({ onNext, onBack }: StepProps) => {
  const [StepComponent, setStepComponent] =
    useState<ComponentType<StepProps> | null>(null);
  const [loading, setLoading] = useState(true);
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const { currentStep } = onboardingState;

  // Calculate which question step this is (subtract 1 because step 0 is website form)
  const questionStep = currentStep - 1;

  // Load dynamic question components
  useEffect(() => {
    const loadStepComponent = async () => {
      const module__ = await import(`./Questions/Step${questionStep}`);
      setStepComponent(() => module__.default);
    };

    loadStepComponent();
    setLoading(false);
  }, [questionStep]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return StepComponent ? (
    <StepComponent onNext={onNext} onBack={onBack} />
  ) : null;
};

const loadingMessages = [
  "Fetching your matches...",
  "Setting up your profile...",
  "Almost there, hang tight...",
  "Analyzing your preferences...",
  "Loading magic...",
  "Preparing personalized suggestions...",
];

export default function UnifiedOnboarding() {
  const {
    user: currentuser,
    loading: currentUserLoading,
    error,
  } = useSelector((state: RootState) => state.user);
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [scrolled, setScrolled] = useState(false);
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const { currentStep = 0 } = onboardingState;

  const [apiLoading, setApiLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(
    loadingMessages[0]
  );
  const [timer, setTimer] = useState<number>(180);

  // Define the total number of steps (1 for website + 20 for questions)
  const totalSteps = 21;

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Loading message and timer effects
  useEffect(() => {
    if (!apiLoading) return;

    const timerInterval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const messageInterval = setInterval(() => {
      setLoadingMessage(
        loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
      );
    }, 5000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(messageInterval);
    };
  }, [apiLoading]);

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      dispatch(updateCurrentStep(currentStep + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Final submission logic
      setApiLoading(true);
      try {
        await dispatch(completeAdditionalDataUploadSMBRedux()).unwrap();

        // Generate prompt and process chat
        const safeJoin = (arr: string[] | undefined, sep = ", ") =>
          Array.isArray(arr) ? arr.join(sep) : "";

        const prompt = [
          onboardingState.name && `My company name is ${onboardingState.name}.`,
          onboardingState.website &&
            `Our website is ${onboardingState.website}.`,
          onboardingState.linkedin_profile &&
            `You can also find us on LinkedIn at ${onboardingState.linkedin_profile}.`,
          onboardingState.google_maps_profile &&
            `Our physical location is here: ${onboardingState.google_maps_profile}.`,
          onboardingState.website_summary &&
            `Here's a quick summary of our company: ${onboardingState.website_summary}.`,
          [
            onboardingState.industry?.length &&
              `We operate in the ${onboardingState.industry
                .map(
                  (code) =>
                    INDUSTRIES.find((i) => i.code === code)?.title || code
                )
                .join(", ")} industry${
                onboardingState.industry.length > 1 ? "ies" : ""
              }`,
            onboardingState.state &&
              `we are incorporated in ${
                US_STATES.find((s) => s.code === onboardingState.state)
                  ?.title || onboardingState.state
              }`,
            onboardingState.years_of_operation &&
              `and have been operational for ${onboardingState.years_of_operation} years`,
          ]
            .filter(Boolean)
            .join(", ") +
            (onboardingState.industry?.length ||
            onboardingState.state ||
            onboardingState.years_of_operation
              ? "."
              : ""),
          onboardingState.product?.length &&
            `We offer the following products or services: ${safeJoin(
              onboardingState.product.map((code) => PRODUCT_CODES[code] || code)
            )}.`,
          onboardingState.collateral?.length &&
            `Our preferred forms of collateral include: ${safeJoin(
              onboardingState.collateral.map((c) => COLLATERAL_CODES[c] || c)
            )}.`,
          onboardingState.annualized_revenue &&
            `Our annualized revenue is ${onboardingState.annualized_revenue}.`,
          onboardingState.funding_reasons?.length &&
            `Our main reasons for seeking funding are: ${safeJoin(
              onboardingState.funding_reasons
            )}.`,
          [
            onboardingState.lending_amount_start != null &&
              onboardingState.lending_amount_end != null &&
              (onboardingState.lending_amount_end === 9007199254740991
                ? `We are seeking funding of more than ${onboardingState.lending_amount_start}`
                : `We are seeking funding in the range of ${onboardingState.lending_amount_start} to ${onboardingState.lending_amount_end}`),
            onboardingState.notes_use_of_finance &&
              `to be used for ${onboardingState.notes_use_of_finance}`,
          ]
            .filter(Boolean)
            .join(" ") +
            ((onboardingState.lending_amount_start != null &&
              onboardingState.lending_amount_end != null) ||
            onboardingState.notes_use_of_finance
              ? "."
              : ""),
          onboardingState.target_lending_duration_start != null &&
            onboardingState.target_lending_duration_end != null &&
            `Our target lending duration is from ${onboardingState.target_lending_duration_start} to ${onboardingState.target_lending_duration_end} Years.`,
          onboardingState.target_timeline &&
            `We need the financing in the next ${onboardingState.target_timeline}.`,
          onboardingState.target_competitive_advantage?.length &&
            `Our target competitive advantages are: ${safeJoin(
              onboardingState.target_competitive_advantage
            )}.`,
          onboardingState.notes_business &&
            `Additional information about our business: ${onboardingState.notes_business}.`,
          onboardingState.notes_ownership_structure &&
            `Our ownership structure is ${onboardingState.notes_ownership_structure}.`,
          onboardingState.notes_additional &&
            `Additional details: ${onboardingState.notes_additional}.`,
        ]
          .filter(Boolean)
          .join(" ");

        const botRes = await dispatch(
          fetchBotResponse({
            userMessage: prompt.trim(),
            selectedFiles: onboardingState.smbDocs.map((doc) => doc.file),
          })
        ).unwrap();

        toast.success("Matches generated successfully");
        router.push("/matches");
      } catch (error) {
        console.error("Error in final submission:", error);
        toast.error("Submission failed. Please try again.");
      } finally {
        setApiLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      dispatch(updateCurrentStep(currentStep - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.back();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <WebsiteFormStep onNext={handleNext} onBack={handleBack} />;
      default:
        return <QuestionsStep onNext={handleNext} onBack={handleBack} />;
    }
  };

  if (status === "loading" || currentUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="loader"></div>
      </div>
    );
  } else if (apiLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="text-center space-y-6">
          <Lottie
            animationData={loadingAnimation}
            loop
            className="w-40 h-40 mx-auto"
          />

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-800">
              {loadingMessage}
            </h2>
            <p className="text-gray-600">
              Please wait while we process your information
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 font-mono tracking-wider">
                  {Math.floor(timer / 60)
                    .toString()
                    .padStart(2, "0")}
                  <span className="text-blue-500 mx-1">:</span>
                  {(timer % 60).toString().padStart(2, "0")}
                </div>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Time remaining
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="sticky top-0 z-[100] h-4 bg-white/70 backdrop-blur-sm pointer-events-none"></div>

      {/* Header */}
      <header
        className={`sticky top-4 z-[101] mx-6 lg:mx-auto max-w-6xl rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-md px-6 transition-all duration-300 ${
          scrolled ? "py-2 shadow-md" : "py-3 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/FNCR_logo_horizontal_theme.png"
              alt="logo"
              width={120}
              height={50}
              unoptimized
            />
          </div>

          {/* Progress indicator */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / totalSteps) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 font-medium transition hover:bg-gray-200 cursor-pointer"
          >
            <FiLogOut className="text-xl" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="p-6 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
