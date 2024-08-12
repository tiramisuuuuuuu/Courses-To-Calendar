'use server';

import puppeteer from 'puppeteer';

export async function scrape_searchInput(search: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://registrar-apps.ucdavis.edu/courses/search/index.cfm');

    // Type into "Course or CRN" box
    await page.locator('input[name="course_number"]').fill(search);
    // Click on search button
    await page.click('input[name="search"]');

    // Ensure database requests or dynamic javascript has been loaded
    await page.waitForNetworkIdle();
    
    const results_table = await page.evaluate(() => {
        const dynamicElement = document.querySelector('table[id="mc_win"]');
        return dynamicElement ? dynamicElement.innerHTML : 'Element not found';
      });

    console.log(results_table);

    await browser.close();
}