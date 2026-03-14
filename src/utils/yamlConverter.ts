/**
 * Bidirectional converter between RenderCV YAML format and magic-resume's ResumeData.
 *
 * RenderCV YAML schema (CV.yaml):
 *   cv:
 *     name: string
 *     email: string
 *     phone: string
 *     location: string
 *     website: string
 *     sections:
 *       <section_name>:
 *         - ExperienceEntry | EducationEntry | NormalEntry | OneLineEntry | PublicationEntry | string
 *
 * ExperienceEntry: { company, position|positions, start_date, end_date, location, highlights, tags, flavors }
 * EducationEntry: { institution, area, degree, start_date, end_date, location, highlights, summary, tags }
 * NormalEntry: { name, start_date, end_date, highlights, tags }
 * OneLineEntry: { label, details } or plain string
 */

import yaml from "js-yaml";
import { v4 as uuidv4 } from "uuid";
import type {
  ResumeData,
  BasicInfo,
  Education,
  Experience,
  Project,
  CustomItem,
  MenuSection,
  GlobalSettings,
} from "@/types/resume";

// ── RenderCV YAML types ──

interface RenderCVYaml {
  cv: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    sections?: Record<string, RenderCVEntry[]>;
  };
  design?: {
    theme?: string;
    [key: string]: unknown;
  };
}

interface RenderCVPositionEntry {
  title: string;
  start_date?: string;
  end_date?: string;
  date?: string;
  highlights?: string[];
}

interface RenderCVExperienceEntry {
  company: string;
  position?: string;
  positions?: (string | RenderCVPositionEntry)[];
  start_date?: string;
  end_date?: string;
  date?: string;
  location?: string;
  highlights?: string[];
  summary?: string;
  tags?: string[];
  flavors?: Record<string, unknown>;
}

interface RenderCVEducationEntry {
  institution: string;
  area?: string;
  degree?: string;
  study_type?: string;
  start_date?: string;
  end_date?: string;
  date?: string;
  location?: string;
  highlights?: string[];
  summary?: string;
  tags?: string[];
}

interface RenderCVNormalEntry {
  name?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  date?: string;
  location?: string;
  highlights?: string[];
  summary?: string;
  url?: string;
  tags?: string[];
}

interface RenderCVOneLineEntry {
  label: string;
  details: string;
}

type RenderCVEntry =
  | RenderCVExperienceEntry
  | RenderCVEducationEntry
  | RenderCVNormalEntry
  | RenderCVOneLineEntry
  | string;

// ── Helpers ──

function formatRenderCVDate(date?: string): string {
  if (!date) return "";
  // RenderCV dates: "2024-03", "2024", "present"
  if (date.toLowerCase() === "present") return "Present";
  // Already formatted or partial
  return date;
}

function formatDateRange(startDate?: string, endDate?: string): string {
  const start = formatRenderCVDate(startDate);
  const end = formatRenderCVDate(endDate);
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  if (end) return end;
  return "";
}

function highlightsToHtml(highlights?: string[]): string {
  if (!highlights || highlights.length === 0) return "";
  const items = highlights.map((h) => `<li>${h}</li>`).join("");
  return `<ul>${items}</ul>`;
}

function htmlToHighlights(html?: string): string[] {
  if (!html) return [];
  // Extract text from <li> tags
  const matches = html.match(/<li>(.*?)<\/li>/g);
  if (!matches) {
    // If no list items, treat as single highlight (strip tags)
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text ? [text] : [];
  }
  return matches.map((m) => m.replace(/<\/?li>/g, "").trim()).filter(Boolean);
}

function isExperienceEntry(entry: RenderCVEntry): entry is RenderCVExperienceEntry {
  return typeof entry === "object" && "company" in entry;
}

function isEducationEntry(entry: RenderCVEntry): entry is RenderCVEducationEntry {
  return typeof entry === "object" && "institution" in entry;
}

function isNormalEntry(entry: RenderCVEntry): entry is RenderCVNormalEntry {
  return typeof entry === "object" && ("name" in entry || "title" in entry) && !("company" in entry) && !("institution" in entry) && !("label" in entry && "details" in entry);
}

function isOneLineEntry(entry: RenderCVEntry): entry is RenderCVOneLineEntry {
  return typeof entry === "object" && "label" in entry && "details" in entry;
}

