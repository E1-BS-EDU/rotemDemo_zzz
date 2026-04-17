package com.rotemDemo.zzz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
//[필수] 내 것(wdc)도 찾고, 공통(common)도 찾으라고 지시
@ComponentScan(basePackages = {
 "com.rotemDemo.zzz",       // 현재 프로젝트의 패키지 (이거 빼먹으면 내 서비스가 안 뜹니다!)
 "com.rotemDemo.zzz.lib"     // 공통 라이브러리 패키지
})
public class Application {
	
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}
