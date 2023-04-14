



// dom
const playground = document.querySelector(".playground>ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text>button");
// setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// varliavles
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;
let time;


const movingItem = {
    type:"", 
    direction:3,
    top:0,
    left:0,  
};
const BLOCKS = {
    tree : [
        [[2,1],[0,1],[1,0],[1,1]],
        [[1,2],[0,1],[1,0],[1,1]],
        [[1,2],[0,1],[2,1],[1,1]],
        [[2,1],[1,2],[1,0],[1,1]],
    ],
    sequre : [
        [[0,0],[0,1],[1,0],[1,1]],
        [[0,0],[0,1],[1,0],[1,1]],
        [[0,0],[0,1],[1,0],[1,1]],
        [[0,0],[0,1],[1,0],[1,1]],
    ],
    bar : [
        [[1,0],[2,0],[3,0],[4,0]],
        [[2,-1],[2,0],[2,1],[2,2]],
        [[1,0],[2,0],[3,0],[4,0]],
        [[2,-1],[2,0],[2,1],[2,2]],
    ],
    zee : [
        [[0,0],[1,0],[1,1],[2,1]],
        [[0,1],[1,0],[1,1],[0,2]],
        [[0,1],[1,1],[1,2],[2,2]],
        [[2,0],[2,1],[1,1],[1,2]],
    ],
    eleft : [
        [[0,0],[0,1],[1,1],[2,1]],
        [[1,0],[1,1],[1,2],[0,2]],
        [[0,1],[1,1],[2,1],[2,2]],
        [[1,0],[2,0],[1,1],[1,2]],
    ],
    eright : [
        [[1,0],[2,0],[1,1],[1,2]],
        [[0,0],[0,1],[1,1],[2,1]],
        [[0,2],[1,0],[1,1],[1,2]],
        [[0,1],[1,1],[2,1],[2,2]],
    ]
};

// functions

init();

function init(){
    tempMovingItem = {...movingItem}; //값만 복사
    duration = 500;
    
    for(let i=0;i<GAME_ROWS;i++){
        prependNewLine();
    }
    generateNewBlock();

    time = setInterval(function(){
        duration *= 4/5;
    }, 20000);
    
    document.addEventListener("keydown",keyDown);
}

function prependNewLine(){
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j=0;j<GAME_COLS;j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}

function renderBlocks(moveType=""){
    const {type, direction, top, left} = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");

    //기존에 있던 블럭 좌표의 클래스삭제
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");  
    });

    //갱신된 블럭 좌표에 클래스삽입
    BLOCKS[type][direction].some(block=>{
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        
    
        const isAvilable = checkEmpty(target);
        
        if(isAvilable){
            target.classList.add(type, "moving");
        }else {
            tempMovingItem = {...movingItem};
            if(moveType ==='retry'){
                clearInterval(downInterval);
                showGameoverText();
            }
            setTimeout(()=>{
                renderBlocks('retry');
                if(moveType ==="top"){
                    console.log(target);
                    seizeBlock();
                }  
            },0);
            return true; 
        }

    })


    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function seizeBlock(){
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    });
    checkMatch();
}

function checkMatch(){
    const childNodes = playground.childNodes;
    childNodes.forEach(child=>{
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerHTML = score;
                //스코어에 따른 속도 증가
            console.log(score);
            if(score%7==0){
                console.log(score/7);
                duration *= (score/7)*(4/5); 
            }
        }
    })
    
    generateNewBlock();
}

function generateNewBlock(){
    
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock("top",1);
    },duration);

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random()*blockArray.length);
    
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = {...movingItem};

    renderBlocks();
}

function checkEmpty(target){
    //null은
    if(!target || target.classList.contains("seized")){
        return false;
    }else return true;
}


function moveBlock(moveType, amount){
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}

function changeDirection(){
    const direction = tempMovingItem.direction;
    direction ===3 ? tempMovingItem.direction =0 : tempMovingItem.direction +=1;
    renderBlocks();
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top",1);
    }, 10);
}

function showGameoverText(){
    clearInterval(time);
    gameText.style.display = "flex";
    duration = 500;
    document.removeEventListener('keydown', keyDown);
}


// event handling

function keyDown(e){
    switch(e.keyCode){
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
}


restartButton.addEventListener("click", ()=>{
    playground.innerHTML ="";
    scoreDisplay.innerHTML ="0";
    gameText.style.display ="none";
    init();
})