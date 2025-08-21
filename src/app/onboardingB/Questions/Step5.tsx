import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { FUNDING_AMOUNTS } from "@/types/oboardingTypes";
import { StepProps } from "@/types/oboardingTypes";

const Step5 = ({ onNext, onBack }: StepProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedLabel, setSelectedLabel] = useState<string>(""); // Track selected option

  const handleSelect = (label: string) => {
    setSelectedLabel(label); // Update selected state
    const selectedOption = FUNDING_AMOUNTS.find(
      (option) => option.label === label
    );
    if (selectedOption) {
      dispatch(
        updateOnboarding({
          lending_amount_start: selectedOption.min,
          lending_amount_end: selectedOption.max,
        })
      );
      onNext();
    }
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
            How much funding are you looking for?
          </motion.h1>

          <div className="mt-6 space-y-4">
            {FUNDING_AMOUNTS.map((amount) => (
              <button
                key={amount.label}
                onClick={() => handleSelect(amount.label)}
                className={`w-full text-left px-4 py-4 rounded-xl border-2 text-lg transition-all duration-200 ${
                  selectedLabel === amount.label
                    ? "border-[#D7E1A4] bg-[#D7E1A4] text-gray-700"
                    : "border-gray-200 bg-white text-gray-900 hover:border-[#D7E1A4] hover:bg-[#F0F8C2]"
                }`}
              >
                {amount.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-[#D7E1A4] text-gray-600 font-semibold hover:cursor-pointer"
            >
              Prev Step
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Step5;
