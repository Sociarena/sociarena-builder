import DOMPurify from "isomorphic-dompurify";
import { micromark } from "micromark";
import { gfmTable, gfmTableHtml } from "micromark-extension-gfm-table";
import { forwardRef, useMemo, type ComponentProps } from "react";

type MarkdownEmbedProps = ComponentProps<"div"> & {
  code: string;
  // avoid builder passing it to dom
  children?: never;
};

// Configure DOMPurify to allow data: URIs for images but block javascript: URLs
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    // Allow data: protocol for images (required for embedded images in markdown)
    ADD_DATA_URI_TAGS: ["img"],
    // Block dangerous protocols like javascript:, vbscript:, etc.
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
};

export const MarkdownEmbed = /* @__PURE__ */ forwardRef<
  HTMLDivElement,
  MarkdownEmbedProps
>((props, ref) => {
  const { code, children, ...rest } = props;
  const html = useMemo(() => {
    // Parse markdown to HTML
    // allowDangerousProtocol is needed for micromark to preserve data: URIs,
    // but we sanitize the output with DOMPurify to block javascript: URLs
    const rawHtml = micromark(code ?? "", {
      allowDangerousProtocol: true,
      extensions: [gfmTable()],
      htmlExtensions: [gfmTableHtml()],
    });
    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(rawHtml);
  }, [code]);
  return <div {...rest} ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
});
