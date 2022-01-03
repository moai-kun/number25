let win_width; // ウィンドウの横サイズ
let win_height; // ウィンドウの縦サイズ
let headSpace; // メニューバーの長さ
let ButtonLeft; // 左上のボタンのx座標
let ButtonTop; // 左上のボタンのy座標
let nextNum; // 次にクリックすべき数字
let AllNum; // 1～25の配列(左上から右下の順)
let size; // ボタンサイズ(size*size)
let startTime; // 開始時間
let elapsedTime; // 経過時間
let myInterval; // ストップウォッチのための関数式
let openScoreBoard; // スコアボードが開いているかどうか
let score = ["- -:- -:- - -", "- -:- -:- - -", "- -:- -:- - -", "- -:- -:- - -", "- -:- -:- - -"];

let supportTouch = 'ontouchend' in document; // タッチイベントが利用可能かの判別
// イベント名
let EVENTNAME_TOUCHSTART = supportTouch ? 'touchstart' : 'mousedown';
let EVENTNAME_TOUCHMOVE = supportTouch ? 'touchmove' : 'mousemove';
let EVENTNAME_TOUCHEND = supportTouch ? 'touchend' : 'mouseup';

// jQueryでHTMLの読み込みが完了してからCSSを読みこむ(スマホでcssのkeyframesが動作しない時のための対策)
$(function(){
  let style = "<link rel='stylesheet' href='style.css'>";
  $('head:last').after(style);
});

// スクロールを制限する処理
let scrollControll = function(event) {
  let scrollArea = $(event.target).closest('.tablevalue');
  let scrollArea2 = $(event.target).closest('.tablevalue > table');
  if (scrollArea.length > 0 && scrollArea.scrollTop() != 0 && scrollArea.scrollTop() + scrollArea.height() != scrollArea2.height()) { // スコアボードのスクロールは可
      event.stopPropagation();
  } else {
      event.preventDefault();
  }
};
document.addEventListener('touchmove', scrollControll, { passive: false }); // スクロール制限(SP)
document.addEventListener('mousewheel', scrollControll, { passive: false }); // スクロール制限(PC)
document.onselectstart = function() { return false; }; // 選択禁止

// ダブルタップによる拡大を禁止
let doubleTapTime = 0;
document.documentElement.addEventListener('touchend', function (e) {
  let now = new Date().getTime();
  if ((now - doubleTapTime) < 350){
    e.preventDefault();
  }
  doubleTapTime = now;
}, false);


// window(HTML)の読み込みが完了してから初期設定
window.onload = function(){
  initDefine();
};


// 初期設定
function initDefine() {
  win_width = window.innerWidth; // ウィンドウの横サイズ
  win_height = window.innerHeight; // ウィンドウの縦サイズ
  headSpace = win_height*0.15;
  ButtonLeft = 0;
  ButtonTop = 0;
  nextNum = 1;
  AllNum = [];
  startTime = 0;
  elapsedTime = 0;
  openScoreBoard = false;
  document.getElementById("timer").innerHTML = '00:00:000';
  setScoreData()
  addNumButton();
  addScoreButton();
  setPos();
  addStartButton();
}

// cookieに保存されている値をとってくる
function setScoreData() {
  let cok = document.cookie.split(';');
  if (cok != "") {
    for (let i = 0; i < cok.length; i++) {
      content = cok[i].split('=');
      score[i] = content[1];
      console.log(cok)
    } 
  }
}

// 数字ボタンを設置する関数
function addNumButton() {
  let Space = 10;
  if (win_width < win_height-headSpace) { // ウィンドウサイズが縦長の時
    size = Math.floor( (win_width-Space*2-2*4) / 5 );
    ButtonLeft = 10;
    ButtonTop = headSpace+5
  }else{
    size = Math.floor( (win_height-Space*2-2*4-headSpace) / 5 );
    ButtonLeft = ( win_width-(size*5 + 2*4) ) / 2;
    ButtonTop = headSpace+Space;
  }

  let x = ButtonLeft;
  let y = ButtonTop;
  let preAllNum = [...Array(25).keys()].map(i => ++i)
  for (let i = 0; i < 25; i++) {
    n = Math.floor(Math.random() * preAllNum.length)
    AllNum.push(preAllNum[n])
    preAllNum.splice(n, 1)
  }

  let divEX;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      n = i*5 + j;
      divEX = document.createElement("div"); // div要素作成
      divEX.setAttribute("class","buttonEx"); // div要素にclassを設定
      divEX.setAttribute("id", AllNum[n]); // div要素にidを設定
      divEX.setAttribute("style","position: absolute; left: "+(x)+"px; top: "+(y)+"px; width: "+(size)+"px; height: "+(size)+"px; z-index: 100;"); // div要素にstyleを設定
      parentDiv = document.getElementById("parent-num"); // 親要素（div）への参照を取得
      parentDiv.appendChild(divEX); // ボタン追加

      divIn = document.createElement("div"); // div要素作成
      divIn.setAttribute("class","buttonIn"); // div要素にclassを設定
      divIn.setAttribute("style", "font-size:"+Math.floor(size*3/5)+"px;") // フォントサイズ指定
      divEX.appendChild(divIn)

      let divElement = document.getElementById(AllNum[n])
      divElement.addEventListener(EVENTNAME_TOUCHSTART, Click); // ボタンに指が触れたときの処理を追加
      x += size+2;
    }
    x = ButtonLeft;
    y += size+2;
  }
}

