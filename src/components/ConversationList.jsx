import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, User } from 'lucide-react';
import { storage } from '../utils/storage';

const SOCKET_URL = 'http://localhost:5000';

export const ConversationList = () => {
  const { user, messages } = useApp();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real conversations from backend
    const fetchConversations = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await fetch(`${SOCKET_URL}/api/messages/conversations?userId=${user.id}`);
        const data = await response.json();
        
        // Enrich with user names from our local store (or fetch them)
        const allUsers = storage.get('users', []);
        const enriched = data.map(conv => {
            const partner = allUsers.find(u => u.id === conv.userId) || { name: 'Unknown User' };
            return {
                ...conv,
                name: partner.name,
                avatar: partner.avatar || `https://ui-avatars.com/api/?name=${partner.name}`
            }
        });

        setConversations(enriched);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [messages, user, storage]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="p-4 border-b border-gray-100 bg-brand-50/20">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            placeholder="Search conversations" 
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400 italic">
            No conversations started yet.
          </div>
        ) : (
          conversations.map(conv => (
            <button 
              key={conv.userId}
              onClick={() => navigate(`/chat/${conv.userId}`)}
              className={`w-full flex items-center gap-4 p-4 transition-all border-b border-gray-50 text-left ${userId === conv.userId ? 'bg-brand-50 border-r-4 border-r-brand-600' : 'hover:bg-gray-50'}`}
            >
              <div className="relative shrink-0">
                <img src={conv.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="" />
                {/* Optional online indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-gray-900 truncate">{conv.name}</p>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{formatTime(conv.timestamp)}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-sm truncate ${userId === conv.userId ? 'text-brand-600 font-medium' : 'text-gray-500'}`}>
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
