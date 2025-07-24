import React, { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { PersonDetails } from './PersonDetailsCard';
import { Person } from 'shared/types/person';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { useHeader } from 'shared/context/HeaderContext';

interface PersonDetailsPanelProps {
  person: Person;
  onEdit: (person: Person) => void;
  people: Person[];
  isAdmin: boolean;
  activeDraftId: number | null;
  editMode: boolean;
}

function mapPersonToDetails(person: Person, people: Person[]) {
  const father = person.fatherId ? people.find(p => String(p.id) === String(person.fatherId)) : undefined;
  const mother = person.motherId ? people.find(p => String(p.id) === String(person.motherId)) : undefined;

  return {
    ...person,
    father: father ? { id: String(father.id), firstName: father.firstName, lastName: father.lastName } : undefined,
    mother: mother ? { id: String(mother.id), firstName: mother.firstName, lastName: mother.lastName } : undefined,
  };
}

const PersonDetailsPanel: React.FC<PersonDetailsPanelProps> = ({ person, onEdit, people, isAdmin, activeDraftId, editMode }) => {
  const { t } = useTranslation();
  const { setHeaderVisible } = useHeader();

  useEffect(() => {
    setHeaderVisible(false);
    return () => setHeaderVisible(true);
  }, [setHeaderVisible]);

  return (
    <Box 
      sx={{ 
        width: 300, 
        minWidth: 300, 
        borderLeft: 1, 
        borderColor: 'divider', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        bgcolor: 'background.paper',
        overflow: 'auto',
        zIndex: 2,
        boxShadow: 3
      }}
    >
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <PersonDetails person={mapPersonToDetails(person, people)} />
      </Box>
      {isAdmin && activeDraftId && editMode && (
        // TODO: check why invisible without duplication
        <Box sx={{ p: 3, pt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 1, borderRadius: 2, fontWeight: 500, fontSize: 18, py: 1.5 }}
            onClick={() => onEdit(person)}
            startIcon={<EditIcon />}
          >
            {t('person.details.edit')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 1, borderRadius: 2, fontWeight: 500, fontSize: 18, py: 1.5 }}
            onClick={() => onEdit(person)}
            startIcon={<EditIcon />}
          >
            {t('person.details.edit')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PersonDetailsPanel; 