import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-4 flex flex-col md:flex-row items-center justify-between z-50 shadow-lg">
      <p className="text-sm mb-2 md:mb-0">
        We use cookies to enhance your browsing experience and analyze site
        traffic.{" "}
        <a
          href="/docs/cookie.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-cyan-400 hover:text-cyan-300"
        >
          Learn more
        </a>
        .
      </p>
      <button
        onClick={acceptCookies}
        className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600"
      >
        Accept
      </button>
    </div>
  );
}
