'use client';

import styles from "./page.module.css";
import { CiSearch } from "react-icons/ci";
import { useState, useRef, useEffect } from "react";
import { search } from "@/app/lib/search";

function Results_List(props) {
    return (
        <div></div>
    )
}

export default function Page() {
    const [curr_search, setCurrSearch] = useState(""); // search term connected to the established search results currently loaded on the page
    let search_results = useRef([]); // holds all search-result data objects
    const [awaiting, setAwaiting] = useState(""); // queues search term currently being queried on server
    let updateCount = useRef(0);
    
    
    function input_handler(e) {
        if (e.key=='Enter') {
            let input = e.currentTarget.value;
            input = input.trim();
            if (input.length > 0 && input != curr_search) {
                setAwaiting(input);
                updateCount.current = updateCount.current + 1;
                }
            }
    }

    function click_clear() {
        setAwaiting("");
        setCurrSearch("");
        search_results.current = [];
    }


    let loading = (awaiting.length > 0);

    useEffect(() => {
        async function retrieve_search() { 
            console.log(awaiting);
            search_results.current = await search(awaiting);
            setCurrSearch(awaiting);
            setAwaiting("");
        }

        if (awaiting.length > 0) {
            retrieve_search();
            }
    }, [updateCount.current]);

    return (
        <main className="flex flex-col items-center">
            <p className="w-5/6 mt-5 mb-24">Dashboard</p>
            <div className={styles.div_search}>
                <input className={styles.search_box} name="search-input" placeholder="Enter course code/CRN" onKeyDown={(e)=>{input_handler(e)}}></input>
                <CiSearch className={styles.search_icon} /></div>
            <div onClick={() => {click_clear()}} >Clear</div>
            {loading && <div>Loading course results...</div>}
            <Results_List results={search_results} />
        </main>
    )
}
//search by the crn of the course