import React from "react";
import { Project, GlobalSettings } from "@/types/resume";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";

interface ProjectSectionProps {
  projects: Project[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({
  projects,
  globalSettings,
  showTitle = true,
}) => {
  const locale = useLocale();
  const visibleProjects = projects?.filter((p) => p.visible);
  const baseFontSize = globalSettings?.baseFontSize || 11;

  return (
    <SectionWrapper
      sectionId="projects"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 4}px` }}
    >
      <SectionTitle
        type="projects"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      {visibleProjects.map((project, idx) => (
        <div
          key={project.id}
          style={{
            marginTop: idx === 0 ? "2px" : "0px",
          }}
        >
          {/* Line 1: Name (bold) ... Date (right) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: `${baseFontSize}px` }}>
              {project.name}
              {project.link && (
                <>
                  {" "}
                  <a
                    href={
                      project.link.startsWith("http")
                        ? project.link
                        : `https://${project.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontWeight: 400,
                      color: "#26428b",
                      textDecoration: "none",
                    }}
                  >
                    [{(() => {
                      try {
                        return new URL(
                          project.link.startsWith("http")
                            ? project.link
                            : `https://${project.link}`
                        ).hostname.replace(/^www\./, "");
                      } catch {
                        return project.link;
                      }
                    })()}]
                  </a>
                </>
              )}
            </span>
            <span style={{ fontSize: `${baseFontSize}px` }}>
              {formatDateString(project.date, locale)}
            </span>
          </div>

          {/* Line 2: Role (italic) */}
          {project.role && (
            <div style={{ marginTop: "-2px" }}>
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: `${baseFontSize}px`,
                }}
              >
                {project.role}
              </span>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div
              className="ahmad-highlights"
              style={{
                fontSize: `${baseFontSize}px`,
                lineHeight: globalSettings?.lineHeight || 1.3,
                marginTop: "-2px",
              }}
              dangerouslySetInnerHTML={{
                __html: normalizeRichTextContent(project.description),
              }}
            />
          )}
        </div>
      ))}
    </SectionWrapper>
  );
};

export default ProjectSection;
