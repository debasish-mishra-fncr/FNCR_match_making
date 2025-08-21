import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { StepProps } from "@/types/oboardingTypes";

const Step14 = ({ onNext, onBack }: StepProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [useOfFinanceNotes, setUseOfFinanceNotes] = useState("");

  const handleChange = (text: string) => {
    setUseOfFinanceNotes(text);
  };

  const handleSubmit = () => {
    dispatch(updateOnboarding({ notes_use_of_finance: useOfFinanceNotes }));
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
            {
              "Anything else that you'd want us to know about your use of finance?"
            }
          </motion.h1>

          <p className="text-gray-500 text-sm mt-2">
            Please share any additional information about your use of finance.
          </p>

          <textarea
            value={useOfFinanceNotes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Write your notes here..."
            className="w-full mt-4 px-4 py-4 border-2 rounded-xl focus:ring-4 transition-all duration-200 text-lg bg-white border-[#D7E1A4] focus:border-[#D7E1A4] focus:ring-[#D7E1A4] resize-none"
            rows={6}
          />
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

export default Step14;
