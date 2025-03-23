
# Arduino Blink with p5.js Web Serial Control

## 유트브 링크 
- 작동설명
  https://youtu.be/CtjAZcNvUd0?si=qonMRei89ybyIWY-
- 아두이노 코드 설명(2주차 과제와 변경사항이 없습니다.)
  https://youtu.be/9J7bw1u8GeM?si=LmlO0U5ShBDX8VP5
- p5.js 코드 설명 
  https://youtu.be/kihaiLj0fFM?si=3fJv_j5dy76PqZX7

    
  - **3주차 과제에서 추가된 내용 설명 부분(p5.js코드 설명 영상)**
  - 0:35 ~ 2:05
  - 4:50 ~ 5:50
  - 9:00 ~ 10:05
  - 13:40 ~
---
---
### 3주차 과제에서 추가된 내용은 글 하단에 있습니다.
### 아두이노의 회로,코드의 변경사항은 없습니다.
---
---
![image](https://github.com/user-attachments/assets/0b16ab2e-18f1-4164-80dd-bac7d4ad4769)




# Arduino
![스크린샷 2025-03-16 오후 6 42 05](https://github.com/user-attachments/assets/e06c108e-3ed5-4211-81fa-5dda64163a52)

Red LED ( 9번 핀)
Yellow LED ( 10번 핀 )
Green LED ( 11번 핀 )

button1 ( 5번 핀 )
button2 ( 6번 핀 )
button3 ( 7번 핀 )

가변저항  ( A0 핀 )

LED는 330옴 저항을 연결하였습니다.



## 기본기능

RED -> YELLOW -> GREEN -> BLINK(OFF -> GREEN -> OFF -> GREEN -> OFF -> GREEN) -> YELLOW
순서대로 9개의 동작으로 나누어 
Normal_Task가 현재 순서에 맞추어 주기를 설정하여 그 주기에 맞게 함수를 호출하여 LED를 변화 시킵니다.








## 기능1 Emergency 

pinchangeinterrupt를 통해서 버튼을 확인 합니다. 
버튼1이 눌릴경우 Emergency_state 함수를 호출해서
현재 LED의 밝기를  RED =255 , YELLOW = 0 , GREEN = 0 으로 설정하고
현재 작동하는 스케줄러를 종료시킵니다.
다시 눌릴경우
normal_state 함수를 호출해서 기본기능을 실행합니다.

## 기능2 Blink

pinchangeinterrupt를 통해서 버튼을 확인 합니다. 
버튼2가 눌릴경우 Blink_State 함수를 호출해서
현재 작동하는 스케줄러를 종료시키고.
Blink_Task를 활성화 시킵니다.
Blink_Task는 250ms주기로 모든 LED의 밝기를 0과 255로 순차적으로 변경합니다.
다시 눌릴경우
normal_state 함수를 호출해서 기본기능을 실행합니다.

## 기능3 on/off

pinchangeinterrupt를 통해서 버튼을 확인 합니다. 
버튼3이 눌릴경우 Off_State 함수를 호출해서
현재 작동하는 스케줄러를 종료시키고
모든 LED의 밝기를 0으로 설정합니다. 
다시 눌릴경우
normal_state 함수를 호출해서 기본기능을 실행합니다.




## 가변저항

LED의 밝기를 설정하는 Set_Bright함수가 호출시 
가변저항의 값을 읽어 0~1023의 값을 1023으로 나누어 비율로 환산해서
설정된 밝기에 곱하여 현재 밝기로 조절합니다.

Emergency상태나, 주기설정이 길어진 기본기능 상태에서는 Set_Bright 함수의 호출이 없어서
실시간으로 변화를 받아드릴 수 없음으로
ts2라는 스케줄러를 생성해서 Pot_Task로 가변저항의 변화를 읽는 Pot_Callback를 호출합니다.
Pot_Callback은 가변저항의 변화가 있는경우 밝기를 갱신합니다.




## 시리얼통신

serialEvent 함수를 통해서 데이터를 수신합니다.
웹에서 데이터를 정보 + 정보인덱스 + 개행문자의 조합으로 송신하기때문에
개행문자까지 데이터를 읽고 정보인덱스에 따라서
조건문으로 데이터를 처리합니다.

신호등 상태를 나타내는 S가 정보인덱스로 수신된 경우
정보에 따라서 상태를 변경하는 함수를 호출합니다.

기본기능의 주기를 나타내는 0~2가 정보인덱스로 수신된 경우
정보에 따라서 normal_interval_arr의 값을 변경하여 주기를 갱신합니다.


아두이노 데이터 송신은
Set_Bright함수에서 LED밝기가 변경되는 경우
Emergeny_State,Blink_State,Off_state,Normal_State함수에서 상태가 변경되는경우
해당정보 + 개행문자로 데이터를 송신하여
웹에서 처리하도록 합니다.




# p5.js
<img width="1247" alt="스크린샷 2025-03-23 오전 4 17 29" src="https://github.com/user-attachments/assets/4b1b2e6e-f556-48c1-a506-e12bd58f9c3d" />


## 신호등 설정 밝기 인디케이터

아두이노에서 밝기가 변경되는 경우 송신하는 데이터를 수신하여 read_bright함수가 호출됩니다.
각 Red,Yellow,Green의 밝기값을 bright_arr에 저장합니다.
bright_arr값은 웹의 우측하단 Brightness에 개별적으로 텍스트를 통해 표시됩니다.




## 현재 신호등 상태 표시

아두이노를 통해 갱신되는 bright_arr값으로
웹의 상단중앙부에 신호등 모양의 원의 밝기를 
빨간색 fill(bright_arr[0],0,0) 
노란색 fill(bright_arr[1],bright_arr[1],0)
녹색 fill(0,bright_arr[2],0)으로 설정합니다.

밝기를 더 자세히 나타내기 위해서 투명도를 통해서 bright_arr값이 클수록 더 선명하게 나타나도록 하였습니다.




## 신호등 모드 인디케이터


아두이노에서 상태가 변경되는 경우 송신하는 데이터를 수신하여 read_state함수가 호출됩니다.
각 emergency,blink,off,normal에 해당하는 0,1,2,3을 state 변수에 저장합니다.
state변수는 웹의 중앙하단부 State에 파란색 사각형으로 그려져, 상태를 나타내는 버튼의 테두리를 만들어 상태를 표시합니다.



## R,Y,G 신호 각각의 길이 변경 슬라이더

웹의 좌측하단부 interval에 있는 3개의 슬라이더가
각각 R,Y,G의 신호 주기를 변경 할 수 있도록 합니다.
현재 설정된 주기가 몇 ms인지 슬라이더 밑에 텍스트로 표시합니다.

슬라이더를 통해 값이 변경되면 Slider함수를 호출합니다.
Slider함수는 3개의 값을  data변수에 문자열로 저장해하여
아두이노로 그 값을 송신합니다.





## state 버튼

각  emergency,blink,off,normal에 해당하는 버튼이 눌리는 경우
emergency_buuton,blink_buuton,off_buuton,normal_buuton함수가 호출됩니다.
각 함수는 현재 눌린 버튼에 해당하는 상태를 아두이노로 송신하고
아두이노는 이를 수신하여 상태를 변경합니다.

---
---
# 3주차 추가내용
**제스처는**
- 화면에 인식되는 손이 오른손만 있을 때만 인식합니다.
- 오른손 손바닥을 화면에 인식시켜 모드변경
- 오른손 손등을 화면에 인식시켜 주기변경
-  0.3333..초에 한번씩 인식합니다.
  

## 모드변경
| 모드     | Emergency     | Blink     | Off     | Normal     |
|-----------|-----------|-----------|-----------|-----------|
| **제스처**     | ![m0](https://github.com/user-attachments/assets/61c6d9a0-ae82-4e26-8ef5-2689b579df09)| ![m1](https://github.com/user-attachments/assets/bb28e8ca-5d54-44ba-9d3d-12badb788522) | ![m2](https://github.com/user-attachments/assets/3132c391-1709-4e79-8ee9-0c4503651c15) | ![m3](https://github.com/user-attachments/assets/e7894f46-aa53-4ebc-83e6-0424c906151a) |

**오른손 손바닥이 보인 채로, 검지가 펴졌을 때 수직이 되도록 손을 위치시킵니다.**
- 손가락이 모두 접혀있는 경우 emergency상태가 됩니다.
- 손가락이 1개만 펴진경우 blink 상태가 됩니다.
- 손가락이 2개만 펴진경우 off 상태가 됩니다.
- 손가락이 3개만 펴진경우 normal상태가 됩니다.

**제스처를 통한 모드변경에서 토글기능은 지원하지않습니다**
  - 예를 들어, Emergency상태에서 Emergency제스처를 한번더 인식시켜도 normal로 돌아가지 않고 Emergency상태를 유지합니다.




## 주기변경
| 색상     | Red    | Yellow     | Green     |
|-----------|-----------|-----------|-----------|
| 증가     |  ![r_u](https://github.com/user-attachments/assets/042ac82a-5693-4545-b94b-2d5400a6fcbb) | ![y_u](https://github.com/user-attachments/assets/bfd7fc83-34e8-4869-a303-59a3ac0c7089) | ![g_u](https://github.com/user-attachments/assets/2a93610f-ff98-4f86-aab6-62290cf82cf4)|
| 감소     | ![r_d](https://github.com/user-attachments/assets/07f34e3c-1be5-45ac-ab27-1877b60d2d6a) | ![y_d](https://github.com/user-attachments/assets/d4913ca6-f6e0-457d-b6ea-721156af96be) | ![g_d](https://github.com/user-attachments/assets/9df939a4-6418-4377-865c-856fb8778b8d) |

**오른손 손등이 보인 채로, 검지가 펴졌을 때 수평이 되도록 손을 위치시킵니다.**
- 엄지가 펴진상태에서
  -  손가락이 모두 접혀있는경우 빨간색 주기를 증가시킵니다. 
  -  손가락이 1개만 펴진경우 노란색 주기를 증가시킵니다.
  -  손가락이 2개만 펴진경우 녹색 주기를 증가시킵니다.
- 엄지가 구부려진상태에서
  - 손가락이 모두 모두 접혀있는 경우 빨간색 주기를 감소시킵니다.
  - 손가락이 1개만 펴진경우 노란색 주기를 감소시킵니다.
  - 손가락이 2개만 펴진경우 녹색 주기를 감소시킵니다.
  
**각 증가 감소 수치는 250ms입니다.**

---
*4개 모드 버튼은 2주차 과제에서 구현하였습니다.* 







