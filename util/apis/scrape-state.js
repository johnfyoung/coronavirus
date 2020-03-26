//import axios from "axios";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import moment from "moment";

import { logError, dbg } from "../tools";

const remoteURL = "https://www.doh.wa.gov/Emergencies/Coronavirus";

export default async () => {
  let result = null;
  try {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.goto(remoteURL);
    await page.waitForSelector(".contentmain");

    let scrapedBody = await page.$("body");
    const html = await scrapedBody.evaluate(
      body => body.innerHTML,
      scrapedBody
    );

    // this will hold the final scraped product
    const scrapedData = { lastUpdated: "", tables: {} };

    const $ = cheerio.load(html);
    const tables = $("table");

    // parse the last updated date time
    let updatedRaw = null;
    $("em")
      .not("caption em")
      .each(function() {
        if (
          $(this)
            .html()
            .includes("Updated")
        ) {
          updatedRaw = $(this).html();
        }
      });
    dbg("rawdate", updatedRaw);
    updatedRaw = updatedRaw
      .substr(11)
      .replace("at&#xA0;", "")
      .replace("p.m.", "pm")
      .replace("a.m", "am");
    dbg("unformatted date", updatedRaw);
    const updatedFormatted = moment(updatedRaw, "MMMM D, YYYY h:mm a").format(
      "YYYY-MM-DDTHH:mm:ss.000Z"
    );
    dbg("formatted date", updatedFormatted);
    scrapedData.lastUpdated = updatedFormatted;

    // parse each of the data tables
    tables.each((idx, el) => {
      const tblCaption = $("caption h3", el).html();
      scrapedData.tables[idx] = {};
      scrapedData.tables[idx].label = tblCaption;
      scrapedData.tables[idx].rows = [];
      const properties = [];
      $("thead tr", el).each((rowIndx, rowEl) => {
        $(rowEl)
          .children()
          .each((cellIdx, cellEl) => {
            properties.push($(cellEl).text());
          });
      });

      $("tbody tr", el).each((rowIndx, rowEl) => {
        const item = {};
        $(rowEl)
          .children()
          .each((cellIdx, cellEl) => {
            item[properties[cellIdx]] = $(cellEl).text();
          });
        scrapedData.tables[idx].rows.push(item);
      });
    });

    result = scrapedData;
    await browser.close();
  } catch (err) {
    logError(`Error retrieving page from WA State DOH: ${err}`);
  }

  return result;
};
