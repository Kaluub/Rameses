import puppeteer from "puppeteer";
import Config from "./config.js";

class GameChangelog {
    static cache = null;

    static async updateChangelog() {
        // Open new page.
        const browser = await puppeteer.launch({ executablePath: Config.CHROMIUM_EXECUTABLE, headless: true });
        const page = await browser.newPage();
        const response = await page.goto("https://evades.io/");
        if (!response.ok()) return null;

        await page.waitForSelector(".changelog");

        // Get all changelogs
        const data = [];
        const elementArray = await page.$$('.changelog-section');
        for (const element of elementArray) {
            data.push(await element.evaluate(e => {
                let res = { title: "", content: [] };
                res.title = e.querySelector(".changelog-section-header").innerText; // Usually a date.
                res.content = [...e.querySelectorAll(".changelog-change-list > li")].map(e => e.innerText); // Rest of changelog in list format.
                return res;
            }));
        };
        // Store it to cache.
        GameChangelog.cache = data;
        browser.close();
    }
}

export default GameChangelog;