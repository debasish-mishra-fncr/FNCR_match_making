"use client";
import { useState, useEffect, ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  COLLATERAL_CODES,
  INDUSTRIES,
  PRODUCT_CODES,
  StepProps,
  US_STATES,
} from "@/types/oboardingTypes";
import { FiLogOut, FiClock } from "react-icons/fi";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  completeAdditionalDataUploadSMBRedux,
  submitSmbOnboardingData,
  updateCurrentStep,
} from "@/redux/onboardingSlice";
import Lottie from "lottie-react";
import loadingAnimation from "@/app/utils/loading.json";
import { processChat } from "../utils/api";

const steps = Array.from({ length: 20 }, (_, i) => ({ component: `Step${i}` }));

const loadingMessages = [
  "Fetching your matches...",
  "Setting up your profile...",
  "Almost there, hang tight...",
  "Analyzing your preferences...",
  "Loading magic...",
  "Preparing personalized suggestions...",
];

export default function OnboardingB() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [scrolled, setScrolled] = useState(false);
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const { currentStep } = onboardingState;
  const [isLoading, setIsLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [StepComponent, setStepComponent] =
    useState<ComponentType<StepProps> | null>(null);

  const [loadingMessage, setLoadingMessage] = useState<string>(
    loadingMessages[0]
  );
  const [timer, setTimer] = useState<number>(180);

  // Load current step dynamically
  useEffect(() => {
    const loadStepComponent = async () => {
      try {
        const step = steps[currentStep];
        if (step) {
          const module__ = await import(`./Questions/${step.component}`);
          setStepComponent(() => module__.default);
        }
      } catch (error) {
        console.error("Error loading step component:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStepComponent();
  }, [currentStep]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    if (currentStep < steps.length - 1) {
      dispatch(updateCurrentStep(currentStep + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setApiLoading(true);
      try {
        await dispatch(completeAdditionalDataUploadSMBRedux()).unwrap();
      } catch (error) {
        setApiLoading(false);
        console.error(error);
        toast.error("Submission failed. Please try again.");
        return;
      }
      try {
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
            onboardingState.industry?.[0] &&
              `We operate in the ${
                INDUSTRIES.find((i) => i.code === onboardingState.industry[0])
                  ?.title || onboardingState.industry[0]
              } industry`,
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
              onboardingState.product.map((p) => PRODUCT_CODES[p] || p)
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
              `We are seeking funding in the range of ${onboardingState.lending_amount_start} to ${onboardingState.lending_amount_end}`,
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
            `Our target lending duration is from ${onboardingState.target_lending_duration_start} to ${onboardingState.target_lending_duration_end}.`,
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

        const formData = new FormData();
        formData.append("user_message", JSON.stringify(prompt));
        onboardingState.smbDocs.forEach((doc) => {
          formData.append("attachments", doc.file);
        });
        const resChat = await processChat(formData);
        if (resChat.status !== "success") {
          setApiLoading(false);
          toast.error("Error generating matches");
          return;
        } else {
          setApiLoading(false);
          toast.success("Matches generated successfully");
          router.push("/matches");
        }
      } catch (error) {
        setApiLoading(false);
        console.error("Error generating deal abstract:", error);
        toast.error("Error generating deal abstract");
        return;
      }
      setApiLoading(false);
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

  if (isLoading || apiLoading) {
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

          {apiLoading && (
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="sticky top-0 z-[100] h-4 bg-white/70 backdrop-blur-sm pointer-events-none"></div>

      {/* Header */}
      <header
        className={`sticky top-4 z-[101] mx-auto max-w-6xl rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-md px-6 transition-all duration-300 ${
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

          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
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
              {StepComponent && (
                <StepComponent onNext={handleNext} onBack={handleBack} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
