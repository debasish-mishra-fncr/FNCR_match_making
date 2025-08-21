import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { StepProps } from "@/types/oboardingTypes";

const Step2 = ({ onNext, onBack }: StepProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const [years, setYears] = useState<number | null>(
    onboardingState.years_of_operation
  );
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (value: string) => {
    const num = value === "" ? null : parseInt(value);
    setYears(num);
    setError(null);
  };

  const handleSubmit = () => {
    dispatch(updateOnboarding({ years_of_operation: years }));
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
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight"
          >
            How many years have you been operationally active for?
          </motion.h1>

          <div>
            <input
              ref={inputRef}
              type="number"
              placeholder="Enter the number of years in operation"
              value={years || ""}
              onChange={(e) => handleChange(e.target.value)}
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
          <div className="flex justify-between">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-[#D7E1A4] text-gray-600 font-semibold hover:cursor-pointer"
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

export default Step2;
