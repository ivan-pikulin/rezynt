import { Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AutocompletePersonSelect from 'shared/components/ui/AutocompletePersonSelect';
import CommonDialog from 'shared/components/ui/CommonDialog';
import { Person } from 'shared/types/person';

export interface MarriageDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  marriageForm: any;
  handleMarriageFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  peopleMen: Person[];
  peopleWomen: Person[];
}

export const MarriageDialog: React.FC<MarriageDialogProps> = ({
  open,
  onClose,
  onSave,
  marriageForm,
  handleMarriageFormChange,
  peopleMen,
  peopleWomen,
}) => {
  const { t } = useTranslation();

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title={t('dialog.marriage.title')}
      minWidth={300}
      actions={
        <Button onClick={onSave} variant="contained">{t('common.button.save')}</Button>
      }
    >
      <AutocompletePersonSelect
        label={t('dialog.marriage.husband')}
        value={marriageForm.husband_id}
        onChange={val => handleMarriageFormChange({ target: { name: 'husband_id', value: val } } as any)}
        people={peopleMen}
        name="husband_id"
        required
      />
      <AutocompletePersonSelect
        label={t('dialog.marriage.wife')}
        value={marriageForm.wife_id}
        onChange={val => handleMarriageFormChange({ target: { name: 'wife_id', value: val } } as any)}
        people={peopleWomen}
        name="wife_id"
        required
      />
    </CommonDialog>
  );
};

export default MarriageDialog; 