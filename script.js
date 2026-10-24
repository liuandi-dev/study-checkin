// ============================================================
// 方案（Day 7 由用户自己写的）：
//   ① 打卡 = 记"学了什么 + 有哪些收获"
//   ② 点今天的格子，也可以补昨天的卡
//   ③ 本月日历打了变色 + 显示连续坚持天数
// 存储（localStorage 周第 2 课）：
//   数据形状从"数组"升级成"对象"——日期字符串当钥匙
// ============================================================

const STORAGE_KEY = "study-checkin-data";

// 数据：{ "2026-10-24": { what: "…", gain: "…" }, … }
let records = {};

const $ = (id) => document.getElementById(id);

// ===== 日期工具：全项目的心脏 =====
// 把 Date 变成 "2026-10-24" 这种固定格式（钥匙的样子）
function dateKey(d) {
  return (
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0")
  );
}
const todayKey = () => dateKey(new Date());
function prevDayKey(key) { // 给一个日期钥匙，返回前一天的钥匙（连续天数的秘密武器）
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return dateKey(date);
}

// ===== 读档 / 存档（心跳不变）=====
function load() {
  records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ===== 功能③：画本月日历 =====
function renderCalendar() {
  const now = new Date();
  $("month-title").textContent = now.getFullYear() + " 年 " + (now.getMonth() + 1) + " 月";

  const year = now.getFullYear();
  const month = now.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay(); // 1 号是周几（0=周日）
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 这个月几天

  const grid = $("days");
  grid.innerHTML = "";

  // 前置空白：把 1 号对齐到正确的星期列
  for (let i = 0; i < firstWeekday; i++) {
    const blank = document.createElement("div");
    blank.className = "day blank";
    grid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(new Date(year, month, day));
    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = day;

    const checked = !!records[key];
    const isToday = key === todayKey();
    const isFuture = key > todayKey(); // 日期字符串比大小 = 比先后（补零的功劳）

    if (checked) cell.classList.add("checked");
    if (isToday) cell.classList.add("today");
    if (isFuture) cell.classList.add("future");

    // 能点的格子：今天/昨天（打卡或补卡），以及任何已打卡的（回看）
    const isYesterday = key === prevDayKey(todayKey());
    if (checked || isToday || isYesterday) {
      cell.classList.add("clickable");
      cell.addEventListener("click", () => openCell(key));
    }

    grid.appendChild(cell);
  }

  renderStreak();
}

// ===== 功能③：连续天数 =====
// 从今天往前数，一天接一天，断链即停
// ⚠️ 注意今天的坑：如果今天还没打卡，while 第一圈就停了，昨天就算连着一个月也显示 0
function calcStreak() {
  let streak = 0;
  let key = todayKey();
  function calcStreak() {
  let streak = 0;
  let key = todayKey();
  if (!records[key]) {
    key = prevDayKey(key);   // 今天还没打卡：从昨天开始数
  }
  while (records[key]) {
    streak++;
    key = prevDayKey(key);
  }
  return streak;
}
  while (records[key]) {
    streak++;
    key = prevDayKey(key);
  }
  return streak;
}

function renderStreak() {
  $("streak-num").textContent = calcStreak();
}

// ===== 功能①②：点格子弹出表单（打卡 / 补卡 / 回看）=====
let activeKey = null; // 当前正在操作哪个日期

function openCell(key) {
  activeKey = key;
  const rec = records[key];
  $("form-card").style.display = "block";
  $("hint").textContent = "";
  $("form-card").scrollIntoView({ behavior: "smooth" });

  if (rec) {
    // 已打卡 → 回看模式（表单填上旧内容，改完点保存 = 修改）
    $("form-title").textContent = "📋 " + key + " 的打卡（可直接修改）";
    $("what-input").value = rec.what;
    $("gain-input").value = rec.gain;
  } else {
    $("form-title").textContent = "✍️ 打卡 " + key;
    $("what-input").value = "";
    $("gain-input").value = "";
  }
  $("what-input").focus();
}

function saveCheckin() {
  const what = $("what-input").value.trim();
  const gain = $("gain-input").value.trim();
  if (!what || !gain) {
    $("hint").textContent = "两栏都写点什么再保存～";
    return;
  }
  records[activeKey] = { what: what, gain: gain };
  save();
  renderCalendar();          // 格子变色、天数刷新
  $("form-card").style.display = "none"; // 收起表单
}

// ===== 启动：先读档再画 =====
$("save-btn").addEventListener("click", saveCheckin);
load();
renderCalendar();
