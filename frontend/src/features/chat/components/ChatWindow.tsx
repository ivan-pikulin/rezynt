import React, { useState } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';
import { useUser } from '../../../shared/hooks/useUser';
import { COLORS } from '../../../shared/theme/theme';
import { useTranslation } from 'react-i18next';
import PaywallModal from '../../../shared/components/PaywallModal';
import { useMediaQuery } from '@mui/material';

interface ChatWindowProps {
  resumeId: string | null;
  onResumeUpdate?: () => void;
  fromUpload?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ resumeId, onResumeUpdate, fromUpload = false }) => {
  const { t } = useTranslation();
  const { user, refetch: refetchUser } = useUser();
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  
      // Define mobile mode for screens up to 768px
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const { 
    messages, 
    isLoading, 
    isLoadingMessages,
    hasMoreMessages,
    sendUserMessage, 
    loadOlderMessages,
    messagesEndRef,
    chatContainerRef,
    currentThinkingPhrase
  } = useChat(resumeId, onResumeUpdate, fromUpload, () => setShowPaywallModal(true));

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    // Load older messages when user scrolls to the top
    if (scrollTop === 0 && hasMoreMessages && !isLoadingMessages) {
      loadOlderMessages();
    }
  };

  const handleCreditsClick = () => {
    if (!user?.is_premium) {
      setShowPaywallModal(true);
    }
  };

  const handlePaywallSuccess = () => {
    setShowPaywallModal(false);
    refetchUser();
  };

  const handlePaywallClose = () => {
    setShowPaywallModal(false);
  };
  
  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: COLORS.gradients.secondary,
      borderRadius: isMobile ? '8px' : '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      position: 'relative'
    }}>
              {/* Modern chat header */}
      <Box sx={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
                  p: isMobile ? 1.5 : 2,
          background: COLORS.gradients.primary,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: -15, // Reduced from -20 to -15
          right: -15, // Reduced from -20 to -15
          width: 45, // Reduced from 60 to 45
          height: 45, // Reduced from 60 to 45
          borderRadius: '50%',
          background: 'rgba(198, 156, 114, 0.2)', // Using color c69c72ff
          backdropFilter: 'blur(10px)'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -10, // Reduced from -15 to -10
          left: -10, // Reduced from -15 to -10
          width: 30, // Reduced from 40 to 30
          height: 30, // Reduced from 40 to 30
          borderRadius: '50%',
          background: 'rgba(192, 183, 177, 0.15)', // Using color c0b7b1ff
          backdropFilter: 'blur(10px)'
        }} />
        
        <Typography variant="h6" sx={{ 
          fontWeight: 700, 
          color: 'white',
          fontSize: isMobile ? '1rem' : '1.1rem', // Reduced from 1.25rem to 1.1rem, even less on mobile
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          zIndex: 1
        }}>
          AI Writer
        </Typography>
        
        {!user?.is_premium && (
          <Chip
            icon={<StarIcon sx={{ fontSize: '1rem', color: COLORS.credits.star }} />}
            label={`${user?.credits || 0}/100`}
            size="small"
            onClick={handleCreditsClick}
            sx={{
              background: user?.credits === 0 ? 'rgba(211, 47, 47, 0.2)' : 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: user?.credits === 0 ? COLORS.error.main : 'white',
              border: user?.credits === 0 ? `1px solid ${COLORS.error.main}` : '1px solid rgba(255, 255, 255, 0.2)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              '& .MuiChip-icon': {
                color: user?.credits === 0 ? COLORS.error.main : COLORS.credits.star
              },
              '&:hover': {
                background: user?.credits === 0 ? 'rgba(211, 47, 47, 0.3)' : 'rgba(255, 255, 255, 0.25)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease'
              },
              position: 'relative',
              zIndex: 1
            }}
          />
        )}
      </Box>

      {/* Chat area with modern design */}
      <Box 
        ref={chatContainerRef}
        sx={{ 
          flex: 1, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? 1.5 : 2,
          p: isMobile ? 2 : 3,
          minHeight: 0,
          maxHeight: 'calc(100% - 60px - 56px)', // Minimum height of input area + header
          background: COLORS.gradients.white,
          position: 'relative'
        }}
        onScroll={handleScroll}
      >
        {/* Decorative grid background */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(118, 75, 162, 0.03) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }} />
        
        {/* Loading indicator for older messages */}
        {isLoadingMessages && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            py: 2 
          }}>
            <CircularProgress size={24} sx={{ color: COLORS.primary.main }} />
          </Box>
        )}
        
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isLoading={isLoading}
            currentThinkingPhrase={currentThinkingPhrase}
          />
        ))}
        {/* Invisible div for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </Box>

              {/* Modern input field */}
      <Box sx={{
        flexShrink: 0,
        height: 'auto',
        minHeight: '60px', // Minimum height
        maxHeight: '170px', // Maximum height (150px + padding)
        display: 'flex',
        alignItems: 'flex-end', // Align to bottom
        position: 'relative',
        overflow: 'hidden' // Prevent overflow
      }}>
        <ChatInput onSendMessage={sendUserMessage} disabled={isLoading} />
      </Box>

      {/* Paywall Modal */}
      <PaywallModal
        open={showPaywallModal}
        onClose={handlePaywallClose}
        onSuccess={handlePaywallSuccess}
      />
    </Box>
  );
};

export default ChatWindow; 