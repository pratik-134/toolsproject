import React, { useRef, useEffect, useState, useCallback } from "react";
import { usePdfEditorStore } from "../store";
import { AnnotationObject, ContentElement } from "../types";
import { MessageSquare, ExternalLink } from "lucide-react";

interface PageCanvasProps {
  rawPdfDoc: any;
  activeColor: string;
  activeStrokeWidth: number;
}

export const PageCanvas: React.FC<PageCanvasProps> = ({
  rawPdfDoc,
  activeColor,
  activeStrokeWidth,
}) => {
  const {
    pages,
    activePageIndex,
    zoom,
    mode,
    activeTool,
    setActiveTool,
    selectedObjectId,
    selectedObjectType,
    selectObject,
    annotations,
    elements,
    formFields,
    redactions,
    addAnnotation,
    updateAnnotation,
    addElement,
    updateElement,
    addFormField,
    updateFormField,
    addRedaction,
    updateRedaction,
    watermark,
    pageNumbering,
    bates,
    headerFooter,
    pageBackground,
  } = usePdfEditorStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentPage = pages[activePageIndex];
  const [isInteracting, setIsInteracting] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentFreehandPoints, setCurrentFreehandPoints] = useState<{ x: number; y: number }[]>([]);
  const [dragBox, setDragBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Moving existing object
  const [isMoving, setIsMoving] = useState(false);
  const [moveStart, setMoveStart] = useState<{ mouseX: number; mouseY: number; initialObjX: number; initialObjY: number } | null>(null);

  // Render PDF page to canvas via pdf.js
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!rawPdfDoc || !canvasRef.current || !currentPage) return;
      if (currentPage.originalIndex < 0) {
        // Blank inserted page: clear canvas with white
        const canvas = canvasRef.current;
        canvas.width = Math.floor(currentPage.width * zoom);
        canvas.height = Math.floor(currentPage.height * zoom);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }

      try {
        const pageNumber = currentPage.originalIndex + 1;
        const page = await rawPdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const viewport = page.getViewport({
          scale: zoom,
          rotation: currentPage.rotation,
        });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;
      } catch (err) {
        console.warn("PDF page render error:", err);
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [rawPdfDoc, activePageIndex, zoom, currentPage?.rotation]);

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No active page selected
      </div>
    );
  }

  const pageWidthPx = currentPage.width * zoom;
  const pageHeightPx = currentPage.height * zoom;

  // Filter items for current active page
  const pageAnnotations = annotations.filter((a) => a.pageIndex === activePageIndex);
  const pageElements = elements.filter((el) => el.pageIndex === activePageIndex);

  // Convert mouse event coordinates into unzoomed points (PDF point space)
  const getPointCoords = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const pxX = e.clientX - rect.left;
    const pxY = e.clientY - rect.top;
    return {
      x: Math.max(0, Math.min(currentPage.width, pxX / zoom)),
      y: Math.max(0, Math.min(currentPage.height, pxY / zoom)),
    };
  };

  // Mouse interaction start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    const pt = getPointCoords(e);

    // If activeTool is freehand drawing
    if (activeTool === "draw") {
      setIsInteracting(true);
      setCurrentFreehandPoints([pt]);
      return;
    }

    // If activeTool is bounding shape or highlight or whiteout or redact or form field
    if (
      activeTool === "highlight" ||
      activeTool === "underline" ||
      activeTool === "strike" ||
      activeTool === "squiggly" ||
      activeTool === "shape-rect" ||
      activeTool === "shape-circle" ||
      activeTool === "line" ||
      activeTool === "arrow" ||
      activeTool === "whiteout" ||
      activeTool === "redact-box" ||
      activeTool.startsWith("form-")
    ) {
      setIsInteracting(true);
      setStartPoint(pt);
      setDragBox({ x: pt.x, y: pt.y, width: 0, height: 0 });
      return;
    }

    // If activeTool is text
    if (activeTool === "text") {
      const newText: ContentElement = {
        id: `text-${Date.now()}`,
        type: "text",
        pageIndex: activePageIndex,
        x: pt.x,
        y: pt.y,
        width: 160,
        height: 28,
        text: "New text label",
        fontSize: 14,
        fontFamily: "Helvetica",
        color: activeColor,
      };
      addElement(newText);
      setActiveTool("select");
      return;
    }

    // If activeTool is sticky note
    if (activeTool === "sticky") {
      const newNote: AnnotationObject = {
        id: `note-${Date.now()}`,
        type: "sticky-note",
        pageIndex: activePageIndex,
        x: pt.x,
        y: pt.y,
        width: 24,
        height: 24,
        color: "#f59e0b",
        opacity: 1,
        strokeWidth: 1,
        text: "Add note comment here...",
        author: "Reviewer",
        createdAt: new Date().toLocaleDateString(),
      };
      addAnnotation(newNote);
      setActiveTool("select");
      return;
    }

    // Deselect if clicking blank canvas area in select mode
    if (activeTool === "select" && !isMoving) {
      selectObject(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pt = getPointCoords(e);

    if (isInteracting && activeTool === "draw") {
      setCurrentFreehandPoints((prev) => [...prev, pt]);
      return;
    }

    if (isInteracting && startPoint) {
      const x = Math.min(startPoint.x, pt.x);
      const y = Math.min(startPoint.y, pt.y);
      const width = Math.abs(pt.x - startPoint.x);
      const height = Math.abs(pt.y - startPoint.y);
      setDragBox({ x, y, width, height });
      return;
    }

    if (isMoving && moveStart && selectedObjectId) {
      const deltaX = pt.x - moveStart.mouseX;
      const deltaY = pt.y - moveStart.mouseY;
      const newX = Math.max(0, moveStart.initialObjX + deltaX);
      const newY = Math.max(0, moveStart.initialObjY + deltaY);

      if (selectedObjectType === "annotation") {
        updateAnnotation(selectedObjectId, { x: newX, y: newY });
      } else if (selectedObjectType === "element") {
        updateElement(selectedObjectId, { x: newX, y: newY });
      } else if (selectedObjectType === "formField") {
        updateFormField(selectedObjectId, { x: newX, y: newY });
      } else if (selectedObjectType === "redaction") {
        updateRedaction(selectedObjectId, { x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    if (isInteracting && activeTool === "draw" && currentFreehandPoints.length > 1) {
      const minX = Math.min(...currentFreehandPoints.map((p) => p.x));
      const minY = Math.min(...currentFreehandPoints.map((p) => p.y));
      const maxX = Math.max(...currentFreehandPoints.map((p) => p.x));
      const maxY = Math.max(...currentFreehandPoints.map((p) => p.y));

      const newAnn: AnnotationObject = {
        id: `draw-${Date.now()}`,
        type: "freehand",
        pageIndex: activePageIndex,
        x: minX,
        y: minY,
        width: Math.max(10, maxX - minX),
        height: Math.max(10, maxY - minY),
        points: currentFreehandPoints,
        color: activeColor,
        opacity: 0.9,
        strokeWidth: activeStrokeWidth,
        createdAt: new Date().toLocaleDateString(),
      };
      addAnnotation(newAnn);
      setCurrentFreehandPoints([]);
    }

    if (isInteracting && dragBox && dragBox.width > 3 && dragBox.height > 3) {
      if (activeTool === "whiteout") {
        const newWhiteout: ContentElement = {
          id: `whiteout-${Date.now()}`,
          type: "whiteout",
          pageIndex: activePageIndex,
          x: dragBox.x,
          y: dragBox.y,
          width: dragBox.width,
          height: dragBox.height,
          backgroundColor: "#ffffff",
        };
        addElement(newWhiteout);
        setActiveTool("select");
      } else if (activeTool === "redact-box") {
        addRedaction({
          id: `redact-${Date.now()}`,
          pageIndex: activePageIndex,
          x: dragBox.x,
          y: dragBox.y,
          width: Math.max(30, dragBox.width),
          height: Math.max(16, dragBox.height),
          label: "[REDACTED]",
        });
        setActiveTool("select");
      } else if (activeTool.startsWith("form-")) {
        const fType: import("../types").FormFieldType =
          activeTool === "form-text"
            ? "text"
            : activeTool === "form-check"
            ? "checkbox"
            : activeTool === "form-radio"
            ? "radio"
            : activeTool === "form-dropdown"
            ? "dropdown"
            : activeTool === "form-listbox"
            ? "listbox"
            : activeTool === "form-sig"
            ? "signature-placeholder"
            : "button-submit";

        addFormField({
          id: `field-${Date.now()}`,
          name: `field_${formFields.length + 1}`,
          type: fType,
          pageIndex: activePageIndex,
          x: dragBox.x,
          y: dragBox.y,
          width: Math.max(fType === "checkbox" || fType === "radio" ? 22 : 120, dragBox.width),
          height: Math.max(fType === "checkbox" || fType === "radio" ? 22 : 28, dragBox.height),
          options:
            fType === "dropdown" || fType === "listbox" || fType === "radio"
              ? ["Option 1", "Option 2", "Option 3"]
              : undefined,
          value: fType === "checkbox" ? false : "",
        });
        setActiveTool("select");
      } else {
        const annType =
          activeTool === "highlight"
            ? "highlight"
            : activeTool === "underline"
            ? "underline"
            : activeTool === "strike"
            ? "strikethrough"
            : activeTool === "squiggly"
            ? "squiggly"
            : activeTool === "shape-rect"
            ? "shape-rect"
            : activeTool === "shape-circle"
            ? "shape-circle"
            : activeTool === "arrow"
            ? "arrow"
            : "line";

        const newAnn: AnnotationObject = {
          id: `ann-${Date.now()}`,
          type: annType,
          pageIndex: activePageIndex,
          x: dragBox.x,
          y: dragBox.y,
          width: dragBox.width,
          height: dragBox.height,
          color: activeColor,
          opacity: annType === "highlight" ? 0.45 : 0.9,
          strokeWidth: activeStrokeWidth,
          createdAt: new Date().toLocaleDateString(),
        };
        addAnnotation(newAnn);
        setActiveTool("select");
      }
    }

    setIsInteracting(false);
    setStartPoint(null);
    setDragBox(null);
    setIsMoving(false);
    setMoveStart(null);
  };

  const handleStartMoveObject = (
    e: React.MouseEvent,
    id: string,
    type: "annotation" | "element" | "formField" | "redaction",
    currentX: number,
    currentY: number
  ) => {
    e.stopPropagation();
    selectObject(id, type);
    if (activeTool === "select") {
      setIsMoving(true);
      const pt = getPointCoords(e);
      setMoveStart({
        mouseX: pt.x,
        mouseY: pt.y,
        initialObjX: currentX,
        initialObjY: currentY,
      });
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-muted/40 p-6 flex justify-center items-start select-none">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          width: pageWidthPx,
          height: pageHeightPx,
        }}
        className={`relative shadow-xl rounded-sm transition-shadow duration-150 bg-white ${
          activeTool === "draw" || activeTool === "highlight"
            ? "cursor-crosshair"
            : activeTool === "text"
            ? "cursor-text"
            : "cursor-default"
        }`}
      >
        {/* Background Color Tint if enabled */}
        {pageBackground?.enabled && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: pageBackground.color, opacity: 0.2 }}
          />
        )}

        {/* PDF Page Rendering Canvas */}
        <canvas
          ref={canvasRef}
          style={{ width: pageWidthPx, height: pageHeightPx }}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Global Watermark Live Preview */}
        {watermark?.enabled && watermark.text && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
            style={{
              opacity: watermark.opacity || 0.2,
              transform: `rotate(${watermark.rotation || 45}deg)`,
            }}
          >
            <span
              className="font-bold whitespace-nowrap select-none"
              style={{
                fontSize: `${(watermark.fontSize || 48) * zoom}px`,
                color: watermark.color || "#94a3b8",
              }}
            >
              {watermark.text}
            </span>
          </div>
        )}

        {/* Global Header & Footer Preview */}
        {headerFooter?.enabled && (
          <>
            {headerFooter.headerText && (
              <div
                className="absolute top-4 left-8 right-8 text-center text-xs font-mono pointer-events-none truncate"
                style={{ color: headerFooter.color || "#6b7280" }}
              >
                {headerFooter.headerText}
              </div>
            )}
            {headerFooter.footerText && (
              <div
                className="absolute bottom-4 left-8 right-8 text-center text-xs font-mono pointer-events-none truncate"
                style={{ color: headerFooter.color || "#6b7280" }}
              >
                {headerFooter.footerText}
              </div>
            )}
          </>
        )}

        {/* Global Page Numbering Preview */}
        {pageNumbering?.enabled && (
          <div
            className={`absolute text-xs font-mono pointer-events-none px-8 ${
              pageNumbering.position.startsWith("top") ? "top-4" : "bottom-4"
            } ${
              pageNumbering.position.endsWith("left")
                ? "left-0 text-left"
                : pageNumbering.position.endsWith("right")
                ? "right-0 text-right"
                : "left-0 right-0 text-center"
            }`}
            style={{ color: pageNumbering.color || "#4b5563" }}
          >
            {pageNumbering.format === "page-of-total"
              ? `Page ${activePageIndex + 1} of ${pages.length}`
              : pageNumbering.format === "page"
              ? `Page ${activePageIndex + 1}`
              : `${activePageIndex + 1}`}
          </div>
        )}

        {/* Bates Numbering Preview */}
        {bates?.enabled && (
          <div
            className={`absolute font-mono text-xs pointer-events-none px-8 ${
              bates.position.startsWith("top") ? "top-4" : "bottom-4"
            } ${bates.position.endsWith("left") ? "left-0 text-left" : "right-0 text-right"}`}
            style={{ color: "#374151" }}
          >
            {bates.prefix || ""}
            {String(bates.startNumber + activePageIndex).padStart(bates.digits || 6, "0")}
            {bates.suffix || ""}
          </div>
        )}

        {/* SVG Drawing Layer for Freehand and Shapes */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${currentPage.width} ${currentPage.height}`}
        >
          {/* Active Freehand Path while drawing */}
          {currentFreehandPoints.length > 1 && (
            <polyline
              points={currentFreehandPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={activeColor}
              strokeWidth={activeStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          )}

          {/* Stored Freehand Annotations */}
          {pageAnnotations
            .filter((a) => a.type === "freehand" && a.points)
            .map((ann) => (
              <polyline
                key={ann.id}
                points={ann.points?.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={ann.color}
                strokeWidth={ann.strokeWidth || 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={ann.opacity || 1}
              />
            ))}
        </svg>

        {/* Interactive Whiteout Rectangles */}
        {pageElements
          .filter((el) => el.type === "whiteout")
          .map((w) => {
            const isSelected = selectedObjectId === w.id;
            return (
              <div
                key={w.id}
                onMouseDown={(e) => handleStartMoveObject(e, w.id, "element", w.x, w.y)}
                style={{
                  left: w.x * zoom,
                  top: w.y * zoom,
                  width: w.width * zoom,
                  height: w.height * zoom,
                  backgroundColor: w.backgroundColor || "#ffffff",
                }}
                className={`absolute ${
                  isSelected ? "ring-2 ring-primary ring-offset-1 z-20" : "z-10"
                } group cursor-move`}
              >
                {isSelected && (
                  <div className="absolute -top-5 left-0 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">
                    Whiteout Box
                  </div>
                )}
              </div>
            );
          })}

        {/* Interactive Annotations Overlay (Highlight, Rect, Circle, Line, Note, Stamp) */}
        {pageAnnotations.map((ann) => {
          if (ann.type === "freehand") return null;
          const isSelected = selectedObjectId === ann.id;

          if (ann.type === "sticky-note") {
            return (
              <div
                key={ann.id}
                onMouseDown={(e) => handleStartMoveObject(e, ann.id, "annotation", ann.x, ann.y)}
                style={{
                  left: ann.x * zoom,
                  top: ann.y * zoom,
                }}
                className="absolute z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                title={ann.text || "Sticky Note"}
              >
                <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-amber-600 shadow-md flex items-center justify-center text-amber-950 font-bold hover:scale-110 transition-transform">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                {ann.text && (
                  <div className="absolute left-8 top-0 hidden group-hover:block bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-2 min-w-[160px] text-xs z-30">
                    <p className="font-semibold">{ann.author || "Reviewer"}</p>
                    <p className="text-[11px] text-muted-foreground">{ann.text}</p>
                  </div>
                )}
              </div>
            );
          }

          if (ann.type === "stamp") {
            return (
              <div
                key={ann.id}
                onMouseDown={(e) => handleStartMoveObject(e, ann.id, "annotation", ann.x, ann.y)}
                style={{
                  left: ann.x * zoom,
                  top: ann.y * zoom,
                  width: ann.width * zoom,
                  height: ann.height * zoom,
                  borderColor: ann.color,
                  color: ann.color,
                  backgroundColor: `${ann.color}15`,
                }}
                className={`absolute border-2 rounded flex items-center justify-center font-bold text-sm tracking-wider uppercase cursor-move z-20 ${
                  isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                <span>{ann.text || "APPROVED"}</span>
              </div>
            );
          }

          return (
            <div
              key={ann.id}
              onMouseDown={(e) => handleStartMoveObject(e, ann.id, "annotation", ann.x, ann.y)}
              style={{
                left: ann.x * zoom,
                top: ann.y * zoom,
                width: ann.width * zoom,
                height: ann.height * zoom,
              }}
              className={`absolute cursor-move ${isSelected ? "ring-2 ring-primary ring-offset-1 z-20" : "z-10"}`}
            >
              {ann.type === "highlight" && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: ann.color,
                    opacity: ann.opacity || 0.45,
                  }}
                />
              )}

              {ann.type === "underline" && (
                <div
                  className="w-full absolute bottom-0"
                  style={{
                    height: ann.strokeWidth || 2,
                    backgroundColor: ann.color,
                  }}
                />
              )}

              {ann.type === "strikethrough" && (
                <div
                  className="w-full absolute top-1/2 -translate-y-1/2"
                  style={{
                    height: ann.strokeWidth || 2,
                    backgroundColor: ann.color,
                  }}
                />
              )}

              {ann.type === "shape-rect" && (
                <div
                  className="w-full h-full"
                  style={{
                    border: `${ann.strokeWidth || 2}px solid ${ann.color}`,
                    backgroundColor: ann.fillColor || "transparent",
                    opacity: ann.opacity || 1,
                  }}
                />
              )}

              {ann.type === "shape-circle" && (
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    border: `${ann.strokeWidth || 2}px solid ${ann.color}`,
                    backgroundColor: ann.fillColor || "transparent",
                    opacity: ann.opacity || 1,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Content Elements (Text, Image, Signature, Initials, Date, Link) */}
        {pageElements
          .filter((el) => el.type !== "whiteout")
          .map((el) => {
            const isSelected = selectedObjectId === el.id;

            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleStartMoveObject(e, el.id, "element", el.x, el.y)}
                style={{
                  left: el.x * zoom,
                  top: el.y * zoom,
                  width: el.width * zoom,
                  height: el.height * zoom,
                }}
                className={`absolute cursor-move z-20 ${
                  isSelected ? "ring-2 ring-primary ring-offset-1" : ""
                }`}
              >
                {el.type === "text" && (
                  <div
                    style={{
                      fontSize: (el.fontSize || 14) * zoom,
                      color: el.color || "#000000",
                      fontFamily: el.fontFamily || "Helvetica, sans-serif",
                    }}
                    className="w-full h-full p-0.5 whitespace-pre-wrap select-text leading-tight"
                  >
                    {el.text}
                  </div>
                )}

                {(el.type === "image" || el.type === "signature" || el.type === "initials") && el.imageDataUrl && (
                  <img
                    src={el.imageDataUrl}
                    alt={el.type}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                )}

                {el.type === "date" && (
                  <div
                    style={{
                      fontSize: (el.fontSize || 12) * zoom,
                      color: el.color || "#000000",
                    }}
                    className="font-mono bg-muted/60 px-1 py-0.5 rounded border border-border/60"
                  >
                    {el.text || new Date().toISOString().split("T")[0]}
                  </div>
                )}

                {el.type === "link" && (
                  <div className="w-full h-full border border-blue-500/50 bg-blue-500/10 flex items-center justify-between px-1 text-xs text-blue-600">
                    <span className="truncate">{el.text || el.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </div>
                )}
              </div>
            );
          })}

        {/* Tier 2: Permanent Redaction Boxes */}
        {redactions
          .filter((r) => r.pageIndex === activePageIndex)
          .map((r) => {
            const isSelected = selectedObjectId === r.id;
            return (
              <div
                key={r.id}
                onMouseDown={(e) => handleStartMoveObject(e, r.id, "redaction", r.x, r.y)}
                style={{
                  left: r.x * zoom,
                  top: r.y * zoom,
                  width: r.width * zoom,
                  height: r.height * zoom,
                }}
                className={`absolute bg-black flex items-center justify-center cursor-move z-20 ${
                  isSelected ? "ring-2 ring-red-500 ring-offset-1" : ""
                }`}
              >
                <span
                  className="font-bold text-white font-mono uppercase tracking-wider select-none truncate px-1"
                  style={{ fontSize: `${Math.max(8, Math.min(12, r.height * 0.45 * zoom))}px` }}
                >
                  {r.label || "[REDACTED]"}
                </span>
              </div>
            );
          })}

        {/* Tier 2: Interactive AcroForm Fields */}
        {formFields
          .filter((f) => f.pageIndex === activePageIndex)
          .map((f) => {
            const isSelected = selectedObjectId === f.id;
            return (
              <div
                key={f.id}
                onMouseDown={(e) => handleStartMoveObject(e, f.id, "formField", f.x, f.y)}
                style={{
                  left: f.x * zoom,
                  top: f.y * zoom,
                  width: f.width * zoom,
                  height: f.height * zoom,
                }}
                className={`absolute z-20 group border rounded-xs transition-shadow ${
                  isSelected
                    ? "border-blue-600 bg-blue-500/10 ring-2 ring-blue-500/30 shadow-xs cursor-move"
                    : "border-blue-400/80 bg-blue-50/40 hover:border-blue-600 cursor-pointer"
                }`}
              >
                {/* Field Name Badge on Hover or Selection */}
                <div className="absolute -top-4 left-0 text-[9px] bg-blue-600 text-white font-mono px-1 py-0.2 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                  {f.name} ({f.type})
                </div>

                {f.type === "text" && (
                  <input
                    type={f.isPassword ? "password" : "text"}
                    value={String(f.value ?? f.defaultValue ?? "")}
                    disabled={f.isReadOnly}
                    onChange={(e) => updateFormField(f.id, { value: e.target.value })}
                    placeholder={f.name}
                    className="w-full h-full px-1.5 py-0.5 bg-transparent text-xs text-foreground focus:outline-hidden"
                  />
                )}

                {f.type === "checkbox" && (
                  <div className="w-full h-full flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={Boolean(f.value ?? f.defaultValue)}
                      disabled={f.isReadOnly}
                      onChange={(e) => updateFormField(f.id, { value: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </div>
                )}

                {f.type === "radio" && (
                  <div className="w-full h-full flex items-center justify-center">
                    <input
                      type="radio"
                      name={f.name}
                      checked={Boolean(f.value)}
                      disabled={f.isReadOnly}
                      onChange={(e) => updateFormField(f.id, { value: e.target.checked })}
                      className="w-4 h-4 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </div>
                )}

                {f.type === "dropdown" && (
                  <select
                    value={String(f.value ?? (f.options && f.options[0]) ?? "")}
                    disabled={f.isReadOnly}
                    onChange={(e) => updateFormField(f.id, { value: e.target.value })}
                    className="w-full h-full px-1 py-0.5 bg-transparent text-xs text-foreground focus:outline-hidden"
                  >
                    {(f.options || ["Option 1", "Option 2"]).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {f.type === "listbox" && (
                  <div className="w-full h-full overflow-y-auto text-[11px] p-1 bg-white">
                    {(f.options || ["Option 1", "Option 2"]).map((opt) => (
                      <div key={opt} className="px-1 py-0.5 hover:bg-blue-100 rounded text-foreground">
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {(f.type === "button-submit" || f.type === "button-reset") && (
                  <button
                    type="button"
                    className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xs flex items-center justify-center"
                  >
                    {f.name || "Submit"}
                  </button>
                )}

                {f.type === "signature-placeholder" && (
                  <div className="w-full h-full border-2 border-dashed border-blue-400 bg-blue-50/50 flex items-center justify-center text-[10px] text-blue-600 font-semibold uppercase">
                    Signature Field
                  </div>
                )}
              </div>
            );
          })}

        {/* Live Drag Creation Box */}
        {dragBox && (
          <div
            style={{
              left: dragBox.x * zoom,
              top: dragBox.y * zoom,
              width: dragBox.width * zoom,
              height: dragBox.height * zoom,
            }}
            className="absolute border-2 border-dashed border-primary bg-primary/10 pointer-events-none z-30"
          />
        )}
      </div>
    </div>
  );
};
