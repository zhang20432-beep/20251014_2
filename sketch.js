let circles = [];
let colors = [
  "#ff0000", "#ff8700", "#ffd300", "#deff0a", "#a1ff0a",
  "#0aff99", "#0aefff", "#147df5", "#580aff", "#be0aff"
];
let starBursts = [];
let score = 0; // 新增分數變數

// 音效相關變數
let explosionSound = null; // 初始設為 null
let initialized = false;   // 追蹤是否已啟動音訊

let timer = 30;
let gameOver = false;
let intervalId = null;
let showDialog = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#bde0fe");
  noStroke();

  // ***** 載入 MP3 檔案，並在 Console 輸出成功或失敗訊息 *****
  // 這會幫助我們確認檔案是否被找到
  explosionSound = loadSound('explosion.mp3', 
    () => { 
      console.log("MP3 Loaded Successfully! Sound is ready to play."); 
    }, 
    (err) => { 
      console.error("MP3 Load Error! Please check if 'explosion.mp3' exists in the correct directory. Sound will not play.", err); 
    }
  );
  // ***************************************************************
  
  // 產生 30 個圓的資料
  for (let i = 0; i < 30; i++) {
    let r = random(30, 150);
    let speed = map(r, 30, 150, 5, 1);
    let color = random(colors);
    circles.push({
      x: random(width),
      y: random(height),
      r: r,
      alpha: random(50, 255),
      speed: speed,
      color: color
    });
  }

  startTimer();
  triggerRandomExplosion(false);
}

function startTimer() {
  timer = 30;
  gameOver = false;
  showDialog = false;
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (!gameOver) {
      timer--;
      if (timer <= 0) {
        timer = 0;
        gameOver = true;
        showDialog = true;
        clearInterval(intervalId);
      }
    }
  }, 1000);
}

// 播放爆破音效的函式
function playExplosionSound() {
  // 檢查：1. 音訊環境已啟動 2. 音效物件存在 3. 音檔已載入
  if (initialized && explosionSound && explosionSound.isLoaded()) {
    // 使用 play() 播放音效
    explosionSound.play(); 
  } else if (initialized) {
    // 如果畫面已點擊，但聲音無法播放，表示檔案載入失敗
    console.warn("Sound is not ready. Please check Console for MP3 load errors.");
  }
}

// =========================================================
// 處理瀏覽器音訊限制 (點擊啟動)
// =========================================================
function mousePressed() {
  if (gameOver) {
    // 檢查是否點擊到「再玩一次」按鈕
    let btnW = 200, btnH = 60;
    let btnX = width / 2 - btnW / 2;
    let btnY = height / 2 + 60;
    if (
      mouseX > btnX && mouseX < btnX + btnW &&
      mouseY > btnY && mouseY < btnY + btnH
    ) {
      // 重新開始
      circles = [];
      for (let i = 0; i < 30; i++) {
        let r = random(30, 150);
        let speed = map(r, 30, 150, 5, 1);
        let color = random(colors);
        circles.push({
          x: random(width),
          y: random(height),
          r: r,
          alpha: random(50, 255),
          speed: speed,
          color: color
        });
      }
      score = 0;
      startTimer();
      initialized = false;
      return;
    }
    return;
  }
  if (!initialized) {
    // userStartAudio() 是啟動音訊環境的關鍵
    userStartAudio(); 
    initialized = true;
    console.log("Audio Context Initialized! Try clicking on the canvas again.");
    return;
  }

  // 檢查是否點擊到任何圓
  for (let i = circles.length - 1; i >= 0; i--) {
    let c = circles[i];
    let d = dist(mouseX, mouseY, c.x, c.y);
    // 設定最小可點擊半徑，讓小圓也容易點擊
    let clickableRadius = max(c.r / 2, 30);
    if (d < clickableRadius) {
      // 點擊到圓
      if (c.color === "#ff8700") {
        score--; // 扣分
      } else {
        score++; // 加分
      }
      playExplosionSound();

      // 爆破特效
      let numStars = 12;
      let stars = [];
      for (let j = 0; j < numStars; j++) {
        let angle = TWO_PI * j / numStars;
        let speed = random(4, 8);
        stars.push({
          x: c.x,
          y: c.y,
          vx: cos(angle) * speed,
          vy: sin(angle) * speed,
          size: random(c.r / 10, c.r / 7),
          angle: random(TWO_PI)
        });
      }
      starBursts.push({
        stars: stars,
        life: 30,
        maxLife: 30
      });

      // 移除該圓，並產生新圓
      circles.splice(i, 1);
      let r = random(30, 150);
      let speed = map(r, 30, 150, 5, 1);
      let colorVal = random(colors);
      circles.push({
        x: random(width),
        y: height + r / 2,
        r: r,
        alpha: random(50, 255),
        speed: speed,
        color: colorVal
      });
      break; // 一次只爆破一個
    }
  }
}
// =========================================================

