# DESIGN.md

version alpha
name Rezynt
description AI-powered resume builder with a calm SaaS shell, trustworthy editorial spacing, and a conservative export layer. The default product experience is clean, structured, and professional. Marketing pages may be warmer and more illustrative, but the app itself stays neutral, precise, and resume-first.

## Источники стиля

- `frontend/src/shared/theme/theme.ts` - базовая палитра, тени, radii, score colors.
- `frontend/src/index.css` - основной sans stack и глобальные browser-level overrides.
- `frontend/src/shared/components/Header/Header.tsx` - каркас shell, stepper/tabs, sticky header.
- `frontend/src/shared/components/templates/*` - поведение экспортируемых резюме.
- `landing/styles.css` - маркетинговый слой, hero-композиции, более тёплая подача.
- `frontend/src/shared/design/designVariant.ts` - экспериментальные дизайн-режимы.

## Визуальный ДНК

- Продукт должен выглядеть как инструмент для серьёзной работы, а не как развлекательный генератор.
- Основное ощущение: ясность, контроль, аккуратность, профессиональная нейтральность.
- Фоновая среда светлая, карточная, с мягкой глубиной и небольшим количеством декоративного шума.
- Акценты используются для действия и статуса, а не для украшения.

## Цвета

| Token | Value | Use |
|---|---:|---|
| `primary` | `#6b7fd7` | Основной action, ссылки, активные состояния |
| `primary.dark` | `#5a6bc8` | Hover / stronger emphasis |
| `secondary` | `#673ab7` | Вторичный брендовый акцент |
| `success` | `#4caf50` / `#10b981` | Успех, готово, подтверждение |
| `error` | `#d32f2f` / `#ef4444` | Ошибка, критический статус |
| `warning` | `#f59e0b` | Предупреждение, paywall, мягкое внимание |
| `ink` | `#2c3e50` / `#333333` | Основной текст и заголовки |
| `muted` | `#7f8c8d` / `#6b7280` | Вторичный текст |
| `surface` | `#ffffff` / `#fafafa` | Карточки и рабочие поверхности |
| `border` | `#ddd` / `#e0e0e0` | Лёгкие границы и разделители |

### Правила цвета

- Базовый shell опирается на холодную blue-purple систему.
- Тёплые оттенки `#c69c72`, `#8B7355`, `#f4ede7`, `#fde047` допустимы в marketing/hero/concept-only зонах.
- Не смешивать много сильных акцентов в одном экране.
- Не вводить новые цвета, если задачу решают существующие токены из `theme.ts`.

## Типографика

| Role | Family | Notes |
|---|---|---|
| Body UI | `Manrope`, `IBM Plex Sans`, `Segoe UI`, sans-serif | Основной продуктовый текст |
| Supporting UI | `IBM Plex Sans` | Табличные, плотные и вторичные интерфейсы |
| Display / concept moments | `Fraunces`, `Sora` | Только для выразительных hero-моментов или концептов |
| Monospace | `source-code-pro`, `Menlo`, `Monaco`, monospace | Код, технические вставки, служебные фрагменты |

### Правила типографики

- UI текст должен быть коротким и функциональным.
- Заголовки читаются уверенно, без декоративной тяжести.
- Для shell и форм не использовать serif как основной стиль.
- Exported resume templates могут быть более классическими и строгими, но не декоративными.

## Радиусы и глубина

| Token | Value | Use |
|---|---:|---|
| `radius-xs` | `4px` | Мелкие декоративные элементы |
| `radius-sm` | `6px` | Buttons, inputs, compact controls |
| `radius-md` | `8px`-`12px` | Standard cards, previews, panels |
| `radius-lg` | `16px`-`24px` | Hero cards, larger containers |
| `radius-pill` | `9999px` | Pills, badges, variant chips |

### Правила глубины

- Тени мягкие, низкоконтрастные, без "floating glass" эффекта.
- Глубина должна помогать иерархии, а не становиться самостоятельным украшением.
- Большие карточки получают чуть более выраженную тень, но всё ещё остаются легкими.

## Отступы и сетка

