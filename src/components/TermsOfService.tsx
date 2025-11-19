import { X } from "lucide-react";

interface TermsOfServiceProps {
  onClose: () => void;
}

export default function TermsOfService({ onClose }: TermsOfServiceProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl max-w-4xl w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="p-8 prose prose-slate max-w-none">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">
              Terms of Service
            </h1>

            {/* ✅ React-safe iframe for Termly link */}
            <iframe
              src="https://app.termly.io/policy-viewer/policy.html?policyUUID=99a9470d-4245-4466-afc3-560af99c0874"
              width="100%"
              height="800"
              style={{
                border: "none",
                borderRadius: "8px",
              }}
              title="Terms of Service"
            />

            {/* Optional: external full-view link */}
            <p className="mt-4">
              <a
                href="https://app.termly.io/policy-viewer/policy.html?policyUUID=99a9470d-4245-4466-afc3-560af99c0874"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                View Full Terms of Service in a New Tab →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




      