// ボタンやタイマーの位置を調整する関数
function setPos() {
  let reStartButton = document.getElementById('restartbutton');
  reStartButton.style.left = ButtonLeft+"px"; // リスタートボタンの位置調整
  reStartButton.style.top = ButtonTop-headSpace+"px"; // リスタートボタンの位置調整
  reStartButton.style.fontSize = size/4+"px"; // リスタートボタンの文字サイズ調整

  let timer = document.getElementById('timer')
  timer.style.right = ButtonLeft+"px"; // ストップウォッチの位置調整
  timer.style.top = ButtonTop-headSpace/2+"px"; // ストップウォッチの位置調整
  timer.style.fontSize = size/3+"px"; // ストップウォッチの文字サイズ調整

  let num = document.getElementById('num')
  num.style.left = ButtonLeft+"px"; // 「次の番号」の位置調整
  num.style.top = ButtonTop-headSpace/2+"px"; // 「次の番号」の位置調整
  num.style.fontSize = size/3+"px"; // 「次の番号」の文字サイズ調整
}

// スタートボタンの追加
function addStartButton() {
  let startBEx = document.createElement('button');
  startBEx.setAttribute("id", "startbutton");
  startBEx.setAttribute("class", "startbutton");
  startBEx.setAttribute("width","100px");
  let x = ( win_width-(size*5 + 2*4) )/2 + size/2;
  let y = Math.floor(ButtonTop + size*7/4 +2);
  startBEx.setAttribute("style", "font-size: "+(size)+"px; position: absolute; left: "+(x)+"px; top: "+(y)+"px; width: "+(size*4+8)+"px; height: "+(size*3/2+4)+"px; z-index: 200;");
  let startBIn1 = document.createElement('div');
  let startBIn2 = document.createElement('div');
  startBIn1.innerHTML = "１から順に素早く押せ！";
  startBIn1.setAttribute("style", "font-size: "+(size/4)+"px; position: relative;");
  startBIn2.innerHTML = supportTouch ? "タップで開始" : "クリックで開始";
  startBIn2.setAttribute("style", "font-size: "+(size/2)+"px; position: relative;");
  startBEx.appendChild(startBIn1);
  startBEx.appendChild(startBIn2);
  document.body.appendChild(startBEx);
  let startB = document.getElementById("startbutton");
  startB.addEventListener(EVENTNAME_TOUCHSTART, startGame); // 開始ボタンをクリックしたときの開始処理を追加
}

// スコア表示ボタンを追加
function addScoreButton() {
  let newElement = document.createElement('button');
  newElement.setAttribute("id", "scorebutton");
  newElement.setAttribute("class", "scorebutton");
  newElement.setAttribute("style", "font-size: "+(size/4)+"px; position: absolute; right: "+(ButtonLeft)+"px; top: "+(ButtonTop-headSpace)+"px;");
  newElement.innerHTML = "スコアランキング"
  document.body.appendChild(newElement);
  let scoreButton = document.getElementById("scorebutton");
  scoreButton.addEventListener(EVENTNAME_TOUCHSTART, scoreDisplay); // スコアボタンをクリックしたときの開始処理を追加
}

// 開始時処理をする関数
function startGame(){
  let startButton = document.getElementById("startbutton");
  startButton.removeEventListener(EVENTNAME_TOUCHSTART, startGame); // 開始ボタンをクリックしたときの開始処理を削除
  document.getElementById("scorebutton").remove() // スコア表示ボタンを削除

  startCheck = true;
  let promise = new Promise((resolve, reject) => { // #1
    $("#startbutton").text(3); // 3を表示
    resolve('1')
  })
  promise.then(() => { // 上記処理後1000秒後，以下を実行
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        $("#startbutton").text(2); // 2を表示
        resolve("2")
      }, 1000)
    })
  }).then(() => { //上記処理後1000秒後，以下を実行
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        $("#startbutton").text(1); // 1を表示
        resolve("3")
      }, 1000)
    })
  }).then(() => { //上記処理後1000秒後，以下を実行
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        for (let i = 1; i <= 25; i++) { // それぞれのボタンに数字を表示
          $("#"+i).children('div').text(i)
        }
        startButton.remove() // 開始ボタンを削除
        document.getElementById('num').innerHTML = "next > "+1;
        let reStartButton = document.getElementById('restartbutton');
        reStartButton.addEventListener("click", reStart); // トップに戻るボタンにリスタート関数を追加
        startTime = new Date();
        myInterval = setInterval("updateTimetText()", 1); // 1mm秒ごとにupdateTimeText関数を実行
        resolve("4")
      }, 1000)
    })
  }).catch(() => { // エラーハンドリング
    console.error('Something wrong!')
  })
}

