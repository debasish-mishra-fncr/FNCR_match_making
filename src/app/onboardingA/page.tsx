"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FiLogOut } from "react-icons/fi";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { fetchSmbInfo } from "@/redux/onboardingSlice";

export default function WebsiteForm() {
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for header animation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const validateWebsite = (value: string) => {
    if (!value) return "Website URL is required";

    const urlPattern = /^(www\.)?[a-z0-9\-]+(\.[a-z]{2,})+.*$/i;

    if (!urlPattern.test(value)) return "Please enter a valid URL";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateWebsite(website);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await dispatch(fetchSmbInfo(website)).unwrap();
      if (res.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }
      router.push("/onboardingB");
    } catch (err: unknown) {
      toast.error(err as string || "Failed to fetch SMB info");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Top subtle space */}
      <div className="sticky top-0 z-[100] h-4 bg-white/70 backdrop-blur-sm pointer-events-none"></div>

      {/* Header */}
      <header
        className={`sticky top-4 z-[101] mx-auto max-w-6xl rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-md px-6 transition-all duration-300 ${
          scrolled ? "py-2 shadow-md" : "py-3 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <Image
              src="/FNCR_logo_horizontal_theme.png"
              alt="logo"
              width={120}
              height={50}
              unoptimized
            />
          </div>

          {/* Right: Sign Out Button */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 font-medium transition hover:bg-gray-200"
          >
            <FiLogOut className="text-xl" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100"
          >
            {/* Question Header */}
            <div className="mb-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight"
              >
                Please share your company website.
              </motion.h1>
            </div>

            {/* Website Input */}
            <div className="mb-12">
              <input
                type="text"
                placeholder="https://yourcompany.com"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
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

            {/* Submit Button */}
            <div className="flex justify-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="px-8 py-4 rounded-xl bg-[#D7E1A4] text-gray-600 font-semibold hover:cursor-pointer"
              >
                {loading ? "Processing..." : "Continue →"}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </main>
    </div>
  );
}
