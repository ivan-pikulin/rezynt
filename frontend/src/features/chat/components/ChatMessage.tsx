import React, { memo } from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { ChatMessage as ChatMessageType } from '../hooks/useChat';
import { COLORS } from '../../../shared/theme/theme';

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
  currentThinkingPhrase?: string;
}

// Компонент для анимированных точек
const AnimatedDots: React.FC = () => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {[0, 1, 2].map((index) => (
      <Box
        key={index}
        sx={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: 'currentColor',
          animation: 'dotPulse 1.4s infinite ease-in-out',
          animationDelay: `${index * 0.2}s`,
          '@keyframes dotPulse': {
            '0%, 80%, 100%': {
              opacity: 0.3,
              transform: 'scale(0.8)'
            },
            '40%': {
              opacity: 1,
              transform: 'scale(1)'
            }
          }
        }}
      />
    ))}
  </Box>
);

export const ChatMessage: React.FC<ChatMessageProps> = memo(({ message, isLoading = false, currentThinkingPhrase = 'Thinking...' }) => {
  const isUser = message.sender === 'user';
  // Показываем фразу ожидания только если нет контента
  const showLoading = isLoading && !isUser && !message.content;
  
  return (
    <Box 
      data-message-id={message.id}
      sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'flex-start',
        justifyContent: isUser ? 'flex-end' : 'flex-start'
      }}>
      {!isUser && (
        <Avatar sx={{ 
          width: 36, // Увеличиваем с 32 до 36
          height: 36, // Увеличиваем с 32 до 36
          bgcolor: COLORS.chat.bot.avatar, // Синий цвет для бота
          fontSize: '1rem' // Увеличиваем с 0.875rem до 1rem
        }}>
          <SmartToyIcon sx={{ fontSize: '1.2rem', color: 'white' }} />
        </Avatar>
      )}
      
      <Box sx={{ 
        bgcolor: isUser ? COLORS.chat.user.background : COLORS.chat.bot.background, // Синий для пользователя, голубой для бота
        color: isUser ? COLORS.chat.user.text : COLORS.chat.bot.text, // Белый текст для пользователя, синий для бота
        p: 1.5,
        borderRadius: '8px',
        maxWidth: '70%',
        fontSize: '1rem', // Увеличиваем с 0.875rem до 1rem
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: '24px'
      }}>
        {showLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: '1rem' }}> {/* Увеличиваем с 0.875rem до 1rem */}
              {currentThinkingPhrase}
            </Typography>
            <AnimatedDots />
          </Box>
        ) : (
          <Box 
            component="div"
            sx={{ 
              fontSize: '1rem',
              wordBreak: 'break-word', // Переносим длинные слова
              '& .markdown-content': {
                // Стили для Markdown контента
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  margin: '0.5em 0 0.3em 0',
                  fontWeight: 600,
                  lineHeight: 1.2,
                },
                '& h1': { fontSize: '1.4em' },
                '& h2': { fontSize: '1.3em' },
                '& h3': { fontSize: '1.2em' },
                '& h4, & h5, & h6': { fontSize: '1.1em' },
                '& p': {
                  margin: '0.5em 0',
                  lineHeight: 1.5,
                },
                '& ul, & ol': {
                  margin: '0.5em 0',
                  paddingLeft: '1.5em',
                },
                '& li': {
                  margin: '0.2em 0',
                  lineHeight: 1.4,
                },
                '& blockquote': {
                  margin: '0.5em 0',
                  paddingLeft: '1em',
                  borderLeft: `3px solid ${isUser ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}`,
                  fontStyle: 'italic',
                },
                '& code': {
                  backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  padding: '0.2em 0.4em',
                  borderRadius: '3px',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                },
                '& pre': {
                  backgroundColor: 'transparent',
                  padding: 0,
                  overflow: 'visible',
                  margin: '0.5em 0',
                  '& code': {
                    backgroundColor: 'transparent',
                    padding: 0,
                  }
                },
                '& table': {
                  borderCollapse: 'collapse',
                  width: '100%',
                  margin: '0.5em 0',
                },
                '& th, & td': {
                  border: `1px solid ${isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                  padding: '0.4em 0.6em',
                  textAlign: 'left',
                },
                '& th': {
                  backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  fontWeight: 600,
                },
                '& a': {
                  color: 'inherit',
                  textDecoration: 'underline',
                  '&:hover': {
                    opacity: 0.8,
                  }
                },
                '& strong': {
                  fontWeight: 600,
                },
                '& em': {
                  fontStyle: 'italic',
                },
                '& del': {
                  textDecoration: 'line-through',
                },
                '& hr': {
                  border: 'none',
                  borderTop: `1px solid ${isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                  margin: '1em 0',
                }
              }
            }}
          >
            <div className="markdown-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Кастомизируем компоненты для лучшего отображения
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match ? match[1] : 'text'}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '6px',
                          fontSize: '0.85em',
                          lineHeight: 1.4,
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // Убираем лишние отступы для списков
                  ul: ({ children, ...props }: any) => (
                    <ul style={{ margin: '0.5em 0', paddingLeft: '1.5em' }} {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }: any) => (
                    <ol style={{ margin: '0.5em 0', paddingLeft: '1.5em' }} {...props}>
                      {children}
                    </ol>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </Box>
        )}
      </Box>
      
      {isUser && (
        <Avatar sx={{ 
          width: 36, // Увеличиваем с 32 до 36
          height: 36, // Увеличиваем с 32 до 36
          bgcolor: COLORS.chat.user.avatar, // Коричневый цвет для пользователя
          fontSize: '1rem' // Увеличиваем с дефолтного до 1rem
        }}>
          U
        </Avatar>
      )}
    </Box>
  );
}); 