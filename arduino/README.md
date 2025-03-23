
# 2주차 과제와 변경사항 없음
---
---

- TaskScheduler로 스케줄러 사용하여 4개의 신호등 모드 구현
- PinChangeInterrupt로 버튼입력을 받아 신호등 모드 변환

## 회로구성
![스크린샷 2025-03-16 오후 6 42 05](https://github.com/user-attachments/assets/34e3faa8-b4a7-426f-b3f8-fd8b75cf9dbb)
- 아두이노의 5V,GND를 브레드보드의 +,-에 연결
- 브레드 보드의 -를 미니브레드와 연결후 빨간색,노란색,초록색 LED의 -와 직렬로 연결
- 각 LED  +는 330옴과 각 핀으로 연결
- 각 버튼은 브레드보드의 -와 연결 후 각 핀에 맞게 연결
- 가변저항은 브레드보드의 +,-에 연결하고 신호핀을 A0에 연결  

- 빨간색 LED = 9번 핀 OUTPUT
- 노란색 LED = 10번 핀 OUTPUT
- 녹색 LED = 11번 핀 OUTPUT
- 버튼 1 = 5번 핀 INPUT_PULLUP
- 버튼 2 = 6번 핀 INPUT_PULLUP
- 버튼 3 = 7번 핀 INPUT_PULLUP
- 가변저항 = A0  


