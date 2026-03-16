import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  quickReplies?: string[];
}

const RESPONSES: { keywords: string[]; reply: string; links?: { text: string; url: string }[] }[] = [
  {
    keywords: ['হ্যালো', 'hello', 'hi', 'হাই', 'hey', 'শুভ'],
    reply: 'হ্যালো! 👋 Chor Koi-তে স্বাগতম। আমি আপনাকে কিভাবে সাহায্য করতে পারি?',
  },
  {
    keywords: ['রিপোর্ট', 'report', 'অভিযোগ', 'complain'],
    reply: 'রিপোর্ট করতে নিচের "Report" বাটনে ক্লিক করুন। আপনাকে করাপশনের ধরন, বিবরণ, অবস্থান এবং প্রমাণ দিতে হবে।',
    links: [{ text: 'রিপোর্ট করুন', url: '/add' }],
  },
  {
    keywords: ['ম্যাপ', 'map', 'অবস্থান', 'location', 'কোথায়'],
    reply: 'ম্যাপে সকল রিপোর্টের অবস্থান পিন আকারে দেখা যায়। প্রতিটি পিনে ক্লিক করলে বিস্তারিত দেখতে পাবেন।',
    links: [{ text: 'ম্যাপ দেখুন', url: '/map' }],
  },
  {
    keywords: ['ভোট', 'vote', 'সত্য', 'মিথ্যা', 'প্রমাণ'],
    reply: 'প্রতিটি রিপোর্টে আপনি "সত্য", "মিথ্যা" বা "প্রমাণ চাই" ভোট দিতে পারেন। ভোট দিতে লগইন করতে হবে না!',
  },
  {
    keywords: ['install', 'ইনস্টল', 'app', 'অ্যাপ', 'ডাউনলোড'],
    reply: 'এই অ্যাপটি ইনস্টল করতে উপরের "Install" বাটনে ক্লিক করুন। এটি আপনার ফোনে একটি নেটিভ অ্যাপের মতো কাজ করবে।',
  },
  {
    keywords: ['সাহায্য', 'help', 'কিভাবে', 'how'],
    reply: 'আমি আপনাকে রিপোর্ট করা, ম্যাপ দেখা, ভোট দেওয়া ইত্যাদি বিষয়ে সাহায্য করতে পারি। আপনি কি জানতে চান?',
  },
  {
    keywords: ['ধন্যবাদ', 'thanks', 'thank'],
    reply: 'আপনাকেও ধন্যবাদ! 🙏 দুর্নীতিমুক্ত সমাজ গড়তে একসাথে কাজ করি।',
  },
  {
    keywords: ['info', 'তথ্য', 'about', 'সম্পর্কে'],
    reply: 'Chor Koi একটি জনগণের ক্ষমতায়নের প্ল্যাটফর্ম। এখানে যে কেউ দুর্নীতির রিপোর্ট করতে এবং যাচাই করতে পারে।',
    links: [{ text: 'আরও জানুন', url: '/info' }],
  },
];

const DEFAULT_QUICK_REPLIES = ['রিপোর্ট কিভাবে করবো?', 'ম্যাপ দেখাও', 'ভোট কিভাবে দিবো?', 'অ্যাপ ইনস্টল'];

function findResponse(text: string): { reply: string; links?: { text: string; url: string }[] } {
  const lower = text.toLowerCase();
  for (const r of RESPONSES) {
    if (r.keywords.some(k => lower.includes(k))) return r;
  }
  return {
    reply: 'দুঃখিত, আমি এই বিষয়ে সাহায্য করতে পারছি না। আপনি নিচের অপশনগুলো ব্যবহার করুন।',
  };
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'হ্যালো! 👋 আমি Chor Koi বট। আপনাকে কিভাবে সাহায্য করতে পারি?', sender: 'bot', quickReplies: DEFAULT_QUICK_REPLIES },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isMapPage = location.pathname === '/map';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = findResponse(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply + (response.links ? '\n' + response.links.map(l => `🔗 ${l.text}: ${l.url}`).join('\n') : ''),
        sender: 'bot',
        quickReplies: DEFAULT_QUICK_REPLIES,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const renderMessageText = (text: string) => {
    const parts = text.split(/(https?:\/\/[^\s]+|\/[a-z/]+)/g);
    return parts.map((part, i) => {
      if (part.match(/^(https?:\/\/|\/[a-z])/)) {
        return (
          <a key={i} href={part} className="text-blue-500 underline font-bold inline-flex items-center gap-0.5" onClick={(e) => {
            if (part.startsWith('/')) { e.preventDefault(); window.location.href = part; }
          }}>
            {part} <ExternalLink size={12} />
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 ${
          isOpen ? 'bg-gray-800' : 'bg-red-600'
        } text-white bottom-24 right-4`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden ${
          isMapPage ? 'bottom-40 left-4 right-4 sm:left-4 sm:right-auto sm:w-80' : 'bottom-40 right-4 left-4 sm:left-auto sm:w-80'
        }`} style={{ maxHeight: '60vh' }}>
          {/* Header */}
          <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="font-bold text-sm">Chor Koi বট</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-red-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    {renderMessageText(msg.text)}
                  </div>
                </div>
                {msg.quickReplies && msg.sender === 'bot' && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.quickReplies.map((qr, i) => (
                      <button key={i} onClick={() => sendMessage(qr)}
                        className="px-3 py-1.5 text-[11px] font-bold bg-red-50 text-red-600 rounded-full border border-red-100 hover:bg-red-100 transition-colors active:scale-95">
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-2 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="আপনার প্রশ্ন লিখুন..."
              className="flex-1 px-3 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm outline-none focus:border-red-300"
            />
            <button onClick={() => sendMessage(input)} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 active:scale-90 transition-all">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
