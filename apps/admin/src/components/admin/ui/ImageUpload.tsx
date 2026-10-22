"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null, previewUrl: string | null) => void;
  label?: string;
  hint?: string;
  error?: string;
  aspectRatio?: "square" | "video" | "banner" | "flag";
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  hint = "PNG, JPG, WebP or SVG up to 5MB",
  error,
  aspectRatio = "video",
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    square: "aspect-square max-w-[140px]",
    flag: "aspect-[4/3] max-w-[160px]",
    video: "aspect-video w-full",
    banner: "aspect-[21/9] w-full",
  }[aspectRatio];

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should not exceed 5MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange(file, objectUrl);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-slate-700">{label}</label>
      )}

      {preview ? (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className={cn("relative mx-auto flex items-center justify-center overflow-hidden", aspectClass)}>
            <img
              src={preview}
              alt="Uploaded preview"
              className="h-full w-full object-cover rounded-lg"
            />
          </div>
          <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy-900 shadow hover:bg-white transition"
            >
              <RefreshCw className="size-3.5" /> Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-600 transition"
            >
              <X className="size-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition",
            isDragging
              ? "border-navy-600 bg-navy-50/50"
              : "border-slate-300 hover:border-navy-400 bg-slate-50/50",
            error && "border-red-300 bg-red-50/20"
          )}
        >
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-500">
            <Upload className="size-5" />
          </div>
          <p className="text-xs font-medium text-navy-800">
            Click to upload or drag & drop
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={onInputChange}
        className="hidden"
      />

      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
