#include <Arduino.h>
#include <TaskScheduler.h> // 스케줄러 헤더파일
#include "PinChangeInterrupt.h" // 버튼인터럽터 헤더파일


/////led,state를 배열로 사용 할 때 편의를 위해서 enum 사용

enum{

    RED = 0, YELLOW = 1, GREEN = 2,

    EMERGENCY = 0, BLINK = 1, OFF = 2, NORMAL = 3,

};



/////아두이노의 핀을 각 기능에 맞게 배열로 선언

const int led_pin[3] ={9,10,11}; // led핀 배열 analogwrite를 사용가능한 9,10,11번핀 사용 
const int button_pin[3]={5, 6, 7}; // 버튼핀 배열
const int pot_pin = A0; // 가변저항값을 읽는 변수



///// 사용될 함수의 프로토타입을 선언

void Set_Bright(int red,int yellow,int green); // 밝기를 설정함수
void Led_On(); // led를 설정된 밝기로 키는 함수

void Emergency_State(); // emergency상태로 변경하는 함수
void Blink_State();  // blink상태로 변경하는 함수
void Off_State();   // off상태로 변경하는 함수
void Normal_State();  // normal상태로 변경하는 함수

void Blink_Callback();  // blink상태에서 스케쥴러가 지속적으로 호출하는 함수 
void Normal_Callback(); // normal상태에서 스케줄러가 지속적으로 호출하는 함수

void Set_Normal_Sequence(); // normal상태의 주기를 변경하는 함수

void Pot_Callback(); // 가변저항의 변화를 지속적으로 확인하는 함수


///// 스케줄러 선언, task선언

Scheduler ts; //스케줄러 객체를 선언합니다.

Task Normal_Task(2000,TASK_FOREVER,Normal_Callback,&ts,false); // normal상태에서 실행되는 task입니다. normal_callback의 setInterval()함수에 따라 주기가 변경되며 호출합니다. 
Task Blink_Task(250,TASK_FOREVER,Blink_Callback,&ts,false); // blink상태에서 실행되는 task입니다. 250ms간격으로 blink_callback을 호출합니다.


Scheduler ts2; //스케줄러 객체를 선언합니다.
Task Pot_Task(20,TASK_FOREVER,Pot_Callback,&ts2,true); // normal,emergency 상태에서 실행되는 task입니다. 20ms간격으로 pot_callback을 호출합니다.

///// 설정값을 저장하는 변수 선언

int state; //신호등 상태를 저장합니다.

int set_bright_arr[3]; // 설정된 밝기를 저장합니다.
int cur_bright_arr[3]; // 현재 밝기를 저장합니다.

int normal_interval_arr[3]; // r,y,g의 설정된 주기를 저장합니다.

int normal_sequence; // normal상태의 순서를 저장합니다.
int normal_sequence_arr[10]; //normal상태의 순서에 따른 주기를 저장합니다.
int pot_value; // 가변저항 값을 저장합니다.



void setup(){

    Serial.begin(9600); // 9600 budrate로 시리얼통신을 시작합니다.



    ///// 핀모드 설정

    pinMode(led_pin[RED],OUTPUT); // 설정에 맞게 전압을 출력하기 위해 OUPUT으로 설정
    pinMode(led_pin[YELLOW],OUTPUT);
    pinMode(led_pin[GREEN],OUTPUT);

    pinMode(button_pin[EMERGENCY],INPUT_PULLUP); // 입력되는 전압이 floating되는 상태를 방지하기 위해 input_pullup으로 설정
    pinMode(button_pin[BLINK],INPUT_PULLUP);
    pinMode(button_pin[OFF],INPUT_PULLUP);


    ////// 버튼 인터럽트 설정

    attachPCINT(digitalPinToPCINT(button_pin[EMERGENCY]), Emergency_State, RISING); // emergency에 해당하는 버튼이 눌릴경우 emergency_state함수가 호출된다, 
    attachPCINT(digitalPinToPCINT(button_pin[BLINK]), Blink_State, RISING); // blink에 해당하는 버튼이 눌릴경우 blink_state가 호출된다.
    attachPCINT(digitalPinToPCINT(button_pin[OFF]), Off_State, RISING); // off에 해당하는 버튼이 눌릴경우 off_state가 호출된다.
    
  
    ////// 초기 설정값 

    set_bright_arr[RED] = 255; // led 밝기의 초기 설정값은 최대 밝기로 합니다.
    set_bright_arr[YELLOW] = 255;
    set_bright_arr[GREEN] = 255;

    state = NORMAL;  // 초기 상태는 normal입니다.

    normal_sequence = 0; // normal 상태애서 진행되는 순서를 초기값 0으로 설정합니다.
    normal_interval_arr[RED] = 2000; // 빨간색 led의 주기 설정
    normal_interval_arr[YELLOW] = 500; // 노란색 led 주기 설정
    normal_interval_arr[GREEN] = 2000; // 녹색 led 주기 설정

    Set_Normal_Sequence(); //normal_sequence_arr에 설정된 주기를 갱신합니다.


    pot_value = analogRead(pot_pin); // 초기 가변저항 값 설정
    Normal_State(); // normal상태로로 시작하기위해 normal_state함수를 호출합니다.

}


