import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { INDUSTRIES, Industry } from "@/types/oboardingTypes";
import { StepProps } from "@/types/oboardingTypes";

const Step3 = ({ onNext, onBack }: StepProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingState = useSelector((state: RootState) => state.onboarding);
  const [selectedIndustry, setSelectedIndustry] = useState<string>(
    onboardingState.industry[0] || ""
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelect = (industry: Industry) => {
    setSelectedIndustry(industry.code);
    setDropdownOpen(false);
  };

  const handleSubmit = () => {
    dispatch(updateOnboarding({ industry: [selectedIndustry] }));
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
            Which industry does your business operate in?
          </motion.h1>

          {/* Custom Dropdown */}
          <div className="relative mt-6">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-4 text-left border-2 rounded-xl bg-white text-lg flex justify-between items-center border-[#D7E1A4] focus:border-[#D7E1A4] focus:ring-[#D7E1A4] transition-all duration-200"
            >
              {selectedIndustry
                ? INDUSTRIES.find((i) => i.code === selectedIndustry)?.title
                : "Select an industry"}
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
                {INDUSTRIES.map((industry) => (
                  <motion.li
                    key={industry.code}
                    onClick={() => handleSelect(industry)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3 cursor-pointer hover:bg-[#F0F8C2] rounded-lg"
                  >
                    {industry.title}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
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

export default Step3;
