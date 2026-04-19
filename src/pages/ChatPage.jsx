import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConversationList } from '../components/ConversationList';
import { Send, Phone, Video, Info, MoreVertical, Paperclip, Smile, CheckCheck, MessageSquare } from 'lucide-react';
import { storage } from '../utils/storage';

export const ChatPage = () => {
  const { user, messages, sendMessage } = useApp();
  const { userId } = useParams();
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (userId) {
      const allUsers = storage.get('users', []);
      const partner = allUsers.find(u => u.id === userId);
      if (partner) {
        setActiveChat({
          id: partner.id,
          name: partner.name,
          avatar: partner.avatar || `https://ui-avatars.com/api/?name=${partner.name}`,
          status: 'Online'
        });
      }
    } else {
      setActiveChat(null);
    }
  }, [userId]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    sendMessage({
      senderId: user.id,
      receiverId: activeChat.id,
      text: newMessage,
    });
    setNewMessage('');
  };

  const filteredMessages = messages.filter(m => 
    (m.senderId === user?.id && m.receiverId === activeChat?.id) ||
    (m.senderId === activeChat?.id && m.receiverId === user?.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-100px)]">
      <Card className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full p-0 overflow-hidden border-none shadow-2xl">
        {/* Conversation List Sidebar */}
        <div className="md:col-span-1 lg:col-span-1">
          <ConversationList />
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col bg-gray-50">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-4 px-6 bg-white border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={activeChat.avatar} className="w-10 h-10 rounded-full" alt="" />
                  <div>
                    <h3 className="font-bold text-gray-900 leading-none">{activeChat.name}</h3>
                    <span className="text-xs text-emerald-500 font-medium">{activeChat.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><Phone size={20} /></button>
                    <button className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><Video size={20} /></button>
                    <button className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                <div className="flex justify-center">
                    <span className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">Today</span>
                </div>
                
                {filteredMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm mb-4">
                            <MessageSquare size={32} />
                         </div>
                         <p className="text-gray-500 font-medium">Start a conversation with {activeChat.name}</p>
                         <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Send a message to discuss project details and deadlines.</p>
                    </div>
                )}

                {filteredMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm relative ${msg.senderId === user.id ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${msg.senderId === user.id ? 'text-brand-200' : 'text-gray-400'}`}>
                        <span className="text-[10px]">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.senderId === user.id && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                  <button type="button" className="p-2 text-gray-400 hover:text-brand-600"><Smile size={24} /></button>
                  <button type="button" className="p-2 text-gray-400 hover:text-brand-600 border-r pr-4"><Paperclip size={24} /></button>
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-grow py-3 outline-none text-gray-900 placeholder:text-gray-400"
                  />
                  <Button type="submit" className="w-12 h-12 rounded-full p-0 flex items-center justify-center shrink-0">
                    <Send size={20} className="ml-1" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
                 <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-brand-600 shadow-xl mb-6">
                    <MessageSquare size={40} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Conversations</h2>
                 <p className="text-gray-500 max-w-sm">Select a contact from the left menu to start messaging or discuss a project.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
