import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";

interface SelfEvaluationSectionProps {
  content?: string;
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const SelfEvaluationSection = ({
  content,
  globalSettings,
  showTitle = true,
}: SelfEvaluationSectionProps) => {
  const baseFontSize = globalSettings?.baseFontSize || 11;

  return (
    <SectionWrapper
      sectionId="selfEvaluation"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 4}px` }}
    >
      <SectionTitle
        type="selfEvaluation"
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
          __html: normalizeRichTextContent(content),
        }}
      />
    </SectionWrapper>
  );
};

export default SelfEvaluationSection;
