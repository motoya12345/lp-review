"use client";

import { useEffect, useRef, useState } from "react";
import type { Issue } from "@/lib/types";
import { SEVERITY_COLOR } from "@/lib/tokens";

interface Props {
  imageUrl:      string;
  issues:        Issue[];
  activeIssueId: number | null;
  onClickIssue:  (id: number) => void;
}

export function AnnotatedImage({ imageUrl, issues, activeIssueId, onClickIssue }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const update = () => setImgSize({ w: img.clientWidth, h: img.clientHeight });
    img.addEventListener("load", update);
    if (img.complete) update();
    const ro = new ResizeObserver(update);
    ro.observe(img);
    return () => { img.removeEventListener("load", update); ro.disconnect(); };
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || imgSize.w === 0) return;
    canvas.width  = imgSize.w;
    canvas.height = imgSize.h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, imgSize.w, imgSize.h);

    issues.forEach((issue) => {
      const color    = SEVERITY_COLOR[issue.severity];
      const isActive = issue.id === activeIssueId;
      const x = (issue.box.x / 100) * imgSize.w;
      const y = (issue.box.y / 100) * imgSize.h;
      const w = (issue.box.w / 100) * imgSize.w;
      const h = (issue.box.h / 100) * imgSize.h;

      ctx.strokeStyle = color;
      ctx.lineWidth   = isActive ? 3 : 2;
      ctx.setLineDash(isActive ? [] : [6, 3]);
      ctx.strokeRect(x, y, w, h);

      if (isActive) {
        ctx.fillStyle = color + "18";
        ctx.fillRect(x, y, w, h);
      }

      // 番号バッジ
      const BADGE_R = 13;
      const bx = x + BADGE_R / 2 + 2;
      const by = y - BADGE_R / 2 + 2;
      ctx.beginPath();
      ctx.arc(bx, by, BADGE_R, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle    = "#fff";
      ctx.font         = `bold ${BADGE_R}px 'DM Mono', monospace`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(issue.id), bx, by);
    });
  }, [issues, imgSize, activeIssueId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;

    for (const issue of issues) {
      const x = (issue.box.x / 100) * imgSize.w;
      const y = (issue.box.y / 100) * imgSize.h;
      const w = (issue.box.w / 100) * imgSize.w;
      const h = (issue.box.h / 100) * imgSize.h;
      if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
        onClickIssue(issue.id);
        return;
      }
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt="LP preview"
        style={{ width: "100%", display: "block", borderRadius: 8 }}
      />
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position:     "absolute",
          top: 0, left: 0,
          width:        "100%",
          height:       "100%",
          cursor:       "pointer",
          borderRadius: 8,
        }}
      />
    </div>
  );
}
