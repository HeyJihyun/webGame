let isJumping = false; // 점프 중
let isAttacking = false; // 공격중
let score = 0; // 점수
let position = 0; // 배경위치

let playing; // null일 경우 play중 아님
const music = new Audio("./assets/bgm.wav"); // 배경음

let player;
let monster;
let star;

$(function () {
  // html 로드 시 변수에 elements 대입
  player = $("#player");
  monster = $("#monster");
  star = $("#star");

  // start 버튼, replay 버튼 클릭 시 게임 스타트
  $("#start, #replay").click(function () {
    gameStart();
  });
});

function gameStart() {
  $(".startBox, .gameOverBox").slideUp(); // start,gameover box 안보이게
  backgroundmusic(); // 배경음악 시작

  isJumping = false; // 점프 중
  isAttacking = false; // 공격중
  score = 0; // 점수 초기화
  updateScore();
  position = 0; // 배경 위치 초기화
  // player 초기화
  player.css("bottom", "20px");

  setKeyboardEvent(); // keyboard이벤트 실행
  setClickEvent();
  monsterStart(); // monster 움직이게

  // 120 프레임으로 반복
  playing = setInterval(function () {
    if (!checkGameOver()) {
      moveBackground();
      if (isAttacking) {
        // 공격중인 동안 공격성공 체크
        checkAttack();
      }
    } else {
      gameOver(playing);
    }
  }, 1000 / 120); // 120
}

//배경음악 재생
function backgroundmusic() {
  music.loop = true;
  music.play();
}

// 배경음악 멈추기
function stopBackgroundMusic() {
  music.pause();
}

// 배경 움직이는 함수
function moveBackground() {
  $(".playBox").css("background-position", position-- + "px");
}

// 키보드 입력이벤트 함수
function setKeyboardEvent() {
  $("html").keydown(function (e) {
    console.log(e.key);
    switch (e.key) {
      case " ":
      case "v":
      case "V":
        jump();
        break;
      case "z":
      case "Z":
        if (!isAttacking) {
          attack();
        }
    }
  });
}

// 클릭 이벤트
function setClickEvent() {
  $("#jump").click(function () {
    jump();
  });
  $("#attack").click(function () {
    if (!isAttacking) {
      attack();
    }
  });
}

// 플레이어 점프
function jump() {
  if (!isJumping) {
    isJumping = true;
    new Audio("./assets/jump.mp3").play(); // jump 효과음
    player
      .animate({ bottom: "130px" }, 500)
      .animate({ bottom: "20px" }, 500, function () {
        isJumping = false;
      });
    star.animate({ bottom: "200px" }, 500).animate({ bottom: "90px" }, 500);
  }
}

// 공격하기
function attack() {
  if (!isAttacking) {
    isAttacking = true;
    new Audio("./assets/attack.wav").play();
    star.animate({ bottom: "50px", left: "100px" }).animate({ left: "500px" });

    setTimeout(() => {
      star.css("left", "70px").css("bottom", "90px").show();
      isAttacking = false;
    }, 5000);
  }
}

// 공격 성공

function checkAttack() {
  const starrRect = star[0].getBoundingClientRect();
  const monsterRect = monster[0].getBoundingClientRect();
  const checked =
    starrRect.right > monsterRect.left &&
    starrRect.left < monsterRect.right &&
    starrRect.top < monsterRect.bottom &&
    starrRect.bottom > monsterRect.top;

  if (checked) {
    monster.hide();
    star.hide();
    score += 200;
    updateScore();
  }

  return checked;
}

// 적의 속도 조절 용 랜덤 넘버 함수
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 적이 오른쪽에서 왼쪽으로 이동
function monsterStart() {
  const speed = getRandomNumber(1500, 4000);
  monster
    .show()
    .css("right", "-50px")
    .css(
      "background-image",
      `url("./assets/monster_${getRandomNumber(1, 3)}.gif")`
    )
    .animate({ right: "500px" }, speed, "linear", function () {
      // 점수 올리자
      console.log(monster.attr("display"));
      if (monster.css("display") !== "none") {
        score += 100;
        updateScore();
      }
      monsterStart();
    });
}

function updateScore() {
  $(".score").html(score);
}

// 게임오버 체크

// 게임오버 조건
function checkGameOver() {
  const playerRect = player[0].getBoundingClientRect();
  const monsterRect = monster[0].getBoundingClientRect();
  checked =
    playerRect.left + 40 < monsterRect.right + 5 &&
    playerRect.right > monsterRect.left + 5 &&
    playerRect.top < monsterRect.bottom + 5 &&
    playerRect.bottom > monsterRect.top + 5;

  console.log(checked);

  return checked;
}

function gameOver(playing) {
  // 게임오버 효과음 재생, 배경음악 멈추기
  new Audio("./assets/gameOver.wav").play();
  stopBackgroundMusic();

  // palying interval 멈추기
  clearInterval(playing);
  $(".gameOverBox").slideDown();
  monster.stop();
  // 이전 이벤트 핸들러 제거
  $("html").off("keydown");
}
