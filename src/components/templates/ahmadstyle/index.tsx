import React from "react";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import BaseInfo from "./sections/BaseInfo";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import ProjectSection from "./sections/ProjectSection";
import SkillSection from "./sections/SkillSection";
import SelfEvaluationSection from "./sections/SelfEvaluationSection";
import CustomSection from "./sections/CustomSection";
import SectionWrapper from "../shared/SectionWrapper";
import SectionTitle from "./sections/SectionTitle";
import CertificatesSection from "../shared/CertificatesSection";

interface AhmadStyleTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

/**
 * Ahmad Style template — mimics the RenderCV ahmadstyle Typst theme.
 *
 * Key visual characteristics:
 * - EB Garamond serif font (set via globalSettings.fontFamily)
 * - 11pt base font, 26pt name
 * - US Letter page, 1.27cm margins
 * - Compact negative-like spacing between entries
 * - 0.4pt horizontal rules under section headings
 * - Uppercase bold section titles
 * - Bold company/date + italic position/location layout
 * - Bullet (•) list markers
 */
const AhmadStyleTemplate: React.FC<AhmadStyleTemplateProps> = ({
  data,
  template,
}) => {
  const { colorScheme } = template;
  const enabledSections = data.menuSections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "basic":
        return (
          <BaseInfo
            basic={data.basic}
            globalSettings={data.globalSettings}
            template={template}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            experiences={data.experience}
            globalSettings={data.globalSettings}
          />
        );
      case "education":
        return (
          <EducationSection
            education={data.education}
            globalSettings={data.globalSettings}
          />
        );
      case "skills":
        return (
          <SkillSection
            skill={data.skillContent}
            globalSettings={data.globalSettings}
          />
        );
      case "projects":
        return (
          <ProjectSection
            projects={data.projects}
            globalSettings={data.globalSettings}
          />
        );
      case "certificates":
        return (
          <SectionWrapper
            sectionId="certificates"
            style={{
              marginTop: `${data.globalSettings?.sectionSpacing ?? 4}px`,
            }}
          >
            <SectionTitle
              type="certificates"
              globalSettings={data.globalSettings}
            />
            <CertificatesSection certificates={data.certificates} />
          </SectionWrapper>
        );
      case "selfEvaluation":
        return (
          <SelfEvaluationSection
            content={data.selfEvaluationContent}
            globalSettings={data.globalSettings}
          />
        );
      default:
        if (sectionId in data.customData) {
          const sectionTitle =
            data.menuSections.find((s) => s.id === sectionId)?.title ||
            sectionId;
          return (
            <CustomSection
              title={sectionTitle}
              sectionId={sectionId}
              items={data.customData[sectionId]}
              globalSettings={data.globalSettings}
            />
          );
        }
        return null;
    }
  };

  return (
    <div
      className="ahmad-style-template flex flex-col w-full min-h-screen"
      style={{
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
        fontFamily: '"EB Garamond", "Source Han Serif SC", Georgia, serif',
        fontSize: `${data.globalSettings?.baseFontSize || 11}px`,
        lineHeight: data.globalSettings?.lineHeight || 1.3,
        padding: `${data.globalSettings?.pagePadding ?? 36}px`,
      }}
    >
      {enabledSections.map((section) => (
        <div key={section.id}>{renderSection(section.id)}</div>
      ))}
    </div>
  );
};

export default AhmadStyleTemplate;