- Базовый ритм близок к 4px/8px системе.
- Типовые внутренние отступы карточек: `16px`, `24px`, `32px`.
- Hero и landing-секции используют более щедрый вертикальный ритм: `48px`-`96px`.
- Контент обычно центрируется в широком контейнере около `1200px`.
- Мобильная верстка должна складывать колонки в вертикаль без потери иерархии.

## Layout Principles

- Верхняя панель должна быстро объяснять, где пользователь находится и что делать дальше.
- Рабочие экраны строятся как последовательность: header -> primary surface -> contextual actions -> content.
- Для сложных flow используйте stepper, tabs или понятный progress rail.
- Формы и анализ обычно располагаются в двухколоночной композиции на desktop и в stacked layout на mobile.
- Preview и export должны сохранять document-like ощущение и не ломать A4-пропорцию.
- Sticky header допустим, если он уменьшает потерю контекста в длинных сценариях.

## Component Style

### Header

- Белый sticky shell.
- Небольшая высота, тонкая нижняя граница, без тяжёлых панелей.
- Logo скрывается на mobile, если это улучшает плотность.

### Cards and panels

- Белые или почти белые поверхности.
- Лёгкая граница вместо тяжёлой рамки.
- Скругление 12-24px в зависимости от размера.

### Buttons

- Text case normal, не uppercase.
- Primary button = brand blue.
- Secondary button = light neutral или tinted accent.
- Disabled state должен быть очевидным, но не агрессивным.

### Analysis UI

- Score, progress и warnings должны быть визуально простыми и считываться за секунду.
- Используются компактные bars, circles, badges и short labels.
- Не перегружать один экран одновременно и графиками, и иконками, и декоративными фонами.

### Resume templates

- Exported resumes должны быть ATS-friendly, классическими и сдержанными.
- Текст темный на светлом фоне.
- Акцент используется точечно: заголовки, разделители, небольшие маркеры.
- Избегать сложных фонов, тяжелых иллюстраций и дизайна, который ломает читаемость при печати.

## Motion and Interaction

- Стандартная анимация должна быть короткой и тихой: примерно `0.2s`-`0.3s` ease.
- Hover state = лёгкое усиление тени, цвета или opacity.
- Loading states должны показывать прогресс явно: spinner, polling text, status message.
- Не использовать избыточные bounce/elastic эффекты.
- Error states должны быть прямыми и диагностичными.

## Responsive Behavior

- Mobile-first приоритет обязателен.
- Navigation упрощается раньше, чем контент.
- Заголовки, кнопки и input fields должны оставаться touch-friendly.
- Preview should preserve reading order and avoid horizontal scroll.
- Служебные визуальные элементы могут исчезать на мобильном, если это улучшает читаемость.

## Tone of Voice

- Копирайт короткий, спокойный, action-oriented.
- Предпочтительны формулировки вроде `Upgrade to re-analyze`, `Log in to save your progress`, `Set New Password`.
- Не использовать hype, drama или маркетинговую болтовню в core product UI.
- Ошибки должны говорить, что произошло и что делать дальше.

## Do

- Используй существующие theme tokens и i18n.
- Держи shell нейтральным, а акценты ограниченными.
- Оставляй много воздуха вокруг ключевых действий.
- Сохраняй ATS-friendly характер экспортируемых резюме.
- Проверяй, что новое решение не конфликтует с `designVariant.ts`.

## Don't

- Не добавляй случайные яркие цвета и не расширяй палитру без нужды.
- Не делай интерфейс слишком "glassmorphism" или слишком декоративным.
- Не вводи serif как основной UI-фонт.
- Не ломай A4-пропорции и печатную читаемость.
- Не смешивай несколько визуальных стилей в одном shell-экране.

## Design Variants

- `Editorial Pro` - основной и наиболее безопасный режим.
- `Precision Grid` - более строгий и техничный, с плотной структурой.
- `Warm Craft` - более тёплый и tactile, допустим для концептов и маркетинга.
- В продуктовый shell не нужно переносить все характерные признаки варианта; вариативность должна оставаться контролируемой.

*Последнее обновление: 2026-05-21*
