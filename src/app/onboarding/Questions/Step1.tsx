import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { US_STATES } from "@/types/oboardingTypes";
import { StepProps } from "@/types/oboardingTypes";

const Step1 = ({ onNext, onBack }: StepProps) => {
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const dispatch = useDispatch<AppDispatch>();
  const [selectedState, setSelectedState] = useState(
    onboardingState.state || ""
  );
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSubmit = () => {
    if (!selectedState) {
      setError("Please select a state.");
      return;
    }
    dispatch(updateOnboarding({ state: selectedState }));
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
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight"
          >
            Which state is your business incorporated in?
          </motion.h1>

          {/* Custom Dropdown */}
          <div className="relative mt-4">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`w-full px-4 py-4 text-left border-2 rounded-xl bg-white text-lg transition-all duration-200 flex justify-between items-center ${
                error
                  ? "border-red-300 focus:border-red-500"
                  : "border-[#D7E1A4] focus:border-[#D7E1A4]"
              }`}
            >
              {selectedState
                ? US_STATES.find((s) => s.code === selectedState)?.title
                : "Select a state"}
              <span className="ml-2 transform transition-transform duration-200">
                {dropdownOpen ? "▲" : "▼"}
              </span>
            </button>

            {dropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden"
              >
                {US_STATES.map((state) => (
                  <motion.li
                    key={state.code}
                    onClick={() => {
                      setSelectedState(state.code);
                      setDropdownOpen(false);
                      if (error) setError(null);
                    }}
                    whileHover={{ scale: 1.01}}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3 cursor-pointer hover:bg-[#F0F8C2] rounded-lg"
                  >
                    {state.title}
                  </motion.li>
                ))}
              </motion.ul>
            )}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2 ml-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-8 py-4 rounded-xl font-semibold ${
                !onBack
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#D7E1A4] text-gray-600 hover:cursor-pointer"
              }`}
            >
              Prev Step
            </motion.button>

            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-8 py-4 rounded-xl font-semibold bg-[#D7E1A4] text-gray-600 hover:cursor-pointer`}
            >
              Next Step
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Step1;
