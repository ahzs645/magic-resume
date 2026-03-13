import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";

interface SkillSectionProps {
  skill?: string;
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const SkillSection = ({
  skill,
  globalSettings,
  showTitle = true,
}: SkillSectionProps) => {
  const baseFontSize = globalSettings?.baseFontSize || 11;

  return (
    <SectionWrapper
      sectionId="skills"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 4}px` }}
    >
      <SectionTitle
        type="skills"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <div
        className="ahmad-highlights"
        style={{
          fontSize: `${baseFontSize}px`,
          lineHeight: globalSettings?.lineHeight || 1.3,
          marginTop: "2px",
        }}
        dangerouslySetInnerHTML={{
          __html: normalizeRichTextContent(skill),
        }}
      />
    </SectionWrapper>
  );
};

export default SkillSection;
