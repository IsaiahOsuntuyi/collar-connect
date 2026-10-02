import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import {
  fetchResumeBlobUrl,
  downloadResume,
  resumeErrorMessage,
  formatFileSize,
} from "@/lib/resume-file";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Stored resume value: Base64 Data URI or legacy storage path/URL. */
  value: string | null | undefined;
  title?: string;
}

export const ResumePreviewModal = ({ open, onOpenChange, value, title = "Resume" }: Props) => {
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>(title);
  const [fileSize, setFileSize] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setSrc(null);
      setError(null);
      setFileSize("");
      return;
    }
    let cancelled = false;
    let created: string | null = null;

    (async () => {
      try {
        const { blobUrl, fileName: name, blob } = await fetchResumeBlobUrl(value);
        created = blobUrl;
        if (cancelled) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        setSrc(blobUrl);
        setFileName(name || title);
        setFileSize(formatFileSize(blob.size));
      } catch (e) {
        if (!cancelled) setError(resumeErrorMessage(e));
      }
    })();

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [open, value, title]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadResume(value);
    } catch (e) {
      toast({
        title: "Couldn't download the resume",
        description: resumeErrorMessage(e),
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const openInNewTab = () => {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b space-y-0">
          <div className="flex items-center justify-between gap-2 pr-8">
            <DialogTitle className="text-base truncate">{fileName}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={openInNewTab}
                disabled={!src}
              >
                <ExternalLink className="h-4 w-4" /> New tab
              </Button>
              <Button size="sm" className="gap-2" onClick={handleDownload} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-muted">
          {error ? (
            <div className="h-[400px] flex items-center justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : src ? (
            <object data={src} type="application/pdf" className="h-[min(600px,calc(100dvh_-_8rem_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom)))] w-full">
              {/* Fallback when the browser can't render the PDF inline */}
              <div className="h-[600px] flex items-center justify-center p-6">
                <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold truncate">{fileName}</p>
                  {fileSize && (
                    <p className="mt-1 text-xs text-muted-foreground">PDF document · {fileSize}</p>
                  )}
                  <p className="mt-3 text-sm text-muted-foreground">
                    Your browser can't display this PDF inline.
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    <Button className="gap-2" onClick={handleDownload} disabled={downloading}>
                      {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download PDF
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={openInNewTab}>
                      <ExternalLink className="h-4 w-4" /> Open PDF in New Tab
                    </Button>
                  </div>
                </div>
              </div>
            </object>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