// Map RenderCV section names to magic-resume section IDs
const SECTION_NAME_MAP: Record<string, string> = {
  experience: "experience",
  education: "education",
  skills: "skills",
  projects: "projects",
  certifications_skills: "skills",
  publications: "selfEvaluation",
};

function guessSectionType(
  sectionName: string,
  entries: RenderCVEntry[]
): string {
  const lower = sectionName.toLowerCase().replace(/[_\s]/g, "");
  if (lower.includes("experience") || lower.includes("work")) return "experience";
  if (lower.includes("education")) return "education";
  if (lower.includes("project")) return "projects";
  if (lower.includes("skill") || lower.includes("certification")) return "skills";

  // Infer from entry shape
  if (entries.length > 0) {
    const first = entries[0];
    if (isExperienceEntry(first)) return "experience";
    if (isEducationEntry(first)) return "education";
    if (isNormalEntry(first)) return "projects";
  }

  return "custom";
}

// ── Import: RenderCV YAML → ResumeData ──

export function importRenderCVYaml(yamlContent: string): Partial<ResumeData> {
  const parsed = yaml.load(yamlContent) as RenderCVYaml;
  if (!parsed?.cv) {
    throw new Error("Invalid RenderCV YAML: missing 'cv' root key");
  }

  const cv = parsed.cv;

  // Basic info
  const basic: Partial<BasicInfo> = {
    name: cv.name || "",
    email: cv.email || "",
    phone: cv.phone || "",
    location: cv.location || "",
    title: "",
    birthDate: "",
    employementStatus: "",
    photo: "",
    photoConfig: {
      width: 90,
      height: 120,
      aspectRatio: "1:1",
      borderRadius: "none",
      customBorderRadius: 0,
      visible: false,
    },
    icons: {},
    customFields: [],
    githubKey: "",
    githubUseName: "",
    githubContributionsVisible: false,
    layout: "center",
  };

  // Add website as custom field
  if (cv.website) {
    basic.customFields = [
      {
        id: uuidv4(),
        label: "Website",
        value: cv.website,
        icon: "Globe",
        visible: true,
      },
    ];
  }

  const education: Education[] = [];
  const experience: Experience[] = [];
  const projects: Project[] = [];
  const customData: Record<string, CustomItem[]> = {};
  const menuSections: MenuSection[] = [
    { id: "basic", title: "Basic Info", icon: "User", enabled: true, order: 0 },
  ];
  let skillContent = "";
  let selfEvaluationContent = "";
  let sectionOrder = 1;

  // Process each section from YAML
  if (cv.sections) {
    for (const [sectionName, entries] of Object.entries(cv.sections)) {
      if (!entries || !Array.isArray(entries)) continue;

      const sectionType = guessSectionType(sectionName, entries);
      const prettyTitle =
        sectionName.charAt(0).toUpperCase() +
        sectionName.slice(1).replace(/_/g, " ");

      switch (sectionType) {
        case "experience": {
          for (const entry of entries) {
            if (isExperienceEntry(entry)) {
              if (entry.positions && entry.positions.length > 0) {
                // Handle positions array (multiple roles at same company)
                for (const pos of entry.positions) {
                  if (typeof pos === "object" && pos.title) {
                    // Position object: {title, start_date, end_date, highlights}
                    experience.push({
                      id: uuidv4(),
                      company: entry.company,
                      position: pos.title,
                      date: pos.date || formatDateRange(pos.start_date, pos.end_date),
                      details: highlightsToHtml(pos.highlights),
                      visible: true,
                      location: entry.location,
                      tags: entry.tags,
                    });
                  } else {
                    // Simple string position
                    experience.push({
                      id: uuidv4(),
                      company: entry.company,
                      position: String(pos),
                      date: entry.date || formatDateRange(entry.start_date, entry.end_date),
                      details: highlightsToHtml(entry.highlights),
                      visible: true,
                      location: entry.location,
                      tags: entry.tags,
                    });
                  }
                }
              } else {
                // Single position
                experience.push({
                  id: uuidv4(),
                  company: entry.company,
                  position: entry.position || "",
                  date: entry.date || formatDateRange(entry.start_date, entry.end_date),
                  details: highlightsToHtml(entry.highlights),
                  visible: true,
                  location: entry.location,
                  tags: entry.tags,
                });
              }
            } else if (isNormalEntry(entry)) {
              // Fallback: entries with title/name but no company (non-standard YAML)
              experience.push({
                id: uuidv4(),
                company: entry.name || entry.title || "",
                position: "",
                date: entry.date || formatDateRange(entry.start_date, entry.end_date),
                details: highlightsToHtml(entry.highlights) || entry.summary || "",
                visible: true,
                location: entry.location,
                tags: entry.tags,
              });
            }
          }
          if (!menuSections.some((s) => s.id === "experience")) {
            menuSections.push({
              id: "experience",
              title: prettyTitle,
              icon: "Briefcase",
              enabled: true,
              order: sectionOrder++,
            });
          }
          break;
        }

        case "education": {
          for (const entry of entries) {
            if (isEducationEntry(entry)) {
              education.push({
                id: uuidv4(),
                school: entry.institution,
                major: entry.area || "",
                degree: entry.degree || entry.study_type || "",
                startDate: formatRenderCVDate(entry.start_date),
                endDate: formatRenderCVDate(entry.end_date),
                gpa: undefined,
                description: highlightsToHtml(entry.highlights) || entry.summary,
                visible: true,
                location: entry.location,
                tags: entry.tags,
              });
            }
          }
          if (!menuSections.some((s) => s.id === "education")) {
            menuSections.push({
              id: "education",
              title: prettyTitle,
              icon: "GraduationCap",
              enabled: true,
              order: sectionOrder++,
            });
          }
          break;
        }

        case "projects": {
          for (const entry of entries) {
            if (isNormalEntry(entry)) {
              projects.push({
                id: uuidv4(),
                name: entry.name || entry.title || "",
                role: "",
                date: entry.date || formatDateRange(entry.start_date, entry.end_date),
                description: highlightsToHtml(entry.highlights) || entry.summary || "",
                visible: true,
                link: entry.url,
                tags: entry.tags,
              });
            }
          }
          if (!menuSections.some((s) => s.id === "projects")) {
            menuSections.push({
              id: "projects",
              title: prettyTitle,
              icon: "FolderOpen",
              enabled: true,
              order: sectionOrder++,
            });
          }
          break;
        }

        case "skills": {
          // Combine one-line entries into rich text
          const lines: string[] = [];
          for (const entry of entries) {
            if (typeof entry === "string") {
              lines.push(entry);
            } else if (isOneLineEntry(entry)) {
              lines.push(`<strong>${entry.label}:</strong> ${entry.details}`);
            } else if (isNormalEntry(entry)) {
              const desc = entry.highlights?.join(", ") || "";
              lines.push(`<strong>${entry.name || entry.title}:</strong> ${desc}`);
            }
          }
          skillContent = lines.map((l) => `<p>${l}</p>`).join("");
          if (!menuSections.some((s) => s.id === "skills")) {
            menuSections.push({
              id: "skills",
              title: prettyTitle,
              icon: "Wrench",
              enabled: true,
              order: sectionOrder++,
            });
          }
          break;
        }

        default: {
          // Map to custom section
          const customId = `custom_${sectionName.toLowerCase().replace(/\s+/g, "_")}`;
          const items: CustomItem[] = [];

          for (const entry of entries) {
            if (typeof entry === "string") {
              items.push({
                id: uuidv4(),
                title: entry,
                subtitle: "",
                dateRange: "",
                description: "",
                visible: true,
              });
            } else if (isOneLineEntry(entry)) {
              items.push({
                id: uuidv4(),
                title: entry.label,
                subtitle: "",
                dateRange: "",
                description: entry.details,
                visible: true,
              });
            } else if (isNormalEntry(entry)) {
              items.push({
                id: uuidv4(),
                title: entry.name || entry.title || "",
                subtitle: "",
                dateRange: entry.date || formatDateRange(entry.start_date, entry.end_date),
                description: highlightsToHtml(entry.highlights) || entry.summary || "",
                visible: true,
                tags: entry.tags,
              });
            } else if (isExperienceEntry(entry)) {
              items.push({
                id: uuidv4(),
                title: entry.company,
                subtitle: entry.position || "",
                dateRange: entry.date || formatDateRange(entry.start_date, entry.end_date),
                description: highlightsToHtml(entry.highlights),
                visible: true,
                tags: entry.tags,
              });
            } else if (isEducationEntry(entry)) {
              items.push({
                id: uuidv4(),
                title: entry.institution,
                subtitle: [entry.degree, entry.area].filter(Boolean).join(", "),
                dateRange: formatDateRange(entry.start_date, entry.end_date),
                description: highlightsToHtml(entry.highlights) || entry.summary || "",
                visible: true,
                tags: entry.tags,
              });
            }
          }

          if (items.length > 0) {
            customData[customId] = items;
            menuSections.push({
              id: customId,
              title: prettyTitle,
              icon: "FileText",
              enabled: true,
              order: sectionOrder++,
            });
          }
          break;
        }
      }
    }
  }

  // Ahmad-style default global settings
  const globalSettings: GlobalSettings = {
    themeColor: "#000000",
    fontFamily: '"EB Garamond", Georgia, serif',
    baseFontSize: 11,
    pagePadding: 36,
    paragraphSpacing: 2,
    lineHeight: 1.3,
    sectionSpacing: 4,
    headerSize: 14,
    subheaderSize: 11,
    useIconMode: false,
    centerSubtitle: false,
    flexibleHeaderLayout: false,
    autoOnePage: false,
  };

  return {
    templateId: "ahmadstyle",
    basic: basic as BasicInfo,
    education,
    experience,
    projects,
    customData,
    skillContent,
    selfEvaluationContent,
    menuSections,
    globalSettings,
    certificates: [],
  };
}

