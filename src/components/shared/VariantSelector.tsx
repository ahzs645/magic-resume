import React, { useState, useRef } from "react";
import { FileText, Upload, Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResumeStore } from "@/store/useResumeStore";
import {
  DEFAULT_VARIANTS,
  applyVariant,
  getAllTags,
} from "@/utils/variants";
import {
  parseVariantsYaml,
  exportVariantsYaml,
  type ResumeVariant,
} from "@/utils/yamlConverter";

const VariantSelector = () => {
  const { activeResume, updateResume } = useResumeStore();
  const [variants, setVariants] = useState<ResumeVariant[]>(DEFAULT_VARIANTS);
  const [activeVariant, setActiveVariant] = useState<string>("full");
  const variantFileRef = useRef<HTMLInputElement>(null);

  if (!activeResume) return null;

  const handleApplyVariant = (variant: ResumeVariant) => {
    // First reset to full (re-enable all sections)
    const fullVariant = variants.find((v) => v.name === "full");
    let baseData = activeResume;
    if (fullVariant && activeVariant !== "full") {
      // Re-enable all sections
      const resetSections = activeResume.menuSections.map((s) => ({
        ...s,
        enabled: true,
      }));
      baseData = { ...activeResume, menuSections: resetSections };
    }

    const result = applyVariant(baseData, variant);
    updateResume(activeResume.id, {
      menuSections: result.menuSections,
      experience: result.experience,
      education: result.education,
      projects: result.projects,
      customData: result.customData,
    });
    setActiveVariant(variant.name);
    toast.success(`Applied variant: ${variant.name}`);
  };

  const handleImportVariants = () => {
    variantFileRef.current?.click();
  };

  const handleVariantFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseVariantsYaml(text);
      if (imported.length > 0) {
        setVariants(imported);
        toast.success(`Imported ${imported.length} variants`);
      } else {
        toast.error("No variants found in file");
      }
    } catch (error) {
      toast.error("Failed to parse variants YAML");
    }

    if (variantFileRef.current) variantFileRef.current.value = "";
  };

  const handleExportVariants = () => {
    const yamlStr = exportVariantsYaml(variants);
    const blob = new Blob([yamlStr], { type: "text/yaml" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume-variants.yaml";
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Variants exported");
  };

  const tags = getAllTags(activeResume);

  return (
    <>
      <input
        ref={variantFileRef}
        type="file"
        accept=".yaml,.yml"
        style={{ display: "none" }}
        onChange={handleVariantFileChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            Variant: {activeVariant}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {variants.map((variant) => (
            <DropdownMenuItem
              key={variant.name}
              onClick={() => handleApplyVariant(variant)}
              className={
                activeVariant === variant.name ? "bg-accent" : ""
              }
            >
              <span className="font-medium">{variant.name}</span>
              {variant.description && (
                <span className="ml-2 text-muted-foreground text-xs">
                  {variant.description}
                </span>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleImportVariants}>
            <Upload className="w-4 h-4 mr-2" />
            Import variants YAML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportVariants}>
            <Download className="w-4 h-4 mr-2" />
            Export variants YAML
          </DropdownMenuItem>
          {tags.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Tags: {tags.join(", ")}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default VariantSelector;
