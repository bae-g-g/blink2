

let port; //포트를 저장하는 변수
let connectBtn; // 아두이노와 연결을 위한 버튼 변수
let interval_arr = []; // R,Y,G의 주기를 저장하는 변수
let bright_arr = []; // R,Y,G의 밝기를 저장하는 변수
let Button = []; // 상태를 표시하는 버튼 변수
let state; // 상태를 저장하는 변수

///////////// line 13~38   3주차 과제에서 추가된 코드입니다.
////////////

let handPose; // ml5의 handPose 모델을 불러올 변수
let video; // 비디오 스트림을 저장할 변수
let hands = [] // 인식된 손의 정보를 저장하는 변수

let motion_image_arr = []; //인식가능한 모션(제스처)의 이미지를 저장하는 변수
let motion_image_x_arr = [620, 680, 740, 800, 1000, 1080, 1160, 1000, 1080, 1160]; // motion_image_arr의 x좌표를 저장한 변수
let motion_image_y_arr = [480, 480, 480, 480, 490, 490, 490, 530, 530, 530]; // motion_image_arr의 y좌표를 저장한 변수
let motion_state; // 인식한 모션을 저장하는 변수

function preload() {

    handPose = ml5.handPose(); //  손 모양을 인식하는 모델을 초기화합니다.

    motion_image_arr[0] = loadImage('./image/m0.png'); //emergency mode 제스쳐 이미지를 로드합니다.
    motion_image_arr[1] = loadImage('./image/m1.png'); //blink mode 제스처 이미지를 로드합니다.
    motion_image_arr[2] = loadImage('./image/m2.png'); //off mode 제스처 이미지를 로드합니다.
    motion_image_arr[3] = loadImage('./image/m3.png');// normal mode 제스처 이미지를 로드합니다.

    motion_image_arr[4] = loadImage('./image/r_u.png'); // red interval up 제스처 이미지를 로드합니다.
    motion_image_arr[5] = loadImage('./image/y_u.png'); // yellow interval up 제스처 이미지를 로드합니다.
    motion_image_arr[6] = loadImage('./image/g_u.png'); // green interval up 제스처 이미지를 로드합니다.
    motion_image_arr[7] = loadImage('./image/r_d.png'); // red interval down 제스처 이미지를 로드합니다.
    motion_image_arr[8] = loadImage('./image/y_d.png'); // yellow interval down 제스처 이미지를 로드합니다.
    motion_image_arr[9] = loadImage('./image/g_d.png'); // green interval down 제스처  이미지를 로드합니다.

  }


function setup() {
  createCanvas(1255, 600); // 12550,600 사이즈의 캔버스를 생성합니다.
  
 
  //////신호등의 상태를 나타내고 변경할 수 있는 버튼
  Button[0] = createButton("Emergency"); // emergency버튼생성
  Button[1] = createButton("Bilnk"); // blink버튼 생성
  Button[2] = createButton("Off");  // off 버튼 생성
  Button[3] = createButton("Normal"); // normal버튼 생성
  
  Button[0].position(260,400); //버튼들의 위치 설정합니다.
  Button[1].position(260,440);
  Button[2].position(260,480);
  Button[3].position(260,520);
 
  Button[0].size(80, 30); //버튼들의 크기를 설정합니다.
  Button[1].size(80, 30);
  Button[2].size(80, 30);
  Button[3].size(80, 30);
  
  Button[0].mousePressed(Emergency_button);//버튼이 눌렸을 때 실행할 함수를 설정합니다
  Button[1].mousePressed(Bilnk_button);
  Button[2].mousePressed(Off_button);
  Button[3].mousePressed(Normal_button);
  
  
  
  
  /////시리얼 통신
  port = createSerial(); //시리얼 통신을 위한 객체를 생성합니다.
  let usedPorts = usedSerialPorts(); //사용 가능한 포트를 저장합니다.
  if (usedPorts.length > 0) { 
    port.open(usedPorts[0], 9600); // 사용가능한 포트가 있다면 첫번째 포트를 9600 rate로 
  }
  connectBtn = createButton("Connect to Arduino"); // 통신 설정을 위한 버튼 객체를 생성합니다.
  connectBtn.position(230, 260);//버튼의 위치를 설정합니다.
  connectBtn.mousePressed(connectBtnClick);//버튼이 눌렸을 때 실행할 함수를 설정합니다

  
  
   ////// 주기설정을 위한 슬라이더
  for(let i = 0; i<3; i++){
    if(i == 1){
    interval_arr[i] = createSlider(100,5000,500); //노란색은 초기값 500ms로 슬라이더 객체생성
    }
    else{
    interval_arr[i] = createSlider(100,5000,2000); //빨간색,녹색은 초기값 2000ms로 슬라이더 생성 
    }
    
    interval_arr[i].position( 50 ,400+ 65*i ); //65간격으로 슬라이더 위치 설정
    interval_arr[i].size(150); // 사이즈 설정
    interval_arr[i].mouseReleased(Slider); // 슬라이더 값 변경시 호출할 함수 설정
  }

  
  
  //////밝기 초기값은 0으로 설정
  bright_arr[0] = 0; 
  bright_arr[1] = 0;
  bright_arr[2] = 0;
  
  //초기 상태 설정
  state = 3; // 3은 normal state
  
  
  ///////////// line 108 ~ 111  3주차 과제에서 추가된 코드입니다.
  ////////////
  video = createCapture(VIDEO, {flipped:true}); //사용가능한 카메라(노트북 내장카메라)를 활성화해서  좌우 반전된 상태로 캡쳐합니다.  
  video.size(640, 480); // 비디오 사이즈를 640,480으로 설정합니다.
  video.hide(); // 기본으로 표시되는 캡쳐화면을 숨김니다.
  handPose.detectStart(video, gotHands); // ml5.handPose()모델을 video를 통해 인식해서 인식에 성공하면 gothands를 호출합니다.

}

