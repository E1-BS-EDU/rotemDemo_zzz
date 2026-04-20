package com.rotemDemo.zzz.main.comtroller;

import org.springframework.web.bind.annotation.*;

import com.rotemDemo.common.util.SecurityUtil;
import com.rotemDemo.zzz.main.service.MenuService;
import com.rotemDemo.zzz.mapper.SystemMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/portal")
public class mainRestController {

    private final SystemMapper systemMapper;

    private final MenuService menuService;

    @PostMapping("/systemList")
    public Map<String, Object> getSystemList(@RequestBody Map<String, String> param) {
        
        log.info("systemList param :: {} ", param);
    	
        List<Map<String, Object>> list = systemMapper.selectSystemList(param);

        Map<String, Object> result = new HashMap<>();
        result.put("result", true);
        result.put("data", list);

        return result;
    }

    @PostMapping("/menuList")
    public Map<String, Object> getMenuList(@RequestBody Map<String, String> param) {
        String userId = SecurityUtil.getUserId();
        param.put("userId", userId);

        log.info("getMenuList userId :: {} ", userId);

        List<Map<String, Object>> tree = menuService.getMenuTree(param);

        return Map.of("result", true, "data", tree);
    }
    
    @PostMapping("/apiTest")
    public Map<String, Object> test(@RequestBody Map<String, String> param) {
        return Map.of("result", true, "data", param);
    }
}
