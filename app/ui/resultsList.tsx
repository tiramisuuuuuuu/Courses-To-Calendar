'use client';

import styles from "./resultsList.module.css";
import clsx from "clsx";
import { FaRegCalendarPlus } from "react-icons/fa";
import { FaCalendarCheck } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa";
import { useContext, useRef, useEffect, useState } from "react";
import { AddedCoursesContext, SavedCoursesContext } from "@/app/lib/Contexts";
import { add_to_calendar } from "@/app/lib/calendar";


export default function ResultsList({ results_arr }) {
    return (
        <div>
            {results_arr.map( (item)=> { return (
                <Result key={item.crn.concat("_resultDiv")} item={item} /> )} )}
        </div>
    )
}


function Result({ item }) {
    const { added_courses, setAddedCourses } = useContext(AddedCoursesContext);
    const { saved_courses, setSavedCourses } = useContext(SavedCoursesContext);
    let addCount = useRef(0);
    const [awaiting, setAwaiting] = useState(false);


    async function clickAdd_handler(courseObj: object) {
        setAwaiting(true);
        addCount.current = addCount.current + 1;
    }

    async function clickSave_handler(courseObj: object) {
        let updated_saved_courses = {...saved_courses};
        updated_saved_courses[courseObj.crn] = courseObj
        setSavedCourses(updated_saved_courses);
    }

    async function clickUnsave_handler(crn: string) {
        let updated_saved_courses = {...saved_courses};
        delete updated_saved_courses[crn];
        setSavedCourses(updated_saved_courses);
    }

    
    useEffect(() => {
        async function update_calendar() {
            let courseObj = item;
            courseObj = await add_to_calendar(courseObj);
            if (Object.keys(courseObj).length > 0) {
                setAddedCourses((curr) => {return {[courseObj.crn]: courseObj, ...curr}});
            }
            setAwaiting(false);
        }

        if (awaiting) {
            update_calendar();
            }

    }, [addCount.current]);

    return (
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
            {added_courses.hasOwnProperty(item.crn) ? <div className={styles.bttn}><FaCalendarCheck className={styles.icon} /></div> :
                <button onClick={()=>{clickAdd_handler(item)}} disabled={awaiting} className={styles.bttn}>
                    <FaRegCalendarPlus className={clsx(styles.icon, !awaiting && "hover:text-yellow-800", awaiting && "text-gray-300")} /></button>}
            {saved_courses.hasOwnProperty(item.crn) ? <button onClick={()=>{clickUnsave_handler(item.crn)}} className={clsx(styles.bttn, "hover:text-yellow-800")}><FaBookmark className={styles.icon} /></button> :
                <button onClick={()=>{clickSave_handler(item)}} className={clsx(styles.bttn, "hover:text-yellow-800")}><FaRegBookmark className={styles.icon} /></button>}
        </div>
        )
}