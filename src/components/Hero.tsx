import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onSignUp: () => void;
  onOpenChat: () => void;
}

const rotatingTexts = ['Your Business', 'Your Success', 'Your Team', 'Your Customers'];

export default function Hero({ onGetStarted, onSignUp, onOpenChat }: HeroProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const typingSpeed = useRef(150);

  useEffect(() => {
    const currentWord = rotatingTexts[currentTextIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
          typingSpeed.current = 120;
        } else {
          setTimeout(() => setIsDeleting(true), 3000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
          typingSpeed.current = 80;
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
        }
      }
    }, typingSpeed.current);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex]);

  return (
    <section className="relative">
      {/* Video Background */}
      <div className="relative h-[70vh] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src="/hero-video.mov" type="video/mp4" />
        </video>

        {/* Top White Bar with Text */}
        <div className="absolute top-0 left-0 right-0 bg-white/40 pt-24 pb-4">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-slate-900">
              Unlock Your AI Superpowers for{' '}
              <span className="text-teal-500 transition-opacity duration-700 ease-in-out">
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
              At Monumentum, we use practical Generative AI solutions and proven expertise to enable forward-thinking organizations
              of all sizes to unlock unprecedented growth, optimize operations, and stay ahead of the competition.
            </p>
          </div>
        </div>

        {/* Bottom White Bar with Buttons */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/40 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onSignUp}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold inline-flex items-center gap-2 transition shadow-lg hover:shadow-xl"
              >
                Sign Up <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onOpenChat}
                className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-full font-semibold inline-flex items-center gap-2 transition shadow-lg hover:shadow-xl"
              >
                Chat with Sales Agent <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}