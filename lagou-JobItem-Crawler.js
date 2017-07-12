const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');

let page = 1;

const options = function(){
    return {
        "hostname": "www.lagou.com",
        "method": "GET",
        "path": `/zhaopin/webqianduan/${ page }/?filterOption=3`,
        // filterOption是拉勾的筛选条件
        "headers": {
            // 请求报头域用于指定客户端接受哪些类型的信息
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:54.0) Gecko/20100101 Firefox/54.0",
            "Accept":"application/json, text/javascript, */*; q=0.01",
            // "Accept-Encoding":"gzip, deflate",
            "Accept-Language":"zh-CN,zh;q=0.8",
            "Referer": "https://www.lagou.com/zhaopin/webqianduan/"+page+"/?filterOption=3",
            "Cookie": "user_trace_token=20170709211259-b9e1a3d2-1d5c-49e6-ab40-fda00f3f3890; LGUID=20170709211641-d8e960fd-64a8-11e7-a6bd-5254005c3644; X_HTTP_TOKEN=367ed6dede9a870938b706391041adb7; JSESSIONID=ABAAABAACDBAAIAFA40C04D0208DD7C97A0160BAF7AEC9B; _gat=1; PRE_UTM=; PRE_HOST=; PRE_SITE=https%3A%2F%2Fwww.lagou.com%2Fzhaopin%2Fwebqianduan%2F3%2F%3FfilterOption%3D3; PRE_LAND=https%3A%2F%2Fwww.lagou.com%2Fzhaopin%2Fwebqianduan%2F3%2F%3FfilterOption%3D3; _putrc=4049A00D6579A3C5; login=true; unick=%E9%87%91%E6%B6%9B; showExpriedIndex=1; showExpriedCompanyHome=1; showExpriedMyPublish=1; hasDeliver=39; SEARCH_ID=917f7257f4af4606b69f881fdc8ad0bf; index_location_city=%E6%9D%AD%E5%B7%9E; _gid=GA1.2.332118856.1499606203; _ga=GA1.2.1578144323.1499606203; Hm_lvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1499606203,1499656639; Hm_lpvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1499735149; LGSID=20170711090543-10a11698-65d5-11e7-a6f6-525400f775ce; LGRID=20170711090545-11b4d95d-65d5-11e7-a749-5254005c3644",
            "Upgrade-Insecure-Requests": "1",
            "Pragma":"no-cache",
            "AlexaToolbar-ALX_NS_PH":"AlexaToolbar/alx-4.0.1"
        }
    };
}

let getResult = '';
let jobItem = [];

// 写入数据文件
function saveData(jobItemData) {
    fs.writeFile('jobItemData.txt', jobItemData, (err) => {
       if(err) {
        console.error(err);
        } else {
           console.log('写入成功');
        }
    });
}

// cheerio筛选信息 获取job号
function JobFilter(getResult) {
    let $ = cheerio.load(getResult);
    $('.item_con_list>li')
        .each(function() {
            // https://www.lagou.com/jobs/1792511.html
            jobItem.push($(this).attr('data-positionid'));
    });
    console.log(jobItem);
    console.log(options().path);
}


// 同步控制异步爬虫队列 Samehada 鲛肌  爬虫主函数
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

// 隔2秒执行爬虫
// for (var i = 1; i < 30; i++) {
//     setTimeout(function(){
//         Samehada();
//         let getResult = '';   // 清空sheerio
//         page++;
//         if (page == 30) {
//             console.log('还有最后一口～嗝～');
//             let jobItemData = jobItem.join(',');
//             saveData(jobItemData);
//         }
//     }, 2000*i);
// }

function syncSetTime() {
    return new Promise(function(resolve,reject){
        let syncSamehada = async() => {
            await Samehada();
        }
            setTimeout(function(){
                console.log(`第${page}次抓取`);
                resolve(syncSamehada());
            }, 1000);
    });
}

const eat = async() => {
    for (var i = 0; i < 30; i++) {
        await syncSetTime();
        page++;
        if (page > 30) {
            console.log('数据爬取完毕！嗝～');
            let jobItemData = jobItem.join(',');
            saveData(jobItemData);
        }
    }
}

eat();
