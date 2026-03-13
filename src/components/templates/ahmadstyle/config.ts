import { ResumeTemplate } from "@/types/template";

export const ahmadstyleConfig: ResumeTemplate = {
  id: "ahmadstyle",
  name: "Ahmad Style",
  description: "Professional academic CV with EB Garamond serif font, compact spacing, and horizontal rule separators",
  thumbnail: "ahmadstyle",
  layout: "ahmadstyle",
  colorScheme: {
    primary: "#000000",
    secondary: "#333333",
    background: "#ffffff",
    text: "#000000",
  },
  spacing: {
    sectionGap: 6,
    itemGap: 2,
    contentPadding: 36, // ~1.27cm in px
  },
  basic: {
    layout: "center",
  },
  availableSections: [
    "skills",
    "experience",
    "projects",
    "education",
    "selfEvaluation",
    "certificates",
  ],
};
