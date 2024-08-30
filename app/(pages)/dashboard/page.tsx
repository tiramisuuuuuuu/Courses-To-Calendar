'use client';

import styles from "./page.module.css";
import SearchPage from "@/app/ui/searchPage";
import StickyBox from "@/app/ui/stickyBox";
import { useState } from "react";
import { AddedCoursesContext, SavedCoursesContext } from "@/app/lib/Contexts";


export default function Page() {
    const [added_courses, setAddedCourses] = useState({});
    const [saved_courses, setSavedCourses] = useState({});

    return (
        <main className="flex flex-col items-center">
            <p className="w-5/6 mt-5 mb-24">Dashboard</p>
            <AddedCoursesContext.Provider value={{ added_courses, setAddedCourses }}>
                <SavedCoursesContext.Provider value={{ saved_courses, setSavedCourses }}>
                    <SearchPage />
                    <StickyBox />
                </SavedCoursesContext.Provider>
            </AddedCoursesContext.Provider>
        </main>
    )
}