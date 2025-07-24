import React, { useState } from 'react';
import { TextField, Button, Box, Checkbox, FormControlLabel, ToggleButtonGroup, ToggleButton, IconButton, Avatar, DialogActions, DialogContent, Dialog, DialogTitle } from '@mui/material';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Person } from 'shared/types/person';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import AutocompletePersonSelect from 'shared/components/ui/AutocompletePersonSelect';
import CommonDialog from 'shared/components/ui/CommonDialog';
import { ImageCropDialog } from './ImageCropDialog';
import personApi from 'services/api/personApi';
import draftApi from 'services/api/draftApi';
import { useFamilyTree } from '../context/FamilyTreeContext';

export interface PersonDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (personForm: any) => Promise<Person>;
  isEditing: boolean;
  personForm: any;
  setPersonForm: React.Dispatch<React.SetStateAction<any>>;
  peopleMen: Person[];
  peopleWomen: Person[];
  selectedPerson: Person | null;
  handlePersonFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  handleError: (error: any) => void;
  loadTree: () => Promise<void>;
  activeDraftId: number | null;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  cropDialogOpen: boolean;
  setCropDialogOpen: (open: boolean) => void;
  currentTreeData: { nodes: any[]; edges: any[] } | null;
}

const PersonDialog: React.FC<PersonDialogProps> = ({
  open,
  onClose,
  onSave,
  isEditing,
  personForm,
  setPersonForm,
  peopleMen,
  peopleWomen,
  selectedPerson,
  handlePersonFormChange,
  onDelete,
  handleError,
  loadTree,
  activeDraftId,
  confirmOpen,
  setConfirmOpen,
  cropDialogOpen,
  setCropDialogOpen,
  currentTreeData
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!personForm.gender) {
      setPersonForm((f: typeof personForm) => ({ ...f, gender: 'male' }));
    }
  }, [open, personForm.gender, setPersonForm]);

  const handleDeleteClick = () => setConfirmOpen(true);
  const handleConfirmClose = () => setConfirmOpen(false);
  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    onDelete();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setCropDialogOpen(true);
        // Сбрасываем значение input после загрузки
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = (croppedBlob: Blob) => {
    // Конвертируем Blob в File для API
    const avatarFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    setPersonForm((f: typeof personForm) => ({ ...f, avatar: avatarFile }));
    setCropDialogOpen(false);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && selectedPerson) {
        if (activeDraftId) {
          if (personForm.avatar instanceof File) {
            await draftApi.updatePersonAvatarInDraft(activeDraftId, selectedPerson.id, personForm.avatar);
          }
          await onSave(personForm);
        } else {
          throw new Error('No draft selected');
        }
      } else {
        if (activeDraftId) {
          await onSave(personForm);
        } else {
          throw new Error('No draft selected');
        }
      }
      
      onClose();
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const months = React.useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: t(`months.full.${i + 1}`)
  })), [t]);

  // Динамический label для alive
  const aliveLabel = personForm.gender === 'female' ? t('dialog.person.alive_female', 'Жива') : t('dialog.person.alive');

  // Автоматическая подстановка матери при выборе отца
  React.useEffect(() => {
    if (!currentTreeData || !personForm.father_id) return;
    // Найти браки, где выбранный отец - муж
    const fatherNodeId = `p-${personForm.father_id}`;
    const marriageEdge = currentTreeData.edges.find((e: any) => e.source === fatherNodeId && e.target.startsWith('m-'));
    if (!marriageEdge) return;
    const marriageNode = currentTreeData.nodes.find((n: any) => n.id === marriageEdge.target && n.type === 'marriage');
    if (!marriageNode) return;
    // Найти мать в этом браке
    const wifeId = marriageNode.data.wifeId;
    if (wifeId && personForm.mother_id !== String(wifeId)) {
      setPersonForm((f: any) => ({ ...f, mother_id: String(wifeId) }));
    }
  }, [personForm.father_id, currentTreeData]);

  // Автоматическая подстановка отца при выборе матери
  React.useEffect(() => {
    if (!currentTreeData || !personForm.mother_id) return;
    // Найти браки, где выбранная мать - жена
    const motherNodeId = `p-${personForm.mother_id}`;
    const marriageEdge = currentTreeData.edges.find((e: any) => e.source === motherNodeId && e.target.startsWith('m-'));
    if (!marriageEdge) return;
    const marriageNode = currentTreeData.nodes.find((n: any) => n.id === marriageEdge.target && n.type === 'marriage');
    if (!marriageNode) return;
    // Найти отца в этом браке
    const husbandId = marriageNode.data.husbandId;
    if (husbandId && personForm.father_id !== String(husbandId)) {
      setPersonForm((f: any) => ({ ...f, father_id: String(husbandId) }));
    }
  }, [personForm.mother_id, currentTreeData]);

  // Обработчик изменения флага alive - очищает даты смерти когда человек помечен как живой
  const handleAliveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isAlive = e.target.checked;
    if (isAlive) {
      // Если человек жив, очищаем все поля дат смерти
      setPersonForm((f: any) => ({ 
        ...f, 
        alive: true,
        death_day: '',
        death_month: '',
        death_year: ''
      }));
    } else {
      // Если человек не жив, просто устанавливаем флаг
      setPersonForm((f: any) => ({ ...f, alive: false }));
    }
  };

  return (
    <>
      <CommonDialog
        open={open}
        onClose={onClose}
        title={isEditing ? t('dialog.person.title_edit') : t('dialog.person.title_add')}
        minWidth={300}
        actions={
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            {isEditing && (
              <Button 
                onClick={handleDeleteClick} 
                variant="outlined"
                color="primary" 
                disabled={isSubmitting}
                startIcon={<DeleteIcon />}
                sx={{ flex: 1 }}
              >
                {t('dialog.person.delete')}
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              variant="contained" 
              disabled={isSubmitting}
              startIcon={<SaveIcon />}
              sx={{ flex: 1 }}
            >
              {isEditing ? t('dialog.person.save_changes') : t('dialog.person.save')}
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box
            component="label"
            sx={{
              position: 'relative',
              width: 100,
              height: 100,
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover .avatar-overlay': {
                opacity: 1
              }
            }}
          >
            <Avatar
              src={
                personForm.avatar instanceof File || personForm.avatar instanceof Blob
                  ? URL.createObjectURL(personForm.avatar)
                  : (isEditing ? selectedPerson?.avatarUrl : undefined)
              }
              sx={{ width: '100%', height: '100%' }}
            />
            <Box
              className="avatar-overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out',
                color: 'white'
              }}
            >
              <CameraAltIcon />
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </Box>
        </Box>
        <TextField
          label={t('dialog.person.last_name')}
          name="last_name"
          value={personForm.last_name}
          onChange={handlePersonFormChange}
          fullWidth
          required
        />
        <TextField
          label={t('dialog.person.first_name')}
          name="first_name"
          value={personForm.first_name}
          onChange={handlePersonFormChange}
          fullWidth
          required
        />
        <TextField
          label={t('dialog.person.middle_name')}
          name="middle_name"
          value={personForm.middle_name}
          onChange={handlePersonFormChange}
          fullWidth
        />
        <Box sx={{ mt: 2, mb: 1 }}>
          <span style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>{t('dialog.person.gender')}</span>
          <ToggleButtonGroup
            color="primary"
            value={personForm.gender || 'male'}
            exclusive
            onChange={(e, value) => value && setPersonForm((f: typeof personForm) => ({ ...f, gender: value }))}
            aria-label="gender"
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }
              }
            }}
          >
            <ToggleButton value="male" aria-label={t('dialog.person.gender_male')} fullWidth><MaleIcon fontSize="medium" /></ToggleButton>
            <ToggleButton value="female" aria-label={t('dialog.person.gender_female')} fullWidth><FemaleIcon fontSize="medium" /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {/* Блок даты рождения */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <span style={{ fontWeight: 500, marginBottom: 2 }}>{t('dialog.marriage.day')}</span>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              label={t('dialog.marriage.day')}
              name="birth_day"
              value={personForm.birth_day}
              onChange={handlePersonFormChange}
              type="number"
              inputProps={{ min: 1, max: 31 }}
              sx={{ minWidth: 60, maxWidth: 80 }}
            />
            <Autocomplete
              options={months}
              getOptionLabel={option => option.label}
              value={months.find(m => m.value === Number(personForm.birth_month)) || undefined}
              onChange={(_, newValue) => {
                setPersonForm((f: any) => ({ ...f, birth_month: newValue ? newValue.value : '' }));
              }}
              renderInput={params => (
                <TextField {...params} label={t('dialog.marriage.month')} sx={{ minWidth: 130, maxWidth: 130 }} />
              )}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              disableClearable
            />
            <TextField
              label={t('dialog.marriage.year')}
              name="birth_year"
              value={personForm.birth_year}
              onChange={handlePersonFormChange}
              type="number"
              sx={{ minWidth: 80, maxWidth: 100 }}
            />
          </Box>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={personForm.alive}
              onChange={handleAliveChange}
              name="alive"
            />
          }
          label={aliveLabel}
          sx={{ mt: 1 }}
        />
        {/* Блок даты смерти */}
        {!personForm.alive && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <span style={{ fontWeight: 500, marginBottom: 2 }}>{t('dialog.person.death_date')}</span>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                label={t('dialog.marriage.day')}
                name="death_day"
                value={personForm.death_day}
                onChange={handlePersonFormChange}
                type="number"
                inputProps={{ min: 1, max: 31 }}
                sx={{ minWidth: 60, maxWidth: 80 }}
              />
              <Autocomplete
                options={months}
                getOptionLabel={option => option.label}
                value={months.find(m => m.value === Number(personForm.death_month)) || undefined}
                onChange={(_, newValue) => {
                  setPersonForm((f: any) => ({ ...f, death_month: newValue ? newValue.value : '' }));
                }}
                renderInput={params => (
                  <TextField {...params} label={t('dialog.marriage.month')} sx={{ minWidth: 130, maxWidth: 130 }} />
                )}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                disableClearable
              />
              <TextField
                label={t('dialog.marriage.year')}
                name="death_year"
                value={personForm.death_year}
                onChange={handlePersonFormChange}
                type="number"
                sx={{ minWidth: 80, maxWidth: 100 }}
              />
            </Box>
          </Box>
        )}
        {/* Отец */}
        <AutocompletePersonSelect
          label={t('dialog.person.father')}
          value={personForm.father_id}
          onChange={val => setPersonForm((f: any) => ({ ...f, father_id: val }))}
          people={peopleMen.filter(p => !isEditing || p.id !== selectedPerson?.id)}
          name="father_id"
          sx={{ mt: 2 }}
        />
        {/* Мать */}
        <AutocompletePersonSelect
          label={t('dialog.person.mother')}
          value={personForm.mother_id}
          onChange={val => setPersonForm((f: any) => ({ ...f, mother_id: val }))}
          people={peopleWomen.filter(p => !isEditing || p.id !== selectedPerson?.id)}
          name="mother_id"
          sx={{ mt: 2 }}
        />
        {/* Описание — в самом конце формы */}
        <TextField
          label={t('dialog.person.description')}
          name="description"
          value={personForm.description}
          onChange={handlePersonFormChange}
          fullWidth
          multiline
          minRows={2}
          sx={{ mt: 2 }}
        />
      </CommonDialog>

      {selectedImage && (
        <ImageCropDialog
          open={cropDialogOpen}
          image={selectedImage}
          onClose={() => setCropDialogOpen(false)}
          onSave={handleCropSave}
        />
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>{t('dialog.person.delete_confirm')}</DialogTitle>
        <DialogContent>{t('dialog.person.delete_confirm_text')}</DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>{t('dialog.person.cancel')}</Button>
          <Button onClick={handleConfirmDelete} color="error">{t('dialog.person.delete')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PersonDialog;