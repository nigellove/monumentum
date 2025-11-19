import { X } from "lucide-react";

interface PrivacyPolicyProps {
  onClose: () => void;
}

export default function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
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
              Privacy Policy
            </h1>

            {/* ✅ Use React iframe directly */}
            <iframe
              src="https://app.termly.io/policy-viewer/policy.html?policyUUID=5c152f5f-4aaa-4856-8c7d-c24794e7aea9"
              width="100%"
              height="800"
              style={{
                border: "none",
                borderRadius: "8px",
              }}
              title="Privacy Policy"
            />

            {/* Optional: link to open full policy */}
            <p className="mt-4">
              <a
                href="https://app.termly.io/policy-viewer/policy.html?policyUUID=5c152f5f-4aaa-4856-8c7d-c24794e7aea9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                View Full Privacy Policy in a New Tab →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
