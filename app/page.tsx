import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
     <Button  className="bg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 px-4 py-2 rounded-lg shadow-md">Fichier</Button>

    </div>
  );
}
