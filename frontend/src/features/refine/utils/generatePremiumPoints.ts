import { ImprovementPoint } from '../../../shared/services/api/types';

/**
 * Generates random premium improvement points for non-premium users
 * These are artificial points that are blurred and show upgrade prompt
 */
export function generatePremiumPoints(sectionId: 'content' | 'ats' | 'style', count: number): ImprovementPoint[] {
  const points: ImprovementPoint[] = [];
  
  const titles = [
    'Missing Metrics',
    'Add Specific Numbers',
    'Show Measurable Results',
    'Quantify Your Impact',
    'Include Key Skills',
    'Add Relevant Courses',
    'Highlight Achievements',
    'Improve Description',
    'Add Technical Details',
    'Enhance Summary',
  ];
  
  const descriptions = [
    'Add specific metrics to quantify your impact.',
    'Include numbers to demonstrate achievements.',
    'Show concrete evidence of contributions.',
    'Add metrics that highlight success.',
    'Include relevant skills for this role.',
    'Add courses related to your field.',
    'Highlight key achievements and results.',
    'Improve description with more details.',
    'Add technical specifications and tools.',
    'Enhance summary with specific examples.',
  ];
  
  // Short old text templates for replace type
  const oldTextTemplates = [
    'improved performance',
    'led team successfully',
    'managed projects',
    'increased satisfaction',
    'optimized processes',
    'delivered results',
    'contributed to success',
    'handled challenges',
    'achieved milestones',
    'worked on tasks',
  ];
  
  // Short new text templates for replace type
  const newTextTemplates = [
    'improved performance by {percent}%, saving ${amount}',
    'led team of {teamSize} to complete {projectCount} projects {percent}% ahead of schedule',
    'managed {projectCount} projects worth ${budget}, completing {percent}% early',
    'increased satisfaction from {oldPercent}% to {newPercent}%, generating ${revenue}',
    'optimized processes, reducing time by {time}% and saving {hours} hours weekly',
    'delivered results with {quality}% quality score, exceeding standards by {exceed}%',
    'contributed to success, increasing productivity by {productivity}%',
    'handled {issues} critical issues with {percent}% success rate',
    'achieved {percent}% on-time delivery rate across {projects} projects',
    'improved efficiency by {time}%, saving ${savings} in costs',
  ];
  
  // Items to add templates (for 'add' type)
  const itemsToAddTemplates = [
    ['Python', 'SQL', 'Data Analysis'],
    ['Project Management', 'Agile', 'Scrum'],
    ['Machine Learning', 'Deep Learning', 'NLP'],
    ['Cloud Computing', 'AWS', 'Docker'],
    ['JavaScript', 'React', 'TypeScript'],
    ['Database Design', 'PostgreSQL', 'MongoDB'],
    ['API Development', 'REST', 'GraphQL'],
    ['Testing', 'Unit Testing', 'Integration Testing'],
    ['CI/CD', 'Git', 'Jenkins'],
    ['UI/UX Design', 'Figma', 'Prototyping'],
  ];
  
  // Helper to generate random number in range
  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Helper to generate random text length (0.5x to 1.3x of base length)
  const generateText = (baseText: string, minMultiplier: number = 0.5, maxMultiplier: number = 1.3): string => {
    const baseLength = baseText.length;
    const targetLength = Math.floor(baseLength * (minMultiplier + Math.random() * (maxMultiplier - minMultiplier)));
    
    // If target is shorter, truncate intelligently
    if (targetLength < baseLength) {
      // Try to cut at word boundaries
      const truncated = baseText.substring(0, targetLength);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > targetLength * 0.7) {
        return truncated.substring(0, lastSpace);
      }
      return truncated;
    }
    
    // If target is longer, extend the text naturally
    if (targetLength > baseLength) {
      // Add variations or extensions
      const extension = targetLength - baseLength;
      const words = baseText.split(' ');
      const lastWord = words[words.length - 1];
      
      // Add some filler words or extend the last part
      const fillerPhrases = [
        ' with measurable results',
        ' demonstrating clear impact',
        ' showing significant improvement',
        ' resulting in positive outcomes',
        ' achieving outstanding performance',
      ];
      
      let result = baseText;
      let currentLength = baseLength;
      
      while (currentLength < targetLength && fillerPhrases.length > 0) {
        const phrase = fillerPhrases[random(0, fillerPhrases.length - 1)];
        if (currentLength + phrase.length <= targetLength) {
          result += phrase;
          currentLength += phrase.length;
        } else {
          break;
        }
      }
      
      // If still not long enough, add generic extensions
      if (currentLength < targetLength) {
        const remaining = targetLength - currentLength;
        result += ' ' + 'and more'.substring(0, Math.min(remaining - 1, 9));
      }
      
      return result.substring(0, targetLength);
    }
    
    return baseText;
  };
  
  // Helper to fill template with random values
  const fillTemplate = (template: string): string => {
    return template
      .replace(/{percent}/g, String(random(85, 98)))
      .replace(/{time}/g, String(random(20, 40)))
      .replace(/{amount}/g, String(random(5000, 15000)))
      .replace(/{teamSize}/g, String(random(3, 8)))
      .replace(/{projectCount}/g, String(random(2, 5)))
      .replace(/{budget}/g, String(random(50000, 200000)))
      .replace(/{revenue}/g, String(random(20000, 100000)))
      .replace(/{savings}/g, String(random(10000, 50000)))
      .replace(/{productivity}/g, String(random(20, 35)))
      .replace(/{oldPercent}/g, String(random(60, 75)))
      .replace(/{newPercent}/g, String(random(85, 95)))
      .replace(/{hours}/g, String(random(5, 15)))
      .replace(/{quality}/g, String(random(92, 99)))
      .replace(/{exceed}/g, String(random(10, 20)))
      .replace(/{issues}/g, String(random(3, 10)))
      .replace(/{projects}/g, String(random(5, 15)));
  };
  
  // Field paths for different types
  const fieldPaths = {
    replace: [
      'work_experience.0.achievements.0',
      'work_experience.0.short_description',
      'professional_summary',
    ],
    add: [
      'skills',
      'education.0.relevant_courses',
      'work_experience.0.technologies_tools',
    ],
    noFix: [
      'work_experience.0.achievements',
      'education.0.relevant_courses',
      'skills',
    ],
  };
  
  for (let i = 0; i < count; i++) {
    const titleIndex = random(0, titles.length - 1);
    const descIndex = random(0, descriptions.length - 1);
    
    // Randomly choose point type: 40% replace, 30% add, 30% no fix
    const typeRoll = random(1, 10);
    let pointType: 'replace' | 'add' | 'noFix';
    if (typeRoll <= 4) {
      pointType = 'replace';
    } else if (typeRoll <= 7) {
      pointType = 'add';
    } else {
      pointType = 'noFix';
    }
    
    const point: ImprovementPoint = {
      id: `premium-${sectionId}-${Date.now()}-${i}`,
      rule_id: `premium-rule-${sectionId}`,
      section_id: sectionId,
      field_path: fieldPaths[pointType][random(0, fieldPaths[pointType].length - 1)],
      title: titles[titleIndex],
      description: descriptions[descIndex],
      score_impact: random(3, 8),
      severity: ['high', 'medium', 'low'][random(0, 2)] as 'high' | 'medium' | 'low',
      premium_only: true,
      is_fixed: false,
    };
    
    // Add fix_suggestion based on type
    if (pointType === 'replace') {
      const oldTextIndex = random(0, oldTextTemplates.length - 1);
      const newTextIndex = random(0, newTextTemplates.length - 1);
      const baseOldText = oldTextTemplates[oldTextIndex];
      const baseNewText = newTextTemplates[newTextIndex];
      
      const oldText = generateText(baseOldText, 0.7, 1.2);
      const filledNewText = fillTemplate(baseNewText);
      const newText = generateText(filledNewText, 0.7, 1.2);
      
      point.fix_suggestion = {
        type: 'replace',
        field_path: point.field_path,
        original_content: oldText,
        new_content: newText,
      };
    } else if (pointType === 'add') {
      const itemsIndex = random(0, itemsToAddTemplates.length - 1);
      const items = itemsToAddTemplates[itemsIndex];
      // Take 2-3 random items from the template
      const itemsToAdd = items.slice(0, random(2, Math.min(3, items.length)));
      
      point.fix_suggestion = {
        type: 'add',
        field_path: point.field_path,
        new_content: itemsToAdd,
      };
    }
    // For 'noFix' type, no fix_suggestion is added
    
    points.push(point);
  }
  
  return points;
}

