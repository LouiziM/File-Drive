"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import MultiFileUpload from "./MultiFileUpload"
import { DialogClose } from "@radix-ui/react-dialog"

export default function UploadDialog() {
    const [file, setFile] = useState<File | null>(null)
    const [numbers, setNumbers] = useState({ year: "", code: "", fileNumber: "" })
    const [tribunalType, setTribunalType] = useState("")
    const [caseType, setCaseType] = useState("")
    const { toast } = useToast()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
            setNumbers(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = () => {
        if (file && numbers.year && numbers.code && numbers.fileNumber && tribunalType && caseType) {
            console.log("File:", file)
            console.log("Numbers:", numbers)
            console.log("Tribunal Type ID:", tribunalType)
            console.log("Case Type ID:", caseType)
            toast({
                title: "نجاح",
                description: "تم رفع الملف بنجاح!",
                duration: 3000,
            })
        } else {
            toast({
                title: "خطأ",
                description: "يرجى ملء جميع الحقول واختيار ملف.",
                variant: "destructive",
                duration: 3000,
            })
        }
    }

    return (
        <div className="p-4 ">
            <Dialog >
                <DialogTrigger asChild>
                    <Button className="flex justify-endbg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 px-4 py-2 rounded-lg shadow-md">
                        ملف
                        <Upload className="mr-2 h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]" >
                    <DialogHeader>
                        <DialogTitle className="flex justify-end">إضافة ملف</DialogTitle>
                        <DialogDescription className="flex justify-end">
                            صالحة للتحميل PDF اختر صور أو ملفات
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 ">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label className="flex justify-end" htmlFor="file">الملف</Label>
                            <MultiFileUpload />
                        </div>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label className="flex justify-end" htmlFor="year">سنة</Label>
                                <Input
                                    id="year"
                                    name="year"
                                    value={numbers.year}
                                    onChange={handleNumberChange}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label className="flex justify-end" htmlFor="code">رمز</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    value={numbers.code}
                                    onChange={handleNumberChange}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label className="flex justify-end" htmlFor="fileNumber">رقم الملف</Label>
                                <Input
                                    id="fileNumber"
                                    name="fileNumber"
                                    value={numbers.fileNumber}
                                    onChange={handleNumberChange}
                                />
                            </div>
                        </div>
                        <div className="flex w-full gap-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label className="flex justify-end" htmlFor="tribunalType">نوع المحكمة</Label>
                                <Select onValueChange={setTribunalType}>
                                    <SelectTrigger className="flex justify-end" id="tribunalType">
                                        <SelectValue placeholder="اختر نوع المحكمة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="flex justify-end" value="1">المحاكم المدنية</SelectItem>
                                        <SelectItem className="flex justify-end" value="2">المحاكم التجارية</SelectItem>
                                        <SelectItem className="flex justify-end" value="3">المحاكم الاجتماعية</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label className="flex justify-end" htmlFor="caseType">نوع القضية</Label>
                                <Select onValueChange={setCaseType}>
                                    <SelectTrigger className="flex justify-end" id="caseType">
                                        <SelectValue placeholder="اختر نوع القضية" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="flex justify-end" value="1">جلسات</SelectItem>
                                        <SelectItem className="flex justify-end" value="2">تبليغ</SelectItem>
                                        <SelectItem className="flex justify-end" value="3">التنفيذات</SelectItem>
                                        <SelectItem className="flex justify-end" value="4">أوامر</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                إلغاء
                            </Button>
                        </DialogClose>
                        <Button type="submit" onClick={handleSubmit}>
                            تأكيد
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster />
        </div>

    )
}