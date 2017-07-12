const fs = require('fs');

let salary = [];
let exp = [];
let edu = [];
let jobData = '';

// 如何统计匹配的字符串
function statistics(text,condition) {
    let firstLength = text.length;
    let nowLength = text.replace(new RegExp((condition),'gm'), '').length;
    let filterSalary  = (firstLength - nowLength) / 4;
    return filterSalary;
}

function slaryStatistics(salary) {
    // 这里有许多 8k-15k 18k 16k 13k 50k 60k 等等的大于10k的薪资
    // 可以用正则一次性拿到所有关键字再相加
    let tenPlus = statistics(salary, '10k-');
    let twelvePlus = statistics(salary, '12k-');
    let fifteenPlus = statistics(salary, '15k-');
    let twentyPlus = statistics(salary, '20k-');
    let twentyFivePlus = statistics(salary, '25k-');
    let thirtyPlus = statistics(salary, '30k-');

    console.log(`******薪资******`);
    console.log(`10k以上 ${ tenPlus } 个岗位`);
    console.log(`12k以上 ${ twelvePlus } 个岗位`);
    console.log(`15k以上 ${ fifteenPlus } 个岗位`);
    console.log(`20k以上 ${ twentyPlus } 个岗位`);
    console.log(`25k以上 ${ twentyFivePlus } 个岗位`);
    console.log(`30k以上 ${ thirtyPlus } 个岗位`);
}

function eduStatistics(edu) {
    let ben = statistics(edu, '本科及以');
    let zhuan = statistics(edu, '大专及以');
    let buxian = statistics(edu, '学历不限')

    console.log(`******学历要求******`);
    console.log(`本科及以上 ${ ben } 个岗位`);
    console.log(`大专及以上 ${ zhuan } 个岗位`);
    console.log(`不限学历 ${ buxian } 个岗位`);
}

function expStatistics(exp) {
    let noExp = statistics(exp, '经验不限');
    let oneTo3 = statistics(exp, '1-3年');
    let threeTo5 = statistics(exp, '3-5年');
    let fiveTo10 = statistics(exp, '5-10');

    console.log(`******工作年限******`);
    console.log(`经验不限 ${ noExp } 个岗位`);
    console.log(`1-3年 ${ oneTo3 } 个岗位`);
    console.log(`3-5年 ${ threeTo5 } 个岗位`);
    console.log(`5-10年 ${ fiveTo10 } 个岗位`);
}

// 异步读取json文件
function asyncRead() {
    return new Promise( (resolve,reject) => {
        fs.readFile('job.json', (err, data) => {
              if (err) {
                 return console.error(err);
              }
              let jobStatistics =  JSON.parse(data.toString().split(','));
              setTimeout(() => {
                  resolve(jobStatistics);     // 这里只能这么写 否则外部无法访问jobNums
              }, 1000)
        });
        //   console.log(`异步读取文件数据: ${ jobNums }`);
    })
}

// 通过promise 管理异步 获取文件数据
asyncRead()
    .then(
        (jobStatistics) => {
            for (var i = 0; i < jobStatistics.length; i++) {
                salary.push(jobStatistics[i].salary);
                exp.push(jobStatistics[i].exp);
                edu.push(jobStatistics[i].edu);
            }

            let data = {
                salary : salary.join(','),
                exp : exp.join(','),
                edu : edu.join(',')
            }

            slaryStatistics(data.salary);
            eduStatistics(data.edu);
            expStatistics(data.exp);
        }
    );
