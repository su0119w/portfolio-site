let users = []
fetch("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_AVG_ALL")
    .then(res => res.json())
    .then(data => {
        users = data;
    })
const newsData = [
    { title: "台積電法說會將登場，市場高度關注", date: "2026/03/28" },
    { title: "金融股成交量升溫，資金轉向防禦型股票", date: "2026/03/28" },
    { title: "電子股震盪整理，投資人觀望後市", date: "2026/03/28" }
];
const hotStocks = [
    { name: "台積電", code: "2330", price: 600, change: "+10 (+1.2%)" },
    { name: "聯發科", code: "2454", price: 1000, change: "+15 (+1.5%)" },
    { name: "鴻海", code: "2317", price: 200, change: "-5 (-0.8%)" }
];

let filterType = "all";
const list = document.querySelector(".stock-left");
const favoriteList = document.querySelector(".favorite-list");
const hotList = document.querySelector(".hot-list");
const newsList = document.querySelector(".news-list");
const filterAll = document.querySelector(".filter-all");
const filterUp = document.querySelector(".filter-up");
const filterDown = document.querySelector(".filter-down");
let sort = ""
let currentType = "all";
let currentStock = null;
let favorite = [];

function renderStocks(data) {

    const html = data.map(function (item) {
        return `
            <div>
                <h2>${item.Name}</h2>
                 <p>${item.Code}</p>
             </div>
    `;
    });

    list.innerHTML = html.join("");
}
const detailBox = document.querySelector(".detail-box");
function renderDetail() {

    if (currentStock === null) {
        detailBox.innerHTML = `
  <div class="detail-empty">
    <p>請先選擇一支股票</p>
  </div>
`
    } else {
        let color = currentStock.change.startsWith("+") ? "up" : "down";
        detailBox.innerHTML = `
  <div class="detail-card">
    <div class="detail-top">
      <h3>${currentStock.name}</h3>
      <p>${currentStock.code}</p>
    </div>

    <div class="detail-middle">
      <p class="detail-price">${currentStock.price}</p>
      <p class="${color} detail-change">${currentStock.change}</p>
    </div>

    <div class="detail-bottom">
      <span>類別</span>
      <strong>${currentStock.type}</strong>
    </div>
  </div>
`;
    }


}
function showDetail(code) {

    const stock = stocks.find(function (item) {
        return item.code === code;

    });
    if (!stock) return;
    currentStock = stock;
    renderDetail();
}
function renderFavorite() {
    if (favorite.length === 0) {
        favoriteList.innerHTML = "<p>還沒有自選股</p>";
        return;
    }
    const html = favorite.map(function (item, index) {
        let color = "";

        if (item.change.startsWith("+")) {
            color = "up";
        } else {
            color = "down";
        }

        return `
      <div class="stock-item">
        <div class="stock-info">
          <h3>${item.name}</h3>
          <p>${item.code}</p>
        </div>
        <div class="stock-data">
          <p>${item.price}</p>
          <p class="${color}">${item.change}</p>
        </div>
        <button onclick="stockDel(${index})">刪除</button>
      </div>
    `;
    });

    favoriteList.innerHTML = html.join("");

}
function renderHotStocks() {
    const html = hotStocks.map(function (item) {
        let color = item.change.startsWith("+") ? "up" : "down";

        return `
        <div class="stock-item">
            <div class="stock-info">
                <h3>${item.name}</h3>
                <p>${item.code}</p>
            </div>
            <div class="stock-data">
                <p>${item.price}</p>
                <p class="${color}">${item.change}</p>
            </div>
        </div>
        `;
    });

    hotList.innerHTML = html.join("");
}

function renderNews() {
    const html = newsData.map(function (item) {
        return `
        <div class="news-item">
            <h4>${item.title}</h4>
            <p>${item.date}</p>
        </div>
        `;
    });

    newsList.innerHTML = html.join("");
}
const input = document.querySelector(".stock-input");
const select = document.getElementById("stock-select");
select.addEventListener("change", function () {
    currentType = select.value;
    updateView();
})
function updateView() {
    let keyword = input.value.trim();

    const result = stocks.filter(function (item) {
        return ((currentType === "all" || item.type === currentType) &&
            (keyword === "" || item.name.includes(keyword) || item.code.includes(keyword)) &&
            (filterType === "all" || ((filterType === "up") && (item.change.startsWith("+"))) || ((filterType === "down") && (item.change.startsWith("-"))))
        );
    });
    if (sort === "change") {
        result.sort(function (a, b) {
            let numA = parseFloat(a.change);
            let numB = parseFloat(b.change);

            return numB - numA;
        })
    }
    if (sort === "price") {
        result.sort(function (a, b) {
            return b.price - a.price
        })
    }

    if (result.length === 0) {
        list.innerHTML = `<p>沒有這筆資料</p>`;
    } else {
        renderStocks(result);
    }


}


input.addEventListener("input", function () {
    updateView();
});


const data = localStorage.getItem("favorite");

if (data) {
    favorite = JSON.parse(data);
    renderFavorite();
}

renderFavorite();

function stockPush(event, code) {
    event.stopPropagation();
    const stock = stocks.find(function (item) {
        return item.code === code;
    });

    if (!stock) return;

    const exists = favorite.some(function (item) {
        return item.code === stock.code;
    });

    if (exists) {
        favorite = favorite.filter(function (item) {
            return item.code !== code
        })
    } else {
        favorite.push(stock);
    }


    localStorage.setItem("favorite", JSON.stringify(favorite));
    renderFavorite();
    updateView();
}
function stockDel(index) {
    favorite.splice(index, 1)
    localStorage.setItem("favorite", JSON.stringify(favorite));
    renderFavorite();
}
const changeUp = document.querySelector(".changeUp")
const priceUp = document.querySelector(".priceUp")

changeUp.addEventListener("click", function () {
    sort = "change"
    setActive(changeUp)
    updateView();
})
priceUp.addEventListener("click", function () {
    sort = "price"
    setActive(priceUp)
    updateView()
})

filterAll.addEventListener("click", function () {
    filterType = "all"
    setActive(filterAll)
    updateView();
})
filterUp.addEventListener("click", function () {
    filterType = "up"
    setActive(filterUp)
    updateView();
})
filterDown.addEventListener("click", function () {
    filterType = "down"
    setActive(filterDown)
    updateView();
})
const filter = document.querySelectorAll(".filter")

function setActive(button) {
    const buttons = document.querySelectorAll(".filter");

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
    }

    button.classList.add("active");
}

renderStocks(users);
renderFavorite();
renderHotStocks();
renderNews();
renderDetail()
