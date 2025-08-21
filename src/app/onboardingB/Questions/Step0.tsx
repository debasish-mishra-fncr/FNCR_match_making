import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { StepProps } from "@/types/oboardingTypes";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const Step0 = ({ onNext, onBack }: StepProps) => {
  const { currentStep } = useSelector((state: RootState) => state.onboarding);
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const dispatch = useDispatch<AppDispatch>();
  const [companyName, setCompanyName] = useState(onboardingState.name || "");
  const [linkedIn, setLinkedIn] = useState(
    onboardingState.linkedin_profile || ""
  );
  const [googleMaps, setGoogleMaps] = useState(
    onboardingState.google_maps_profile || ""
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      setError("Company name is required");
      return;
    }

    dispatch(
      updateOnboarding({
        name: companyName,
        linkedin_profile: linkedIn,
        google_maps_profile: googleMaps,
      })
    );
    onNext();
  };

  return (
    <main className="p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100 space-y-8"
        >
          {/* Question Header */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight"
            >
              {"What is your company's name?"}
            </motion.h1>
          </div>

          {/* Company Name Input */}
          <div>
            <input
              type="text"
              placeholder="Enter your company's name"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
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

          {/* Optional URLs */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                LinkedIn URL
              </label>
              <input
                type="text"
                placeholder="Link to your company's LinkedIn"
                value={linkedIn}
                onChange={(e) => setLinkedIn(e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-xl focus:ring-4 transition-all duration-200 text-lg bg-white border-[#D7E1A4] focus:border-[#D7E1A4] focus:ring-[#D7E1A4]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Google Maps URL
              </label>
              <input
                type="text"
                placeholder="Link to your company's Google Maps profile"
                value={googleMaps}
                onChange={(e) => setGoogleMaps(e.target.value)}
                className="w-full px-4 py-4 border-2 rounded-xl focus:ring-4 transition-all duration-200 text-lg bg-white border-[#D7E1A4] focus:border-[#D7E1A4] focus:ring-[#D7E1A4]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-8 py-4 rounded-xl font-semibold ${
                currentStep === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#D7E1A4] text-gray-600 hover:cursor-pointer"
              }`}
              disabled={currentStep === 0}
            >
              Prev Step
            </motion.button>

            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-[#D7E1A4] text-gray-600 font-semibold hover:cursor-pointer"
            >
              Next Step
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Step0;
