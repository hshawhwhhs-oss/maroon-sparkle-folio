import React from 'react';
import { Shield, Lock, FileText, AlertTriangle, ExternalLink, Github, Globe } from 'lucide-react';

export default function InfoPage() {
  const sections = [
    {
      title: 'About Chor Koi',
      icon: Shield,
      content: '"Chor Koi" is a crowd-powered platform dedicated to exposing corruption and promoting public accountability. We believe that transparency is the first step towards a corruption-free society. By empowering citizens to report and verify incidents, we create a collective voice that cannot be ignored.',
      color: 'text-red-600 bg-red-50'
    },
    {
      title: 'Privacy Policy',
      icon: Lock,
      content: 'Your privacy is our priority. Reports can be submitted anonymously. We do not track your personal identity unless you choose to provide it. Location data is used only for mapping reports and is never linked to your personal profile.',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Terms of Use',
      icon: FileText,
      content: 'By using this app, you agree to provide truthful information. False reporting or malicious use of the platform may lead to your reports being flagged or removed. We encourage constructive reporting with evidence.',
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Disclaimer',
      icon: AlertTriangle,
      content: 'Reports on this platform are user-submitted and crowd-verified. "Chor Koi" does not independently verify every report. Users should exercise their own judgment when viewing reports. We are not responsible for the accuracy of user-generated content.',
      color: 'text-yellow-600 bg-yellow-50'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
          <Shield size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Chor Koi</h1>
        <p className="text-gray-500 font-medium">Crowd-Powered Accountability</p>
      </div>

      <div className="space-y-6 mb-12">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${section.color}`}>
                  <Icon size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-2">Developed By</p>
          <h2 className="text-2xl font-black mb-4">Md Ridoan Mahmud Zisan</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Passionate about building tools that solve real-world problems and empower communities through technology.
          </p>
          <div className="flex gap-4">
            <a 
              href="https://ridoan-zisan.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              <Globe size={16} /> Portfolio
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              <Github size={16} /> GitHub
            </a>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <p className="text-center text-gray-400 text-xs mt-12">
        &copy; {new Date().getFullYear()} Chor Koi. All rights reserved.
      </p>
    </div>
  );
}

