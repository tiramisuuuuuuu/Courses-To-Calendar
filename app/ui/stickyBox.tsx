import styles from "./stickyBox.module.css";
import clsx from "clsx";
import { PiBookmarkSimpleDuotone } from "react-icons/pi";
import { FaRegCalendarMinus } from "react-icons/fa";
import { useContext, useRef, useEffect, useState } from "react";
import { AddedCoursesContext, SavedCoursesContext } from "@/app/lib/Contexts";
import { remove_from_calendar } from "@/app/lib/calendar";


function Box_Template({ children, header, courses_obj, click_handler, ...props }) {
    let updateCount = useRef(0);
    const [awaiting, setAwaiting] = useState("");

    function onClick_handler(crn: string) {
        updateCount.current = updateCount.current + 1;
        setAwaiting(crn);
    } 

    useEffect(() => {
        if (awaiting.length > 0) {
            click_handler(awaiting, setAwaiting);
            }

    }, [updateCount.current]);
    return (
        <div className={styles.box}>
            <p className={clsx(styles.header, props.header_bgColor, props.header_color)}>{header}</p>
            <div className={styles.content}>
                {Object.entries(courses_obj).map( ([crn, courseObj])=> { return (
                    <div key={crn.concat("_", header)} className={styles.entry}>
                        <div className="w-9/12 flex flex-col overflow-x-auto">
                            <p className="w-full text-left text-sm">{courseObj.crn.concat(" ", courseObj.course)}</p>
                            <p className="w-full text-left text-sm">{courseObj.title}</p>
                        </div>
                        <button onClick={()=>{onClick_handler(crn)}} disabled={( awaiting.length>0 )} className={clsx((awaiting.length==0) && "hover:text-yellow-800", (awaiting==crn) && "text-indigo-500")}>{children}</button>
                    </div> )} )}
            </div>
        </div>
    )
}


function SavedCourses() {
    const { saved_courses, setSavedCourses } = useContext(SavedCoursesContext);

    function unsave_course(crn, setAwaiting) {
        let updated_saved_courses = {...saved_courses};
        delete updated_saved_courses[crn];
        setSavedCourses(updated_saved_courses);
        setAwaiting("");
    }

    return (
        <Box_Template courses_obj={saved_courses} header="Saved Courses" header_bgColor="bg-blue-500"
            header_color="text-indigo-200" click_handler={unsave_course}>
            <PiBookmarkSimpleDuotone title="Click to Unbookmark" />
        </Box_Template>
    )
}

function AddedCourses() {
    const { added_courses, setAddedCourses } = useContext(AddedCoursesContext);

    async function remove_course(crn, setAwaiting) {
        let courseObj = added_courses[crn];
        await remove_from_calendar(courseObj);
        let updated_added_courses = {...added_courses};
        delete updated_added_courses[crn];
        setAddedCourses(updated_added_courses);
        setAwaiting("");
    }

    return (
        <Box_Template courses_obj={added_courses} header="Recently Added To Calendar" header_bgColor="bg-purple-500"
            header_color="text-purple-300" click_handler={remove_course}>
            <FaRegCalendarMinus title="Remove from Calendar" />
        </Box_Template>
    )
}

export default function StickyBox(props) {
    return (
        <div className={styles.main}>
            <SavedCourses />
            <AddedCourses />
        </div>
    )
}