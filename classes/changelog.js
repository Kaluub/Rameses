import puppeteer from "puppeteer";
const browser = await puppeteer.launch();

class Changelog {
    static cache = null;

    static async updateChangelog() {
        // Open new page
        const page = await browser.newPage();
        const response = await page.goto("https://evades.io/");
        if(!response.ok()) return null;

        await page.waitForSelector(".changelog");

        // Get text from latest changelog entry
        const elementArray = await page.$$('.changelog-section');
        const data = await elementArray[0].evaluate(e =>{
            let res = {title: "", content: []};
            res.title = e.querySelector(".changelog-section-header").innerText; // Usually a date
            res.content = [...e.querySelectorAll(".changelog-change-list > li")].map(e => e.innerText); // Rest of changelog in list format
            return res;
        });
        // Store it to cache
        Changelog.cache = data;
    }
}

export default Changelog;