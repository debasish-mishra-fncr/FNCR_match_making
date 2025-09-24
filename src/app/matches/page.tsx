"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaCircle, FaGlobe } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import Image from "next/image";
import { useSelector } from "react-redux";
import { signOut, useSession } from "next-auth/react";
import { RootState, useAppDispatch } from "@/redux/store";
import { fetchLenderMatch, Lender } from "@/redux/matchSlice";
import {
  COLLATERAL_CODES,
  PRODUCT_CODES,
  INDUSTRIES,
} from "@/types/oboardingTypes";
import { useRouter } from "next/navigation";

// Format money helper
const formatMoney = (value?: number) => {
  if (value === undefined || value === null) return null;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(0)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
    <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">
      {title}
    </h3>
    <div className="space-y-1 text-sm text-gray-700">{children}</div>
  </div>
);

const LenderCard = ({ lender }: { lender: Lender }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:-translate-y-1"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex justify-between items-center w-full"
      >
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-xl text-gray-900 truncate max-w-[80%]">
              {lender.name}
            </h2>
            {lender.tag && (
              <span className="px-2 py-0.5 text-xs rounded-full text-white bg-gradient-to-r from-green-600 to-emerald-500">
                {lender.tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-green-700 text-sm mt-1">
            <FaGlobe size={12} /> <span>{lender.website}</span>
          </div>
        </div>
        {expanded ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-5 space-y-4"
          >
            {lender.linkedin_profile && (
              <Section title="LinkedIn">{lender.linkedin_profile}</Section>
            )}
            {lender.google_maps_profile && (
              <Section title="Google Maps">
                {lender.google_maps_profile}
              </Section>
            )}
            {lender.founded_year && (
              <Section title="Founded Year">{lender.founded_year}</Section>
            )}

            {lender.products?.length > 0 && (
              <Section title="Products">
                <div className="grid grid-cols-2 gap-1">
                  {lender.products.map((code, i) => (
                    <div key={i} className="flex items-center">
                      <FaCircle size={6} className="text-green-600 mr-2" />
                      {PRODUCT_CODES[code] || code}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {lender.collaterals?.length > 0 && (
              <Section title="Collateral">
                <div className="grid grid-cols-2 gap-1">
                  {lender.collaterals.map((code, i) => (
                    <div key={i} className="flex items-center">
                      <FaCircle size={6} className="text-green-600 mr-2" />
                      {COLLATERAL_CODES[code] || code}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {lender.industries?.length > 0 && (
              <Section title="Industries">
                <div className="grid grid-cols-2 gap-1">
                  {lender.industries.map((code, i) => (
                    <div key={i} className="flex items-center">
                      <FaCircle size={6} className="text-green-600 mr-2" />
                      {INDUSTRIES.find((ind) => ind.code === code)?.title ||
                        code}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {(lender.hq_city || lender.hq_state) && (
              <Section title="Headquarters">
                {[lender.hq_city, lender.hq_state].filter(Boolean).join(", ")}
              </Section>
            )}

            {(lender.contact_name ||
              lender.contact_email ||
              lender.contact_phone) && (
              <Section title="Contact">
                {[
                  lender.contact_name,
                  lender.contact_email,
                  lender.contact_phone,
                ]
                  .filter(Boolean)
                  .join(" | ")}
              </Section>
            )}

            <Section title="Preferences">
              <ul className="space-y-1">
                {[
                  {
                    label: "Min Lending Amount",
                    value: formatMoney(lender.min_lending_amount),
                  },
                  {
                    label: "Max Lending Amount",
                    value: formatMoney(lender.max_lending_amount),
                  },
                  {
                    label: "Min Lending Duration",
                    value: lender.min_lending_duration,
                  },
                  {
                    label: "Max Lending Duration",
                    value: lender.max_lending_duration,
                  },
                  {
                    label: "Min Total Revenue",
                    value: formatMoney(lender.min_total_revenue),
                  },
                  {
                    label: "Max Total Revenue",
                    value: formatMoney(lender.max_total_revenue),
                  },
                  {
                    label: "Min Annual EBITDA",
                    value: formatMoney(lender.min_annual_ebitda),
                  },
                  {
                    label: "Max Annual EBITDA",
                    value: formatMoney(lender.max_annual_ebitda),
                  },
                ].map((item, i) =>
                  item.value ? (
                    <li key={i} className="flex justify-between text-gray-700">
                      <span className="font-medium">{item.label}:</span>
                      <span>{item.value}</span>
                    </li>
                  ) : null
                )}
              </ul>
            </Section>

            {lender.notes && <Section title="Notes">{lender.notes}</Section>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function Page() {
  const {
    user: currentUser,
    loading: currentUserLoading,
    error,
  } = useSelector((state: RootState) => state.user);
  const [scrolled, setScrolled] = useState(false);
  const chatbotState = useSelector((state: RootState) => state.chatbot);
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("status", status);
    console.log("currentUserLoading", currentUserLoading);
    console.log("currentUser", currentUser);
    const fetchMatches = async () => {
      if (
        status === "authenticated" &&
        !currentUserLoading &&
        currentUser?.smb
      ) {
        console.log("Fetching lender match");
        try {
          await dispatch(fetchLenderMatch({ smbId: currentUser.smb }));
        } catch (err) {
          console.error("Error fetching lender match:", err);
        }
      }
    };

    fetchMatches();
  }, [status, dispatch, currentUserLoading, currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header
        className={`sticky top-4 z-50 mx-auto max-w-6xl rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-md px-6 transition-all duration-300 ${
          scrolled ? "py-2 shadow-md" : "py-3 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/FNCR_logo_horizontal_theme.png"
              alt="logo"
              width={120}
              height={50}
              unoptimized
            />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 font-medium transition hover:bg-gray-200"
          >
            <FiLogOut className="text-xl" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6 lg:p-12">
        {status === "loading" || currentUserLoading ? (
          <div className="flex items-center justify-center">
            <div className="loader" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold mb-10 text-gray-900 tracking-tight text-center">
              Lender Matches
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {chatbotState.lenderMatch?.map((lender, idx) => (
                <LenderCard key={idx} lender={lender} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
