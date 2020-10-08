const axios = require("axios");
const emailValidator = require('email-validator');
const fs = require("fs");
const { JSDOM } = require("jsdom");
class Scraper {
  static dangerDomains = [
    "loan",
    "work",
    "biz",
    "racing",
    "ooo",
    "life",
    "ltd",
    "png",
  ];
  static emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  static DOM = null;
  static internalLinks = new Set();

  constructor(url) {
    this.url = url;
    this.dangerEmails = new Set();
    this.validatedEmails = new Set();
  }

  async executeScraper() {
    const fetchedData = await this.fetchUrlAndGetDom(this.url);
    const links = await this.findInternalLinks();
    const emails = await this.fetchInternalLinks([...Scraper.internalLinks]);
    const toValidateEmails = this.createEmailsArray([...emails])
    const validated = this.validateEmails(toValidateEmails);

    await this.writeFile(validated);
  }
  async fetchUrlAndGetDom(url) {
    try {
      const { status, data } = await axios(url);
      switch (status) {
        case 200:
          Scraper.DOM = await new JSDOM(await data);
          let dades = this.findEmails();
          return dades;
          break;
        case 404:
          return process.exit(1);
          break;
      }
    } catch (error) {
      console.log(error);
      return process.exit(1);
    }
  }
  async fetchInternalLinks(internalLinks) {
    const result = await Promise.all(
      internalLinks.map((link) => {
        return this.fetchUrlAndGetDom(`${this.url}${link}`);
      })
    );
    return result;
  }
  findInternalLinks() {
    const body = Scraper.DOM.window.document.body;
    const links = body.querySelectorAll('a[href^="/"]');

    [...links].map((link) =>
      Scraper.internalLinks.add(link.getAttribute("href"))
    );
  }
  findEmails() {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    let html = Scraper.DOM.window.document.body.innerHTML;

    return html.toString().match(emailRegex);
  }

  validateEmails(emails) {
    const isEmails = emails
                  .filter(email => emailValidator.validate(email))
                  .filter(email => {
                    let domainName = email.split("@")[1].split(".")[1];
                      if (Scraper.dangerDomains.includes(domainName)) {
                          this.dangerEmails.add(email);
                          return false;
                      }else return true;
                  })
    return new Set(isEmails);
  }
  createEmailsArray(emails){
    const toValidateEmails = [];
    const newEmails = emails.filter(el => el !== null);

    newEmails.map(el => {
      el.map(el =>toValidateEmails.push(el))
    });

    return toValidateEmails;
  }
  async writeFile(validated) {
    return new Promise((resolve, reject) => {
      fs.writeFile("./emails.txt", Array.from(validated), (err) => {
        if (err) reject("Could not write file");
        resolve("success");
      });
    });
  }
}

module.exports = Scraper;
