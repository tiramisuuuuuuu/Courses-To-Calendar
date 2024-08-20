'use server';

import puppeteer from 'puppeteer';


export async function search(search: string) {
  let _results_data = [];
  let crn_list = [];

  const results = await scrape_searchInput(search);
  if (results === undefined || results.length == 0) {
    console.log("No results yall")
    return null;
    }
  
  const num_results = results.length;
  for (let i=4; i<num_results; i++) {
    let result = results[i];
    let data_arr = reformat_result(result);
    push_result(_results_data, data_arr, crn_list);
    console.log("================== donezo");
    }
  return _results_data;
}

async function scrape_searchInput(search: string) {
    let _results = [];
    // Open headless browser and navigate to UCD course search website
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://registrar-apps.ucdavis.edu/courses/search/index.cfm');

    // Type into "Course or CRN" box
    await page.locator('input[name="course_number"]').fill(search);
    // Click on search button
    await page.click('input[name="search"]');

    // Ensure database requests or dynamic javascript has been loaded
    await page.waitForNetworkIdle();

    _results = await page.evaluate(() => {
      let results_arr = []
      const results_table = document.querySelector('table#mc_win');
      if (results_table) {
        const results = results_table.querySelectorAll('tr');
        Array.from(results).map(result => results_arr.push(result.innerHTML));
        }
      return results_arr;
      });
    
    await browser.close();

    return _results;
}

function reformat_result(text: string) {
  let result = [];
  text = remove_tags(text);
  while (text.search("\n") != -1) { // remove excess newlines
    let index = text.search("\n");
    let line = text.substring(0, index);
    line.trim();
    if (line.length != 0) {
      result.push(line);
      }
    text = text.substring(index+1);
    }
  return result;
}

function remove_tags(text: string) {
  let result = "";
  while (text.search("<") != -1) {
    let start_index = text.search("<");
    let data = text.substring(0, start_index);
    data = data.trim();
    result = result.concat(data, "\n");
    text = text.substring(start_index);
    let end_index = text.search(">");
    text = text.substring(end_index+1);
  }
  result = result.concat(text);
  return result;
}

function push_result(results_list, data, crn_list) {
  let crn = data[0];
  if (crn in crn_list) {
    let index = crn_list.indexOf(crn);
    let result = results_list[index];
    let timing_add = data[1];
    let location_add = data[3];
    
    result.timing.push(timing_add);
    result.location.push(location_add);
    return;
    }

  let extracted_data = {
    crn: data[0],
    timing: [data[1]],
    course: data[2],
    location: [data[3]],
    title: data[6],
    instructor: data[8],
    }
  
  results_list.push(extracted_data);
  crn_list.push(crn);
  return;
}