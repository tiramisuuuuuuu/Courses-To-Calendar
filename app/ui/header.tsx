import Image from "next/image";
import { header_font } from "@/app/ui/fonts";

export default function Header() {
    return (
        <div className="flex flex-col items-center bg-gray-100 border-2">
            <Image src="/logo.PNG" alt="Cow builder logo" width="160" height="192"></Image>
            <h1 className={`${header_font.className} text-5xl`}>Courses To Calendar</h1>
            </div>
    )
}

// className={'${header_font.className}'}