
const { timeStamp } = require('console');
const express = require('express')
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port=3000;

const CANVAS_WIDTH=600;
const CANVAS_HEIGHT=500;

let frameNumber=0;
let policeX=555*0.0009259*CANVAS_WIDTH;
let policeY=154*CANVAS_HEIGHT*0.00131;
let trafficpoliceW=60*0.0009259*CANVAS_WIDTH
let trafficpoliceH=80*CANVAS_HEIGHT*0.00131

let potX=565*0.0009259*CANVAS_WIDTH
let potY =214*CANVAS_HEIGHT*0.00131
let potW=97*0.0009259*CANVAS_WIDTH
let potH=31*CANVAS_HEIGHT*0.00131

let busW=332*0.0009259*CANVAS_WIDTH
let busH=303*CANVAS_HEIGHT*0.00131
let busX=398*0.0009259*CANVAS_WIDTH
let busY=444*CANVAS_HEIGHT*0.00131

server.listen(port,()=>{
    console.log(`server running at port ${port}`)
})

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/client/index.html');
})

app.use('/client',express.static(__dirname+'/client'));

const SOCKET_LIST ={};



const vms=16;
class roadObjects{
    constructor(){
        this.x=0;
        this.y=0;
        this.width = CANVAS_WIDTH;
        this.height = CANVAS_HEIGHT;
    }
    scale(){
        this.x-=0.15*.0009259*CANVAS_WIDTH;
        this.width+=0.3*.0009259*CANVAS_WIDTH;
        this.height+=0.05*.00131*CANVAS_HEIGHT;
    }
    move(){
        this.y+=vms/2;
        if(this.y>40){
            this.y=0
        }
    }
    moveLeft(){
            this.y+=vms*.00131*CANVAS_HEIGHT;
            this.x-=9.5*.0009259*CANVAS_WIDTH;  
    }
    moveRight(){
        this.y+=vms*.00131*CANVAS_HEIGHT;
        this.x+=9.5*.0009259*CANVAS_WIDTH;
    }
    moveCenter(){
        this.y+=vms*.00131*CANVAS_HEIGHT;
        this.x-=11*.0009259*CANVAS_WIDTH;
        this.width+=22*.0009259*CANVAS_WIDTH;
    }
    restore(){
        this.x=0;
        this.y=0;
    }
    restore2(){
        this.x=0;
        this.y=0;
        this.width=CANVAS_WIDTH;
        this.height = CANVAS_HEIGHT
    }
}

class EventOjects{
    constructor(x,y,width,height)
    {
        this.x=x;
        this.y=y;
        this.width=width;
        this.height =height;
    }
    move(){
        this.y+=(vms/2)*.00131*CANVAS_HEIGHT;
      //  this.x=policeX*.0009259*CANVAS_WIDTH;
        this.width+=1.5*.0009259*CANVAS_WIDTH
        this.height+=1.5*.00131*CANVAS_HEIGHT
    }
    move2(){
        this.y+=(vms/2)*.00131*CANVAS_HEIGHT;;
       // this.x=potholeX
        this.width+=0.5*.0009259*CANVAS_WIDTH
        this.height+=0.3*.00131*CANVAS_HEIGHT;
    }
    restore(){
        this.y=policeY;
        this.width=trafficpoliceW;
        this.height=trafficpoliceH
    }
    restore2(){
        this.y=potY;
        this.width=potW;
        this.height=potH;
    }
    restoreBus(){
        this.x=busX;
    }
}

let leftbusStop = new roadObjects();
let rightbusStop = new roadObjects();
let zebraCrossing = new roadObjects();

//event objects
let police = new EventOjects(policeX,policeY,trafficpoliceW,trafficpoliceH);
let policeSpawn=false;

let bus =new EventOjects(busX,busY,busW,busH);
let busStops=false;
let preloaderDraw=false;
let preloaderTimer=0;
let timerStop=false;

let pothole = new EventOjects(potX,potY,potW,potH)
let potholeSpawn=false;
let delaycounter=0;

let flattyre = false;
let accident = false;
let overheating=false;
let bool=false;
let busstand = false;
let busstopleft=false;
let busstopright=false;
let trafficlightstop=false;

let consoleBusStopLeft=false;
let consoleBusStopRight=false;
let consoleTrafficLightStop=false;


let busImgChange=0;

