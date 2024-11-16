"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Upload, X, FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize pdf.js worker
const MAX_FILE_SIZE = 800 * 1024; // 800KB in bytes
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

interface FileWithPreview extends File {
  preview?: string;
}
interface MultiFileUploadProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
}
export default function MultiFileUpload({files,setFiles}:MultiFileUploadProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  //loading the pdf worker
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    
    const selectedFiles = Array.from(event.target.files || []);
    
    const validFiles = selectedFiles.filter(file => {
      if (!ALLOWED_FORMATS.includes(file.type)) {
        toast({
          title: "خطأ في تنسيق الملف",
          description: `${file.name} ليس بالتنسيق المطلوب.`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "حجم الملف كبير جدًا",
          description: `.يتجاوز الحد الأقصى البالغ 800 كيلوبايت ${file.name} `,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const newFiles = validFiles.map(file => Object.assign(file, {
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles(files.filter(file => file !== fileToRemove));
    if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleFileChange({ target: { files: droppedFiles } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">انقر أو اسحب وأفلت الملفات هنا</p>
        <p className="mt-1 text-xs text-gray-500">JPEG, JPG, PNG, WebP, PDF (الحد الأقصى: 800 كيلوبايت)</p>
        <Input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept={ALLOWED_FORMATS.join(',')}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="w-full h-32 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {file.type.startsWith('image/') ? (
                  <img src={file.preview} alt={file.name} className="max-h-full max-w-full object-contain" />
                ) : file.type === 'application/pdf' ? (
                  <Document
                    file={file}
                    loading={<div className="text-xs text-gray-500">Loading PDF...</div>}
                    onLoadError={(error: { message: any; }) => {
                      toast({
                        title: "خطأ في تحميل PDF",
                        description: error.message,
                        variant: "destructive",
                      });
                    }}
                  >
                    <Page pageNumber={1} width={100} />
                  </Document>
                ) : (
                  <FileIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                aria-label="إزالة الملف"
              >
                <X className="h-4 w-4"/>
              </button>
              <p className="mt-1 text-xs text-center truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}