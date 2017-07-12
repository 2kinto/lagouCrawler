const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');

// 爬取职位详情

let jobData = [];
let getResult = '';
let count = 1;

// 文件读取是异步 所以需要异步控制 否则可能jobNums获取不到
function asyncRead() {
    return new Promise( (resolve,reject) => {
        fs.readFile('jobItemData.txt', (err, data) => {
              if (err) {
                 return console.error(err);
              }
              let jobNums =  data.toString().split(',');
              setTimeout(() => {
                  resolve(jobNums);     // 这里只能这么写 否则外部无法访问jobNums
              }, 1000)
        });
        //   console.log(`异步读取文件数据: ${ jobNums }`);
    })
}

asyncRead()
    .then(
        (jobNums) => {
            let i = 1;
            let jobNumsCopy = jobNums; //这里必须要拷贝一份 否则里面获取不到
            let interval = setInterval(function() {
                console.log(`第${i}条数据`);
                requestData(jobNumsCopy[i]);
                i++;
                if (i == 450) {
                    clearInterval(interval);
                }
            }, 100);
        }
    );

function requestData(jobNum) {
    const options = function(){
        return {
            "hostname": "www.lagou.com",
            "method": "GET",
            "path": `/jobs/${ jobNum }.html`,
            "headers": {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:54.0) Gecko/20100101 Firefox/54.0",
                "Accept":"application/json, text/javascript, */*; q=0.01",
                // "Accept-Encoding":"gzip, deflate",
                "Accept-Language":"zh-CN,zh;q=0.8",
                "Referer": "https://www.lagou.com/jobs/2614451.html",
                "Cookie": "user_trace_token=20170709211259-b9e1a3d2-1d5c-49e6-ab40-fda00f3f3890; LGUID=20170709211641-d8e960fd-64a8-11e7-a6bd-5254005c3644; X_HTTP_TOKEN=367ed6dede9a870938b706391041adb7; JSESSIONID=ABAAABAACDBAAIAFA40C04D0208DD7C97A0160BAF7AEC9B; _gat=1; PRE_UTM=; PRE_HOST=; PRE_SITE=https%3A%2F%2Fwww.lagou.com%2Fzhaopin%2Fwebqianduan%2F3%2F%3FfilterOption%3D3; PRE_LAND=https%3A%2F%2Fwww.lagou.com%2Fzhaopin%2Fwebqianduan%2F3%2F%3FfilterOption%3D3; _putrc=4049A00D6579A3C5; login=true; unick=%E9%87%91%E6%B6%9B; showExpriedIndex=1; showExpriedCompanyHome=1; showExpriedMyPublish=1; hasDeliver=39; SEARCH_ID=917f7257f4af4606b69f881fdc8ad0bf; index_location_city=%E6%9D%AD%E5%B7%9E; _gid=GA1.2.332118856.1499606203; _ga=GA1.2.1578144323.1499606203; Hm_lvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1499606203,1499656639; Hm_lpvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1499735149; LGSID=20170711090543-10a11698-65d5-11e7-a6f6-525400f775ce; LGRID=20170711090545-11b4d95d-65d5-11e7-a749-5254005c3644",
                "Upgrade-Insecure-Requests": "1",
                "Pragma":"no-cache",
                "AlexaToolbar-ALX_NS_PH":"AlexaToolbar/alx-4.0.1"
            }
        };
    }

    // 写入数据文件
    function saveData(jobItemData) {
        fs.writeFile('job.json', jobItemData, (err) => {
           if(err) {
            console.error(err);
            }
        });
    }

    // 筛选信息 获取job号
    function JobFilter(getResult) {
        let $ = cheerio.load(getResult);

        const company = $('.company').text();
        const salary = $('.salary').text();
        const city = $('.job_request span:nth-child(2)').text();
        const exp = $('.job_request span:nth-child(3)').text();
        const edu = $('.job_request span:nth-child(4)').text();

        function JobInfo(company, city, salary, edu, exp) {
            this.company = company;
            this.city = city;
            this.salary = salary;
            this.edu = edu;
            this.exp = exp;
        }

        jobData.push(new JobInfo(company, city, salary, edu, exp));
        saveData(JSON.stringify(jobData));
        console.log(jobData);
    }
    // 同步控制异步爬虫队列 Samehada 鲛肌  爬虫函数
    function Samehada() {
        return new Promise(function(resolve,reject){
            (function() {
                const req = https.request((options)(), (res) => {
                    // console.log(`状态码: ${ res.statusCode }`);
                    // console.log(`请求头: ${ res.headers }`);
                    res.setEncoding('utf8');
                    res.on('data', (data) => {
                        getResult += data;
                    })
                    console.log(options().path);
                    res.on('end', () => {
                        JobFilter(getResult);
                        resolve();
                        getResult = '';     // 这里必须清空DOM
                    })
                });

                req.on('error', function(err) {
                    reject('爬虫被踩死啦');
                });

                req.end();
            })();
        })
    }

// 爬虫函数也是异步的 这里用到了async/wait 等待promise决议

    function syncSetTime() {
        return new Promise(function(resolve,reject){
            let syncSamehada = async() => {
                await Samehada();       //await阻塞了代码执行
            }
                setTimeout(function(){   //为了不被拉勾封id 所以要限制请求时间 所以 嵌套了两层Promise
                    // console.log(`第${count++}次抓取`);
                    resolve(syncSamehada());
                }, 1000);
        });
    }

    const eat = async() => {
            await syncSetTime();
    }

    eat();

}
