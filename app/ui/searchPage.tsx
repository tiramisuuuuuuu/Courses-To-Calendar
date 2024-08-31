'use client';

import styles from "./searchPage.module.css";
import { CiSearch } from "react-icons/ci";
import { TfiTruck } from "react-icons/tfi";
import ResultsList from "./resultsList";
import { useState, useRef, useEffect, useContext } from "react";
import { search } from "@/app/lib/search";



export default function SearchPage() {
    let updateCount = useRef(0);
    const [curr_search, setCurrSearch] = useState(""); // search term connected to the established search results currently loaded on the page
    let search_results = useRef([]); // holds all search-result data objects
    const [awaiting, setAwaiting] = useState(""); // queues search term currently being queried on server
    let is_search_inProgress = (awaiting.length > 0);

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
    
    function input_handler(e) {
        if (e.key=='Enter') {
            let input = e.currentTarget.value;
            input = input.trim();
            if (input.length > 0 && !(awaiting && input == curr_search)) {
                setAwaiting(input);
                updateCount.current = updateCount.current + 1;
                }
            }
    }

    function click_clear() {
        setAwaiting("");
        setCurrSearch("");
        search_results.current = [];
        updateCount.current = 0;
    }

    return (
        <div className="flex flex-col items-center">
            <div className={styles.div_search}>
                <input className={styles.search_box} name="search-input" placeholder="Enter course code/CRN" onKeyDown={(e)=>{input_handler(e)}}></input>
                <button onClick={() => {click_clear()}} className="text-sm text-blue-600" >Clear</button>
                <CiSearch className={styles.search_icon} /></div>
            {is_search_inProgress && <div className={styles.loading}>
                <p>Loading course results...</p>
                <TfiTruck className="animate-bounce" /></div>}
            {(updateCount.current != 0 && search_results.current.length == 0 && !awaiting) && <div className="border border-solid border-yellow-500 bg-yellow-300">
                <p>No results found. Please refine your search</p>
                <p className="text-sm">Note: this may be an error, try this search again, if you believe so</p></div>}
            <ResultsList results_arr={search_results.current} />
        </div>
    )
}