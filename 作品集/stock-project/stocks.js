let stocks = [];
let filterType = "all";
let sort = "";
let currentType = "all";
let currentStock = null;
let favorite = [];

const list = document.querySelector(".stock-left");
const favoriteList = document.querySelector(".favorite-list");
const hotList = document.querySelector(".hot-list");
const newsList = document.querySelector(".news-list");
const filterAll = document.querySelector(".filter-all");
const filterUp = document.querySelector(".filter-up");
const filterDown = document.querySelector(".filter-down");
const input = document.querySelector(".stock-input");
const select = document.getElementById("stock-select");
const detailBox = document.querySelector(".detail-box");
const changeUp = document.querySelector(".changeUp");
const priceUp = document.querySelector(".priceUp");

const newsData = [
  { title: "台積電法說會將登場，市場高度關注", date: "2026/03/28" },
  { title: "金融股成交量升溫，資金轉向防禦型股票", date: "2026/03/28" },
  { title: "電子股震盪整理，投資人觀望後市", date: "2026/03/28" }
];

function renderStocks(data) {
  const html = data.map(function (item) {
    const exists = favorite.some(function (fav) {
      return fav.code === item.code;
    });

    let color = item.change.startsWith("+") ? "up" : "down";
    let buttonText = exists ? "已加入" : "加入自選";

    return `
      <div class="stock-item" onclick="showDetail('${item.code}')">
        <div class="stock-info">
          <h3>${item.name}</h3>
          <p>${item.code}</p>
          <p>${item.type}</p>
        </div>
        <div class="stock-data">
          <p>${item.price}</p>
          <p class="${color}">${item.change}</p>
        </div>
        <button onclick="stockPush(event,'${item.code}')">${buttonText}</button>
      </div>
    `;
  });

  list.innerHTML = html.join("");
}

function renderDetail() {
  if (currentStock === null) {
    detailBox.innerHTML = `
      <div class="detail-empty">
        <p>請先選擇一支股票</p>
      </div>
    `;
    return;
  }

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
        <button onclick="stockDel(${index})">刪除</button>
      </div>
    `;
  });

  favoriteList.innerHTML = html.join("");
}

function renderHotStocks() {
  const top3 = [...stocks]
    .sort(function (a, b) {
      return b.price - a.price;
    })
    .slice(0, 3);

  const html = top3.map(function (item) {
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

function updateView() {
  let keyword = input.value.trim();

  let result = stocks.filter(function (item) {
    return (
      (currentType === "all" || item.type === currentType) &&
      (keyword === "" || item.name.includes(keyword) || item.code.includes(keyword)) &&
      (
        filterType === "all" ||
        (filterType === "up" && item.change.startsWith("+")) ||
        (filterType === "down" && item.change.startsWith("-"))
      )
    );
  });

  if (sort === "change") {
    result.sort(function (a, b) {
      let numA = parseFloat(a.change);
      let numB = parseFloat(b.change);
      return numB - numA;
    });
  }

  if (sort === "price") {
    result.sort(function (a, b) {
      return b.price - a.price;
    });
  }

  if (result.length === 0) {
    list.innerHTML = `<p>沒有這筆資料</p>`;
  } else {
    renderStocks(result);
  }
}

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
      return item.code !== code;
    });
  } else {
    favorite.push(stock);
  }

  localStorage.setItem("favorite", JSON.stringify(favorite));
  renderFavorite();
  updateView();
}

function stockDel(index) {
  favorite.splice(index, 1);
  localStorage.setItem("favorite", JSON.stringify(favorite));
  renderFavorite();
}

function setActive(button) {
  const buttons = document.querySelectorAll(".filter");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active");
  }

  button.classList.add("active");
}

async function loadStocks() {
  try {
    list.innerHTML = "<p>資料載入中...</p>";

    const url = "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_AVG_ALL";
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("HTTP 狀態錯誤：" + res.status);
    }

    const data = await res.json();
    console.log("API原始資料：", data);

    stocks = data.slice(0, 50).map(function (item) {
      const price = Number(item.ClosingPrice || item.MonthlyAveragePrice || 0);

      return {
        name: item.Name || "未知股票",
        code: item.Code || "",
        price: price,
        change: "+0",
        type: "未分類"
      };
    });

    updateView();
    renderHotStocks();
  } catch (error) {
    console.error("API錯誤詳細內容：", error);
    list.innerHTML = `<p>資料載入失敗：${error.message}</p>`;
  }
}
select.addEventListener("change", function () {
  currentType = select.value;
  updateView();
});

input.addEventListener("input", function () {
  updateView();
});

changeUp.addEventListener("click", function () {
  sort = "change";
  setActive(changeUp);
  updateView();
});

priceUp.addEventListener("click", function () {
  sort = "price";
  setActive(priceUp);
  updateView();
});

filterAll.addEventListener("click", function () {
  filterType = "all";
  setActive(filterAll);
  updateView();
});

filterUp.addEventListener("click", function () {
  filterType = "up";
  setActive(filterUp);
  updateView();
});

filterDown.addEventListener("click", function () {
  filterType = "down";
  setActive(filterDown);
  updateView();
});

const data = localStorage.getItem("favorite");
if (data) {
  favorite = JSON.parse(data);
}

renderFavorite();
renderNews();
renderDetail();
loadStocks();