void loop(){
    Led_On(); // 현재 밝기에 맞춰 led를 킵니다.

    ts.execute(); // normal_task와 blink_task를 실행할 스케줄러를 실행합니다.
    
    if(state == NORMAL || state == EMERGENCY){ //led색의 변화가 있을때만 가변저항값을 읽기 때문에 , 색이 바뀌는 주기가 긴 normal,emegency상태에선 스케줄러를 통해서 가변저항 값을 읽습니다. 
        ts2.execute();  
    }
    
  

    
}


////// 가변저항값을 스케줄러로 읽을 때 주기적으로 호출하는 함수

void Pot_Callback(){
    int cur_pot_value = analogRead(pot_pin);
    if( (pot_value - cur_pot_value)*(pot_value - cur_pot_value) >= 9 ) { // 가변저항 노이즈를 고려하여 이전값과 3이상 차이나는 경우만 실행 

        Set_Bright( set_bright_arr[RED],set_bright_arr[YELLOW],set_bright_arr[GREEN]); // 설정된 값을로 갱신합니다.
    }
    
}

///// 현재밝기 설정함수. 입력받은 인자로 현재 밝기를 갱신하고.  웹으로 값을 전달합니다.

void Set_Bright(int red,int yellow, int green){
 
    set_bright_arr[RED] = red;
    set_bright_arr[YELLOW] = yellow;
    set_bright_arr[GREEN] = green;


    pot_value = analogRead(pot_pin);
    float temp = (float)pot_value / 1023;  // 현재 가변저항 값을 읽어 비율로 변경합니다.
    
    cur_bright_arr[RED] = (int)(red *temp); // 설정된 밝기에 비율로 변환된 가변저항값을 곱하여 밝기를 갱신합니다.
    cur_bright_arr[YELLOW] = (int)(yellow *temp);  
    cur_bright_arr[GREEN] = (int)(green *temp); 


    Serial.print("B"); // 밝기에 대한 정보임을 나타내는 B를 보내 웹에서 밝기 정보를 처리하는 함수를 호출하도록 합니다.
    Serial.print("\n"); //개행문자를 보내 정보의 끝을 표시합니다.

    Serial.print(cur_bright_arr[RED]); // led의 밝기 정보를 보냅니다.
    Serial.print("\n"); 

    Serial.print(cur_bright_arr[YELLOW]); //
    Serial.print("\n");

    Serial.print(cur_bright_arr[GREEN]);
    Serial.print("\n");

}



////// cur_bright_arr의 값을 led_pin으로 출력하고

void Led_On(){


    analogWrite(led_pin[RED],cur_bright_arr[RED]); // 현재 밝기로 출력합니다.
    analogWrite(led_pin[YELLOW],cur_bright_arr[YELLOW]);
    analogWrite(led_pin[GREEN],cur_bright_arr[GREEN]);





}



///// 신호등을 normal 상태로 변경하는 함수 

void Normal_State(){

    state = NORMAL; // 상태정보를 normal(= 3)으로 갱신합니다.
    normal_sequence = 0; // 빨간 led부터 순차적으로 진행하도록 순서를 0으로 변경합니다.

    ts.disableAll(); // ts의 모든task들을 중단시킵니다. 
    Normal_Task.restart(); // Normal_task가 true상태에서 disable된 경우 다시 enable이 가능하도록 재설정합니다.
    Normal_Task.enable(); // Normal_task를 실행합니다.
    
    

    Serial.print("S"); // 상태에 대한 정보임을 나타내는 S를 보내 웹에서 상태 정보를 처리하는 함수를 호출하도록 합니다.
    Serial.print("\n"); // 개행분자를 보내 정보의 끝을 표시합니다.
 
    Serial.print(state); // 상태 정보를 보냅니다.
    Serial.print("\n");

}


////// normal_task에서 주기적으로 호출하는 함수.

