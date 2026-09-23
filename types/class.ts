export type ClassGrade =
  | 'Year 7'
  | 'Year 8'
  | 'Year 9'
  | 'Year 10'
  | 'Year 11'
  | 'Year 12';

export interface ClassDefinition {
  name: ClassGrade;
  slug: string;
  stage: string;
  description: string;
  iconName: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export const CLASSES: ClassDefinition[] = [
  {
    name: 'Year 7',
    slug: 'year-7',
    stage: 'Key Stage 3',
    description: 'Foundational concepts, exploratory science, core mathematics & computing basics.',
    iconName: 'Sparkles',
    accentColor: 'from-blue-500 to-cyan-500',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'text-blue-700',
  },
  {
    name: 'Year 8',
    slug: 'year-8',
    stage: 'Key Stage 3',
    description: 'Deepening analytical skills, structured writing, algebra, and digital literacy.',
    iconName: 'Compass',
    accentColor: 'from-cyan-500 to-teal-500',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeText: 'text-teal-700',
  },
  {
    name: 'Year 9',
    slug: 'year-9',
    stage: 'Key Stage 3',
    description: 'Bridging into senior curricula, robotics, experimental physics & critical inquiry.',
    iconName: 'Atom',
    accentColor: 'from-indigo-500 to-blue-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'text-indigo-700',
  },
  {
    name: 'Year 10',
    slug: 'year-10',
    stage: 'Key Stage 4 / GCSE',
    description: 'Core subject syllabi, programming in C/Python, advanced geometry & mechanics.',
    iconName: 'Cpu',
    accentColor: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    badgeText: 'text-blue-800',
  },
  {
    name: 'Year 11',
    slug: 'year-11',
    stage: 'Key Stage 4 / GCSE',
    description: 'Exam preparation, comprehensive subject revisions, algorithms & practical lab work.',
    iconName: 'BookOpen',
    accentColor: 'from-sky-600 to-blue-700',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    badgeText: 'text-sky-800',
  },
  {
    name: 'Year 12',
    slug: 'year-12',
    stage: 'Sixth Form / A-Level',
    description: 'Advanced academic topics, higher calculus, data structures & university prep.',
    iconName: 'GraduationCap',
    accentColor: 'from-slate-700 to-slate-900',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: 'text-slate-800',
  },
];

export function getClassBySlug(slug: string): ClassDefinition | undefined {
  return CLASSES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function getClassByName(name: string): ClassDefinition | undefined {
  return CLASSES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
