import React from "react";
import { BasicInfo, GlobalSettings } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import SectionWrapper from "../../shared/SectionWrapper";

interface BaseInfoProps {
  basic: BasicInfo | undefined;
  globalSettings: GlobalSettings | undefined;
  template?: ResumeTemplate;
}

/**
 * Ahmad-style header: centered bold name (26pt), pipe-separated contact info,
 * thin horizontal rule separator underneath.
 */
const BaseInfo = ({
  basic = {} as BasicInfo,
  globalSettings,
}: BaseInfoProps) => {
  // Build contact items from fieldOrder or fallback
  const contactItems: string[] = [];

  if (basic.email) contactItems.push(basic.email);
  if (basic.phone) contactItems.push(basic.phone);
  if (basic.location) contactItems.push(basic.location);

  // Add custom fields that are visible
  basic.customFields
    ?.filter((f) => f.visible !== false && f.value)
    .forEach((f) => contactItems.push(f.value));

  return (
    <SectionWrapper sectionId="basic">
      <div style={{ textAlign: "center" }}>
        {/* Name - 26pt bold */}
        {basic.name && (
          <h1
            style={{
              fontSize: "26pt",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {basic.name}
          </h1>
        )}

        {/* Contact line - 14pt, pipe-separated */}
        {contactItems.length > 0 && (
          <div
            style={{
              fontSize: `${globalSettings?.baseFontSize || 11}px`,
              marginTop: "2px",
              color: "#333333",
            }}
          >
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span style={{ margin: "0 6px", color: "#666" }}>|</span>
                )}
                {item.includes("@") ? (
                  <a
                    href={`mailto:${item}`}
                    style={{ color: "#333333", textDecoration: "none" }}
                  >
                    {item}
                  </a>
                ) : item.startsWith("http") ? (
                  <a
                    href={item}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#26428b", textDecoration: "none" }}
                  >
                    {item}
                  </a>
                ) : (
                  <span>{item}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Horizontal rule separator */}
        <hr
          style={{
            border: "none",
            borderTop: "0.4pt solid #000000",
            margin: "4px 0 0 0",
          }}
        />
      </div>
    </SectionWrapper>
  );
};

export default BaseInfo;
