import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { ANNUALIZED_REVENUE } from "@/types/oboardingTypes";
import { StepProps } from "@/types/oboardingTypes";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Step4 = ({ onNext, onBack }: StepProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const [selectedRevenue, setSelectedRevenue] = useState<string>(
    onboardingState.annualized_revenue || ""
  );

  const handleSelect = (value: string) => {
    setSelectedRevenue(value);
    dispatch(updateOnboarding({ annualized_revenue: selectedRevenue }));
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
            How much annualized revenue do you currently have?
          </motion.h1>

          <div className="space-y-4 mt-6">
            {ANNUALIZED_REVENUE.map((amount) => (
              <button
                key={amount}
                onClick={() => handleSelect(amount)}
                className={`w-full text-left px-4 py-4 rounded-xl border-2 text-lg transition-all duration-200 ${
                  selectedRevenue === amount
                    ? "border-[#D7E1A4] bg-[#D7E1A4] text-gray-700"
                    : "border-gray-200 bg-white text-gray-900 hover:border-[#D7E1A4] hover:bg-[#F0F8C2]"
                }`}
              >
                {amount}
              </button>
            ))}
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
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Step4;
