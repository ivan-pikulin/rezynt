import CloseIcon from '@mui/icons-material/Close';
import HeartPlusIcon from '@mui/icons-material/Favorite';
import AccountPlusIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import SyncIcon from '@mui/icons-material/Sync';
import { Box, Button, Card, CardActions, IconButton, Tooltip, Typography } from '@mui/material';
import InputBase from '@mui/material/InputBase';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Draft } from 'services/api/types';

interface DraftCardProps {
  draft: Draft;
  isActive: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onPublish: (id: number) => void;
  onRename: (id: number, name: string) => void;
  onAddPerson?: () => void;
  onAddMarriage?: () => void;
  onAutoLayout?: () => void;
  onSyncPositions?: () => void;
  hasUnsavedChanges?: boolean;
  isSyncing?: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  setConfirmPublishDraftOpen: (open: boolean) => void;
  setDraftToDelete: (id: number | null) => void;
  setDraftToPublish: (id: number | null) => void;
}

const DraftCard: React.FC<DraftCardProps> = ({
  draft,
  isActive,
  onSelect,
  onDelete,
  onPublish,
  onRename,
  onAddPerson,
  onAddMarriage,
  onAutoLayout,
  onSyncPositions,
  hasUnsavedChanges = false,
  isSyncing = false,
  setDeleteDialogOpen,
  setConfirmPublishDraftOpen,
  setDraftToDelete,
  setDraftToPublish,
}) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(draft.name || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleNameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    setEditing(false);
    if ((name.trim() || t('tree.draft', { number: draft.id })) !== (draft.name || t('tree.draft', { number: draft.id }))) {
      onRename(draft.id, name.trim());
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setName(draft.name || '');
      setEditing(false);
    }
  };

  return (
    <Card
      variant={isActive ? 'elevation' : 'outlined'}
      sx={{
        mb: 2,
        cursor: 'pointer',
        borderColor: isActive ? 'primary.main' : 'divider',
        borderWidth: 2,
        borderStyle: isActive ? 'solid' : 'outlined',
        position: 'relative',
        minWidth: 260,
        minHeight: isActive ? 160 : undefined,
        pt: isActive ? 2 : 0,
        transition: isActive
          ? 'min-height 0.3s cubic-bezier(.4,2,.6,1), padding-top 0.3s cubic-bezier(.4,2,.6,1)'
          : 'min-height 0.3s cubic-bezier(.4,2,.6,1)',
        overflow: 'hidden',
      }}
      onClick={() => onSelect(draft.id)}
    >
      <Box
        sx={
          isActive
            ? { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', mb: 2, height: 56, transition: 'height 0.3s cubic-bezier(.4,2,.6,1)' }
            : {
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                py: 1.5,
              }
        }
      >
        {isActive ? (
          editing ? (
            <InputBase
              inputRef={inputRef}
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              inputProps={{
                maxLength: 64,
                style: {
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: '1.25rem',
                  padding: '2px 8px',
                  width: '100%',
                  background: 'inherit',
                  borderRadius: 4,
                },
                onClick: (e: React.MouseEvent) => e.stopPropagation(),
              }}
              sx={{
                width: '100%',
                fontWeight: 500,
                fontSize: '1.25rem',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                background: 'inherit',
                color: 'text.primary',
                '& input': {
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: '1.25rem',
                  color: 'text.primary',
                  background: 'inherit',
                },
              }}
            />
          ) : (
            <Typography
              variant="h6"
              sx={{ textAlign: 'center', flexGrow: 1, fontWeight: 500, wordBreak: 'break-word', pr: 1, cursor: 'pointer', userSelect: 'text' }}
              onDoubleClick={handleNameDoubleClick}
              title={t('tree.rename_draft')}
            >
              {draft.name || t('tree.draft', { number: draft.id })}
            </Typography>
          )
        ) : (
          <Typography
            variant="h6"
            sx={{ textAlign: 'center', fontWeight: 500, wordBreak: 'break-word', pr: 1 }}
          >
            {draft.name || t('tree.draft', { number: draft.id })}
          </Typography>
        )}
      </Box>
      {isActive && (
        <>
          {/* Close (delete) button in top-left */}
          <Tooltip title={t('tree.draft.delete_button_help')} placement="right">
            <IconButton
              aria-label={t('tree.draft.delete_button_help')}
              sx={{
                position: 'absolute',
                left: 8,
                top: 8,
                color: (theme) => theme.palette.grey[400],
                zIndex: 2,
                opacity: 0.6,
                p: 0.5,
                '&:hover': { color: (theme) => theme.palette.grey[600], opacity: 1 },
              }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setDraftToDelete(draft.id);
                setDeleteDialogOpen(true);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {/* Info button in top-right */}
          <Tooltip 
            title={
              <Box sx={{ 
                p: 1.5, 
                whiteSpace: 'pre-line',
                '& > div': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                  '&:last-child': { mb: 0 }
                },
                '& .key': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100],
                  color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
                  padding: '2px 8px',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  boxShadow: (theme) => theme.shadows[1],
                  mr: 0.5,
                  mb: 0.5,
                  display: 'inline-block',
                  minWidth: 32,
                  textAlign: 'center',
                }
              }}>
                <div><span className="key">Alt + P</span> - {t('tree.draft.keyboard_shortcuts.add_person')}</div>
                <div><span className="key">Alt + M</span> - {t('tree.draft.keyboard_shortcuts.add_marriage')}</div>
                <div><span className="key">e</span> - {t('tree.draft.keyboard_shortcuts.edit_person')}</div>
                <div><span className="key">o</span> - {t('tree.draft.keyboard_shortcuts.organize_marriage')}</div>
                <div><span className="key">r</span> - {t('tree.draft.keyboard_shortcuts.swap_spouse_positions')}</div>
                <div><span className="key">Del</span> - {t('tree.draft.keyboard_shortcuts.delete')}</div>
              </Box>
            } 
            placement="left"
          >
            <IconButton
              aria-label={t('tree.draft.keyboard_shortcuts')}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[400],
                zIndex: 2,
                opacity: 0.6,
                p: 0.5,
                '&:hover': { color: (theme) => theme.palette.grey[600], opacity: 1 },
              }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <CardActions sx={{ flexDirection: 'column', alignItems: 'center', gap: 1, pt: 0, pb: 1, width: '100%' }}>
            {/* Tools row: three equal-width buttons */}
            <Box sx={{ display: 'flex', width: '100%', gap: 1, mb: 2 }}>
              <Tooltip title={t('action.add_person')} placement="bottom">
                <IconButton
                  color="primary"
                  sx={{ flex: 1, minWidth: 0, border: 1, borderColor: 'divider', borderRadius: 1, height: 40 }}
                  onClick={e => { e.stopPropagation(); onAddPerson && onAddPerson(); }}
                >
                  <AccountPlusIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('action.add_marriage')} placement="bottom">
                <IconButton
                  color="primary"
                  sx={{ flex: 1, minWidth: 0, border: 1, borderColor: 'divider', borderRadius: 1, height: 40 }}
                  onClick={e => { e.stopPropagation(); onAddMarriage && onAddMarriage(); }}
                >
                  <HeartPlusIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('tree.draft.sync_positions')} placement="bottom">
                <IconButton
                  color={hasUnsavedChanges ? "warning" : "primary"}
                  disabled={isSyncing || !hasUnsavedChanges}
                  sx={{ 
                    flex: 1, 
                    minWidth: 0, 
                    border: 1, 
                    borderColor: hasUnsavedChanges ? 'warning.main' : 'divider', 
                    borderRadius: 1, 
                    height: 40,
                    '&.Mui-disabled': {
                      borderColor: 'divider',
                      color: 'action.disabled'
                    }
                  }}
                  onClick={e => { e.stopPropagation(); onSyncPositions && onSyncPositions(); }}
                >
                  <SyncIcon sx={{ 
                    animation: isSyncing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              fullWidth
              size="large"
              color="success"
              variant="contained"
              startIcon={<CheckCircleIcon />}
              sx={{
                fontWeight: 600,
                fontSize: '1.25rem',
                letterSpacing: 0.5,
                color: '#fff',
                backgroundColor: 'success.main',
                boxShadow: 2,
                borderRadius: 2,
                '&:hover': { backgroundColor: 'success.dark', color: '#fff' },
                textTransform: 'none',
              }}
              onClick={e => {
                e.stopPropagation();
                setDraftToPublish(draft.id);
                setConfirmPublishDraftOpen(true);
              }}
            >
              {t('tree.draft.publish_button_text')}
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default DraftCard; 