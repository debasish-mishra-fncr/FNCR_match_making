import "./globals.css";
import { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Providers } from "@/providers/Providers";
import HOC from "@/providers/Hoc";

export const metadata: Metadata = {
  title: "SMB Assessment Platform",
  description: "SMB business assessment and matching platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <HOC>
          <Providers>{children}</Providers>
        </HOC>
        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </body>
    </html>
  );
}