void Normal_Callback(){


    
    /*
    normal_sequence의 값을 조건문으로 나누어 현재 밝기를 갱신합니다.
    
    과제에서 제시된 순서는 
    R -> Y -> G -> Bink(off -> G -> off -> G -> off -> G) -> Y
    0 -> 1 -> 2 ->       3  -> 4 ->   5 -> 6 ->  7  -> 8  -> 9  
    
    */
    if(normal_sequence == 0){  
        
        Set_Bright(255,0,0); // 빨간색만 빛나도록 현재 밝기 갱신
    } 
    else if( normal_sequence == 1  || normal_sequence == 9){
    
        Set_Bright(0,255,0); // 노란색만 빛나도록 현재 밝기 갱신
    }
    else if( normal_sequence == 2 ){
    
        Set_Bright(0,0,255); // 녹색만 빛나도록 현재 밝기 갱신
    } 
    else if( normal_sequence <= 8  ){
        
        if( set_bright_arr[GREEN] > 0){ // 녹색이 켜져있는 경우
        
            Set_Bright(0,0,0); // 모두 꺼지도록 현재 밝기 갱신
        }
        else{ // 빛이 꺼져있는 경우
         
            Set_Bright(0,0,255); // 녹색만 빛나도록 현재 밝기 갱신
        }
    
    }
   


    
    Normal_Task.setInterval( normal_sequence_arr[ normal_sequence ] ); // set_normal_sequence로 설정된  normal_sequence_arr값을 현재 순서에 맞게 주기를 변경
    normal_sequence = ( normal_sequence + 1 )%10; // 주기적으로 반복하기 위해 진행이 9(yellow)까지 끝나면 다시 0번째로 돌아가 반복

    
}



///// emergency버튼이 눌린경우 호출되는 함수

void Emergency_State(){

    if( state != EMERGENCY){ // 토글기능,다른 상태에서 emergency버튼이 눌린다면 emergency상태로 변경합니다. 

        state = EMERGENCY; // 상태를 emergency(= 0 )으로 갱신합니다.
        ts.disableAll(); // 스케줄러에서 현재 실행중인 task를 모두 종료 

        Set_Bright(255,0,0); // 빨간 불빛만 켜지도록 현재 밝기 갱신
        


        Serial.print("S"); // 상태에 대한 정보임을 나타내는 S를 보내 웹에서 상태 정보를 처리하는 함수를 호출하도록 합니다.
        Serial.print("\n"); // 개행분자를 보내 정보의 끝을 표시합니다.
     
        Serial.print(state); // 상태 정보를 보냅니다.
        Serial.print("\n");

    }
    else{ // 토글 기능, emergency상태에서 한번 더 버튼이 눌린다면 normal 상태로 돌아갑니다.

        Normal_State(); // normal상태로 변경합니다.
    }
}




////// blink 버튼이 눌릴경우 호출되는 함수

void Blink_State(){

    if( state != BLINK){ // 토글기능, bilnk상태가 아닌경우 버튼이 눌린다면 blink상태로 변경합니다.

        state = BLINK; // 상태를 blink(= 1)로 갱신합니다.

        ts.disableAll();// 스케줄러에서 현재 실행중인 task를 모두 종료 
        Blink_Task.restart(); // Blink_Task가 true상태에서 disable된 경우 다시 enable이 가능하도록 재설정합니다.

        Set_Bright(0,0,0); //blink상태로 변경시 모두 꺼진 상태로 시작합니다.
        Blink_Task.enable(); //Blink_Task를 실행시키니다. 



        Serial.print("S"); // 상태에 대한 정보임을 나타내는 S를 보내 웹에서 상태 정보를 처리하는 함수를 호출하도록 합니다.
        Serial.print("\n"); // 개행분자를 보내 정보의 끝을 표시합니다.
     
        Serial.print(state); // 상태 정보를 보냅니다.
        Serial.print("\n");

    }
    else{ // 토글기능, blink상태에서 버튼이 한번 더 눌린다면 normal상태를 종료합니다

        Normal_State();// normal상태로 변경합니다.
    }

}



////// blink_task가 주기적으로 호출하는 함수

void Blink_Callback(){


    if( cur_bright_arr[RED] > 0){ // 현재 불이 켜져있는 경우
 
        Set_Bright(0,0,0); // 현재 밝기를 모두 0으로 갱신합니다.

    }
    else{ // 현재 불이 꺼져 있는 경우

        Set_Bright(255,255,255); // 불빛이 켜지도록 현재 밝기를 갱신합니다.
    }

    
}



////// off버튼이 눌린 경우 호출되는 함수입니다.

