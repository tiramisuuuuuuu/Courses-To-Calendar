'use client';

import { CiSearch } from "react-icons/ci";
import { scrape_searchInput } from "@/app/lib/search";

export default function Page() {
    function input_handler(e) {
        if (e.key=='Enter') {
            console.log(e.currentTarget.value);
            scrape_searchInput(e.currentTarget.value); 
            console.log("finished search heehaw");       
            }
    }

    return (
        <main className="flex flex-col items-center">
            <p className="w-5/6 mt-5 mb-24">Dashboard</p>
            <div>
                <input name="search_input" placeholder="Enter course code/CRN" onKeyDown={(e)=>{input_handler(e)}}></input>
                <CiSearch /></div>
        </main>
    )
}
//search by the crn of the course