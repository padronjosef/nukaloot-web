import type { Metadata } from "next";
import { Toaster } from "@/shared/UI/Toaster";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <Toaster position="bottom-right" />
  </>
);

export default AdminLayout;
