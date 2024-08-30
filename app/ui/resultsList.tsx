'use client';

import styles from "./resultsList.module.css";
import { GrAddCircle } from "react-icons/gr";
import { MdRemoveCircleOutline } from "react-icons/md";
import { FaRegBookmark } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa";
import { useContext, useRef, useEffect, useState } from "react";
import { AddedCoursesContext, SavedCoursesContext } from "@/app/lib/Contexts";
import { add_to_calendar, remove_from_calendar } from "@/app/lib/calendar";


export default function ResultsList(props) {
    const { added_courses, setAddedCourses } = useContext(AddedCoursesContext);
    const { saved_courses, setSavedCourses } = useContext(SavedCoursesContext);
    let addCount = useRef(0);
    let removeCount = useRef(0);
    const [awaiting, setAwaiting] = useState({});
    let calendar_update_inProgress = (Object.keys(awaiting).length > 0);


    async function clickAdd_handler(courseObj: object) {
        setAwaiting(courseObj);
        addCount.current = addCount.current + 1;
    }

    async function clickRemove_handler(crn: string) {
        let courseObj = added_courses[crn];
        setAwaiting(courseObj);
        removeCount.current = removeCount.current + 1;
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
            let courseObj = awaiting;
            courseObj = await add_to_calendar(courseObj);
            let updated_added_courses = {...added_courses};
            updated_added_courses[courseObj.crn] = courseObj;
            setAddedCourses(updated_added_courses);
            setAwaiting({});
        }

        if (Object.keys(awaiting).length > 0) {
            update_calendar();
            }

    }, [addCount.current]);

    useEffect(() => {
        async function update_calendar() {
            let courseObj = awaiting;
            await remove_from_calendar(courseObj);
            let updated_added_courses = {...added_courses};
            delete updated_added_courses[courseObj.crn];
            setAddedCourses(updated_added_courses);
            setAwaiting({});
        }

        if (Object.keys(awaiting).length > 0) {
            update_calendar();
            }

    }, [removeCount.current]);

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
                    {added_courses.hasOwnProperty(item.crn) ? <button onClick={()=>{clickRemove_handler(item.crn)}} disabled={calendar_update_inProgress}><MdRemoveCircleOutline /></button> :
                        <button onClick={()=>{clickAdd_handler(item)}} disabled={calendar_update_inProgress}><GrAddCircle /></button>}
                    {saved_courses.hasOwnProperty(item.crn) ? <button onClick={()=>{clickUnsave_handler(item.crn)}}><FaBookmark /></button> :
                        <button onClick={()=>{clickSave_handler(item)}}><FaRegBookmark /></button>}
                </div> )} )}
        </div>
    )
}