let curFrame = 0;
let curFrame2 = 0;
let curFrame3 = 0;
let curFrame4=0;
let curFrame5=0;
let frameNo;
let frameNo2;
let frameNo3;
let frameNo4;
let frameNo5;
function updateFrame(){
    if(curFrame>=37){
        curFrame=0
    }
    frameNo=curFrame;
    curFrame++  
    
    return frameNo;
}
function updatedFrameNoForBus(){
    if(curFrame2>=8){
        curFrame2=0
    }
    frameNo2=curFrame2;
    curFrame2++

    return frameNo2;
}
function updatedFrameNoForWhitestripes(){
    if(curFrame3>=8){
        curFrame3=0
    }
    frameNo3=curFrame3;
    curFrame3++

    return frameNo3;
}
function updatedFrameForSmoke(){
    if(curFrame4>=6){
        curFrame4=0
    }
    frameNo4=curFrame4;
    curFrame4++  
    
    return frameNo4;
}

function treeframe(){
    if(curFrame5>=8){
        curFrame5=0
    }
    frameNo5=curFrame5;
    curFrame5++;
    return frameNo5;
}


io.on('connection',(socket)=>{//socket connection here!!
    console.log('user connected')
   
    
   socket.id=Math.random();//assigning an unique id 
   SOCKET_LIST[socket.id]=socket;

   

   socket.emit('servermessage',
         ` player_id:${socket.id}`//unique id for each player
    )

    socket.on('message',(data)=>{//receiving the message sent from the client side!
        console.log(data.width,data.height)
    })

   socket.on('disconnect',()=>{
       delete SOCKET_LIST[socket.id]
   })
   
   
})


setInterval(()=>{
    if(!timerStop){
        frameNumber++;
        
    }
    
    console.log(frameNumber)//uncomment to see server side frame Numbers
   if(busStops){
    curFrame=0;
    curFrame2=0;
    curFrame3=0;
    curFrame4=0;
    curFrame5=0;
    //return;
    preloaderDraw=true;
    preloaderTimer++;
    if(preloaderTimer>=50){//resetting everything before going to next round!!
        police.restore()
        pothole.restore2()
        bus.restoreBus()
        overheating=false;
        bool=false;
        delaycounter=0
        flattyre=false;
        busStops=false;
        busstand=false
        timerStop=false;
        accident=false;
        busstopleft=false;
        busstopright=false;
        trafficlightstop=false;
        consoleBusStopRight=false;
        consoleBusStopLeft=false;
        consoleTrafficLightStop=false;
       policeSpawn=false;
        
        preloaderDraw=false;
        preloaderTimer=0;
        frameNumber=0
        busImgChange=0;
    }
   // pack.push({preloaderDraw,preloaderTimer})
    
    } 

    let updatedFrameNo=updateFrame()
    let updatedFrameNo2 = updatedFrameNoForWhitestripes()
    let updatedFrameNo3 = updatedFrameNoForBus()
    let updatedFrameNo4 = updatedFrameForSmoke()
    let updatedFrameNo5 = treeframe()
    

    //below the pack array contains all the data sent to the client side!!
    const pack=[{frameNo:updatedFrameNo},{frameNo2:updatedFrameNo2,updatedFrameNo5},{
        x:leftbusStop.x,
        y:leftbusStop.y,
    },{
        x2:rightbusStop.x,
        y2:rightbusStop.y,
    },{
        x3:zebraCrossing.x,
        y3:zebraCrossing.y,
        width:zebraCrossing.width,
        height:zebraCrossing.height
    },{frameNo3:updatedFrameNo3,
        b_x:bus.x,
        b_y:bus.y,
        b_w:bus.width,
        b_h:bus.height},
        {busImgChange,updatedFrameNo4,accidentX:bus.x,eventBolean:accident, b_x:bus.x,
            b_y:bus.y,
            b_w:bus.width,
            b_h:bus.height},
    {preloaderDraw,preloaderTimer},{countdown:frameNumber*4.5},
    {eventBolean2:consoleBusStopLeft,eventBolean3:consoleBusStopRight,eventBolean4:consoleTrafficLightStop}
     ]


     if(!busImgChange==0){//sending data to change bus image at events
        pack.splice(5,1,{})
    }

        if(policeSpawn)//traffic police event triggering!
           {
            timerStop=true;
            pack.splice(5,0,{p_x:police.x,
            p_y:police.y,
            p_w:police.width,
            p_h:police.height});

           if(!bool) police.move()
                 if(police.y+police.height/2>=bus.y)
                 {
                    bool=true;
                    police.y>=bus.y-police.height/2
                    busStops=true;
                    
                   // policeSpawn=false
                 }
            }//police spawn

        if(potholeSpawn){//pothole event handler!!
            timerStop=true;
            pack.splice(5,0,{ph_x:pothole.x,
                ph_y:pothole.y,
                ph_w:pothole.width,
                ph_h:pothole.height});

            pothole.move2()
            if(pothole.y>=bus.y){
                busImgChange=1;   
            }
            if(pothole.y>=bus.y+10){
                potholeSpawn=false;
                busStops=true;
            }   
        }//pothole spawn

        if(overheating){//overheating  event handler!!!
            timerStop=true;
            
            delaycounter++
            busImgChange=2;
            
                 if(delaycounter==30){
                    busStops=true;
                    return;
                 }      
        }//overheating

        if(flattyre){//flattyre  event handler
            timerStop=true;

            delaycounter++;
            busImgChange=3;
                if(delaycounter==10){
                    busStops=true;
                    return;
                }
        }

        if(accident){//accident event handler!!
            timerStop =true;
            bus.x+=15;
            delaycounter++;
            if(delaycounter>=6.5){
                busImgChange=4;
                if(bus.x+bus.width>=CANVAS_WIDTH-90){
                    busStops=true;
                    bus.x=CANVAS_WIDTH-bus.width-90;
                }
            }
        }

        if(busstand){//bus stop event handler!!
            if(busstopright){
                if(trafficlightstop){
                    trafficLightStop()
                }else{
                    busstopRight(busstopright)
                }
               
            }else{
                if(trafficlightstop){
                    trafficLightStop()
                }else{
                    busstopLeft(busstopleft)
                }
               
            }  
        }
        

       if(!busStops){
         leftbusStop.moveLeft()
         rightbusStop.moveRight()
         zebraCrossing.moveCenter()
         zebraCrossing.scale()
     
        if(everyinterval(100)){//sending data to draw Tjunctions randomly at a 10 sec interval
            console.log('junctions')
            let rng =getRndInteger(0,100)//change here to change the probabilty of bus stop event
            if(rng<=5){
                if(rng==1)trafficlightstop=true;
                busstand=true;
            }
            let ctl = getRndInteger(0,10)
            if(ctl<=3) leftjunc();
            if(ctl>3&&ctl<7)bothjunc();
            if(ctl>=7&&ctl<10)rightjunc() 
        }
    }
    
    if(frameNumber==646){//change to a variable to implemnt hash key
      // potholeSpawn=true;
     //  policeSpawn=true
        //flattyre=true;
       // overheating=true;
        // accident = true;
       let rng =getRndInteger(1,6)
       if(rng==1)potholeSpawn=true;
       if(rng==2)policeSpawn=true;
       if(rng==3)flattyre=true;
       if(rng==4)overheating=true;
       if(rng==5)accident=true;
    }
    
    for(var i in SOCKET_LIST){  ///sending animation data to each socket connected!
        var socket = SOCKET_LIST[i];
        socket.emit('newposition',pack)  
    }
},1000/5)//END OF SET INTERVAL

