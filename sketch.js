
let isSetup = false;
let me, ppl, shared, canvas;
let width = 500;
let height = 500;
let avatar = [];
let paw = [];
let sprites = [], sprite_paw,sprite_me;
let PLAYERS, OTHER_PLAYERS;
let currentPaw = getRandom(0,5);

//helpers for the paw movements 
const MARGIN = 50;
const DIRECTIONS = [[1,MARGIN, 180], [1,height-MARGIN, 0], [MARGIN,1, 90], [width-MARGIN,1, 270]]

function preload() {
  
    partyConnect(
      "wss://deepstream-server-1.herokuapp.com",
      "hello_pawty_1ala",
      "main",
    () => {
      console.log("connected!");
    }
  );

  
  me = partyLoadMyShared();
  ppl = partyLoadParticipantShareds();
  shared = partyLoadShared("shared");
  // partyWatchShared(shared, onDataChange);
  
  
  for(let i=1; i<4; i++){ 
    let a = [`assets/fish${i}_${1}.png`, `assets/fish${i}_${2}.png`];
    avatar.push(a)
  }
  
  for(let i=1; i<7; i++){
    let a = `assets/paw${i}.png`;
    paw.push(a)
  }
  
}

function createPlayerSprite(p){

  let s = createSprite(p.x, p.y,50, 50)
  s.addAnimation('normal', avatar[p.avatar][0],avatar[p.avatar][1] );
  s.scale = 0.5
  PLAYERS.add(s);

  return s;

}


function setup() {
  
  shared.counts = shared.counts || 0;
  shared.counts += 1;
  shared.x = shared.x || width/2;
  shared.y = shared.y || height/2;
  shared.rotation = shared.rotation || getRandom(0, 180);
  shared.paw = shared.paw || getRandom(0,5)
  
  frameRate(10);
  canvas = createCanvas(width, height);
 
  me.x = width/2 + (Math.random()-1) * 100;
  me.y = height/2 + (Math.random()-1) * 100;
  me.avatar = getRandom(0,2);   
  me.ready = true;
  me.id = shared.counts;
  me.score = 0;
  isSetup = true;
  
  PLAYERS = new Group();
  OTHER_PLAYERS = new Group();
  
  sprite_me = createPlayerSprite(me);
  sprites.push(sprite_me);

//creating sprites for all plays except me
  for(let p of ppl){
    
    if (p.ready === true && me.id !== p.id){
          
      let s = createPlayerSprite(p);
      OTHER_PLAYERS.add(s)
      sprites.push(s)
     }     
        
  }


  
  //creating the paw sprite
  sprite_paw = createSprite( width/2, height/2);
  sprite_paw.addAnimation('normal', `assets/paw1.png`,`assets/paw2.png`,`assets/paw3.png`,`assets/paw4.png`,`assets/paw5.png`,`assets/paw6.png`)  

  sprite_paw.animation.playing = false;

  sprite_paw.velocity.y = 10;
  // sprite_paw.setCollider('circle', 0, 0, 50);

  setNewPaw();
  
  keyPressed();
  

}

function addPeople(){
    let current = sprites.length;
  
    
    for(let [i,p] of ppl.entries()){
    
    if (p.ready === true && i >= current){
      
        let s = createPlayerSprite(p);
        OTHER_PLAYERS.add(s)
        sprites.push(s)
        
    }
  }
}

function setNewPaw(){

  shared.show = true;  
  shared.paw = getRandom(0,5);  

//appearing from the edges------

  let dir = getRandom( 0, 3)
  let speed = 20;
  let degrees = DIRECTIONS[dir][2] //
  shared.x = DIRECTIONS[dir][0] === 1 ? Math.random() * width : DIRECTIONS[dir][0];
  shared.y = DIRECTIONS[dir][1] === 1 ? Math.random() * height : DIRECTIONS[dir][1]
  shared.rotation = degrees;

  //not working 
  // sprite_paw.velocity.x = cos(degrees)*speed;
  // sprite_paw.velocity = (0,10)

//appearing from the edges--------

  sprite_paw.animation.nextFrame();

  

}

function showPaw(){

    if(shared.paw !== currentPaw){
       sprite_paw.animation.nextFrame();
       currentPaw = shared.paw;
     }
    sprite_paw.position.x = shared.x;
    sprite_paw.position.y = shared.y;
    sprite_paw.rotation = shared.rotation;

}

function getRandom(start, end){
  return Math.floor(Math.random() * (end - start + 1) + start);
}


function draw() {

  
  
  background(color('#efefef'));
  keyMove();

  if (partyIsHost()) {
    if(frameCount % 30 == 0){
       setNewPaw();
       }
  }

  
  
  if(sprites.length !== ppl.length){
    addPeople();
  }else{
      
  for(let [i,p] of ppl.entries()){
    if (p !== undefined){
        if (p.ready === true){
        sprites[i].position.x = p.x;
        sprites[i].position.y = p.y;
     }
    
    // if(sprites[i].bounce(sprite_paw) === true){     
    //      sprites[i].rotation += 100;
  
    // }
      
    }
    
  }

  }//end of updating positions

OTHER_PLAYERS.bounce((sprite_paw), (someone)=>{     
    someone.rotation += 100;
})

sprite_me.bounce( sprite_paw, (myself)=>{
    myself.rotation += 100;
    me.score += 1;
    console.log(me.score)

})
sprite_me.bounce( OTHER_PLAYERS );


  showPaw();

  drawSprites();


}


function keyPressed() {
  let step = 20;
    
  switch(key) {   
    case 'w': me.y = Math.max(0.0, me.y-step ); break;
    case 'd': me.x = Math.min(width, me.x + step );break;    
    case 's': me.y = Math.min(height, me.y + step );break;
    case 'a': me.x = Math.max(0.0, me.x-step ); break;
  }

}

function keyMove() {
  let step = 20;
    
    if (keyIsDown(87)) me.y = Math.max(0.0, me.y-step ); 
    if (keyIsDown(68)) me.x = Math.min(width, me.x + step );
    if (keyIsDown(83)) me.y = Math.min(height, me.y + step );
    if (keyIsDown(65)) me.x = Math.max(0.0, me.x-step ); 
}