void Off_State(){

    if( state != OFF){ // 토글기능, off상태가 아닐 때 버튼이 눌린경우. Off상태로 변경합니다.
        
        state = OFF; // 현재 상태를 off(= 2)로 변경합니다.

        ts.disableAll(); // 스케줄러의 모든 task를 종료시키니다.

        Set_Bright(0,0,0); // 현재 밝기를 모두 0으로 갱신합니다.
       
        
        
        
        Serial.print("S"); // 상태에 대한 정보임을 나타내는 S를 보내 웹에서 상태 정보를 처리하는 함수를 호출하도록 합니다.
        Serial.print("\n"); // 개행분자를 보내 정보의 끝을 표시합니다.
     
        Serial.print(state); // 상태 정보를 보냅니다.
        Serial.print("\n");

    }
    else{ // 토글기능, off인 상태에서 다시 버튼을 누를 경우 normal상태로 돌아갑니다.

        Normal_State(); // normal상태로 변경합니다.
    }

}


///// normal상태의 신호 주기를 변경하는 함수입니다.

void Set_Normal_Sequence(){
    //Normal_callback함수에서 setInterval() 함수를 통해 순서에 맞게 주기를 변경 하도록 값을 갱신합니다.

    normal_sequence_arr[0] = normal_interval_arr[RED];

    normal_sequence_arr[1] = normal_interval_arr[YELLOW];

    normal_sequence_arr[2] = normal_interval_arr[GREEN];

    normal_sequence_arr[3] = (int)(1000/6) ; //off
    normal_sequence_arr[4] = (int)(1000/6) ; // on
    normal_sequence_arr[5] = (int)(1000/6) ; //off
    normal_sequence_arr[6] = (int)(1000/6) ; // on
    normal_sequence_arr[7] = (int)(1000/6) ; //off
    normal_sequence_arr[8] = (int)(1000/6) ; //on

    normal_sequence_arr[9] = normal_interval_arr[YELLOW];

}




/////// 시리얼에서 데이터를 읽을 수 있는 경우 호출되는 함수 입니다.

void serialEvent()
{
	static char buffer[100] = {0}; // 시리얼로 입력된 데이터를 저장하기 위한 공간
	static int index = -1;		   // buffer의 사용 상태를 알기 위한 변수
	
    if (Serial.available()) // 버퍼에 읽을 수 있는 문자가 있다면 실행합니다.
	{
		index++;
		buffer[index] = Serial.read(); // 한 글자씩만 읽는다. 멀티태스킹 기능을 위해 최소한의 동작만 하는 것.

	}
	if (buffer[index] == '\n') // 한 명령어가 모두 수신 되면 명령을 해석한다. 개행문자로 명령어의 끝을 표현하는 경우.
	{   

        char last_index = buffer[index-1]; // 웹에서 보낸 데이터가 상태변경,주기변경인지 표시하기 위해 추가된 문자를 읽습니다.
        buffer[index-1] = '\n'; // 어떤 종류의 정보인지 확인했으면 개행문자로 바꾸어 string으로 변경하기 쉽도록 처리해줍니다.
        String input(buffer); // 버퍼에 받은 정보를 문자열로 바꾸는 함수를 호출합니다.
        
        /*
        주기에 대한 데이터는  주기(100~5000) + LED색(0~2) + \n 으로 전송되고
        상태에 대한 데이터는  상태(0~3) + S + \n 으로 전송된다.
        */


        if( last_index >= '0' && last_index <= '2'  ){ //수신 데이터가 0~2에 해당하는 주기에 대한 정보인 경우

            normal_interval_arr[last_index -'0'] = input.toInt(); // 수신된 주기 문자열을 정수형태로 변경해 주기정보를 갱신한다.
            Set_Normal_Sequence(); // 주기정보가 갱신되었음으로 재설정한다. 

        }
        else if( last_index == 'S'){ //수신 데이터가 S에 해당하는 상태에 대한 정보인 경우 


            int input_state = input.toInt(); // 수신된 상태에 대한 문자열 정수형태로 변경한다.

            if(input_state == NORMAL) Normal_State();  // normal을 수신했다면 normal상태로 전환 
            else if( input_state == EMERGENCY ) Emergency_State(); // emergency를 수신했다면 emergency상태로 전환
            else if ( input_state == BLINK ) Blink_State();  // blinkf를 수신했다면 blink상태로 전환
            else if( input_state == OFF) Off_State(); // off를 수신했다면 off상태로 전환
            
        }
			
		index = -1; // 한 명령어에 대한 처리가 끝났으므로 buffer 사용 정보 초기화.
	}
}