import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { initializeSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiSend, FiPaperclip, FiX } from 'react-icons/fi';
import type { Message, ChatSession } from '../types';

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messageType, setMessageType] = useState<'text' | 'image' | 'video' | 'document' | 'link'>('text');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chatSession, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => chatService.getChatSession(chatId!),
    enabled: !!chatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: {
      type: 'text' | 'image' | 'video' | 'document' | 'link';
      text?: string;
      contentURL?: string;
      file?: File;
    }) => {
      if (data.file) {
        const uploadResult = await chatService.uploadFile(data.file);
        return chatService.sendMessage(chatId!, {
          type: data.type,
          contentURL: uploadResult.url,
        });
      } else {
        return chatService.sendMessage(chatId!, {
          type: data.type,
          text: data.text,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setMessage('');
      setSelectedFile(null);
      setMessageType('text');
    },
  });

  const endChatMutation = useMutation({
    mutationFn: () => chatService.endChatSession(chatId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'accepted'] });
      toast.success('Chat session ended');
      navigate('/dashboard');
    },
  });

  // Socket.io integration
  useEffect(() => {
    if (!chatId || !user) return;

    const socket = initializeSocket();
    if (!socket) return;

    socket.emit('join-chat', { chatId });

    // Listen for new messages
    const handleNewMessage = (data: { message: Message; chatId: string }) => {
      if (data.chatId === chatId) {
        queryClient.setQueryData(['chat', chatId], (old: ChatSession | undefined) => {
          if (!old) return old;
          // Check if message already exists to avoid duplicates
          const messageExists = old.messages.some(
            (msg) => (typeof msg._id === 'string' ? msg._id : msg._id) === (typeof data.message._id === 'string' ? data.message._id : data.message._id)
          );
          if (messageExists) return old;
          
          return {
            ...old,
            messages: [...old.messages, data.message],
          };
        });
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.emit('leave-chat', { chatId });
    };
  }, [chatId, user, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatSession?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedFile) return;

    if (messageType === 'text' || messageType === 'link') {
      sendMessageMutation.mutate({
        type: messageType,
        text: message,
      });
    } else if (selectedFile) {
      sendMessageMutation.mutate({
        type: messageType,
        file: selectedFile,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine file type
    if (file.type.startsWith('image/')) {
      setMessageType('image');
    } else if (file.type.startsWith('video/')) {
      setMessageType('video');
    } else {
      setMessageType('document');
    }

    setSelectedFile(file);
  };

  const getOtherParticipant = () => {
    if (!chatSession) return null;
    return chatSession.participants.find(
      (p) => (typeof p === 'string' ? p : p._id) !== user?._id
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Chat not found</div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();
  const participantName = typeof otherParticipant === 'string' ? 'User' : otherParticipant?.name || 'User';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{participantName}</h2>
          <p className="text-sm text-gray-500">Skill Exchange Chat</p>
        </div>
        <button
          onClick={() => endChatMutation.mutate()}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
        >
          End Session
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {chatSession.messages.map((msg) => {
          const isOwnMessage = (typeof msg.senderId === 'string' ? msg.senderId : msg.senderId._id) === user?._id;
          const sender = typeof msg.senderId === 'string' ? null : msg.senderId;

          return (
            <div
              key={msg._id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow'
                }`}
              >
                {!isOwnMessage && (
                  <p className="text-xs font-medium mb-1 opacity-75">
                    {sender?.name || 'User'}
                  </p>
                )}
                {msg.type === 'text' && <p>{msg.text}</p>}
                {msg.type === 'link' && (
                  <a href={msg.text} target="_blank" rel="noopener noreferrer" className="underline">
                    {msg.text}
                  </a>
                )}
                {(msg.type === 'image' || msg.type === 'video' || msg.type === 'document') && (
                  <div>
                    {msg.type === 'image' && (
                      <img src={msg.contentURL} alt="Shared" className="max-w-full rounded" />
                    )}
                    {msg.type === 'video' && (
                      <video src={msg.contentURL} controls className="max-w-full rounded" />
                    )}
                    {msg.type === 'document' && (
                      <a
                        href={msg.contentURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Download Document
                      </a>
                    )}
                  </div>
                )}
                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="px-6 py-2 bg-gray-100 border-t flex items-center justify-between">
          <span className="text-sm text-gray-700">{selectedFile.name}</span>
          <button
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="text-red-600 hover:text-red-800"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t px-6 py-4">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!!selectedFile}
          />
          <button
            type="submit"
            disabled={(!message.trim() && !selectedFile) || sendMessageMutation.isPending}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;