function draw() {
   
  background(240) // 배경색 설정  
  

  /////시리얼통신을 통해 값을 전달 받은 경우
  if(port.available()) { // 버퍼에 읽을 수 있는 값이 있다면

    let str = port.readUntil("\n"); // 개행문자까지 읽습니다.
    
    if(str == "B\n"){ // 읽은 문자가 밝기를 나타내는 B라면 밝기를 처리하는 함수를 호출
       read_bright();  
     }
    else if( str == "S\n"){ //읽은 문자가 상태를 나타내는 S라면 상태를 처리하는 함수를 호출
       read_state();
    }
  } 
  
  
  
  
  ////// 신호등 테두리 검은색
  fill(40) 
  noStroke()
  rect(150,90, 300,120,40)
  
  
  
  //////ui배경, 신호등 불빛 바탕색 힌바탕
  fill(255)
  rect(10,300,580,500,25) 
  circle(205,150,80 ); 
  circle(300,150,80 ); 
  circle(395,150,80 ); 
  
  
  
  
  
  ///// 함수 read_bright에서 갱신된 bright_arr값으로 채도,투명도를 조절해 신호등 표현 
  fill(bright_arr[0]+100 ,0,0,bright_arr[0]+70); //빨간불 색 설정
  circle(205,150,80);
  
  fill(bright_arr[1]+100,bright_arr[1]+100,0 ,bright_arr[1]+70);// 노란불 색 설정
  circle(300,150,80 );
  
  fill(0,bright_arr[2]+100,0 ,bright_arr[2]+100);//녹색불 색 설정
  circle(395,150,80 );

  
  
  
  
  
  //////주기,상태,밝기 정보를 쉽게 파악하도록 텍스트로 표시했습니다.
  fill(0);
  textSize(24)
  
  text("Interval",95,350)
  text("State",275,350)
  text("Brightness",420,350)
  
  
  
  
  
  //////슬라이더의 값을 읽어 표시합니다.
  fill(70);
  textSize(16)
  
  text("Red interval",50,440);
  text(interval_arr[0].value(),160,440) // 빨간불의 주기 
  
  text("Yellow interval",50,505);
  text(interval_arr[1].value(),160,505) //노란불 주기
  
  text("Green interval",50,570);
  text(interval_arr[2].value(),160,570) // 녹색불 주기

  

  
  ///// 함수 read_state에서 state값이 갱신되면 y좌표값도 갱신되도록하는 사각형을
  ///// 현재 신호등상태에 해당하는 버튼위치에 그려지도록해서 상태를 나타냅니다.
  noFill();
  stroke(0,0,255);
  strokeWeight(5);
  rect(260,400+state*40,80,30,2); 
  
  fill(70)
  noStroke()  
  
   //// 함수 read_bright에서 갱신된 bright_arr 값으로 R,Y,G값 텍스트로 표시
  text("Red brightness",400, 425)
  text( bright_arr[0],540, 425) // 빨간불의 밝기
  
  text("Yellow brightness",400, 475)
  text( bright_arr[1],540, 475) // 노란불의 밝기
  
  text("Green brightness",400, 525)
  text( bright_arr[2],540, 525) // 녹색불의 밝기


  /////// line 220~226 3주차 과제에서 추가된 코드입니다.
  ///////
  stroke(80) // 선의 굵기를 80으로 설정합니다.
  line(605,0,605,600) // 카메로로 인식하는 영역과 기존 ui를 구부하기 위해 선을 생성합니다.
  noStroke() // 다시 선의 굵기를 0으로 설정

  image(video, 610, 0, 640, 480); // video가 캡쳐한 화면을 610,0의 좌표에 640,480사이즈로 나타냅니다. 
  motion_detect(); // 인식된 손의 정보로 제스처를 인식하는 함수를 호출합니다.
  motion_guide();  // 제스처에 대한 정보를 나타내는 함수를 호출합니다.

}



