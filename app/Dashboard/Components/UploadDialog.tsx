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
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { s3Client, ddbClient } from "../../../lib/AwsClients"

interface FileWithPreview extends File {
    preview?: string;
}

interface Numbers {
    year: number;
    code: number;
    fileNumber: number;
}

export default function UploadDialog() {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [numbers, setNumbers] = useState<Numbers>({ year: 0, code: 0, fileNumber: 0 });
    const [tribunalType, setTribunalType] = useState("");
    const [caseType, setCaseType] = useState("");
    const { toast } = useToast();

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
            setNumbers((prev) => ({ ...prev, [name]: value }));
        }
    };

    const uploadToS3 = async (file: FileWithPreview) => {
        const fileId = uuidv4();
        const uploadParams = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
            Key: `uploads/${fileId}-${file.name}`,
            Body: file,
            ContentType: file.type,
        };

        try {
            await s3Client.send(new PutObjectCommand(uploadParams));
            return uploadParams.Key;
        } catch (error) {
            console.error("S3 Upload Error:", error);
            throw new Error("Failed to upload file to S3");
        }
    };

    const saveToDynamoDB = async (s3Keys: string[]) => {
        const item = {
            id: { S: sanitizeInput(uuidv4()) },
            year: { N: sanitizeInput(numbers.year.toString()) },
            code: { N: sanitizeInput(numbers.code.toString()) },
            fileNumber: { N: sanitizeInput(numbers.fileNumber.toString()) },
            tribunalType: { S: sanitizeInput(tribunalType) },
            caseType: { S: sanitizeInput(caseType) },
            files: { SS: s3Keys },
            createdAt: { S: new Date().toISOString() },
        };

        try {
            await ddbClient.send(new PutItemCommand({ TableName: process.env.NEXT_PUBLIC_DDB_TABLE, Item: item }));
        } catch (error) {
            console.error("DynamoDB Save Error:", error);
            throw new Error("Failed to save data to DynamoDB");
        }
    };
    const sanitizeInput = (input: string) => {
        return input.replace(/[^a-zA-Z0-9]/g, '');
    };
    const handleSubmit = async () => {
        if (files.length && numbers.year != 0 && numbers.code != 0 && numbers.fileNumber != 0 && tribunalType != "" && caseType != "") {
            try {
                // Upload files to S3
                const s3Keys = await Promise.all(files.map(uploadToS3));

                // Save metadata to DynamoDB
                await saveToDynamoDB(s3Keys);

                toast({
                    title: "نجاح",
                    description: "!تم رفع الملف بنجاح",
                    duration: 3000,
                });

                // Reset form
                setFiles([]);
                setNumbers({ year: 0, code: 0, fileNumber: 0 });
                setTribunalType("");
                setCaseType("");
            } catch (error) {
                toast({
                    title: "خطأ",
                    description: "حدث خطأ أثناء رفع الملفات. حاول مرة أخرى.",
                    variant: "destructive",
                    duration: 3000,
                });
            }
        } else {
            toast({
                title: "خطأ",
                description: "يرجى ملء جميع الحقول واختيار ملف.",
                variant: "destructive",
                duration: 3000,
            });
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
                            صالحة للتحميل PDF اختر صور أو ملفات
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label className="flex justify-end">الملف</Label>
                            <MultiFileUpload files={files} setFiles={setFiles} />
                        </div>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                            <Input id="year" name="year" value={numbers.year} onChange={handleNumberChange} placeholder="سنة" />
                            <Input id="code" name="code" value={numbers.code} onChange={handleNumberChange} placeholder="رمز" />
                            <Input id="fileNumber" name="fileNumber" value={numbers.fileNumber} onChange={handleNumberChange} placeholder="رقم الملف" />
                        </div>
                        <Select onValueChange={(value) => setTribunalType(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر نوع المحكمة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">المحاكم المدنية</SelectItem>
                                <SelectItem value="2">المحاكم التجارية</SelectItem>
                                <SelectItem value="3">المحاكم الاجتماعية</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select onValueChange={(value) => setCaseType(value)}>
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
