import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { ratingService } from '../services/rating.service';
import { initializeSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiSend, FiPaperclip, FiX, FiStar } from 'react-icons/fi';
import type { Message, ChatSession } from '../types';

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messageType, setMessageType] = useState<'text' | 'image' | 'video' | 'document' | 'link'>('text');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
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
      // Show rating modal instead of navigating immediately
      setShowRatingModal(true);
    },
  });

  const createRatingMutation = useMutation({
    mutationFn: (data: { ratedUserId: string; skillId: string; score: number; comment?: string; sessionId?: string }) => {
      return ratingService.createRating({
        ratedUserId: data.ratedUserId,
        skillId: data.skillId,
        score: data.score,
        comment: data.comment,
        sessionId: data.sessionId || chatId,
      });
    },
    onSuccess: () => {
      // Invalidate all relevant queries to update dashboard
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'accepted'] });
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit rating');
    },
  });

  // Socket.io integration
  useEffect(() => {
    if (!chatId || !user) return;

    const socket = initializeSocket();
    if (!socket) {
      console.warn('Socket not initialized');
      return;
    }

    // Wait for socket to connect before joining
    const handleConnect = () => {
      console.log('Socket connected, joining chat:', chatId);
      socket.emit('join-chat', { chatId });
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.once('connect', handleConnect);
    }

    // Listen for new messages
    const handleNewMessage = (data: { message: Message; chatId: string }) => {
      console.log('Received new message event:', data);
      if (data.chatId === chatId) {
        queryClient.setQueryData(['chat', chatId], (old: ChatSession | undefined) => {
          if (!old) {
            console.warn('No old chat data, cannot add message');
            return old;
          }
          
          // Check if message already exists to avoid duplicates
          const messageId = typeof data.message._id === 'string' 
            ? data.message._id 
            : (data.message._id as any)?.toString();
          
          const messageExists = old.messages.some((msg) => {
            const msgId = typeof msg._id === 'string' ? msg._id : (msg._id as any)?.toString();
            return msgId === messageId;
          });
          
          if (messageExists) {
            console.log('Message already exists, skipping');
            return old;
          }
          
          console.log('Adding new message to chat');
          return {
            ...old,
            messages: [...old.messages, data.message],
          };
        });
      } else {
        console.log('Message chatId mismatch:', data.chatId, 'expected:', chatId);
      }
    };

    // Listen for session ended event
    const handleSessionEnded = (data: { chatId: string; endedBy: string }) => {
      console.log('Session ended event received:', data);
      if (data.chatId === chatId) {
        // Show rating modal when session is ended by other participant
        setShowRatingModal(true);
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.invalidateQueries({ queryKey: ['requests', 'accepted'] });
        toast('Session ended. Please rate your experience.', { icon: 'ℹ️' });
      }
    };

    // Listen for socket errors
    const handleError = (error: any) => {
      console.error('Socket error:', error);
      toast.error(error?.message || 'Socket connection error');
    };

    socket.on('new-message', handleNewMessage);
    socket.on('session-ended', handleSessionEnded);
    socket.on('error', handleError);

    return () => {
      console.log('Cleaning up socket listeners for chat:', chatId);
      socket.off('new-message', handleNewMessage);
      socket.off('session-ended', handleSessionEnded);
      socket.off('error', handleError);
      socket.off('connect', handleConnect);
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

      {/* Rating Modal */}
      {showRatingModal && chatSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="h3 mb-4 text-text-primary">Rate Your Learning Experience</h3>
            <p className="text-sm text-text-secondary mb-6">
              How would you rate {(() => {
                const otherParticipant = chatSession.participants.find(
                  (p: any) => (typeof p === 'string' ? p : p._id) !== user?._id
                );
                return typeof otherParticipant === 'string' ? 'the other participant' : otherParticipant?.name || 'the other participant';
              })()} for teaching you {(() => {
                const request = typeof chatSession.requestId === 'object' ? chatSession.requestId : null;
                if (user?._id && request) {
                  // Determine which skill the user was learning
                  const isSender = (request as any).senderId?._id === user._id || (request as any).senderId === user._id;
                  const learningSkill = isSender 
                    ? (request as any).requestedSkillId 
                    : (request as any).offeredSkillId;
                  return typeof learningSkill === 'object' ? learningSkill?.name : 'this skill';
                }
                return 'this skill';
              })()}?
            </p>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors ${
                    star <= rating
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  <FiStar className="fill-current" />
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Optional: Add a comment about your experience..."
              className="input min-h-[100px] mb-6"
              maxLength={500}
            />

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  if (rating === 0) {
                    toast.error('Please select a rating');
                    return;
                  }
                  
                  const otherParticipant = chatSession.participants.find(
                    (p: any) => (typeof p === 'string' ? p : p._id) !== user?._id
                  );
                  const otherUserId = typeof otherParticipant === 'string' 
                    ? otherParticipant 
                    : otherParticipant?._id;

                  const request = typeof chatSession.requestId === 'object' ? chatSession.requestId : null;
                  let skillId = '';
                  if (user?._id && request) {
                    const isSender = (request as any).senderId?._id === user._id || (request as any).senderId === user._id;
                    const learningSkill = isSender 
                      ? (request as any).requestedSkillId 
                      : (request as any).offeredSkillId;
                    skillId = typeof learningSkill === 'object' ? learningSkill?._id : learningSkill || '';
                  }

                  if (!otherUserId || !skillId) {
                    toast.error('Unable to determine rating details');
                    return;
                  }

                  createRatingMutation.mutate({
                    ratedUserId: otherUserId,
                    skillId,
                    score: rating,
                    comment: ratingComment || undefined,
                    sessionId: chatId,
                  });
                }}
                disabled={rating === 0 || createRatingMutation.isPending}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
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

