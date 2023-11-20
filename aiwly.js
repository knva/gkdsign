const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");

axiosCookieJarSupport(axios);
var baseUrl = "bbs.ai-thinker.com";
let run = async function (cookieJar, param) {
  if (!(await check(cookieJar, param))) return "您尚未登录";
  //访问 http://bbs.ai-thinker.com/plugin.php?id=dc_signin 获得formhash
  let respx = await axios.get(`http://${baseUrl}/plugin.php?id=dc_signin`, {
    jar: cookieJar, // tough.CookieJar or boolean
    withCredentials: true, // If true, send cookie stored in jar
  });
  //获取formhash
  let formhash = respx.data.match(/name="formhash" value="(.*?)"/)[1];
  console.log(formhash);

  //post Content-Type: application/x-www-form-urlencoded
  var data = {
    formhash: formhash,
    signsubmit: "yes",
    handlekey: "signin",
    emotid: "1",
    referer: "http://bbs.ai-thinker.com/",
    content: "000",
  };
  // 将数据转换为 URL 查询字符串格式
  const params = new URLSearchParams();
  for (const key in data) {
    params.append(key, data[key]);
  }
  var resp = await axios.post(
    `http://${baseUrl}/plugin.php?id=dc_signin:sign&inajax=1`,
    params,
    {
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      proxy: {
        host: '127.0.0.1',
        port: 8888,
      }
    }
  );
  if (/您今日已经签过到/.test(resp.data)) return "重复签到";

  if (/签到成功/.test(resp.data)) {
    // let result = resp2.data.match(/class="hidnum" id="lxreward" value="(.*?)"/);
    return "签到成功";
  } else {
    return "未成功签到";
  }
};

let check = async function (cookieJar, param) {
  //get http://bbs.ai-thinker.com/member.php?mod=logging&action=login&infloat=yes&handlekey=login&inajax=1&ajaxtarget=fwin_content_login
  let resphash = await axios.get(
    `http://${baseUrl}/member.php?mod=logging&action=login&infloat=yes&handlekey=login&inajax=1&ajaxtarget=fwin_content_login`,
    {
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
    }
  );
  // 选择器来获取 formhash 属性的值
  const formhashValue = resphash.data.match(/name="formhash" value="(.*?)"/)[1];

  // 选择器来获取 loginhash 属性的值
  const posthash = resphash.data.match(/name="username" id="(.*?)"/)[1];

  const extractedString = posthash.match(/_(.*?)$/)[1];

  let data = {
    formhash: formhashValue,
    referer: "http://bbs.ai-thinker.com/index.php",
    loginfield: "username",
    username: param.name,
    password: param.pwd,
    questionid: "0",
    answer: "",
  };
  // 将数据转换为 URL 查询字符串格式
  const params = new URLSearchParams();
  for (const key in data) {
    params.append(key, data[key]);
  }

  let resp = await axios.post(
    `http://${baseUrl}/member.php?mod=logging&action=login&loginsubmit=yes&handlekey=login&loginhash=${extractedString}&inajax=1`,
    params,
    {
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return !/登录失败/.test(resp.data);
};
async function test(dd) {
  for (let item of dd) {
    let cookieJar = new tough.CookieJar();
    let rr = await run(cookieJar, item);
    console.log(item.name, rr);
  }
}
//举例[{"name":"test","pwd":"xxxxxxx"}]
let dd =JSON.parse(process.env.COOKIESET)
test(dd);
