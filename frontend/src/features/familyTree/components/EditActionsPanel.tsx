import React from 'react';
import { Stack, Card, CardContent, Typography, IconButton, CardActions, Dialog, DialogTitle, DialogContent, DialogActions as MuiDialogActions, Box, Tooltip, Button, Chip, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';
import { Draft } from 'services/api/types';
import DraftCard from './DraftCard';
import CommonDialog from 'shared/components/ui/CommonDialog';
import draftApi from 'services/api/draftApi';

interface EditActionsPanelProps {
  onAddPerson: () => void;
  onAddMarriage: () => void;
  onAutoLayout: () => void;
  onSyncPositions?: () => void;
  hasUnsavedChanges?: boolean;
  isSyncing?: boolean;
  drafts: Draft[];
  activeTab: 'published' | number | 'new';
  onTabChange: (_: any, value: string | number) => void;
  onDeleteDraft: (id: number) => void;
  onPublishDraft: (id: number) => void;
  onCreateDraft: () => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  draftToDelete: number | null;
  setDraftToDelete: (id: number | null) => void;
  onExitEditMode: () => void;
  setConfirmPublishDraftOpen: (open: boolean) => void;
  confirmPublishDraftOpen: boolean;
  draftToPublish: number | null;
  setDraftToPublish: (id: number | null) => void;
  setDrafts: React.Dispatch<React.SetStateAction<Draft[]>>;
}

const EditActionsPanel: React.FC<EditActionsPanelProps> = ({
  onAddPerson,
  onAddMarriage,
  onAutoLayout,
  onSyncPositions,
  hasUnsavedChanges = false,
  isSyncing = false,
  drafts,
  activeTab,
  onTabChange,
  onDeleteDraft,
  onPublishDraft,
  onCreateDraft,
  deleteDialogOpen,
  setDeleteDialogOpen,
  draftToDelete,
  setDraftToDelete,
  onExitEditMode,
  setConfirmPublishDraftOpen,
  confirmPublishDraftOpen,
  draftToPublish,
  setDraftToPublish,
  setDrafts,
}) => {
  const { t } = useTranslation();
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [draftToRename, setDraftToRename] = React.useState<Draft | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const handleOpenRename = (draft: Draft) => {
    setDraftToRename(draft);
    setRenameValue(draft.name || '');
    setRenameDialogOpen(true);
  };
  const handleRenameConfirm = async () => {
    if (!draftToRename) return;
    setLoading(true);
    try {
      const updatedDraft = await draftApi.renameDraft(draftToRename.id, renameValue);
      // Update the drafts list with the renamed draft
      const updatedDrafts = drafts.map(draft => 
        draft.id === updatedDraft.id ? updatedDraft : draft
      );
      setDrafts(updatedDrafts);
    } catch (e) {
      // handle error if needed
    } finally {
      setLoading(false);
      setRenameDialogOpen(false);
      setDraftToRename(null);
    }
  };
  return (
    <Box
      sx={{
        width: 300,
        minWidth: 300,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        boxShadow: 3,
        overflow: 'auto',
        zIndex: 2,
        position: 'relative',
      }}
    >
      {/* Верхняя панель с крестиком и плашкой */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton onClick={onExitEditMode} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
        <Chip
          icon={<AccountTreeIcon />}
          label={t('tree.published_title')}
          clickable
          color={activeTab === 'published' ? 'primary' : 'default'}
          variant={activeTab === 'published' ? 'filled' : 'outlined'}
          onClick={() => onTabChange(null, 'published')}
          sx={{ ml: 1, fontWeight: 500, fontSize: 15, px: 1.5, py: 0.5 }}
        />
      </Box>
      <Stack direction="column" spacing={2} sx={{ flex: 1, p: 3, pt: 2 }}>
        {/* Draft cards */}
        {Array.isArray(drafts) && drafts.map((draft, idx) => (
          <DraftCard
            key={draft.id}
            draft={draft}
            isActive={activeTab === draft.id}
            onSelect={id => onTabChange(null, id)}
            onDelete={onDeleteDraft}
            onPublish={onPublishDraft}
            onRename={async (id, name) => {
              if (!name || name === draft.name) return;
              setLoading(true);
              try {
                const updatedDraft = await draftApi.renameDraft(id, name);
                const updatedDrafts = drafts.map(d => d.id === updatedDraft.id ? updatedDraft : d);
                setDrafts(updatedDrafts);
              } finally {
                setLoading(false);
              }
            }}
            onAddPerson={activeTab === draft.id ? onAddPerson : undefined}
            onAddMarriage={activeTab === draft.id ? onAddMarriage : undefined}
            onAutoLayout={activeTab === draft.id ? onAutoLayout : undefined}
            onSyncPositions={activeTab === draft.id ? onSyncPositions : undefined}
            hasUnsavedChanges={activeTab === draft.id ? hasUnsavedChanges : false}
            isSyncing={activeTab === draft.id ? isSyncing : false}
            setDeleteDialogOpen={setDeleteDialogOpen}
            setConfirmPublishDraftOpen={setConfirmPublishDraftOpen}
            setDraftToDelete={setDraftToDelete}
            setDraftToPublish={setDraftToPublish}
          />
        ))}
        {/* Hint about Shift+drag functionality */}
        <Alert 
          severity="info" 
          icon={<InfoIcon fontSize="small" />}
          sx={{ 
            fontSize: '0.75rem',
            '& .MuiAlert-message': { fontSize: '0.75rem' },
            '& .MuiAlert-icon': { fontSize: '1rem' },
            mt: 1,
            mb: 1
          }}
        >
          <Typography variant="caption" component="div">
            <strong>{t('common.tip', 'Tip')}:</strong> {t('tree.draft.shift_drag_tip')}
          </Typography>
        </Alert>

        {/* Create new draft card */}
        <Tooltip title={t('tree.draft.create_button_help')} placement="top">
          <Card
            variant={activeTab === 'new' ? 'elevation' : 'outlined'}
            sx={{
              mt: 'auto',
              cursor: 'pointer',
              borderColor: 'primary.main',
              borderWidth: 2,
              borderStyle: 'dashed',
              opacity: 0.5,
              backgroundColor: 'background.paper',
              boxShadow: 'none',
              minWidth: 260,
              mb: 2,
              transition: 'min-height 0.3s cubic-bezier(.4,2,.6,1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...(activeTab === 'new' && { opacity: 0.7, borderColor: 'primary.main' }),
            }}
            onClick={onCreateDraft}
          >
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1.5 }}>
              <AddIcon sx={{ color: 'text.primary', fontSize: 22 }} />
            </Box>
          </Card>
        </Tooltip>
        {/* Dialogs */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>{t('tree.draft.confirm_delete')}</DialogTitle>
          <DialogContent>{t('tree.draft.delete_warning')}</DialogContent>
          <MuiDialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button color="error" onClick={() => draftToDelete && onDeleteDraft(draftToDelete)}>{t('common.delete')}</Button>
          </MuiDialogActions>
        </Dialog>
        <Dialog open={confirmPublishDraftOpen} onClose={() => setConfirmPublishDraftOpen(false)}>
          <DialogTitle>{t('tree.draft.confirm_publish')}</DialogTitle>
          <DialogContent>{t('tree.draft.publish_warning')}</DialogContent>
          <MuiDialogActions>
            <Button onClick={() => setConfirmPublishDraftOpen(false)}>{t('common.cancel')}</Button>
            <Button color="success" onClick={() => draftToPublish && onPublishDraft(draftToPublish)}>{t('common.publish')}</Button>
          </MuiDialogActions>
        </Dialog>
        <CommonDialog
          open={renameDialogOpen}
          onClose={() => setRenameDialogOpen(false)}
          title={t('tree.rename_draft')}
          actions={
            <>
              <Button onClick={() => setRenameDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleRenameConfirm} disabled={loading || !renameValue.trim()} variant="contained" color="primary">{t('common.save')}</Button>
            </>
          }
        >
          <input
            type="text"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            style={{ width: '100%', padding: 8, fontSize: 16 }}
            autoFocus
          />
        </CommonDialog>
      </Stack>
    </Box>
  );
};

export default EditActionsPanel; 