//NECESSARY FUNCTIONS ...............................

function bothjunc(){
    busstopright=true
    leftbusStop.restore()
    rightbusStop.restore()
    zebraCrossing.restore2()
 }

 function leftjunc(){
     busstopleft=true;
    leftbusStop.restore()
    zebraCrossing.restore2()
 }

 function rightjunc(){
     busstopright=true
    rightbusStop.restore()
    zebraCrossing.restore2()
 }

 function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

  function everyinterval(n) {
    return ((frameNumber/ n) % 1 == 0) ?  n : false;
}


function busstopRight(busstopright){
    if(busstopright){
        delaycounter++
        if(delaycounter>=5){
            timerStop=true;
            consoleBusStopRight=true;
            bus.x+=4.5;
            if(bus.x+bus.width>=CANVAS_WIDTH-100){
                busStops=true;
              return  bus.x=CANVAS_WIDTH-bus.width-100;
            }
           
        }
    }
}
function busstopLeft(busstopleft){
    if(busstopleft){
        delaycounter++
        if(delaycounter>=5){
            timerStop=true;
            consoleBusStopLeft=true;
            bus.x-=6;
            if(bus.x<=100){
                busStops=true;
              return  bus.x=100;
            }
           
        }
    }
}

function trafficLightStop(){
    
        if(trafficlightstop){
            busstopleft=false;
            busstopright=false;
            delaycounter++
            if(delaycounter>=9){
                timerStop=true;
                consoleTrafficLightStop=true;
                if(delaycounter>=15){
                    busStops=true;
                }
            }
        }
    
   
}