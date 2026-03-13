import React, { useState, useRef } from "react";
import { useTranslations } from "@/i18n/compat/client";
import {
  Download,
  Loader2,
  FileJson,
  Printer,
  ChevronDown,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { exportToPdf } from "@/utils/export";
import { exportResumeToBrowserPrint } from "@/utils/print";
import {
  importRenderCVYaml,
  exportToRenderCVYaml,
} from "@/utils/yamlConverter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PdfExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const { activeResume, updateResume } = useResumeStore();
  const { globalSettings = {}, title } = activeResume || {};
  const t = useTranslations("pdfExport");
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const yamlInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    await exportToPdf({
      elementId: "resume-preview",
      title: title || "resume",
      pagePadding: globalSettings?.pagePadding || 0,
      fontFamily: globalSettings?.fontFamily,
      onStart: () => setIsExporting(true),
      onEnd: () => setIsExporting(false),
      successMessage: t("toast.success"),
      errorMessage: t("toast.error"),
    });
  };

  const handleJsonExport = () => {
    try {
      setIsExportingJson(true);
      if (!activeResume) {
        throw new Error("No active resume");
      }

      const jsonStr = JSON.stringify(activeResume, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.json`;
      link.click();

      window.URL.revokeObjectURL(url);
      toast.success(t("toast.jsonSuccess"));
    } catch (error) {
      console.error("JSON export error:", error);
      toast.error(t("toast.jsonError"));
    } finally {
      setIsExportingJson(false);
    }
  };

  const handleYamlExport = () => {
    try {
      if (!activeResume) {
        throw new Error("No active resume");
      }

      const yamlStr = exportToRenderCVYaml(activeResume);
      const blob = new Blob([yamlStr], { type: "text/yaml" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CV.yaml`;
      link.click();

      window.URL.revokeObjectURL(url);
      toast.success("YAML exported successfully");
    } catch (error) {
      console.error("YAML export error:", error);
      toast.error("Failed to export YAML");
    }
  };

  const handleYamlImport = () => {
    yamlInputRef.current?.click();
  };

  const handleYamlFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !activeResume) return;

    try {
      const text = await file.text();
      const imported = importRenderCVYaml(text);

      // Merge imported data into active resume
      updateResume(activeResume.id, {
        ...imported,
        title: activeResume.title, // keep existing title
      });

      toast.success("RenderCV YAML imported successfully");
    } catch (error) {
      console.error("YAML import error:", error);
      toast.error(
        `Failed to import YAML: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Reset input
    if (yamlInputRef.current) {
      yamlInputRef.current.value = "";
    }
  };

  const handlePrint = async () => {
    const resumeContent = document.getElementById("resume-preview");
    if (!resumeContent) {
      console.error("Resume content not found");
      return;
    }

    const pagePadding = globalSettings?.pagePadding || 0;
    await exportResumeToBrowserPrint(
      resumeContent,
      pagePadding,
      globalSettings?.fontFamily
    );
  };

  const isLoading = isExporting || isExportingJson;
  const loadingText = isExporting
    ? t("button.exporting")
    : isExportingJson
      ? t("button.exportingJson")
      : "";

  return (
    <>
      {/* Hidden file input for YAML import */}
      <input
        ref={yamlInputRef}
        type="file"
        accept=".yaml,.yml"
        style={{ display: "none" }}
        onChange={handleYamlFileChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t("button.export")}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            {t("button.exportPdf")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint} disabled={isLoading}>
            <Printer className="w-4 h-4 mr-2" />
            {t("button.print")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleJsonExport} disabled={isLoading}>
            <FileJson className="w-4 h-4 mr-2" />
            {t("button.exportJson")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleYamlExport} disabled={isLoading}>
            <FileText className="w-4 h-4 mr-2" />
            Export YAML (RenderCV)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleYamlImport} disabled={isLoading}>
            <Upload className="w-4 h-4 mr-2" />
            Import YAML (RenderCV)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default PdfExport;
