
import React, { useState } from 'react';
import { GmailEmail } from '../../types';

const MOCK_EMAILS: GmailEmail[] = [
  { id: '1', sender: 'Google Workspace', subject: 'Your weekly activity summary', time: '10:24 AM', isRead: false },
  { id: '2', sender: 'GitHub', subject: '[GitHub] A new release is available', time: 'Yesterday', isRead: true },
  { id: '3', sender: 'Netlify', subject: 'Production deploy succeeded', time: '2 days ago', isRead: true },
];

const GmailWidget: React.FC = () => {
  const [emails] = useState<GmailEmail[]>(MOCK_EMAILS);

  const openGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <div className="ios-glass p-0 h-full flex flex-col min-h-0 overflow-hidden relative border-white/10">
      <div className="px-6 py-4 border-b border-white/10 shrink-0 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
            <i className="fa-solid fa-envelope text-rose-400 text-[10px]"></i>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Smart Inbox</h3>
        </div>
        <button 
          onClick={openGmail}
          className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          Check Gmail <i className="fa-solid fa-arrow-up-right-from-square text-[8px]"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-hide">
        {emails.map((email) => (
          <div 
            key={email.id} 
            className="group flex flex-col p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-[11px] font-black truncate max-w-[120px] ${!email.isRead ? 'text-white' : 'text-white/40'}`}>
                {email.sender}
              </span>
              <span className="text-[8px] font-black opacity-20 uppercase tracking-tighter whitespace-nowrap">{email.time}</span>
            </div>
            <p className={`text-[10px] font-medium truncate leading-tight ${!email.isRead ? 'text-white/80' : 'text-white/30'}`}>
              {email.subject}
            </p>
            {!email.isRead && (
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 bg-black/20 border-t border-white/5 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
          Syncing encrypted notifications
        </p>
      </div>
    </div>
  );
};

export default GmailWidget;
