class Game {
    constructor(isPaused,score,density,speed,densityStep,balloonsArray,updateTime){
        console.log('in constructor ');
        console.log
        this.isPaused = isPaused;
        this.score = score;
        this.density = density;
        this.speed = speed;
        this.densityStep = densityStep;
        this.balloonsArray = balloonsArray;
        this.startedElement = document.getElementById('start-btn');
        // this.pausedElement = document.getElementById('pause-btn');
        this.scoreElement = document.getElementById('score-count');
        this.innContainerElement = document.getElementById('inn-container');
        this.intervalId=null;
        this.updateTime = updateTime;
        var thiz = this;
        this.updater = function(){
            thiz.updateGame();
        };
    };

    startGame(){
        this.startedElement.style.display = "none";
        // this.pausedElement.style.display = "block";
        this.intervalId = setInterval(this.updater,this.updateTime);
    };

    pauseGame(){
        clearInterval(this.intervalId);
    };

    updateScore(score){
        this.scoreElement.innerHTML = score;
    };

    updateGame(){
        this.densityStep +=this.density;

        if(this.densityStep >=1 && this.balloonsArray.length < 20){
            for(var i=0; i<parseInt(this.densityStep,10); i++){
                var popBalloon = new Balloon(0,-53,'green',100);
                popBalloon.XPosition = popBalloon.getRandomPosX();
                var elm = document.createElement('div');
                elm.className = 'balloon '+popBalloon.color;
                elm.style.left = popBalloon.XPosition+'px';
                elm.style.bottom = popBalloon.YPosition+'px';
                var thiz = this;
                var index = this.balloonsArray.length;

                elm.onclick = function(){
                    thiz.score += thiz.balloonsArray[index].points;
                    thiz.updateScore(thiz.score);
                    this.parentNode.removeChild(elm);
                };

                this.innContainerElement.appendChild(elm);                

                var popObj = {};
                popObj.elm = elm;
                popObj.speed = popBalloon.getRandomSpeed();
                popObj.points = popBalloon.points;
                this.balloonsArray.push(popObj);
            }
            this.densityStep = 0;
        }
        for(var j=0; j <this.balloonsArray.length ; j++){
            if(parseInt(this.balloonsArray[j].elm.style.bottom,10)>1400){
                this.pauseGame();
                var score = this.score;
                var params = {scoreval:score};
                $.post('/score',params, function(data){
                    console.log('calling score route');
                });
                break;
            }else{
                this.balloonsArray[j].elm.style.bottom = (parseInt(this.balloonsArray[j].elm.style.bottom, 10)+
                                                        (3+this.balloonsArray[j].speed))+'px';
            }                                  
        }
    };
};

class Balloon {
    constructor(pos_x, pos_y, color, points){
        this.XPosition = pos_x;
        this.YPosition = pos_y;
        this.color = color;
        this.points = points;
    };

    getRandomSpeed(){
        return Math.floor(Math.random() * 201)/100; 
    };

    getRandomPosX(){
        return Math.floor(Math.random() * 500);
    };
};


window.addEventListener('load',function(){
    // this.pausedElement.style.display = "none";
    const popgame = new Game(true,0,1000/4000,0.01,1,[],50);
                            
    document.getElementById('start-btn').onclick = function(){
        console.log('in clickevnt : ', popgame.densityStep);
        popgame.startGame();
    };

    this.document.getElementById('pause-btn').onclick = function(){
        popgame.pauseGame();
    }
});