// ── Export: ResumeData → RenderCV YAML ──

function parseDateRange(dateStr: string): { start_date?: string; end_date?: string } {
  if (!dateStr) return {};
  // Try to split "YYYY-MM - YYYY-MM" or "YYYY-MM - Present"
  const parts = dateStr.split(/\s*[-–—]\s*/);
  if (parts.length === 2) {
    return {
      start_date: parts[0].trim().toLowerCase() === "present" ? undefined : parts[0].trim(),
      end_date: parts[1].trim().toLowerCase() === "present" ? "present" : parts[1].trim(),
    };
  }
  // Single date
  return { start_date: dateStr.trim() };
}

export function exportToRenderCVYaml(data: ResumeData): string {
  const cv: Record<string, unknown> = {
    name: data.basic?.name || "",
  };

  if (data.basic?.email) cv.email = data.basic.email;
  if (data.basic?.phone) cv.phone = data.basic.phone;
  if (data.basic?.location) cv.location = data.basic.location;

  // Check for website in custom fields
  const websiteField = data.basic?.customFields?.find(
    (f) => f.label?.toLowerCase() === "website" || f.value?.startsWith("http")
  );
  if (websiteField) cv.website = websiteField.value;

  const sections: Record<string, unknown[]> = {};
  const enabledSections = data.menuSections
    .filter((s) => s.enabled && s.id !== "basic")
    .sort((a, b) => a.order - b.order);

  for (const section of enabledSections) {
    switch (section.id) {
      case "experience": {
        const entries = data.experience
          ?.filter((e) => e.visible)
          .map((exp) => {
            const entry: Record<string, unknown> = {
              company: exp.company,
              position: exp.position,
            };
            const dates = parseDateRange(exp.date);
            if (dates.start_date) entry.start_date = dates.start_date;
            if (dates.end_date) entry.end_date = dates.end_date;
            if (exp.location) entry.location = exp.location;
            const highlights = htmlToHighlights(exp.details);
            if (highlights.length > 0) entry.highlights = highlights;
            if (exp.tags && exp.tags.length > 0) entry.tags = exp.tags;
            return entry;
          });
        if (entries && entries.length > 0) {
          sections[section.title.toLowerCase().replace(/\s+/g, "_")] = entries;
        }
        break;
      }

      case "education": {
        const entries = data.education
          ?.filter((e) => e.visible)
          .map((edu) => {
            const entry: Record<string, unknown> = {
              institution: edu.school,
            };
            if (edu.major) entry.area = edu.major;
            if (edu.degree) entry.degree = edu.degree;
            if (edu.startDate) entry.start_date = edu.startDate;
            if (edu.endDate) entry.end_date = edu.endDate;
            if (edu.location) entry.location = edu.location;
            const highlights = htmlToHighlights(edu.description);
            if (highlights.length > 0) entry.highlights = highlights;
            if (edu.tags && edu.tags.length > 0) entry.tags = edu.tags;
            return entry;
          });
        if (entries && entries.length > 0) {
          sections[section.title.toLowerCase().replace(/\s+/g, "_")] = entries;
        }
        break;
      }

      case "projects": {
        const entries = data.projects
          ?.filter((p) => p.visible)
          .map((proj) => {
            const entry: Record<string, unknown> = { name: proj.name };
            const dates = parseDateRange(proj.date);
            if (dates.start_date) entry.start_date = dates.start_date;
            if (dates.end_date) entry.end_date = dates.end_date;
            if (proj.link) entry.url = proj.link;
            const highlights = htmlToHighlights(proj.description);
            if (highlights.length > 0) entry.highlights = highlights;
            if (proj.tags && proj.tags.length > 0) entry.tags = proj.tags;
            return entry;
          });
        if (entries && entries.length > 0) {
          sections[section.title.toLowerCase().replace(/\s+/g, "_")] = entries;
        }
        break;
      }

      case "skills": {
        if (data.skillContent) {
          // Parse rich text skill content back to one-line entries
          const div = typeof document !== "undefined" ? document.createElement("div") : null;
          if (div) {
            div.innerHTML = data.skillContent;
            const paragraphs = div.querySelectorAll("p");
            const entries: unknown[] = [];
            paragraphs.forEach((p) => {
              const text = p.textContent || "";
              // Check if it's "Label: Details" format
              const match = text.match(/^(.+?):\s*(.+)$/);
              if (match) {
                entries.push({ label: match[1].trim(), details: match[2].trim() });
              } else if (text.trim()) {
                entries.push(text.trim());
              }
            });
            if (entries.length > 0) {
              sections[section.title.toLowerCase().replace(/\s+/g, "_")] = entries;
            }
          }
        }
        break;
      }

      case "selfEvaluation": {
        if (data.selfEvaluationContent) {
          const highlights = htmlToHighlights(data.selfEvaluationContent);
          if (highlights.length > 0) {
            sections[section.title.toLowerCase().replace(/\s+/g, "_")] = highlights;
          }
        }
        break;
      }

      default: {
        // Custom sections
        if (section.id in data.customData) {
          const items = data.customData[section.id]
            ?.filter((item) => item.visible)
            .map((item) => {
              const entry: Record<string, unknown> = { name: item.title };
              if (item.subtitle) entry.position = item.subtitle;
              const dates = parseDateRange(item.dateRange);
              if (dates.start_date) entry.start_date = dates.start_date;
              if (dates.end_date) entry.end_date = dates.end_date;
              const highlights = htmlToHighlights(item.description);
              if (highlights.length > 0) entry.highlights = highlights;
              if (item.tags && item.tags.length > 0) entry.tags = item.tags;
              return entry;
            });
          if (items && items.length > 0) {
            sections[section.title.toLowerCase().replace(/\s+/g, "_")] = items;
          }
        }
        break;
      }
    }
  }

  if (Object.keys(sections).length > 0) {
    cv.sections = sections;
  }

  const output: Record<string, unknown> = { cv };

  // Add design block
  output.design = {
    theme: "ahmadstyle",
  };

  return yaml.dump(output, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });
}

