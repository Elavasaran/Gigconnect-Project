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
              <div className="p-4 px-6 bg-white border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-gray-900">Chat with {activeChat.name}</h3>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-white">
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
                    <div className={`max-w-[70%] px-5 py-2.5 rounded-full ${msg.senderId === user.id ? 'bg-[#2563eb] text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <p className="text-sm font-medium">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="flex items-center w-full border border-gray-300 rounded-full px-2 py-1.5">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow pl-4 py-2 outline-none text-gray-900 bg-transparent text-sm placeholder:text-gray-500"
                  />
                  <Button type="submit" className="w-10 h-10 rounded-full p-0 flex items-center justify-center shrink-0 bg-[#2563eb] hover:bg-blue-700">
                    <Send size={18} className="text-white" />
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