/////시리얼 통신을 위한 버튼이 클릭된 경우 호출되는 함수입니다.
function connectBtnClick() {
  if (!port.opened()) { // 통신중이 아닌 경우 
    port.open(9600); // 9600 budrate로 통신을 시작합니다.
  } else {
    port.close(); //통신중인 경우 눌린다면 통신을 끝냅니다.
  }
}



//// 시리얼 통신으로 받은값이 B일 경우 호출되는 함수입니다. 
function read_bright(){
  
  for(let i = 0; i<3; i++){ // R -> Y -> G 순으로 반복합니다.  
    let str = port.readUntil("\n");  //개행문자까지 읽어서 밝기 정보를 저장합니다.
    bright_arr[i] = parseInt(str); // 저장된 정보를 정수로 바꾸어 밝기를 갱신합니다.
    
  }
  
} 


///// 시리얼 통신으로 받은값이 S일 경우 호출되는 함수입니다.
function read_state(){
  
    
    let str = port.readUntil("\n"); // 개행문자까지 읽어서 상태정보를 저장합니다.
    state = parseInt(str); // 저장된 정보를 정수로 바꾸어 상태를 갱신합니다.
    
}



/////슬라이더가 조정된 경우 호출되는 함수입니다.
function Slider() {
  
  let data = [];
  
  for(let i = 0; i<3; i++){ // r->y->g 순서로 반복합니다.
    data[i] = String(interval_arr[i].value()); // 각 슬라이더의 값을 받아서 저장합니다. 
  }
  
  for(let i = 0; i<3; i++){// r->y->g 순서로 반복합니다.
    port.write(data[i] +""+ i+"\n"); //슬라이더값과 불빛색을 나타내는 0(r),1(y),2(g)를 포함해서 값을 보냅니다. 
 
  }
}


////// emergency 버튼이 눌린경우 호출되는 함수입니다.
function Emergency_button(){
  
   port.write(0 + ""+ "S"+"\n"); //emergency를 나타내는 0과 상태정보임을 나타내는S를 보냅니다.
  
}



////// blink 버튼이 눌린경우 호출되는 함수입니다.
function Bilnk_button(){
  port.write(1 + ""+ "S"+"\n"); //blink를 나타내는 1과 상태정보임을 나타내는 S를 보냅니다.
}


//////off버튼이 눌린경우 호출되는 함수입니다.
function Off_button(){
  
  port.write(2 + ""+ "S"+"\n"); //off를 나타내는 2와 상태정보임을 나타내는 S를 보냅니다.
}


//// normal 버튼이 눌린경우 호출되는 함수입니다.
function Normal_button(){
  
  port.write(3 + ""+ "S"+"\n"); //normal을 나타내는 3과 상태저보임을 나타내는 S를 보냅니다.
}



/////////////// line 316 ~ 505 3주차 과제에서 추가된 코드입니다.
///////////////

//// ml5.handPose 모델이 손 인식을 성공하면 호출되는 함수입니다.
function gotHands(results) { 
  hands = results;  // hands에 인식된 결과( 손의 좌표값과 같은 정보)를 저장합니다.
}