// ── Variant YAML import ──

export interface ResumeVariant {
  name: string;
  description: string;
  exclude_sections?: string[];
  tags?: string[];
  flavors?: string[];
}

export function parseVariantsYaml(yamlContent: string): ResumeVariant[] {
  const parsed = yaml.load(yamlContent) as {
    variants?: Record<string, {
      description?: string;
      exclude_sections?: string[];
      tags?: string[];
      flavors?: string[];
    }>;
  };

  if (!parsed?.variants) return [];

  return Object.entries(parsed.variants).map(([name, config]) => ({
    name,
    description: config.description || "",
    exclude_sections: config.exclude_sections,
    tags: config.tags,
    flavors: Array.isArray(config.flavors)
      ? config.flavors
      : config.flavors
        ? [String(config.flavors)]
        : undefined,
  }));
}

export function exportVariantsYaml(variants: ResumeVariant[]): string {
  const variantsObj: Record<string, Record<string, unknown>> = {};

  for (const v of variants) {
    const entry: Record<string, unknown> = {
      description: v.description,
    };
    if (v.exclude_sections && v.exclude_sections.length > 0) {
      entry.exclude_sections = v.exclude_sections;
    }
    if (v.tags && v.tags.length > 0) {
      entry.tags = v.tags;
    }
    if (v.flavors && v.flavors.length > 0) {
      entry.flavors = v.flavors;
    }
    variantsObj[v.name] = entry;
  }

  return yaml.dump({ variants: variantsObj }, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}
