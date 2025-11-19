import { useState, useEffect, useRef } from 'react';
import { Brain, TrendingUp, TrendingDown, Zap, Clock, Target, Code } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onSignUp: () => void;
  onOpenChat: () => void;
}


const rotatingTexts = ['Your Business', 'Your Success', 'Your Team', 'Your Customers'];

//export default function Hero({ onGetStarted, onSignUp }: HeroProps) {
export default function Hero({ onGetStarted, onSignUp, onOpenChat }: HeroProps){   
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
          // pause before deleting
          setTimeout(() => setIsDeleting(true), 3000); // was 2000 → now 3s
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
    <>
      <div className="pt-32 pb-20 px-6 relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              {/* 💡 Adjusted line spacing */}
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-snug tracking-tight">
                Unlock Your AI Superpowers for{' '}
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent transition-opacity duration-700 ease-in-out">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                At NeuroIQ, we use practical
                Generative AI solutions and proven expertise to enable forward-thinking organizations
                of all sizes to unlock unprecedented growth, optimize operations, and stay ahead of
                the competition.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onSignUp}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Sign Up
                </button>
   <button
  onClick={onOpenChat}
  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
>
  Chat with Sales Agent
</button>
                
                
                {/*
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  View Demo
                </button>
                */}
              </div>
            </div>

            {/* The rest remains unchanged */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">AI</span>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Costs</span>
                  </div>
                </div>

                <div
                  className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl relative overflow-hidden"
                  style={{ aspectRatio: '0.8 / 0.6' }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  ></div>
                  <div className="absolute top-4 right-4 opacity-[0.04]">
                    <TrendingUp className="w-32 h-32 text-cyan-600" strokeWidth={1} />
                  </div>
                  <div className="relative h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-slate-600">Performance</span>
                      <span className="text-2xl font-bold text-cyan-600">&gt;317%+</span>
                    </div>
                    <div className="flex-1 flex items-end justify-between space-x-2">
                      {[40, 55, 45, 70, 65, 85, 95].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t-lg transition-all duration-500"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
