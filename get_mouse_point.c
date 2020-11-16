#include <stdio.h>
#include <windows.h>

#define KEY_DOWN(VK_NONAME) ((GetAsyncKeyState(VK_NONAME) & 0x8000) ? 1:0) //必要的，我是背下来的 
int main(){
    POINT pt;
    GetCursorPos(&pt); 
	if(KEY_DOWN(VK_LBUTTON))printf("1");
	else printf("0");
	printf(",");
	if(KEY_DOWN(VK_MBUTTON))printf("1");
	else printf("0");
	printf(",");
	if(KEY_DOWN(VK_RBUTTON))printf("1");
	else printf("0");
	printf(",");
    printf("%ld,%ld",pt.x,pt.y);
}