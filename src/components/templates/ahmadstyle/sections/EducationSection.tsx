import React from "react";
import { Education, GlobalSettings } from "@/types/resume";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { hasMeaningfulRichTextContent, normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";

interface EducationSectionProps {
  education?: Education[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

/**
 * Ahmad-style education: institution bold + date right on first line,
 * degree & area italic + location italic right on second line,
 * compact spacing.
 */
const EducationSection = ({
  education,
  globalSettings,
  showTitle = true,
}: EducationSectionProps) => {
  const locale = useLocale();
  const visibleEducation = education?.filter((edu) => edu.visible);
  const baseFontSize = globalSettings?.baseFontSize || 11;

  return (
    <SectionWrapper
      sectionId="education"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 4}px` }}
    >
      <SectionTitle
        type="education"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      {visibleEducation?.map((edu, idx) => (
        <div
          key={edu.id}
          style={{
            marginTop: idx === 0 ? "2px" : "0px",
          }}
        >
          {/* Line 1: Institution (bold) ... Date (bold, right) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: `${baseFontSize}px`,
              }}
            >
              {edu.school}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: `${baseFontSize}px`,
              }}
              suppressHydrationWarning
            >
              {`${formatDateString(edu.startDate, locale)} – ${formatDateString(edu.endDate, locale)}`}
            </span>
          </div>

          {/* Line 2: Degree + Major (italic) ... Location (italic, right) */}
          {(edu.degree || edu.major || edu.location) && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginTop: "-2px",
              }}
            >
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: `${baseFontSize}px`,
                }}
              >
                {[edu.degree, edu.major].filter(Boolean).join(", ")}
                {edu.gpa && ` — GPA: ${edu.gpa}`}
              </span>
              {edu.location && (
                <span
                  style={{
                    fontStyle: "italic",
                    fontSize: `${baseFontSize}px`,
                  }}
                >
                  {edu.location}
                </span>
              )}
            </div>
          )}

          {/* Description/highlights */}
          {hasMeaningfulRichTextContent(edu.description) && (
            <div
              className="ahmad-highlights"
              style={{
                fontSize: `${baseFontSize}px`,
                lineHeight: globalSettings?.lineHeight || 1.3,
                marginTop: "-2px",
              }}
              dangerouslySetInnerHTML={{
                __html: normalizeRichTextContent(edu.description),
              }}
            />
          )}
        </div>
      ))}
    </SectionWrapper>
  );
};

export default EducationSection;
