
let isSetup = false;
let me, ppl, shared, canvas;
let width = 900;
let height = 600;
let avatar = [];
let paw = [];
let sprites = [], sprite_paw,sprite_me;
let PLAYERS, OTHER_PLAYERS;
let currentPaw = getRandom(0,5);

        //helpers for the paw movements 
        const MARGIN = 70;
        const DIRECTIONS = [[1,MARGIN, 180], [1,height-MARGIN, 0], [MARGIN,1, 90], [width-MARGIN,1, 270]]

const drawMainCanvas = (sketch) =>{

      sketch.preload = function(){

       
              sketch.partyConnect(
                "wss://deepstream-server-1.herokuapp.com",
                "hello_pawty_1alandla",
                "main",
              () => {
              
              }
            );

            

            me = sketch.partyLoadMyShared();
            ppl = sketch.partyLoadParticipantShareds();
            shared = sketch.partyLoadShared("shared");
          

            for(let i=1; i<4; i++){ 
              let a = [`assets/fish${i}_${1}.png`, `assets/fish${i}_${2}.png`];
              avatar.push(a)
            }

            for(let i=1; i<7; i++){
              let a = `assets/paw${i}.png`;
              paw.push(a)
            }

            
      }//end of preload

      sketch.setup = function(){
          sketch.partyToggleInfo(false);
  
          shared.counts = shared.counts || 0;
          shared.counts += 1;
          shared.x = shared.x || width/2;
          shared.y = shared.y || height/2;
          shared.rotation = shared.rotation || getRandom(0, 180);
          shared.paw = shared.paw || getRandom(0,5)

       
          
          sketch.frameRate(10);
          canvas = sketch.createCanvas(width, height);
         
          me.x = me.x || width/2 + (Math.random()-1) * 100;
          me.y = me.y || height/2 + (Math.random()-1) * 100;
          me.avatar = me.avatar || getRandom(0,2);   
          // if index === 0, will be false then overwrite 0 through get random???

          me.id = me.id || shared.counts;
          me.score = me.score || 0;
          isSetup = true;
          me.ready = true;


          let index;
          ppl.forEach((p, i)=>{
          if (p.id === me.id){ index = i;}
          })

          
          PLAYERS = new sketch.Group();
          OTHER_PLAYERS = new sketch.Group();
       

          sprite_me = createPlayerSprite(me, index);
        
        
        //creating sprites for all plays except me
          for(let [i,p] of ppl.entries()){
            
            if (p.ready === true && me.id !== p.id){
                  
              let s = createPlayerSprite(p, i);
              OTHER_PLAYERS.add(s)
          
             }     
                
          }
        
        
          
          //creating the paw sprite
          sprite_paw = sketch.createSprite( width/2, height/2);
          sprite_paw.addAnimation('normal', `assets/paw1.png`,`assets/paw2.png`,`assets/paw3.png`,`assets/paw4.png`,`assets/paw5.png`,`assets/paw6.png`)  
        
          sprite_paw.animation.playing = false;
          sprite_paw.setVelocity(0, 10);
      
          // sprite_paw.setCollider('circle', 0, 0, 50);
        
          setNewPaw();
        
        

      }//end of set up

    sketch.draw = function(){

  
        sketch.background(sketch.color('#efefef'));

        keyMove();

        // keyPressed();
      
        if (sketch.partyIsHost()) {
          if(sketch.frameCount % 30 == 0){
             setNewPaw();
             }
        }
      
        
        
        if(sprites.length !== ppl.length){
          addPeople();
        }else{
            
        for(let [i,p] of ppl.entries()){
          if (p?.ready){
              if (p.id !== me.id){
              sprites[i].position.x = p.x;
              sprites[i].position.y = p.y;
              sprites[i].scale = Math.min( 0.4 + 0.005 * p.score, 1);
           }
         }
          
        }

        sprite_me.position.x = me.x;
        sprite_me.position.y = me.y;
        sprite_me.scale = Math.min( 0.4 + 0.005 * me.score, 1);

      
        }//end of updating positions
      
      OTHER_PLAYERS.bounce((sprite_paw), (someone)=>{     
          someone.rotation += 100;
      })
      
      sprite_me.bounce( sprite_paw, (myself)=>{
          myself.rotation += 100;
          me.score += 1;
              
      })
      sprite_me.bounce( OTHER_PLAYERS );
      
      
      
      showPaw();
      
      sketch.drawSprites();
      
      // sprite_paw.position.y += 1;
      
      
    }//end of draw


    function createPlayerSprite(p,index){

      let s = sketch.createSprite(p.x, p.y,50, 50)
      s.addAnimation('normal', avatar[p.avatar][0],avatar[p.avatar][1] );
      s.scale = 0.5

      sprites[index] = s; 
      PLAYERS.add(s);
    
      return s;
    
    }

    function keyMove() {
      let step = 20;
        
        if (sketch.keyIsDown(87)){  sprite_me.rotation= -90 ;  
          me.y = Math.max(0.0, me.y-step ); }
        if (sketch.keyIsDown(68)){  sprite_me.rotation= 0 ;  
          me.x = Math.min(width, me.x + step );}
        if (sketch.keyIsDown(83)){  sprite_me.rotation= 90 ;  
          me.y = Math.min(height, me.y + step );}

        if (sketch.keyIsDown(65)){ sprite_me.rotation= 180 ;  
           me.x = Math.max(0.0, me.x-step );}
   }


      function addPeople(){
        let current = sprites.length;

        
        for(let [i,p] of ppl.entries()){
        
        if (p.ready === true && i >= current){
          
            let s = createPlayerSprite(p, i);
            OTHER_PLAYERS.add(s)
            
            
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
      
        //not working ??
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

      function keyPressed() {
        let step = 20;
          
        switch(sketch.key) {   
          case 'w': me.y = Math.max(0.0, me.y-step ); break;
          case 'd': me.x = Math.min(width, me.x + step );break;    
          case 's': me.y = Math.min(height, me.y + step );break;
          case 'a': me.x = Math.max(0.0, me.x-step ); break;
        }
      
      }

}//end of main canvas sketch





function getRandom(start, end){
  return Math.floor(Math.random() * (end - start + 1) + start);
}


const drawScoreCanvas = function(sketch){
  const padding = 20;
  const height_rec = 20;


  sketch.setup = function() {
    sketch.createCanvas(200, 200);

  };

  sketch.draw = function() {
    sketch.background(255);

    ppl.forEach((p, i)=>{

      if (p?.ready){

        let w = score_to_width(p.score);
        let s = p.id === me.id ? `Fish No.${p.id} (that's you!)` : `Fish No.${p.id}`;
  
        sketch.fill(0);
        sketch.text(s, 0, padding * (i+1) * 2 - padding);  
        sketch.rect(0, padding * (i+1) * 2 - 15, w, height_rec);
  
        sketch.text(p.score, w + 15, padding * (i+1) * 2);  

      }


    })

  };

  function score_to_width(w){
      const full_score = 120;
      const full_width = 150;

      return Math.trunc( w /full_score * full_width) + 1
  }
}

let mainCanvas = new p5(drawMainCanvas, 'mainCanvas');
let scoreCanvas = new p5(drawScoreCanvas, 'scoreCanvas');