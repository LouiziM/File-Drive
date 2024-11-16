"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MultiFileUpload from "./MultiFileUpload";
import { DialogClose } from "@radix-ui/react-dialog";

interface FileWithPreview extends File {
  preview?: string;
}

interface Numbers {
  year: string;
  code: string;
  fileNumber: string;
}

export default function UploadDialog() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [numbers, setNumbers] = useState<Numbers>({
    year: "",
    code: "",
    fileNumber: "",
  });
  const [tribunalType, setTribunalType] = useState<string>("");
  const [caseType, setCaseType] = useState<string>("");
  const { toast } = useToast();

  const sanitizeInput = (input: string) => input.replace(/[^a-zA-Z0-9]/g, "");

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setNumbers((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
    }
  };

  const handleSubmit = async () => {
    try {
      const fileMetadata = files.map((file) => ({ fileType: file.type, fileSize: file.size }));
      const response = await fetch("/api/getPresignedUrls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileMetadata }),
      });
  
      const responseText = await response.text();
      console.log("API Response Text:", responseText);
  
      if (!response.ok) {
        throw new Error(responseText || "Failed to get presigned URLs");
      }
  
      const presignedUrls = JSON.parse(responseText);
      console.log("Presigned URLs:", presignedUrls);
  
      await Promise.all(
        files.map((file, index) =>
          fetch(presignedUrls[index].url, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
              "Content-Length": String(file.size),
            },
            body: file,
          })
        )
      );
  
      toast({ title: "Success", description: "Files uploaded successfully!" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Error", description: "Upload failed.", variant: "destructive" });
    }
  };
  

  return (
    <div className="p-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex justify-end bg-gray-700 text-gray-100 hover:bg-gray-600">
            ملف
            <Upload className="mr-2 h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex justify-end">إضافة ملف</DialogTitle>
            <DialogDescription className="flex justify-end">
              اختر صورًا أو ملفات PDF صالحة للتحميل
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label className="flex justify-end">الملف</Label>
              <MultiFileUpload files={files} setFiles={setFiles} />
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Input
                id="year"
                name="year"
                value={numbers.year}
                onChange={handleNumberChange}
                placeholder="سنة"
              />
              <Input
                id="code"
                name="code"
                value={numbers.code}
                onChange={handleNumberChange}
                placeholder="رمز"
              />
              <Input
                id="fileNumber"
                name="fileNumber"
                value={numbers.fileNumber}
                onChange={handleNumberChange}
                placeholder="رقم الملف"
              />
            </div>
            <Select onValueChange={setTribunalType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المحكمة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">المحاكم المدنية</SelectItem>
                <SelectItem value="2">المحاكم التجارية</SelectItem>
                <SelectItem value="3">المحاكم الاجتماعية</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setCaseType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع القضية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">جلسات</SelectItem>
                <SelectItem value="2">تبليغ</SelectItem>
                <SelectItem value="3">التنفيذات</SelectItem>
                <SelectItem value="4">أوامر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>تأكيد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
