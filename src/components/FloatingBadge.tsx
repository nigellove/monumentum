import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingBadgeProps {
  onOpenChat: () => void;
}

export default function FloatingBadge({ onOpenChat }: FloatingBadgeProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsVisible(window.scrollY < window.innerHeight * 3);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const floatOffset = Math.sin(scrollY * 0.01) * 15;

  if (!isVisible) return null;

  return (
    <button
      onClick={onOpenChat}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed right-0 z-40 flex items-center space-x-3 bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group overflow-hidden"
      style={{
        top: `${120 + floatOffset}px`,
        transition: 'top 0.1s ease-out, width 0.5s ease, padding 0.5s ease, opacity 0.3s ease, border-radius 0.5s ease',
        opacity: 0.9,
        borderRadius: isHovered ? '9999px 0 0 9999px' : '9999px 0 0 9999px',
        width: isHovered ? 'auto' : '60px',
        height: '60px',
        paddingLeft: isHovered ? '1.25rem' : '0.75rem',
        paddingRight: '0',
      }}
    >
      <div className="flex items-center justify-center" style={{ minWidth: '32px', height: '60px' }}>
        <MessageCircle className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
      </div>
      {isHovered && (
        <span className="text-sm font-medium text-white whitespace-nowrap pr-4 animate-fadeIn">
          Questions about our services? Chat with us now
        </span>
      )}
    </button>
  );
}