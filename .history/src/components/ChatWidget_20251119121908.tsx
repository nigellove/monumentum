import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface Message {
  role: 'user' | 'agent';
  text: string;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [memoryKey, setMemoryKey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiUrl = "https://monumentum.app.n8n.cloud/webhook/sales-agent7";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || sessionClosed) return;

    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, memoryKey })
      });
      const data = await res.json();

      if (data.sessionClosed) {
        setMessages(prev => [...prev, { role: 'agent', text: data.message }]);
        setSessionClosed(true);
        setTimeout(() => handleClose(), 3000);
        return;
      }

      if (data.message) {
        setMessages(prev => [...prev, { role: 'agent', text: data.message }]);
      }

      setHistory(data.history || []);
      setMemoryKey(data.memoryKey || "");
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'agent',
        text: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    setMessages([{ role: 'agent', text: 'Hello! How can I help you today?' }]);
    setInput('');
    setHistory([]);
    setMemoryKey('');
    setSessionClosed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-full sm:max-w-md h-[600px] flex flex-col">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">Chat with Monumentum</h3>
            <p className="text-teal-100 text-sm">We typically reply instantly</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 bg-white rounded-b-2xl">
          <div className="flex items-end space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={isLoading || sessionClosed}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || sessionClosed}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}