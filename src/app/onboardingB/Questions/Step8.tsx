import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { COLLATERAL_CODES } from "@/types/oboardingTypes";
import { StepProps } from "@/types/oboardingTypes";

const Step8 = ({ onNext, onBack }: StepProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedCollateral, setSelectedCollateral] = useState<string[]>([]);

  const toggleCollateral = (collateralKey: string) => {
    let updatedCollateral = [];
    if (selectedCollateral.includes(collateralKey)) {
      updatedCollateral = selectedCollateral.filter((c) => c !== collateralKey);
    } else {
      updatedCollateral = [...selectedCollateral, collateralKey];
    }
    setSelectedCollateral(updatedCollateral);
  };

  const handleSubmit = () => {
    dispatch(updateOnboarding({ collateral: selectedCollateral }));
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
            Which of the following can you put up as collateral for the loan?
          </motion.h1>

          <div className="mt-6 space-y-3">
            {Object.entries(COLLATERAL_CODES)
              .filter(([key]) => key !== "NSPEC")
              .map(([key, label]) => (
                <motion.button
                  key={key}
                  onClick={() => toggleCollateral(key)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left px-4 py-4 rounded-xl border-2 text-lg transition-all duration-200 ${
                    selectedCollateral.includes(key)
                      ? "border-[#D7E1A4] bg-[#D7E1A4] text-gray-700"
                      : "border-gray-200 bg-white text-gray-900 hover:border-[#D7E1A4] hover:bg-[#F0F8C2]"
                  }`}
                >
                  {label}
                </motion.button>
              ))}
          </div>

          <p className="text-gray-500 text-sm mt-4 ml-1">
            Select as many options as applicable.
          </p>

          <div className="flex justify-between">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:cursor-pointer hover:bg-gray-200"
            >
              Prev Step
            </motion.button>
            
            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-[#D7E1A4] text-gray-600 font-semibold hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedCollateral.length === 0}
            >
              Next Step
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Step8;