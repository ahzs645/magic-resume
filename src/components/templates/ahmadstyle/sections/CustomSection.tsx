import React from "react";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings, CustomItem } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";

interface CustomSectionProps {
  sectionId: string;
  title: string;
  items: CustomItem[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const CustomSection = ({
  sectionId,
  title,
  items,
  globalSettings,
  showTitle = true,
}: CustomSectionProps) => {
  const locale = useLocale();
  const visibleItems = items?.filter(
    (item) => item.visible && (item.title || item.description)
  );
  const baseFontSize = globalSettings?.baseFontSize || 11;

  return (
    <SectionWrapper
      sectionId={sectionId}
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 4}px` }}
    >
      <SectionTitle
        title={title}
        type="custom"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      {visibleItems.map((item, idx) => (
        <div
          key={item.id}
          style={{
            marginTop: idx === 0 ? "2px" : "0px",
          }}
        >
          {/* Line 1: Title (bold) ... Date (right) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: `${baseFontSize}px` }}>
              {item.title}
            </span>
            <span style={{ fontSize: `${baseFontSize}px` }}>
              {formatDateString(item.dateRange, locale)}
            </span>
          </div>

          {/* Line 2: Subtitle (italic) */}
          {item.subtitle && (
            <div style={{ marginTop: "-2px" }}>
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: `${baseFontSize}px`,
                }}
              >
                {item.subtitle}
              </span>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div
              className="ahmad-highlights"
              style={{
                fontSize: `${baseFontSize}px`,
                lineHeight: globalSettings?.lineHeight || 1.3,
                marginTop: "-2px",
              }}
              dangerouslySetInnerHTML={{
                __html: normalizeRichTextContent(item.description),
              }}
            />
          )}
        </div>
      ))}
    </SectionWrapper>
  );
};

export default CustomSection;
