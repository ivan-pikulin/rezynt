import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useTheme } from '@mui/material/styles';

interface PersonDetailsProps {
  person: {
    id: number | string;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    birthDay?: number | null;
    birthMonth?: number | null;
    birthYear?: number | null;
    deathDay?: number | null;
    deathMonth?: number | null;
    deathYear?: number | null;
    description?: string | null;
    avatarUrl?: string | null;
    fatherId?: number | null;
    motherId?: number | null;
    father?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    mother?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    gender?: string;
  } | null;
}

const formatDate = (day?: number | null, month?: number | null, year?: number | null, t?: TFunction) => {
  if (!year) return '';
  const parts = [];
  if (day) parts.push(day);
  if (month) parts.push(t?.(`months.full.${month}`));
  parts.push(year);
  return parts.join(' ');
};

const getInitials = (first: string, last: string) => {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
};

export const PersonDetails: React.FC<PersonDetailsProps> = ({ person }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!person) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">
          {t('person.details.select')}
        </Typography>
      </Box>
    );
  }

  const fullName = `${person.firstName} ${person.lastName}`;
  const fio = [person.lastName, person.firstName, person.middleName].filter(Boolean).join(' ');
  const birthDate = formatDate(person.birthDay, person.birthMonth, person.birthYear, t);
  const deathDate = formatDate(person.deathDay, person.deathMonth, person.deathYear, t);
  const isFemale = person.gender === 'female';

  return (
    <Card sx={{ m: 0, maxWidth: 400, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2 }}>
      <CardHeader
        avatar={
          <Avatar
            src={person.avatarUrl || undefined}
            sx={{
              width: 64,
              height: 64,
              fontSize: 28,
              bgcolor: !person.avatarUrl
                ? (isFemale ? theme.palette.gender.female.border : theme.palette.gender.male.border)
                : undefined
            }}
          >
            {!person.avatarUrl && getInitials(person.firstName, person.lastName)}
          </Avatar>
        }
        title={
          <Typography variant="h5" fontWeight={600}>{fullName}</Typography>
        }
      />
      <Divider />
      <CardContent>
        <Typography variant="subtitle1" fontWeight={500} mb={1}>{fio}</Typography>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <CalendarMonthIcon color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {birthDate
              ? `${isFemale ? t('person.born_female') : t('person.born_male')}: ${birthDate}`
              : t('person.birth_unknown')}
          </Typography>
        </Stack>
        {person.deathYear && (
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <CalendarMonthIcon color="error" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {deathDate ? `${isFemale ? t('person.died_female') : t('person.died_male')}: ${deathDate}` : t('person.death_unknown')}
            </Typography>
          </Stack>
        )}
        {(person.father || person.mother) && (
          <Box mb={2}>
            {person.father && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <ManIcon fontSize="small" sx={{ color: theme.palette.gender.male.border }} />
                <Typography variant="body2">
                  {t('person.father')}: {person.father.firstName} {person.father.lastName}
                </Typography>
              </Stack>
            )}
            {person.mother && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <WomanIcon fontSize="small" sx={{ color: theme.palette.gender.female.border }} />
                <Typography variant="body2">
                  {t('person.mother')}: {person.mother.firstName} {person.mother.lastName}
                </Typography>
              </Stack>
            )}
          </Box>
        )}
        {person.description && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('person.about')}</Typography>
            <Typography variant="body2">{person.description}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 