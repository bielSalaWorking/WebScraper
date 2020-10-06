const axios = require('axios');
const fs = require('fs')
const {JSDOM} = require('jsdom');

class Scrapper {

  static dangerDomains = ['loan','work','biz','racing','ooo','life','ltd'];
  static emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  static domObject = null;

  constructor(url){
    this.url = url;
    this.emails = new Set();
    this.dangerEmails = new Set();
  }
  async executeScrapper() {

      const fetchedData = await this.fetchUrl();
      const emailsInDom = await this.searchForEmails();

      this.addEmails(emailsInDom);
      this.validateEmails();
      await this.writeFile();

      return this.emails
  }
  async fetchUrl(){
    try {
      const response = await axios(this.url);
      if(response.status === 200) {
        const htmlData = await response.data;

        return Scrapper.domObject = new JSDOM(htmlData);
      }
      else if(response.status === 404) {
        console.log('this page doesnt exists')
        return process.exit(1);
      }
    } catch (error) {
        console.log(error)
        return process.exit(1);
    }
   }
 searchForEmails(){
   let emailsInDom = Scrapper.domObject.window.document.body.innerHTML;
   let emails = emailsInDom
                 .toString()
                 .match(Scrapper.emailRegex);

   if(emails == null) {
     console.log('this page dont have any email')
     return process.exit(1)
   }
   return emails
  }
  validateEmails(){
    const validatedEmails = Array
                        .from(this.emails)
                        .filter(email => {
       let domainName = email
                        .split('@')[1]
                        .split('.')[1];
       if(Scrapper.dangerDomains.includes(domainName)){
         this.dangerEmails.add(email);
         this.emails.delete(email);
       }
       else return email;
   });
  }
  async writeFile(){
    return new Promise((resolve, reject) => {
      fs.writeFile('./emails.txt', Array.from(this.emails), err => {
        if (err) reject('Could not write file');
        resolve('success');
      });
    });
  }
  addEmails(emailsInDom){
    emailsInDom.filter(el => this.emails.add(el))
  }
}
module.exports = Scrapper;
