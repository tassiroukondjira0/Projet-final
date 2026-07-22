export const COURSES_MAPPING = {
  "base-endurance": "course_1",
  "base-hiit": "course_2",
  "base-force": "course_3",
  "souplesse": "course_4",
  "cardio": "course_5",
  "souffle": "course_6",
  "power-training": "course_7",
  "yoga-flow": "course_8",
  "hiit-avance": "course_9",
  "mobilite": "course_10",
  "endurance-matinale": "course_11",
  "renforcement-musculaire": "course_12",
} as const;

export const getCourseIdFromSlug = (slug: string): string | undefined => {
  return COURSES_MAPPING[slug as keyof typeof COURSES_MAPPING];
};
