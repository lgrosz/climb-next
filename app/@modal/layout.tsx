import { ReactNode } from "react";

export default function ModalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
