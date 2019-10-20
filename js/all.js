// DOM
const districtContent = document.querySelector('.districtContent');
const districtSelect = document.querySelector('.districtSelect');
const districtName = document.querySelector('.districtName');
const pageNav = document.querySelector('.pageNav');
const popularList = document.querySelector('.popularList');

// 監聽
districtSelect.addEventListener('change', changeDistrict, false);
pageNav.addEventListener('click', switchPages, false)
popularList.addEventListener('click', popularBlock, false);

// 預設取得回傳資料  data->所有資料  displaydata->顯示資料
let data = [];
let displayData = [];


// 當前頁
let pageNum = 1;
// 每一個分頁顯示的數量 -> 4 筆
let contentNum = 4;
// 頁碼數量
let pageLeng = 0;

// AJAX
let xhr = new XMLHttpRequest;
xhr.open('get', 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97', true);
xhr.send(null);
xhr.onload = function () {
    let arr = JSON.parse(xhr.responseText);
    for (let i = 0; i < arr.result.records.length; i++) {
        data.push(arr.result.records[i])
    }

    // 把 data 裡的地區塞到 district 裡  -> 列出所有的行政區
    let allDistrict = [];
    for (let i = 0; i < data.length; i++) {
        allDistrict.push(data[i].Zone);
    }

    // 去除重複行政區名
    let district = allDistrict.filter(function (element, index, array) {
        // filter 函式，接受一個 callback 函式，callback 可以有三個參數(element, index, array) ，
        // element：陣列元素的值。
        // index：陣列元素的所在位置。
        // arr：已經過 filter 處理的陣列
        return array.indexOf(element) === index;
    });

    // 合成下拉選單項目
    let str = ``;
    const firstSelected = `<option disabled="disabled" selected> -- 請選擇行政區 -- </option>`;
    for (let i = 0; i < district.length; i++) {
        str += `<option value="${district[i]}">${district[i]}</option>`;
    }
    districtSelect.innerHTML = firstSelected + str;

    // 初始畫面
    getAllDistrict();
    hotDistrict(district);
}

// 顯示全部行政區
function getAllDistrict() {
    districtName.textContent = "高雄旅遊地";
    displayData = data;
    displayDistrict();
}

// 熱門景點
function popularBlock(e) {
    e.preventDefault();
    if (e.target.nodeName !== 'A') return
    changeDistrict(e);
    districtName.textContent = e.target.textContent;
}

function hotDistrict(district) {
    let randomArr = [];
    let max = district.length;
    let min = 0;
    const randomLength = 4;

    // 過濾重複值
    for (let i = 0; i < randomLength; i++) {
        let randomNum = getRandom(min, max);
        randomArr.push(randomNum);

        for (var j = 0; j < i; j++) {
            if (randomArr[i] == randomArr[j]) {
                randomArr.splice(j, 1);
                randomArr.push(randomNum - 1);
            }
        }
    }

    // 顯示熱門行政區
    let str = ``;
    let color = ["#8a82cc", "#559AC8", "#F5D005", "#FFA782"];
    for (let i = 0; i < randomArr.length; i++) {
        str += `<li style = "background: ${
            color[i]
            }";><a href="#" class="popularBlock">${district[randomArr[i]]}</a></li>`;
    }

    popularList.innerHTML = str;
}
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


// 切換行政區改變當前標題、顯示頁數
function changeDistrict(e) {
    e.preventDefault();
    districtName.textContent = e.target.value;
    let distData = [];

    // 從 data 取相同地區的值，存到 distData 裡
    for (let i = 0; i < data.length; i++) {
        // 確認選單(value))和熱門區塊(textContent)內容都能輸入
        if (e.target.value == data[i].Zone || e.target.textContent == data[i].Zone) {
            distData.push(data[i]);
        }
    }

    displayData = distData;

    // 回到第一頁
    pageNum = 1;

    // 取出值後，呼叫 displayDistrict 顯示
    displayDistrict();
}

function displayDistrict() {
    let str = ``;

    // 選取開始的陣列位置 -> 頁碼乘以每頁顯示數量
    let start = pageNum * contentNum;
    let dataLen = displayData.length;

    // 頁數
    calPagesNum(displayData.length);

    // 如果長度大於 start，以 start 作為迴圈停止條件
    if (dataLen > start) {
        dataLen = start;
    } else {
        dataLen = displayData.length;
    }

    // 以 start - 每頁顯示數量作為開始條件
    for (let i = start - contentNum; i < dataLen; i++) {
        // 顯示筆數
        str += `<div class="contentCard" >
                         <div class="cardHeader bgImg" style="background-image: url('${displayData[i].Picture1}');">
                             <h2>${displayData[i].Name} </h2>
                             <p>${displayData[i].Zone} </p>
                         </div>
                         <div class="cardBody">
                             <div class="cardInfo">
                                 <div class="time"><img class="infoImg" src="img/icons_clock.png" alt="clock" />
                                     <p>${displayData[i].Opentime}</p>
                                 </div>
                                 <div class="address"><img class="infoImg" src="img/icons_pin.png" alt="address" />
                                     <p>${displayData[i].Add}</p>
                                 </div>
                                 <div class="flexWrap">
                                     <div class="phone"> <img class="infoImg" src="img/icons_phone.png" alt="phone" />
                                         <p>${displayData[i].Tel}</p>
                                     </div>
                                     <div class="tag"> <img class="infoImg" src="img/icons_tag.png" alt="tag" />
                                         <p>${displayData[i].Ticketinfo}</p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>`;
    }

    districtContent.innerHTML = str;
}

// 頁數計算
function calPagesNum(num) {
    if (num > contentNum) {
        // Math.ceil() 最小整數 -> 取大於這個數的最小整數
        pageLeng = Math.ceil(num / contentNum);

        const prev = `<li class="pagePrev"><a href="#">Prev</a></li>`;
        const next = `<li class="pageNext"><a href="#">Next</a></li>`;

        let str = ``;
        for (let i = 1; i <= pageLeng; i++) {
            // 當前頁加上 active
            if (i == pageNum) {
                str += `<li class="pageItem"><a class="pageLink active" href="#">${i}</a></li>`;
            } else {
                str += `<li class="pageItem"><a class="pageLink " href="#">${i}</a></li>`;
            }
        }

        pageNav.innerHTML = prev + str + next;
    } else {
        str = `<li class="pageItem"><a class="pageLink active" href="#">1</a></li>`;
        pageNav.innerHTML = str;
    }
}



// 頁面切換
function switchPages(e) {
    e.preventDefault();
    if (e.target.nodeName !== "A") {
        return;
    }

    // 頁碼切換
    if (e.target.textContent == "Next") {
        if (pageNum == pageLeng) {
            pageNum = pageLeng;
        } else {
            pageNum++;
        }
    } else if (e.target.textContent == "Prev") {
        if (pageNum == 1) {
            pageNum = 1;
        } else {
            pageNum--;
        }
    } else {
        pageNum = parseInt(e.target.textContent);
    }

    // 更新資料
    displayDistrict();
}

