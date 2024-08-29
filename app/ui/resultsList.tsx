'use client';

import styles from "./resultsList.module.css";
import { useContext } from "react";
import { AddedCoursesContext, SavedCoursesContext } from "@/app/lib/Contexts";
import { add_to_calendar } from "@/app/lib/calendar";



export default function ResultsList(props) {
    const { added_courses, setAddedCourses } = useContext(AddedCoursesContext);
    const { saved_courses, setSavedCourses } = useContext(SavedCoursesContext);

    async function onClick_handler(courseObj: object) {
        setAddedCourses(["parden"]);
        await add_to_calendar(courseObj);
    }

    return (
        <div>
            {props.results.map( (item)=> { return (
            <div key={item.crn} className={styles.result}>
                <div className={styles.result_data}>

                    <div className={styles.result_main}>
                        <div className="w-3/10 text-sm italic font-medium">CRN: {item.crn}</div>
                        <div className="w-4/10 leading-4">
                            {item.course}
                            <br />{item.title}</div>
                        <div className="w-3/10 leading-4 text-base font-thin">
                            Instructor:
                            <br/>{item.instructor}</div>
                        </div>

                    <div className={styles.result_more_details}>
                        {item.timing.map( (time, index) => {
                            return (
                            <div key={item.crn.concat(time)} className={styles.time_loc_pair}>
                                <p className={styles.more_details}>{time}</p>
                                <p className={styles.more_details}>{item.location[index]}</p></div> )} )}
                        </div>

                    </div>
                    <button onClick={()=>{onClick_handler(item)}}>Click here</button>
                </div> )} )}
        </div>
    )
}
