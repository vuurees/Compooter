(function () {
  "use strict";

  var PARTS = [
    { type: "CPU", url: "https://www.newegg.com/p/N82E16819113884?Item=N82E16819113884&cm_sp=pc-builder-_-from-_-markup-share", item: "AMD Ryzen 9 9950X3D - Ryzen 9 9000 Series Granite Ridge (Zen 5) 16-Core 4.3 GHz Socket AM5 170W AMD Radeon Graphics Desktop CPU Processor - 100-100000719WOF", price: 699.00 },
    { type: "Motherboard", url: "https://www.newegg.com/p/N82E16813119682?Item=N82E16813119682&cm_sp=pc-builder-_-from-_-markup-share", item: "ASUS ROG STRIX X870E-E GAMING WIFI", price: 399.99 },
    { type: "Memory", url: "https://www.newegg.com/p/N82E16820982338?Item=N82E16820982338&cm_sp=pc-builder-_-from-_-markup-share", item: "CORSAIR Vengeance RGB 64GB (2 x 32GB) 288-Pin PC RAM DDR5 6000 (PC5 48000) Desktop Memory Model CMH64GX5M2N6000Z40", price: 947.99 },
    { type: "Graphics Card", url: "https://www.newegg.com/p/N82E16814932771?Item=N82E16814932771&cm_sp=pc-builder-_-from-_-markup-share", item: "GIGABYTE WindForce GeForce RTX 5070 Ti 16GB GDDR7 PCI Express 5.0 ATX Graphics Card GV-N507TWF3OC-16GD", price: 1169.99 },
    { type: "Case", url: "https://www.newegg.com/p/N82E16811854133?Item=N82E16811854133&cm_sp=pc-builder-_-from-_-markup-share", item: "Phanteks XT Pro Ultra, Mid-Tower Gaming Chassis, 4x M25-140 Fans Included, High Airflow Performance Mesh, Tempered Glass Window, USB-C 3.2 Gen2, Black", price: 79.99 },
    { type: "Power Supply", url: "https://www.newegg.com/p/N82E16817139334?Item=N82E16817139334&cm_sp=pc-builder-_-from-_-markup-share", item: "CORSAIR RMx Series RM1000x ATX Power Supply - Fully Modular - ATX 3.1 - PCIe 5.1 - Cybenetics Gold - Low-Noise - Japanese Capacitors - 1000 Watts", price: 199.99 },
    { type: "Storage", url: "https://www.newegg.com/p/N82E16820147903?Item=N82E16820147903&cm_sp=pc-builder-_-from-_-markup-share", item: "SAMSUNG SSD 9100 PRO 2TB, PCIe 5.0x4 M.2 2280, Seq. Read Speeds Up to 14,700MB/s, Best for AI Computing, Gaming, and Heavy Duty Workstations (MZ- VAP2T0B/AM)", price: 399.99 },
    { type: "CPU Cooler", url: "https://www.newegg.com/p/N82E16835101119?Item=N82E16835101119&cm_sp=pc-builder-_-from-_-markup-share", item: "ASUS ROG RYUYJIN III 360 ARGB EXTREME all-in-one AIO CPU liquid cooler, AMD Ryzen 9000 & Intel\u00AE Core\u2122 Ultra Ready, Asetek Gen8 V2 pump; high airflow & static pressure magnetic fans; customizable 3.5\"", price: 339.99 }
  ];

  var PALETTE = ["#7c5cff", "#22d3ee", "#34d399", "#fbbf24", "#f87171", "#60a5fa", "#f472b6", "#a78bfa"];
  PARTS.forEach(function (p, i) { p.color = PALETTE[i % PALETTE.length]; });

  var TOTAL_USD = PARTS.reduce(function (s, p) { return s + p.price; }, 0);

  var RATES = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, AUD: 1.52, BTC: 0.0000091 };
  var LOCALES = { USD: "en-US", EUR: "de-DE", GBP: "en-GB", JPY: "ja-JP", CAD: "en-CA", AUD: "en-AU" };

  var state = {
    search: "",
    sort: "default",
    currency: "USD",
    budget: 1,
    theme: localStorage.getItem("compooter-theme") || "dark",
    sound: localStorage.getItem("compooter-sound") === "on"
  };

  var partsBody = document.getElementById("partsBody");
  var totalPriceEl = document.getElementById("totalPrice");
  var legendList = document.getElementById("legendList");
  var meterFill = document.getElementById("meterFill");
  var meterLabel = document.getElementById("meterLabel");
  var overBudgetBadge = document.getElementById("overBudgetBadge");
  var budgetInput = document.getElementById("budgetInput");
  var gaugeScoreEl = document.getElementById("gaugeScore");
  var toastContainer = document.getElementById("toastContainer");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatPrice(usd, currency) {
    var value = usd * RATES[currency];
    if (currency === "BTC") return "\u20BF" + value.toFixed(8);
    try {
      return new Intl.NumberFormat(LOCALES[currency], { style: "currency", currency: currency }).format(value);
    } catch (e) {
      return "$" + value.toFixed(2);
    }
  }

  function sortList(list, mode) {
    var l = list.slice();
    if (mode === "price-asc") l.sort(function (a, b) { return a.price - b.price; });
    else if (mode === "price-desc") l.sort(function (a, b) { return b.price - a.price; });
    else if (mode === "type-asc") l.sort(function (a, b) { return a.type.localeCompare(b.type); });
    else if (mode === "type-desc") l.sort(function (a, b) { return b.type.localeCompare(a.type); });
    return l;
  }

  function rowHtml(p) {
    var priceText = formatPrice(p.price, state.currency);
    var copyPayload = escapeHtml(p.type + " \u2014 " + p.item + " \u2014 " + priceText);
    return "" +
      '<tr>' +
      '<td class="type-cell"><span class="dot" style="background:' + p.color + '"></span>' + escapeHtml(p.type) + '</td>' +
      '<td class="item-cell"><a href="' + p.url + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(p.item) + '</a></td>' +
      '<td class="price-cell">' + priceText + '</td>' +
      '<td class="action-cell"><button class="copy-btn" data-copy="' + copyPayload + '" title="Copy row" aria-label="Copy ' + escapeHtml(p.type) + ' details">&#10697;</button></td>' +
      '</tr>';
  }

  function render() {
    var q = state.search.trim().toLowerCase();
    var list = PARTS.filter(function (p) {
      return (p.type + " " + p.item).toLowerCase().indexOf(q) !== -1;
    });
    list = sortList(list, state.sort);

    if (list.length === 0) {
      partsBody.innerHTML = '<tr class="empty-row"><td colspan="4">No components match your search.</td></tr>';
    } else {
      partsBody.innerHTML = list.map(rowHtml).join("");
    }
  }

  function animateCount(el, to, duration) {
    var start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatPrice(to * eased, state.currency);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function updateTotal() {
    animateCount(totalPriceEl, TOTAL_USD, 700);
  }

  function updateLegend() {
    legendList.innerHTML = PARTS.map(function (p) {
      var pct = ((p.price / TOTAL_USD) * 100).toFixed(1);
      return '<li><span class="dot" style="background:' + p.color + '"></span>' +
        '<span class="legend-type">' + escapeHtml(p.type) + '</span>' +
        '<span class="legend-pct">' + pct + '%</span></li>';
    }).join("");
  }

  function drawDonut() {
    var canvas = document.getElementById("donutCanvas");
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2, radius = Math.min(w, h) / 2 - 2, inner = radius * 0.58;
    var start = -Math.PI / 2;
    PARTS.forEach(function (p) {
      var slice = (p.price / TOTAL_USD) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();
      start += slice;
    });
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  function overkillScore() {
    return Math.max(0, Math.min(100, Math.round(TOTAL_USD / 55 + PARTS.length * 3)));
  }

  function drawGauge(score) {
    var canvas = document.getElementById("gaugeCanvas");
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h - 12, radius = Math.min(w / 2, h) - 14;

    var grad = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
    grad.addColorStop(0, "#f87171");
    grad.addColorStop(0.5, "#fbbf24");
    grad.addColorStop(1, "#34d399");
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 0);
    ctx.stroke();

    var angle = Math.PI - (score / 100) * Math.PI;
    var nx = cx + radius * 0.82 * Math.cos(angle);
    var ny = cy - radius * 0.82 * Math.sin(angle);
    var textColor = getComputedStyle(document.documentElement).getPropertyValue("--text") || "#fff";
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function animateGauge(to) {
    var start = performance.now();
    var duration = 900;
    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(to * eased);
      drawGauge(val);
      gaugeScoreEl.textContent = val;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function updateBudgetMeter() {
    var budget = Math.max(state.budget, 0.01);
    var pct = (TOTAL_USD / budget) * 100;
    meterFill.style.width = Math.min(pct, 100) + "%";
    meterFill.style.background = pct < 70 ? "var(--total)" : pct <= 100 ? "var(--warn)" : "var(--bad)";
    meterLabel.textContent = formatPrice(TOTAL_USD, state.currency) + " of " + formatPrice(budget, state.currency) + " budget (" + pct.toFixed(0) + "%)";
    overBudgetBadge.hidden = pct <= 100;
    if (pct > 100) {
      overBudgetBadge.textContent = pct >= 1000 ? ("\u{1F480} " + Math.round(pct / 100) + "\u00D7 OVER") : "OVER";
    }
  }

  function refreshAll() {
    render();
    updateTotal();
    updateLegend();
    drawDonut();
    animateGauge(overkillScore());
    updateBudgetMeter();
  }

  // --- toolbar wiring ---
  document.getElementById("searchInput").addEventListener("input", function (e) {
    state.search = e.target.value;
    render();
  });

  document.getElementById("sortSelect").addEventListener("change", function (e) {
    state.sort = e.target.value;
    render();
  });

  document.getElementById("currencySelect").addEventListener("change", function (e) {
    state.currency = e.target.value;
    render();
    updateTotal();
    updateBudgetMeter();
    beep(520);
  });

  budgetInput.addEventListener("input", function (e) {
    var v = parseFloat(e.target.value);
    state.budget = isNaN(v) ? 0 : v;
    updateBudgetMeter();
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    state.search = "";
    state.sort = "default";
    state.currency = "USD";
    state.budget = 1;
    document.getElementById("searchInput").value = "";
    document.getElementById("sortSelect").value = "default";
    document.getElementById("currencySelect").value = "USD";
    budgetInput.value = 1;
    refreshAll();
    toast("Reset to defaults");
  });

  document.getElementById("exportBtn").addEventListener("click", function () {
    var rows = [["Type", "Item", "Price (USD)"]];
    PARTS.forEach(function (p) { rows.push([p.type, p.item, p.price.toFixed(2)]); });
    rows.push(["", "Total", TOTAL_USD.toFixed(2)]);
    var csv = rows.map(function (r) {
      return r.map(function (f) { return '"' + String(f).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    var blob = new Blob([csv], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "compooter-build.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("CSV exported");
  });

  document.getElementById("printBtn").addEventListener("click", function () { window.print(); });

  document.getElementById("celebrateBtn").addEventListener("click", function () {
    launchConfetti();
    beep(660);
    toast("Cha-ching! Happy building.");
  });

  // --- donate-instead modal ---
  var neweggLink = document.getElementById("neweggLink");
  var donateModal = document.getElementById("donateModal");
  var donateModalClose = document.getElementById("donateModalClose");

  function openDonateModal() {
    donateModal.hidden = false;
    document.body.style.overflow = "hidden";
    donateModalClose.focus();
  }

  function closeDonateModal() {
    donateModal.hidden = true;
    document.body.style.overflow = "";
    neweggLink.focus();
  }

  neweggLink.addEventListener("click", function (e) {
    e.preventDefault();
    openDonateModal();
    beep(440);
  });

  donateModalClose.addEventListener("click", closeDonateModal);
  document.getElementById("donateModalContinue").addEventListener("click", closeDonateModal);

  donateModal.addEventListener("click", function (e) {
    if (e.target === donateModal) closeDonateModal();
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !donateModal.hidden) closeDonateModal();
  });

  partsBody.addEventListener("click", function (e) {
    var btn = e.target.closest(".copy-btn");
    if (!btn) return;
    var text = btn.getAttribute("data-copy");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Copied to clipboard"); }).catch(function () { toast("Copy failed"); });
    } else {
      toast("Clipboard unavailable");
    }
    beep(420);
  });

  // --- theme + sound toggles ---
  var themeToggle = document.getElementById("themeToggle");
  var soundToggle = document.getElementById("soundToggle");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.textContent = theme === "light" ? "\u2600\uFE0F" : "\u{1F319}";
    drawDonut();
  }

  themeToggle.addEventListener("click", function () {
    state.theme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("compooter-theme", state.theme);
    applyTheme(state.theme);
    beep(380);
  });

  function applySound(on) {
    soundToggle.textContent = on ? "\u{1F50A}" : "\u{1F507}";
    soundToggle.setAttribute("aria-pressed", String(on));
  }

  soundToggle.addEventListener("click", function () {
    state.sound = !state.sound;
    localStorage.setItem("compooter-sound", state.sound ? "on" : "off");
    applySound(state.sound);
    if (state.sound) beep(500);
  });

  var audioCtx;
  function beep(freq, duration) {
    if (!state.sound) return;
    duration = duration || 0.05;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* audio unsupported, ignore */ }
  }

  // --- toast notifications ---
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastContainer.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 300);
    }, 2200);
  }

  // --- clock ---
  var clockEl = document.getElementById("clock");
  function updateClock() { clockEl.textContent = new Date().toLocaleTimeString(); }
  updateClock();
  setInterval(updateClock, 1000);

  // --- confetti ---
  function launchConfetti() {
    var canvas = document.getElementById("confettiCanvas");
    var ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var colors = ["#7c5cff", "#22d3ee", "#34d399", "#f87171", "#fbbf24"];
    var pieces = [];
    for (var i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        r: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: Math.random() * 3 + 2,
        vx: (Math.random() - 0.5) * 2,
        rot: Math.random() * 360,
        vrot: (Math.random() - 0.5) * 10
      });
    }
    var frame = 0;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(function (p) {
        p.y += p.vy; p.x += p.vx; p.rot += p.vrot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      });
      pieces = pieces.filter(function (p) { return p.y < canvas.height + 20; });
      frame++;
      if (pieces.length > 0 && frame < 400) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    tick();
  }

  // --- Konami code easter egg ---
  var KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  var konamiIndex = 0;
  window.addEventListener("keydown", function (e) {
    var expected = KONAMI[konamiIndex];
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === expected) {
      konamiIndex++;
      if (konamiIndex === KONAMI.length) {
        launchConfetti();
        toast("\u{1F3AE} Overkill mode unlocked");
        konamiIndex = 0;
      }
    } else {
      konamiIndex = key === KONAMI[0] ? 1 : 0;
    }
  });

  // --- init ---
  applyTheme(state.theme);
  applySound(state.sound);
  refreshAll();
})();
