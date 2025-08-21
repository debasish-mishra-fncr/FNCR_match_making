import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import { AppDispatch } from "@/redux/store";
import { updateOnboarding } from "@/redux/onboardingSlice";
import { StepProps } from "@/types/oboardingTypes";
import {
  AiOutlineCloudUpload,
  AiOutlineClose,
  AiOutlineFileText,
  AiOutlineFileImage,
  AiOutlineWarning,
} from "react-icons/ai";
import { FileWithMetadata } from "@/redux/onboardingSlice";

const StepDebtSchedule = ({ onNext, onBack }: StepProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [uploadedFiles, setUploadedFiles] = useState<FileWithMetadata[]>([]);
  const [comment, setComment] = useState<string>("");

  const handleFilesChange = (files: FileWithMetadata[]) => {
    setUploadedFiles(files);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileWithMetadata[] = acceptedFiles.map((file) => ({
        name: file.name,
        file: file,
        metadata: {
          document_purpose: "Debt Schedule",
          description: comment,
        },
      }));

      const updatedFiles = [...uploadedFiles, ...newFiles].slice(0, 5);
      handleFilesChange(updatedFiles);
    },
    [uploadedFiles, comment]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
          ".xlsx",
        ],
        "application/vnd.ms-excel": [".xls"],
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
      },
      maxFiles: 5,
      maxSize: 10 * 1024 * 1024, // 10MB per file
      multiple: true,
    });

  const removeFile = (fileName: string) => {
    const updatedFiles = uploadedFiles.filter((file) => file.name !== fileName);
    handleFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <AiOutlineFileImage className="w-5 h-5 text-blue-500" />;
    }
    return <AiOutlineFileText className="w-5 h-5 text-red-500" />;
  };

  const handleNext = () => {
    // Update all descriptions with comment
    const updatedFiles = uploadedFiles.map((file) => ({
      ...file,
      metadata: { ...file.metadata, description: comment },
    }));

    dispatch(updateOnboarding({ smbDocs: [...updatedFiles] }));
    onNext();
  };

  const canProceed = uploadedFiles.length > 0;

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
            {"Please share your company's debt schedule for the last three years."}
          </motion.h1>

          {/* File Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                isDragActive
                  ? "border-[#D7E1A4] bg-[#F0F8C2]"
                  : "border-gray-300 hover:border-[#D7E1A4] hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              <AiOutlineCloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Upload Debt Schedule Documents
              </h3>
              {isDragActive ? (
                <p className="text-[#D7E1A4] font-semibold mb-4">
                  Drop the files here...
                </p>
              ) : (
                <p className="text-gray-500 mb-4">
                  Drag and drop your files here, or click to browse
                </p>
              )}
              <p className="text-sm text-gray-400">
                Accepted formats: PDF, Excel, Images • Max 5 files • 10MB per
                file
              </p>
            </div>

            {/* File Rejection Errors */}
            {fileRejections.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AiOutlineWarning className="w-5 h-5 text-red-500 mr-2" />
                  <h4 className="font-semibold text-red-700">Upload Errors</h4>
                </div>
                {fileRejections.map(({ file, errors }) => (
                  <div key={file.name} className="text-sm text-red-600">
                    <strong>{file.name}</strong>:
                    {errors.map((e) => (
                      <div key={e.code} className="ml-2">
                        • {e.message}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">
                  Uploaded Files ({uploadedFiles.length}/5)
                </h4>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.file.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.file.size)} •{" "}
                          {file.metadata.document_purpose}
                        </p>
                        <p className="text-xs text-gray-400">
                          {file.metadata.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.name)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <AiOutlineClose className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Additional Notes (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any additional context or notes about your income statement..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D7E1A4] focus:border-transparent resize-none"
              />
            </div>
          </motion.div>

          {/* Navigation Buttons */}
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
              onClick={handleNext}
              whileHover={{ scale: canProceed ? 1.02 : 1 }}
              whileTap={{ scale: canProceed ? 0.98 : 1 }}
              disabled={!canProceed}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                canProceed
                  ? "bg-[#D7E1A4] text-gray-700 hover:cursor-pointer hover:bg-[#C8D693]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next Step
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default StepDebtSchedule;
