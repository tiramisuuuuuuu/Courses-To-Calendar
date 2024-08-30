import { createContext } from "react";

export const AddedCoursesContext = createContext({
    added_courses: {},
    setAddedCourses: (object) => {}
})

export const SavedCoursesContext = createContext({
    saved_courses: {},
    setSavedCourses: (object) => {}
})