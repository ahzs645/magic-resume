/**
 * Resume variant system — applies RenderCV-style variant filtering to ResumeData.
 *
 * Supports:
 * - exclude_sections: remove entire sections by name
 * - tags: filter entries that have matching tags
 */

import type {
  ResumeData,
  Experience,
  Education,
  Project,
  CustomItem,
  MenuSection,
} from "@/types/resume";
import type { ResumeVariant } from "./yamlConverter";

// ── Built-in variant presets (matching resume-variants.yaml patterns) ──

export const DEFAULT_VARIANTS: ResumeVariant[] = [
  {
    name: "full",
    description: "Complete resume with all sections",
  },
  {
    name: "academic",
    description: "Academic-focused resume",
    exclude_sections: ["projects"],
  },
  {
    name: "minimal",
    description: "Essential sections only",
    exclude_sections: [
      "projects",
      "selfEvaluation",
      "certificates",
    ],
  },
  {
    name: "industry",
    description: "Industry-focused resume",
    exclude_sections: [
      "selfEvaluation",
      "certificates",
    ],
  },
  {
    name: "tech",
    description: "Technical resume",
    exclude_sections: [
      "selfEvaluation",
    ],
  },
];

// ── Section name mapping (RenderCV → magic-resume IDs) ──

function mapSectionNameToId(sectionName: string): string {
  const lower = sectionName.toLowerCase().replace(/[_\s]/g, "");
  if (lower === "experience" || lower === "work") return "experience";
  if (lower === "education") return "education";
  if (lower === "skills" || lower === "certificationsskills") return "skills";
  if (lower === "projects") return "projects";
  if (lower === "selfevaluation" || lower === "summary" || lower === "publications") return "selfEvaluation";
  if (lower === "certificates") return "certificates";
  // Custom sections use their original ID
  return sectionName;
}

// ── Tag filtering ──

function hasMatchingTag(
  tags: string[] | undefined,
  requiredTags: string[]
): boolean {
  if (!requiredTags || requiredTags.length === 0) return true;
  if (!tags || tags.length === 0) return true; // entries without tags pass through
  return requiredTags.some((t) => tags.includes(t));
}

function filterByTags<T extends { tags?: string[] }>(
  items: T[],
  requiredTags?: string[]
): T[] {
  if (!requiredTags || requiredTags.length === 0) return items;
  return items.filter((item) => hasMatchingTag(item.tags, requiredTags));
}

// ── Apply variant ──

export function applyVariant(
  data: ResumeData,
  variant: ResumeVariant
): ResumeData {
  // Clone to avoid mutation
  const result = JSON.parse(JSON.stringify(data)) as ResumeData;

  // 1. Exclude sections
  if (variant.exclude_sections && variant.exclude_sections.length > 0) {
    const excludeIds = variant.exclude_sections.map(mapSectionNameToId);
    result.menuSections = result.menuSections.map(
      (section: MenuSection) => ({
        ...section,
        enabled: excludeIds.includes(section.id) ? false : section.enabled,
      })
    );
  }

  // 2. Filter by tags
  if (variant.tags && variant.tags.length > 0) {
    result.experience = filterByTags(result.experience, variant.tags);
    result.education = filterByTags(result.education, variant.tags);
    result.projects = filterByTags(result.projects, variant.tags);

    // Filter custom sections
    for (const key of Object.keys(result.customData)) {
      result.customData[key] = filterByTags(
        result.customData[key],
        variant.tags
      );
    }
  }

  return result;
}

/**
 * Get all unique tags used across all entries in a resume.
 */
export function getAllTags(data: ResumeData): string[] {
  const tagSet = new Set<string>();

  const collectTags = (items: Array<{ tags?: string[] }>) => {
    for (const item of items) {
      if (item.tags) {
        item.tags.forEach((t) => tagSet.add(t));
      }
    }
  };

  collectTags(data.experience || []);
  collectTags(data.education || []);
  collectTags(data.projects || []);
  for (const items of Object.values(data.customData || {})) {
    collectTags(items || []);
  }

  return Array.from(tagSet).sort();
}

/**
 * Get available section names that can be excluded.
 */
export function getExcludableSections(data: ResumeData): string[] {
  return data.menuSections
    .filter((s) => s.id !== "basic")
    .map((s) => s.id);
}
