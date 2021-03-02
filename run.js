const axios = require("axios");
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

axiosCookieJarSupport(axios);

let run = async function (cookieJar,param) {
    if (!(await check(cookieJar,param))) return '需要登录';
    var resp = await axios.get('https://gkdworld.xyz/plugin.php?id=k_misign:sign', {
        jar: cookieJar, // tough.CookieJar or boolean
        withCredentials: true, // If true, send cookie stored in jar
    });
    if (/您的签到排名/.test(resp.data)) return '重复签到';
    let result = resp.data.match(/<a id="JD_sign" href="(.*?)"/);
    if (result == null) throw 'Not found JD_sign';
    var resp1 = await axios.get('https://gkdworld.xyz/' + result[1], {
        jar: cookieJar, // tough.CookieJar or boolean
        withCredentials: true, // If true, send cookie stored in jar
    });
    if (/今日已签/.test(resp1.data)) return '重复签到';
    if (/需要先登录/.test(resp1.data)) throw '需要登录';
    var resp2 = await axios.get('https://gkdworld.xyz/plugin.php?id=k_misign:sign', {
        jar: cookieJar, // tough.CookieJar or boolean
        withCredentials: true, // If true, send cookie stored in jar
    });
    if (/您的签到排名/.test(resp2.data)) {
        // let result = resp2.data.match(/class="hidnum" id="lxreward" value="(.*?)"/);
        return '签到成功';
    } else throw '未成功签到';
};

let check = async function (cookieJar,param) {
    let resp = await axios.post(
        'https://gkdworld.xyz/member.php?mod=logging&action=login&loginsubmit=yes&infloat=yes&lssubmit=yes&inajax=1',
        `username=${param.name}&cookietime=2592000&password=${param.pwd}&quickforward=yes&handlekey=ls`
        , {
            jar: cookieJar, // tough.CookieJar or boolean
            withCredentials: true, // If true, send cookie stored in jar
        });
    return !/登录失败/.test(resp.data);
};
async function test(dd){
    for(let item of dd){
        let cookieJar = new tough.CookieJar();
        let rr = await run(cookieJar,item)
        console.log(item.name,rr)
    }
}
let dd =JSON.parse(process.env.COOKIESET)
test(dd)
