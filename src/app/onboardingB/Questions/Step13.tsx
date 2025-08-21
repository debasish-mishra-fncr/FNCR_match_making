import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Range } from "react-range";
import { AppDispatch, RootState } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { StepProps } from "@/types/oboardingTypes";
import { motion } from "framer-motion";

const Step13 = ({ onNext, onBack }: StepProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingState = useSelector((state: RootState) => state.onboarding);

  const [range, setRange] = useState<[number, number]>([
    onboardingState.target_lending_duration_start || 2,
    onboardingState.target_lending_duration_end || 6,
  ]);

  const handleSubmit = () => {
    dispatch(
      updateOnboarding({
        target_lending_duration_start: range[0],
        target_lending_duration_end: range[1],
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
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight"
          >
            What is the ideal loan duration that you are looking for?
          </motion.h2>

          <div className="mt-6 px-4">
            <Range
              step={1}
              min={1}
              max={10}
              values={range}
              onChange={(values) => setRange(values as [number, number])}
              allowOverlap={false}
              renderTrack={({ props, children }) => {
                const percentage1 = ((range[0] - 1) / 9) * 100;
                const percentage2 = ((range[1] - 1) / 9) * 100;

                return (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: "8px",
                      width: "100%",
                      borderRadius: "4px",
                      background: `linear-gradient(
            to right,
            #d1d5db 0%,          /* Gray before first thumb */
            #d1d5db ${percentage1}%,
            #22c55e ${percentage1}%, /* Green active range start */
            #22c55e ${percentage2}%, /* Green active range end */
            #d1d5db ${percentage2}%, /* Gray after second thumb */
            #d1d5db 100%
          )`,
                    }}
                  >
                    {children}
                  </div>
                );
              }}
              renderThumb={({ props, index }) => {
                const { key, ...restProps } = props;
                return (
                  <div
                    key={key || index}
                    {...restProps}
                    style={{
                      ...restProps.style,
                      height: "24px",
                      width: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {range[index]}
                    </span>
                  </div>
                );
              }}
            />

            <div className="flex justify-between mt-2 text-gray-700">
              <span>{range[0]} Years</span>
              <span>{range[1]} Years</span>
            </div>
          </div>

          <div className="flex justify-between mt-6">
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
              disabled={range[0] === range[1]}
            >
              Next Step
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Step13;