///// 인식한 손의 좌표를 통해 모션(제스처)를 분석합니다.
function motion_detect(){
  
if(frameCount%20 == 0){ // 1초에 60frame -> 0.333...초에 한번만 모션을 분석합니다.
if(hands.length == 1){ // 손이 화면에 1개만 인식 될 때 모션을 분석합니다.
    

    let pinger_num = 0; //펴진 손가락의 갯수를 저장할 변수


    /// 인식된 손이 손등인경우, 손바닥인 경우를 나눠서 판단합니다.
    if(hands[0].keypoints[2].x > hands[0].keypoints[17].x ){ //손바닥 -- 오른손일 때 엄지가 소지보다 왼쪽에 있는경우는 손바닥으로 판단
          
          
        if(hands[0].keypoints[3].x < hands[0].keypoints[4].x){ // 엄지의 손가락 끝이 두번째 마디보다 왼쪽에 있는경우 펴져있다고 판단
          pinger_num++; // 펴진 손가락 갯수 + 1
        }
        
        if(hands[0].keypoints[5].y > hands[0].keypoints[6].y && hands[0].keypoints[6].y > hands[0].keypoints[7].y &&  hands[0].keypoints[7].y > hands[0].keypoints[8].y){
          // 검지의 세번째 마디보다 두번째 마디가, 두번째 마디보다 첫번째 가,  첫번째 마디보다 손가락끝이 위에 있으면 펴져있다고 판단   
          pinger_num++; // 펴진 손가락 갯수 + 1
        }

        if(hands[0].keypoints[9].y > hands[0].keypoints[10].y && hands[0].keypoints[10].y > hands[0].keypoints[11].y &&  hands[0].keypoints[11].y > hands[0].keypoints[12].y){
          //// 중지의 세번째 마디보다 두번째 마디가, 두번째 마디보다 첫번째 가,  첫번째 마디보다 손가락끝이 위에 있으면 펴져있다고 판단
          pinger_num++; // 펴진 손가락 갯수 + 1
        }

        if(hands[0].keypoints[13].y > hands[0].keypoints[14].y && hands[0].keypoints[14].y > hands[0].keypoints[15].y &&  hands[0].keypoints[15].y > hands[0].keypoints[16].y){
          // 약지의 세번째 마디보다 두번째 마디가, 두번째 마디보다 첫번째 가,  첫번째 마디보다 손가락끝이 위에 있으면 펴져있다고 판단
          pinger_num++; // 펴진 손가락 개수 + 1
        }

        if(hands[0].keypoints[17].y > hands[0].keypoints[18].y && hands[0].keypoints[18].y > hands[0].keypoints[19].y &&  hands[0].keypoints[19].y > hands[0].keypoints[20].y){
          // 소지의 세번째 마디보다 두번째 마디가, 두번째 마디보다 첫번째 가,  첫번째 마디보다 손가락끝이 위에 있으면 펴져있다고 판단
          pinger_num++; // 펴진 손가락 갯수 + 1
        }
        
        // 펴진 손가락 갯수로 제스처 결정
        if(pinger_num == 0){ // 펴진 손가락이 0개라면 emergency모드

          if(state != pinger_num) Emergency_button(); //연속으로 인식하여 토글되는것을 막기 위해서 제스체에 해당하는 모드가 아닌경우에만 작동 
          
          motion_state = 0; // 제스처의 상태를 저장합니다.

        }
        else if(pinger_num == 1){ //펴진 손가락이 1개라면 blink모드
          
          if(state != pinger_num) Bilnk_button(); //연속으로 인식하여 토글되는것을 막기 위해서 제스체에 해당하는 모드가 아닌경우에만 작동
          
          motion_state = 1; // 제스처의 상태를 저장합니다.

        }
        else if(pinger_num == 2){ // 펴진 손가락이 2개라면 off모드
        
          if(state != pinger_num) Off_button(); //연속으로 인식하여 토글되는것을 막기 위해서 제스체에 해당하는 모드가 아닌경우에만 작동

          motion_state = 2; // 제스처의 상태를 저장합니다.

        }
        else if(pinger_num == 3){ // 펴진 손가락이 3개라면 normal모드
        
          if(state != pinger_num) Normal_button(); //연속으로 인식하여 토글되는것을 막기 위해서 제스체에 해당하는 모드가 아닌경우에만 작동
          
          motion_state = 3; // 제스처의 상태를 저장합니다.

        }
        else motion_state = -1;  // 그이상의 손가락이 펴진경우는 정해진 제스쳐가 아니기 때문에 제스처 상태를 -1로 저장
        
        
    } // 손바닥에 대한 조건문 끝.
    else if(hands[0].keypoints[2].x < hands[0].keypoints[17].x    ){ // 손등 --- 오른손의 소지가 왼쪽  엄지가 오른쪽인 경우 손등이 보인다고 판단합니다. 
          
          if( hands[0].keypoints[6].x < hands[0].keypoints[8].x ){ // 검지의 손가락끝이 마디보다  왼쪽에 있으면 검지가 펴져있다고 판단합니다.
            pinger_num++; // 펴진 손가락 갯수 + 1
          }

          if(hands[0].keypoints[10].x < hands[0].keypoints[12].x ){ // 중지의  손가락끝이 마디보다 왼쪽에 있으면 중지가 펴져있다고 판단합니다.
              pinger_num++; // 펴진 손가락 갯수 + 1
          }
          if( hands[0].keypoints[14].x < hands[0].keypoints[16].x ){ // 약지의  손가락끝이 마디보다 왼쪽에 있으면 약지가 펴져있다고 판단합니다.
              pinger_num++; // 펴진 손가락 갯수 + 1
          }
          if( hands[0].keypoints[18].x < hands[0].keypoints[20].x){ // 소지의  손가락끝이 마디보다 왼쪽에 있으면 소지가 펴져있다고 판단합니다.
            pinger_num++; // 펴진손가락 갯수 + 1
          }
          
          ///엄지가 펴져있는지,구부려져 있는지에 나눠서 판단합니다.
          if( (hands[0].keypoints[2].y - hands[0].keypoints[3].y)/(hands[0].keypoints[2].x - hands[0].keypoints[3].x)    >  (hands[0].keypoints[3].y - hands[0].keypoints[4].y)/(hands[0].keypoints[3].x - hands[0].keypoints[4].x) ||  hands[0].keypoints[3].y > hands[0].keypoints[4].y ){
          //  엄지가 두번째 마디가 엄지의 손가락끝보다 위에있거나 , 엄지의 첫번째 마디와 두번째 마디의 기울기가 엄지의 두번째 마디와 손가락끝의 기울기보다 크다면 펴져있다고 판단합니다.

                if( pinger_num == 0) {//펴진 손가락이 없는 경우 빨간색 LED의 주기를 증가시키는 제스쳐입니다.
                 
                  let newValue = interval_arr[0].value(); // 현재 빨간색 LED 주기(슬라이더 값을 저장합니다.)
                  interval_arr[0].value(constrain(newValue+250, 100, 5000)) ///빨간색 LED 슬라이더 값을 100,5000의 최소,최대제한을 두고 250을 증가시킵니다.

                  motion_state = 4 // 제스처의 상태를 저장합니다.
                }
                else if(pinger_num == 1 ){ //펴진 손가락이 1개인 경우 노란색 LED의 주기를 증가시키는 제스쳐입니다.
                   
                  let newValue = interval_arr[1].value(); // 현재 노란색 LED 주기(슬라이더 값을 저장합니다.)
                  interval_arr[1].value(constrain(newValue+250, 100, 5000))  ///노란색 LED 슬라이더 값을 100,5000의 최소,최대제한을 두고 250을 증가시킵니다.
        
                  motion_state = 5 // 제스처의 상태를 저장합니다.
                }
                else if(pinger_num == 2){  //펴진 손가락이 2개인 경우 녹색 LED의 주기를 증가시키는 제스쳐입니다
                  
                  let newValue = interval_arr[2].value(); // 현재 녹색 LED 주기(슬라이더 값을 저장합니다.)
                  interval_arr[2].value(constrain(newValue+250, 100, 5000)) ///녹색 LED 슬라이더 값을 100,5000의 최소,최대제한을 두고 250을 증가시킵니다.

                  motion_state = 6  // 제스처의 상태를 저장합니다.
                }
                else motion_state = -1; // 그 이상의 손가락이 펴진 경우는 정해지지 않은 제스쳐임으로 -1로 상태를 저장
          }//엄지가 펴진경우 조건문 끝
          else{ //엄지가 펴지지 않은 경우 
          
                if( pinger_num == 0) {//펴진 손가락이 없는 경우 빨간색 LED의 주기를 감소시키는 제스쳐입니다.  
                
                  let newValue = interval_arr[0].value(); // 현재 빨간색 LED 주기(슬라이더 값을 저장합니다.)
                  interval_arr[0].value(constrain(newValue-250, 100, 5000)) ///빨간색 LED 슬라이더 값을 100,5000의 최소,최대제한을 두고 250을 감소시킵니다.
                      
                  motion_state =7 // 제스처의 상태를 저장합니다.
                }
                else if(pinger_num == 1 ){ //펴진 손가락이 1개인 경우 노란색 LED의 주기를 감소시키는 제스쳐입니다.
                    
                  let newValue = interval_arr[1].value(); // 현재 노란색 LED 주기(슬라이더 값을 저장합니다.)
                  interval_arr[1].value(constrain(newValue-250, 100, 5000))///노란색 LED 슬라이더 값을 100,5000의 최소,최대제한을 두고 250을 감소시킵니다.

                  motion_state = 8 // 제스처의 상태를 저장합니다.
                }
                else if(pinger_num == 2){   //펴진 손가락이 2개인 경우 녹색 LED의 주기를 감소시키는 제스쳐입니다
                   
                  let newValue = interval_arr[2].value(); // 현재 녹색 LED 주기(슬라이더 값을 저장합니다.)
                  interval_arr[2].value(constrain(newValue-250, 100, 5000))  ///녹색 LED 슬라이더 값을 100,5000의 최소,최대제한을 두고 250을 감소시킵니다.
                  
                  motion_state = 9 // 제스처의 상태를 저장합니다. 
                }
                else motion_state = -1; // 그 이상의 손가락이 펴진 경우는 정해지지 않은 제스쳐임으로 -1로 상태를 저장
                           
          }
          Slider(); //함수를 호출하여 바뀐 주기값을 송신하도록 합니다.

    }// 손등 조건문 끝
    else motion_state = -1; //손 모양을 손등이나 손바닥으로 인식하지 못한 경우 -1로  제스처 상태를 저장 

}// 손 하나만 인식한 경우의 조건문 끝
else  motion_state = -1; // 손이 하나가 아닌경우 -1로 제스처 상태를 저장

}// frameCount%20 == 0 조건문 끝
  
}

