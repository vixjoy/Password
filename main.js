const puppeteer = require('puppeteer');
        
async function run() {
    var args = process.argv.slice(2);
    target_url = args[0]
    // cookies = args[1].toString()
    // console.log(cookies)
    const browser = await puppeteer.launch(
        {
            headless: false
        });
    const page = await browser.newPage();
    // await page.setCookie(cookies)
    // await page.setCookie({ 
    //  'name': 'PHPSESSID',
    //  'domain': '192.168.221.142',
    //  'path': '/', 
    //  'last accessed on': 'Wed, 07 Feb 2018 20:38:20 GMT',
    //  'value': 'n5ut009g7pla6ho77765i1ut12',
    //  'httponly': 'false'});
    // await crawl(target_url, page)
    await page.goto(target_url)
    // await getAllForms(page)
    await detectAlerts(page)
}
async function crawl(target_url, page) {
    const hostname = await getHostName(target_url)
    await page.goto(target_url)
    var uniq_links = new Set()
    var not_visited_links = Array.from(uniq_links)
    console.log(not_visited_links)
    not_visited_links.push(target_url)
    uniq_links.add(target_url)
    while (not_visited_links.length > 0) {
        const curr_link = not_visited_links.shift()
        console.log('visiting ' + curr_link)
        await page.goto(curr_link)
        
        var links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(
                link => link.href
            );
        });
        links = Array.from(new Set(links))
        links.forEach( function(element) {
            if (!uniq_links.has(element) && isInScope(hostname, element)) {
                uniq_links.add(element)
                not_visited_links.push(element)
                console.log("adding " + element)
            }
        });
    }
    console.log(uniq_links);
}
function getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
    }
    else {
        return null;
    }
}
function isInScope(hostname, url) {
    var result = (getHostName(url) == hostname)
    // console.log("result " + result)
    return result
}
async function detectAlerts(page) {
    // Nav to the page that is displaying the alerts
    // await page.goto(vuln_url)
    page.on('dialog', async dialog => {
        console.log("XSS Detetched! I repeat: XSS Detected");
        await dialog.dismiss();
    });
}
async function getAllForms(page) {  
    var forms = await page.evaluate(() => {
        for (var i = 0; i < document.forms.length; ++i) {
            for(var j = 0; j < document.forms[i].length; ++j) {
                document.forms[i][j].value = "<script>alert('1')</script>"
            }
        }
        forms = 1
        return forms
    });
    // page.XSSForms = forms
    // console.log(page);
    // editFormValue(page, 0,1,"<script>alert(1)</script>")
    // while(document)
    // var k = 0;
    // for (var i = 0; i < page.XSSForms.length; i++) {
    //  var form = page.XSSForms[i];
    //  console.log("here");
    //  for (var j = 0; j < form.length; j++) {
    //      page.XSSForms[i][j] = k++;
    //  }
    // }
    // page.XSSForms[0][0] = "lol"
    // console.log(page.XSSForms[0])
    
    // console.log(page.XSSForms)
}
// This function can be written to work for forms on different pages.
// It makes no sense to do that though.
async function editFormValue(formNumber, inputNumber, value) {
    await page.evaluate(() => {
        document.forms[formNumber][inputNumber] = value
    });
    
}
run(); 
