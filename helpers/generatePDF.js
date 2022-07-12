const fs = require('fs')
// const path = require('path')
const puppeteer = require('puppeteer')
const handlebars = require('handlebars')

/* start of helpers for dealing with decimals */
handlebars.registerHelper('averageDecimal', (average) => {
  average = parseFloat(average).toFixed(2)
  return average
})

handlebars.registerHelper('scoreDecimal', (score) => {
  score = parseFloat(score).toFixed(1)
  return score
})
/* end of helpers for dealing with decimals */
const createPDF = async (data) => {
  const templateHtml = fs.readFileSync('./views/dosier.html', { encoding: 'utf8', flag: 'r' })
  const template = handlebars.compile(templateHtml)
  const html = template(data)

  // generate miliseconds to conctatenate to the pdf name to make it unique
  // let milis = new Date()
  // milis = milis.getTime()

  // const pdfPath = path.join('public/results', `results-${milis}.pdf`)
  // IF YOU UNCOMMENT THIS DONT FORGET TO CREATE RESULTS FOLDER IN PUBLIC FOLDER

  const options = {
    width: '1230px',
    headerTemplate: '<p></p>',
    footerTemplate: '<p></p>',
    displayHeaderFooter: false,
    margin: {
      top: '10px',
      bottom: '30px'
    },
    printBackground: true,
    format: 'A4'
    // path: pdfPath
  }

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  })

  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: 'networkidle0'
  })

  const pdf = await page.pdf(options)
  await browser.close()
  return pdf
}

module.exports = createPDF
