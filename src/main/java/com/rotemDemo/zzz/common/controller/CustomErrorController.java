package com.rotemDemo.zzz.common.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class CustomErrorController {

    /**
     * 공통 에러 페이지 뷰
     * URL: /error/view?code=404&msg=메시지
     */
    @GetMapping("/error/view")
    public String errorView(Model model, 
                            @RequestParam(value = "code", defaultValue = "500") String code,
                            @RequestParam(value = "msg", required = false) String msg) {
        
        model.addAttribute("errorCode", code);
        
        // 메시지가 파라미터로 넘어오지 않았을 때의 기본 문구 처리
        if (msg == null || msg.isEmpty()) {
            if ("404".equals(code)) {
                msg = "요청하신 페이지를 찾을 수 없습니다.";
            } else if ("401".equals(code)) {
                msg = "로그인 세션이 만료되었습니다.";
            } else if ("403".equals(code)) {
                msg = "접근 권한이 없습니다.";
            } else {
                msg = "시스템 처리 중 오류가 발생했습니다.";
            }
        }
        
        model.addAttribute("errorMessage", msg);

        // [중요] 요청하신 폴더 경로(templates/zzz/error/errorPage.html)로 리턴
        return "zzz/error/errorPage"; 
    }
}