'use client';

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import styles from "./page.module.css";
import { FcGoogle } from "react-icons/fc";
import clsx from "clsx";


export default function Page() {
  const [signIn_bttn, disable_signIn_bttn] = useState(true);

  function click_signIn() {
    signIn('google', {callbackUrl: "/dashboard"});
    disable_signIn_bttn(false);
    }

  return (
    <main className="flex flex-col items-center">
      <p className="w-5/6 mt-5 mb-24">Welcome to Courses To Calendar, a web app designed for UC Davis students to add (and more) 
      their UCD course schedule to their Google Calendars within a few clicks. Connect your Google account below to get started.</p>
      <button className={clsx(styles.bttn, signIn_bttn && "hover:bg-sky-700", signIn_bttn ? styles.clickable: styles.disabled)} onClick={()=>{click_signIn()}} disabled={!signIn_bttn}>
        <FcGoogle style={{fontSize: "2.2rem"}} />
        <p style={{fontSize: "1.2rem"}} >Continue with Google</p></button>
      {!signIn_bttn && <p className="w-1/5 text-xs text-center mt-4">(Please give the signIn a minute to load)</p>}
    </main>
  );
}
