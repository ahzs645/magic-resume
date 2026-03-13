import { useMemo } from "react";
import { GlobalSettings } from "@/types/resume";
import { useTemplateContext } from "../../TemplateContext";
import { useResumeStore } from "@/store/useResumeStore";

interface SectionTitleProps {
  globalSettings?: GlobalSettings;
  type: string;
  title?: string;
  showTitle?: boolean;
}

/**
 * Ahmad-style section title: uppercase bold text with a thin horizontal rule underneath.
 * Mimics the RenderCV ahmadstyle Typst theme.
 */
const SectionTitle = ({
  type,
  title,
  globalSettings,
  showTitle = true,
}: SectionTitleProps) => {
  const { activeResume } = useResumeStore();
  const templateContext = useTemplateContext();
  const menuSections =
    templateContext?.menuSections ?? activeResume?.menuSections ?? [];

  const renderTitle = useMemo(() => {
    if (type === "custom") return title;
    return menuSections.find((s) => s.id === type)?.title;
  }, [menuSections, type, title]);

  if (!showTitle) return null;

  return (
    <div style={{ paddingTop: "6pt" }}>
      <h3
        style={{
          fontSize: `${globalSettings?.headerSize || 14}px`,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: globalSettings?.themeColor || "#000000",
          margin: 0,
          padding: 0,
        }}
      >
        {renderTitle}
      </h3>
      <hr
        style={{
          border: "none",
          borderTop: `0.4pt solid ${globalSettings?.themeColor || "#000000"}`,
          margin: "2px 0 0 0",
        }}
      />
    </div>
  );
};

export default SectionTitle;
