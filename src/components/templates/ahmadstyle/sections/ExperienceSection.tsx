import React from "react";
import { Experience, GlobalSettings } from "@/types/resume";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";

interface ExperienceSectionProps {
  experiences?: Experience[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

/**
 * Ahmad-style experience: company bold + date right-aligned on first line,
 * position italic + location right-aligned on second line,
 * bullet highlights with • marker, compact negative-like spacing.
 */
const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  globalSettings,
  showTitle = true,
}) => {
  const locale = useLocale();
  const visibleExperiences = experiences?.filter((exp) => exp.visible);
  const baseFontSize = globalSettings?.baseFontSize || 11;

  return (
    <SectionWrapper
      sectionId="experience"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 4}px` }}
    >
      <SectionTitle
        type="experience"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      {visibleExperiences?.map((exp, idx) => (
        <div
          key={exp.id}
          style={{
            marginTop: idx === 0 ? "2px" : "0px",
            paddingTop: idx > 0 ? "0px" : undefined,
          }}
        >
          {/* Line 1: Company (bold) ... Date (right) */}
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
              {exp.company}
            </span>
            <span style={{ fontSize: `${baseFontSize}px` }}>
              {formatDateString(exp.date, locale)}
            </span>
          </div>

          {/* Line 2: Position (italic) ... Location (italic, right) */}
          {(exp.position || exp.location) && (
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
                {exp.position}
              </span>
              {exp.location && (
                <span
                  style={{
                    fontStyle: "italic",
                    fontSize: `${baseFontSize}px`,
                  }}
                >
                  {exp.location}
                </span>
              )}
            </div>
          )}

          {/* Highlights / details */}
          {exp.details && (
            <div
              className="ahmad-highlights"
              style={{
                fontSize: `${baseFontSize}px`,
                lineHeight: globalSettings?.lineHeight || 1.3,
                marginTop: "-2px",
              }}
              dangerouslySetInnerHTML={{
                __html: normalizeRichTextContent(exp.details),
              }}
            />
          )}
        </div>
      ))}
    </SectionWrapper>
  );
};

export default ExperienceSection;
