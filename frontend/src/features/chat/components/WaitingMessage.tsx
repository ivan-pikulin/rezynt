import React from 'react';
import './WaitingMessage.css';

interface WaitingMessageProps {
  isVisible: boolean;
  isCompleted?: boolean;
}

export const WaitingMessage: React.FC<WaitingMessageProps> = ({ isVisible, isCompleted = false }) => {
  console.log('WaitingMessage render:', isVisible, 'isCompleted:', isCompleted);
  
  if (!isVisible) return null;

  return (
    <div className="waiting-message">
      <div className="waiting-message-content">
        <div className={`waiting-icon ${isCompleted ? 'completed' : 'loading'}`}>
          {isCompleted ? (
            <div className="checkmark">✓</div>
          ) : (
            <div className="spinner"></div>
          )}
        </div>
        <span className="waiting-text">Edit your resume</span>
      </div>
    </div>
  );
};