function draw() {
  background("#bde0fe");
  noStroke();

  // 左上角顯示指定數字與分數與倒數
  fill(0);
  textAlign(LEFT, TOP);
  textSize(28);
  text("414730514", 16, 12);
  textSize(24);
  text("分數: " + score, 16, 48);
  text("倒數: " + timer + " 秒", 16, 80);

  if (!initialized && !gameOver) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("點擊畫布開始 (Click to Start)", width / 2, height / 2);
    return;
  }

  // 遊戲結束時顯示分數視窗
  if (showDialog) {
    fill(255, 240);
    rect(width / 2 - 220, height / 2 - 120, 440, 240, 20);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(36);
    text("時間到！", width / 2, height / 2 - 60);
    textSize(28);
    text("你的分數：" + score, width / 2, height / 2);
    // 再玩一次按鈕
    fill("#ff8700");
    rect(width / 2 - 100, height / 2 + 60, 200, 60, 12);
    fill(255);
    textSize(26);
    text("再玩一次", width / 2, height / 2 + 90);
    return;
  }

  // --- 移除自動爆破邏輯 ---
  // ...請刪除自動爆破的這一段...
  // let candidates = circles.filter(c => c.y < height * 2 / 3);
  // if (candidates.length > 0) {
  //   ...自動爆破內容...
  // }
  // --- end ---

  // --- 畫圓與裝飾 ---
  let speedFactor = map(timer, 0, 30, 2.5, 1); // 時間越短，速度越快
  for (let c of circles) {
    let col = color(c.color);
    col.setAlpha(c.alpha);
    fill(col);
    ellipse(c.x, c.y, c.r, c.r);

    // 右上角小方塊
    let boxSize = c.r / 8;
    let boxX = c.x + c.r / 8;
    let boxY = c.y - c.r / 3;
    fill(255, 255, 255, c.alpha * 0.8);
    rect(boxX, boxY, boxSize, boxSize, 4);

    // 左上角星星
    let starSize = c.r / 6;
    let starX = c.x - c.r / 3;
    let starY = c.y - c.r / 3;
    push();
    translate(starX + starSize / 2, starY + starSize / 2);
    fill(255, 255, 0, c.alpha * 0.9);
    noStroke();
    drawStar(0, 0, starSize / 2.5, starSize / 6, 5);
    pop();

    // 根據倒數調整速度
    c.y -= c.speed * speedFactor;

    // 如果飄到最上方，移到最底部
    if (c.y < -c.r / 2) {
      c.y = height + c.r / 2;
    }
  }

  // --- 畫爆破星星特效 ---
  for (let i = starBursts.length - 1; i >= 0; i--) {
    let burst = starBursts[i];
    burst.life--;
    for (let s of burst.stars) {
      push();
      translate(s.x, s.y);
      rotate(s.angle);
      fill(255, 255, 0, map(burst.life, 0, burst.maxLife, 0, 255));
      noStroke();
      drawStar(0, 0, s.size, s.size / 2.5, 5);
      pop();

      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.96;
      s.vy *= 0.96;
    }
    if (burst.life <= 0) {
      starBursts.splice(i, 1);
    }
  }
}

// 輔助函式 (未更動)
function triggerRandomExplosion(playSound = true) { 
  let r = random(30, 150);
  let x = random(width);
  let y = random(height * 0.05, height * 0.7); 
  let colorVal = random(colors);

  if (playSound) {
    playExplosionSound(); 
  }

  let numStars = 12;
  let stars = [];
  for (let j = 0; j < numStars; j++) {
    let angle = TWO_PI * j / numStars;
    let speed = random(4, 8);
    stars.push({
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      size: random(r / 10, r / 7),
      angle: random(TWO_PI)
    });
  }
  starBursts.push({
    stars: stars,
    life: 30,
    maxLife: 30
  });

  let speed = map(r, 30, 150, 2.5, 0.5);
  circles.push({
    x: random(width),
    y: height + r / 2,
    r: r,
    alpha: random(50, 255),
    speed: speed,
    color: colorVal
  });
}

function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius1;
    let sy = y + sin(a) * radius1;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius2;
    sy = y + sin(a + halfAngle) * radius2;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

