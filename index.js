const puppeteer = require('puppeteer');
const data = require('./data.json');
const https = require('https')
const defaultBrowserless = "ws://browserless:3000"
const barkToken = process.env.BARKTOKEN;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const browserless = process.env.BROWSERLESS
if (barkToken) {
    console.log('bark notification enable')
} else {
    console.log('bark notification disable')
}
if (!browserless) {
    console.log("use default browserless address:", defaultBrowserless);
    browserless = defaultBrowserless
}
if (username && password) {
    (async () => {
        // const browser = await puppeteer.launch();
        const browser = await puppeteer.connect({
            browserWSEndpoint: browserless,
        });
        const page = await browser.newPage();
        // login 
        await page.goto('https://app.upc.edu.cn/ncov/wap/default/index').catch(handleError);
        await page.type('input[placeholder="数字石大工号"]', username).catch(handleError)
        await page.type('input[placeholder="数字石大密码"]', password).catch(handleError)
        await page.click('.btn').catch(handleError)

        await page.waitForNavigation()
        page.on("console", msg => { console.log(msg) })
        const hasFlag = await page.evaluate(() => { return vm.hasFlag }).catch(handleError)
        if (hasFlag != 1) {
            // not fill today
            console.log("start post")
            await page.evaluate((res) => { vm.locatComplete(res); vm.hasFlag = 0 }, data).catch(handleError)
            await page.click('.footers a').catch(handleError)
            // await page.click('.wapcf-btn.wapcf-btn-qx') // click cancel for test
            await page.click('.wapcf-btn.wapcf-btn-ok', { delay: 1000 }).catch(handleError)// TODO is this delay config needed?
        } else {
            console.log("table has been fill totay")
        }
        await page.screenshot({ path: 'example.png', fullPage: true }).catch(handleError);

        await browser.close();
    })();
} else {
    console.log("need environment 'USERNAME' and 'PASSWORD'")
}

function barkNotification(message, token) {
    if (!barkToken) {
        return
    }
    const title = "疫情防控通"
    const url = `https://api.day.app/${token}/${title}/${message}?isArchive=0`;
    https.get(url, res => {
        if (res.statusCode == 200) {
            console.log(`send bark message '${message}' to ${token}'`)
        }
    }).on("error", err => {
        console.log(err);
    })
}

function handleError(err) {
    console.error(error)
    barkNotification(error, barkToken)
}