///// 제스처 이미지를 웹에 나타내주는 함수
function motion_guide(){
  
  push() //이후 사용될 textSize,tine등 설정옵션을 push합니다. 

  textSize(12) // 텍스트 크기를 12사이즈로

  text("emergency",612,593) // 모드 제스처를 설명하는 텍스트
  text("bilnk",690,593)     // 모드 제스처를 설명하는 텍스트
  text("off",755,593)       // 모드 제스처를 설명하는 텍스트
  text("normal",805,593   ) // 모드 제스처를 설명하는 텍스트
  
  text("UP",980,520);     // 주기설정의 증가 제스처를 설명하는 텍스트
  text("DOWN",970,563);   // 주기설정의 감소 제스처를 설명하는 텍스트
  
  text("red",1035,593);   //주기설정의 빨간색 LED 제스처를 설명하는 텍스트
  text("yellow",1105,593); //주기설정의 노란색 LED 제스처를 설명하는 텍스트
  text("green",1185,593);  //주기설정의 녹색 LED 제스처를 설명하는 텍스트
  
  
  
  for(let i = 0; i<10; i++){ // 각 제스처의 이미지만큼 반복
    
    tint(255,40); // 이미지의 rgb채널을 모두 255로, 투명도를 40으로 흐리게 설정
  
    if(i == motion_state){ // 만약 현재 이미지가 인식된 제스쳐인경우 
      tint(255,255); // 투명도를 255로 진하게 설정
    }
    image(motion_image_arr[i],motion_image_x_arr[i],motion_image_y_arr[i]);// 제스처에 대한 이미지를 웹에 나타냅니다.
  }
  pop() // textSize,tine등 설정옵션을 pop합니다. 

}
