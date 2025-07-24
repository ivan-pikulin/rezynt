import React, { memo, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { t, TFunction } from 'i18next';
import { alpha, useTheme } from '@mui/material/styles';
import './TreeNodes.css';
import { PERSON_NODE_WIDTH, PERSON_NODE_HEIGHT } from '../../constants/nodeSizes';
import { getKinships } from '../../hooks/familyTreeFunctions';

// Вынесли функции форматирования за пределы компонента
const formatDateShort = (day?: number, month?: number, year?: number, t?: TFunction): string => {
  if (!year) return '';
  if (month && day) return `${day} ${t?.(`months.short.${month}`)} ${year}`;
  if (month) return `${t?.(`months.short.${month}`)} ${year}`;
  return `${year}`;
};

const formatDateFull = (day?: number, month?: number, year?: number, t?: TFunction): string => {
  if (!year) return '';
  if (month && day) return `${day} ${t?.(`months.full.${month}`)} ${year}`;
  if (month) return `${t?.(`months.full.${month}`)} ${year}`;
  return `${year}`;
};

const getAge = (birthYear: number, birthMonth: number | undefined, birthDay: number | undefined): number => {
  if (!birthYear) return 0;
  
  const today = new Date();
  if (!birthMonth) return today.getFullYear() - birthYear;
  
  const birthDate = new Date(
    birthYear,
    birthMonth - 1,
    birthDay || 15
  );
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

function getAgeWord(age: number): string {
  const remainder = age % 100;
  if (remainder >= 11 && remainder <= 19) {
    return t('years.11-19');
  }
  const lastDigit = age % 10;
  if (lastDigit === 1) {
    return t('years.1');
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return t('years.2-4');
  }
  return t('years.other');
}

interface PersonNodeData {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  deathDay?: number;
  deathMonth?: number;
  deathYear?: number;
  avatarUrl?: string;
  gender?: 'male' | 'female';
  alive: boolean;
  kinship?: {
    meDepth: number;
    otherDepth: number;
    otherGender: 'male' | 'female';
  };
}

interface PersonNodeProps {
  data: PersonNodeData;
  selected: boolean;
}

export const PersonNode = memo(({ data, selected }: PersonNodeProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const isDeceased = !data.alive;

  // Мемоизируем вычисление цветов
  const genderColors = useMemo(() => {
    if (data.gender === 'female') {
      return {
        background: theme.palette.gender.female.background,
        border: selected ? theme.palette.gender.female.active : theme.palette.gender.female.border,
        avatarBg: theme.palette.gender.female.border,
        text: theme.palette.gender.female.text
      };
    }
    if (data.gender === 'male') {
      return {
        background: theme.palette.gender.male.background,
        border: selected ? theme.palette.gender.male.active : theme.palette.gender.male.border,
        avatarBg: theme.palette.gender.male.border,
        text: theme.palette.gender.male.text
      };
    }
    return {
      background: theme.palette.gender.neutral.background,
      border: selected ? theme.palette.gender.neutral.active : theme.palette.gender.neutral.border,
      avatarBg: theme.palette.gender.neutral.border,
      text: theme.palette.gender.neutral.text
    };
  }, [data.gender, selected, theme.palette]);

  // Мемоизируем вычисление имени и дат
  const { fullName, lifeDates, kinshipText } = useMemo(() => {
    const name = [data.firstName, data.lastName].filter(Boolean).join(' ');
    let dates = '';
    
    if (data.alive && data.birthYear) {
      const age = getAge(data.birthYear, data.birthMonth, data.birthDay);
      const ageWord = getAgeWord(age);
      dates = `${age} ${ageWord}`;
    } else if (data.birthYear && data.deathYear) {
      const birth = formatDateShort(data.birthDay, data.birthMonth, data.birthYear, t);
      const death = formatDateShort(data.deathDay, data.deathMonth, data.deathYear, t);
      dates = `${birth} • ${death}`;
    } else if (data.birthYear) {
      dates = formatDateFull(data.birthDay, data.birthMonth, data.birthYear, t);
    } else if (data.deathYear) {
      const death = formatDateFull(data.deathDay, data.deathMonth, data.deathYear, t);
      dates = `? • ${death}`;
    }

    let kinshipText = '';
    if (data.kinship) {
      kinshipText = getKinships(
        data.kinship.meDepth,
        data.kinship.otherDepth,
        data.kinship.otherGender
      );
    }

    return { 
      fullName: name, 
      lifeDates: dates, 
      kinshipText
    };
  }, [data, t]);

  // Мемоизируем инициалы для аватара
  const initials = useMemo(() => {
    if (data.avatarUrl) return '';
    return `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`.toUpperCase();
  }, [data.avatarUrl, data.firstName, data.lastName]);

  return (
    <Card
      className={`person-node ${selected ? 'person-node--selected' : ''} ${isDeceased ? 'person-node--deceased' : ''}`}
      sx={{
        borderColor: genderColors.border,
        bgcolor: genderColors.background,
        width: PERSON_NODE_WIDTH,
        height: PERSON_NODE_HEIGHT,
      }}
    >
      <Handle type="target" position={Position.Top} className="handle" />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar
            src={data.avatarUrl}
            alt={fullName}
            sx={{
              width: 40,
              height: 40,
              bgcolor: genderColors.avatarBg,
              color: genderColors.text,
              fontWeight: 500,
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                lineHeight: 1.2,
                color: genderColors.text,
              }}
            >
              {fullName}
            </Typography>
            {kinshipText && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: alpha(genderColors.text, 0.7),
                  fontSize: '0.95rem', 
                  lineHeight: 1.1, 
                  whiteSpace: 'nowrap',
                  display: 'block',
                  mb: data.alive ? 0 : 0.5
                }}
              >
                {data.alive 
                  ? lifeDates 
                    ? `${kinshipText}, ${lifeDates}`
                    : kinshipText
                  : kinshipText}
              </Typography>
            )}
            {(!data.alive || !kinshipText) && lifeDates && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: alpha(genderColors.text, 0.7),
                  fontSize: '0.95rem', 
                  lineHeight: 1.1, 
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}
              >
                {lifeDates}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </Card>
  );
}); 