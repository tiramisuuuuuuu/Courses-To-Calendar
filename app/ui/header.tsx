'use client';

import Image from "next/image";
import styles from "./header.module.css";
import { header_font } from "@/app/ui/fonts";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
    const curr_path = usePathname();
    const { data: session, status } = useSession();
    
    return (
        <div className="relative flex flex-col items-center bg-gray-100 border-2">
            <Image src="/logo.PNG" alt="Cow builder logo" width="160" height="192"></Image>
            <h1 className={`${header_font.className} text-5xl`}>Courses To Calendar</h1>
            {curr_path=='/dashboard' && 
                (status=='authenticated' ? <div className={styles.div_login}>
                    <p>Welcome</p>
                    <button onClick={() => {signOut()}}>Sign Out</button></div> : 
                <div className={styles.div_login}>
                    <button onClick={() => {signIn('google')}}>Sign In With Google</button></div>)}
            </div>
    )
}