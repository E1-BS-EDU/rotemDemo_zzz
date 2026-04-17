package com.rotemDemo.zzz.dept;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/dept") // 1. 공통 URL 프리픽스 정의
public class deptController {

	/**
     * 부서 목록 페이지 호출
     * URL: http://localhost:9001/dept/list
     */
    @GetMapping("/list")
    public String deptList(Model model) {
        
        // (선택사항) 화면에 전달할 데이터가 있다면 여기에 작성
        // model.addAttribute("msg", "부서 목록 화면입니다.");

        // 2. 템플릿 경로 반환
        // 실제 파일: src/main/resources/templates/epm/dept/deptList.html
        // 타임리프 기준: templates/ 폴더 생략, .html 확장자 생략
        return "epm/dept/deptList";
    }

	
}