let closeScoreBorad = function(event) {
  if(openScoreBoard && !event.target.closest('.scoreboard')) {
    scoreDisplay();
  }
}

// スコアボードの表示
function scoreDisplay() {
  if (openScoreBoard) { // スコアボードが開いていたら
    document.removeEventListener(EVENTNAME_TOUCHSTART, closeScoreBorad);
    document.getElementById("scoreboard").remove()
    addStartButton();
    setTimeout(() => {
      let scoreButton = document.getElementById("scorebutton");
      scoreButton.addEventListener(EVENTNAME_TOUCHSTART, scoreDisplay); // スコアボタンをクリックしたときの開始処理を追加
    }, 500)
    openScoreBoard = false;
  }else{ // スコアボードが閉じていたら
    nowScore = document.getElementById("timer").innerHTML;
    if (nowScore == "00:00:000") {
      let scoreButton = document.getElementById("scorebutton");
      scoreButton.removeEventListener(EVENTNAME_TOUCHSTART, scoreDisplay); // スコアボタンをクリックしたときの開始処理を削除      
    }
    if (document.getElementById("startbutton") != null) {
      document.getElementById("startbutton").remove(); 
    }
    let newElementD = document.createElement('div');
    newElementD.setAttribute("id", "scoreboard");
    newElementD.setAttribute("class", "scoreboard");
    let x = ButtonLeft+size/2;
    let y = ButtonTop+size/2;
    let width = size*4+8;
    let height = size*4+8;
    newElementD.setAttribute("style", "font-size: "+(size/2)+"px; position: absolute; left: "+(x)+"px; top: "+(y)+"px; width: "+(width)+"px; height: "+(height)+"px; z-index: 300;");
    document.body.appendChild(newElementD);

    // タイム更新
    if (nowScore != "00:00:000") {
      let notFinal = false;
      for (let i = 0; i < score.length; i++) {
        if (nowScore < score[i] || score[i] == "- -:- -:- - -") {
          score.splice(i,0,nowScore);
          notFinal = true
          break;
        }
      }
      if (score[score.length-1] == "- -:- -:- - -") { // 記録なし(- -:- -:- - -)が5位以降は表示されないようにするため
        score.pop();
      }
      if (!notFinal) { // 一番タイムが遅かったら
        score.push(nowScore);
      }
      // スコアをCookieに保存(期限は24時間)
      let expire = new Date();
      expire.setTime( expire.getTime() + 1000 * 3600 * 24 )
      for (let i = 0; i < score.length; i++) {
        document.cookie = 'score'+(i+1)+'='+score[i]+'; expires='+expire.toUTCString();
      }
    }

    // スコア表作成(順位・スコアの名称部分，上の１行)
    let newDivName = document.createElement('div');
    newDivName.setAttribute("class", "tablename");
    newDivName.setAttribute("style", "position: relative; width: "+(width)+"px; height: "+(height*0.25)+"px;");
    let newTableName = document.createElement('table');
    newTableName.setAttribute("style", "width: "+(width)+"px;")
    let newTr = document.createElement('tr');
    let newTh1 = document.createElement('th');
    newTh1.setAttribute("nowrap", ""); // 文字の改行を防ぐ
    newTh1.setAttribute("style", "width: 30%;"); // 幅の指定
    newTh1.innerHTML = "順位";
    let newTh2 = document.createElement('th');
    newTh2.setAttribute("nowrap", ""); // 文字の改行を防ぐ
    newTh2.setAttribute("style", "width: 70%;"); // 幅の指定
    newTh2.innerHTML = "スコア";
    newTr.appendChild(newTh1);
    newTr.appendChild(newTh2);
    newTableName.appendChild(newTr);
    newDivName.appendChild(newTableName);
    newElementD.appendChild(newDivName);

    // スコア表作成(順位・スコア内容部分２行目以降)
    let newDivValue = document.createElement('div');
    newDivValue.setAttribute("class", "tablevalue");
    newDivValue.setAttribute("style", "position: relative; width: "+(width)+"px; height: "+(height*0.75)+"px;");
    let newTableValue = document.createElement('table');
    newTableValue.setAttribute("style", "width: "+(width)+"px;")
    let scoreN = 0; // スコア位置
    for (let i = 0; i < score.length; i++) {
      newTr = document.createElement('tr');
      newTh1 = document.createElement('th');
      newTh1.setAttribute("style", "width: 30%;"); // 幅の指定
      newTh1.innerHTML = i+1;
      newTh2 = document.createElement('th');
      newTh2.setAttribute("style", "width: 70%;"); // 幅の指定
      newTh2.innerHTML = score[i];
      if (nowScore == score[i]) { // 記録したスコアには点滅エフェクトを入れる
        newTh1.setAttribute("class", "nowscore");
        newTh2.setAttribute("class", "nowscore");
        if (i >= 3) {
          scoreN = i-2;
        }
      }
      newTr.appendChild(newTh1);
      newTr.appendChild(newTh2);
      newTableValue.appendChild(newTr);
    }
    newDivValue.appendChild(newTableValue);
    newElementD.appendChild(newDivValue);

    // ページ全体がスクロールしないように調整
    let scrollArea = document.querySelector('.tablevalue');
    let scoreDy = scrollArea.querySelector('table th').clientHeight
    scrollArea.scrollTop = 1 + scoreDy*scoreN; // 最初のスクロール位置
    let scrollArea2 = document.querySelector('.tablevalue table');
    scrollArea.addEventListener('scroll', function() {
      if (scrollArea.scrollTop == 0) {
        scrollArea.scrollTop = 1;
      }else if (scrollArea.scrollTop + scrollArea.clientHeight == scrollArea2.clientHeight) {
        scrollArea.scrollTop = scrollArea.scrollTop-1;
      }
    });

    if(nowScore == "00:00:000"){
      setTimeout(() => {
        document.addEventListener(EVENTNAME_TOUCHSTART, closeScoreBorad);
      }, 500)
    }
    openScoreBoard = true;

  }
}

