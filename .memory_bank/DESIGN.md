# DESIGN.md

version alpha
name Rezynt
description AI-powered resume builder with a calm SaaS shell, trustworthy editorial spacing, and a conservative export layer. The default product experience is clean, structured, and professional. Marketing pages use a warmer editorial language with premium gold accents, layered imagery, and richer surface tints, but the app itself stays neutral, precise, and resume-first.

## Источники стиля

- Базовая продуктовая палитра, тени, радиусы и цвета статусов.
- Глобальная типографика и browser-level reset для спокойного product UI.
- Sticky app shell, stepper/tabs и последовательность рабочих экранов.
- Экспортируемые резюме как строгие, ATS-friendly документные поверхности.
- Маркетинговый лэндинг как отдельная, более тёплая и premium-композиция с upload funnel, badge overlays и CTA.
- Экспериментальные design variants, которые меняют тональность, но не ломают базовую систему.

## Визуальный ДНК

- Продукт должен выглядеть как инструмент для серьёзной работы, а не как развлекательный генератор.
- Основное ощущение: ясность, контроль, аккуратность, профессиональная нейтральность.
- Фоновая среда светлая, карточная, с мягкой глубиной и небольшим количеством декоративного шума.
- Акценты используются для действия и статуса, а не для украшения.
- Landing и промо-экраны допускают более тёплую, tactile-подачу: gold, cream, brown, lavender и image overlays.
- Золото в маркетинге - не случайный декоративный цвет, а часть бренда: его используют для badge, highlight, checkmark, sticker, score-badge и премиального акцента.

## Цвета

| Token | Value | Use |
|---|---:|---|
| `primary` | `#6b7fd7` | Основной action, ссылки, активные состояния |
| `primary.dark` | `#5a6bc8` | Hover / stronger emphasis |
| `secondary` | `#673ab7` | Вторичный брендовый акцент |
| `success` | `#4caf50` / `#10b981` | Успех, готово, подтверждение |
| `error` | `#d32f2f` / `#ef4444` | Ошибка, критический статус |
| `warning` | `#f59e0b` | Предупреждение, paywall, мягкое внимание |
| `gold` | `#fde047` | Landing highlight, premium emphasis, badge/checkmark accents |
| `gold dark` | `#ca8a04` | Outline, hover, stronger gold emphasis |
| `cream` | `#f4ede7` | Warm panels, upload dropzones, tactile backgrounds |
| `cream border` | `#c69c72` | Warm borders, badges, subtle premium framing |
| `brown` | `#8B7355` | Text-on-gold, sticker labels, warm neutrals |
| `lavender` | `#f8f9ff` | Soft promo backgrounds, editorial panels |
| `ink` | `#2c3e50` / `#333333` | Основной текст и заголовки |
| `muted` | `#7f8c8d` / `#6b7280` | Вторичный текст |
| `surface` | `#ffffff` / `#fafafa` | Карточки и рабочие поверхности |
| `border` | `#ddd` / `#e0e0e0` | Лёгкие границы и разделители |

### Правила цвета

- Базовый shell опирается на холодную blue-purple систему.
- Тёплые оттенки `#c69c72`, `#8B7355`, `#f4ede7`, `#fde047` являются частью landing-палитры и допустимы в marketing/hero/conversion зонах.
- В app-shell их использовать точечно, только если нужен controlled premium cue, а не общий сдвиг к warm UI.
- Не смешивать много сильных акцентов в одном экране.
- Не вводить новые цвета, если задачу решают существующие токены темы.

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

### Landing / marketing surfaces

- Допустимы layered backgrounds: white -> soft blue tint -> lavender/cream, плюс спокойные aurora blobs.
- Hero может сочетать жирный headline, highlighted word, badge, upload dropzone и product image overlays в одной композиции.
- Gold используется в badge, highlight underline, success/check marks, score emphasis и price/CTA details.
- Иллюстрации и скриншоты могут быть слегка rotated, overlapping и framed stickers, если это помогает премиальности.
- Маркетинговые секции должны оставаться плотными по смыслу, но визуально богаче, чем app-shell.

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
- Landing hover states могут чуть сильнее подчёркивать gold/cream surfaces, но без анимационной шумихи.
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
- Проверяй, что новое решение не конфликтует с экспериментальными вариантами дизайна.

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