function Click(e) { // ボタンをクリックしたときの処理
  if (startTime != 0) { // タイマーが始まっていたらボタンのクリックを許可
    let clicked_id = e.currentTarget.id
    console.log(e.currentTarget)
    if (clicked_id == nextNum) {
      e.currentTarget.removeEventListener(EVENTNAME_TOUCHSTART, Click); // ボタンに指が触れたときの処理を削除
      $("#"+clicked_id).addClass("clicked")
      if (clicked_id == 25) {
        clearInterval(myInterval);
        document.getElementById('num').innerHTML = "";
        scoreDisplay()
      }else{
        nextNum += 1;
        document.getElementById("num").innerHTML = "next > "+nextNum;
      }
    }else{
      $("#"+clicked_id).addClass("badeffect")
      setTimeout(() => {
        $("#"+clicked_id).removeClass("badeffect"); //0.1秒後にclassを削除
      }, 100)
    }
  }
}

function updateTimetText(){
  let nowTime = new Date();
  elapsedTime = nowTime.getTime() - startTime.getTime()
  //m(分) = 135200 / 60000ミリ秒で割った数の商　-> 2分
  let m = Math.floor(elapsedTime / 60000);

  //s(秒) = 135200 % 60000ミリ秒で / 1000 (ミリ秒なので1000で割ってやる) -> 15秒
  let s = Math.floor(elapsedTime % 60000 / 1000);

  //ms(ミリ秒) = 135200ミリ秒を % 1000ミリ秒で割った数の余り
  let ms = elapsedTime % 1000;

  //HTML 上で表示の際の桁数を固定する　例）3 => 03　、 12 -> 012
  //javascriptでは文字列数列を連結すると文字列になる
  //文字列の末尾2桁を表示したいのでsliceで負の値(-2)引数で渡してやる。
  m = ('0' + m).slice(-2); 
  s = ('0' + s).slice(-2);
  ms = ('0' + ms).slice(-3);

  //HTMLのid　timer部分に表示させる
  document.getElementById("timer").innerHTML = m + ':' + s + ':' + ms;
}


// リスタート処理．「トップに戻る」ボタンを押したときの処理
function reStart() {
  let reStartButton = document.getElementById('restartbutton');
  reStartButton.removeEventListener("click", reStart); // トップに戻るボタンに追加されたリスタート関数を削除
  clearInterval(myInterval); // タイマーのカウントを削除

  if (document.getElementById("scoreboard") != null) {
    document.getElementById("scoreboard").remove();
    openScoreBoard = false;
  }

  let parent = document.getElementById('parent-num');
  parent.innerHTML = ''; // 数字ボタンをすべて削除
  initDefine();
}




