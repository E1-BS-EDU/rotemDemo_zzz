package com.rotemDemo.zzz.main.serviceImpl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.rotemDemo.zzz.main.mapper.MenuMapper;
import com.rotemDemo.zzz.main.service.MenuService;

@Service
public class MenuServiceImpl implements MenuService {
	
	private static final Logger log = LoggerFactory.getLogger(MenuServiceImpl.class);
	
	@Autowired
    private MenuMapper menuMapper;
	

    // [변경] application.yml에서 server.type 값만 가져옴 (local/dev/prd)
	@Value("${server.type:local}")
	private String serverType;
	
	@Override
    public List<Map<String, Object>> getMenuTree(Map<String, String> param) {

		//log.info(">> getMenuTree sysId: {}, mode: {}", sysId, serverType);
		
		String sysId = (String) param.get("sysId");
		
		
	    // 1. [핵심] DB에서 현재 환경(server.type)과 시스템ID에 맞는 도메인 URL 조회
        // 예: sysId='wdc', serverType='local' -> 'http://localhost:8082'
        String baseUrl = menuMapper.selectSystemUrl(sysId, serverType);
        
        // DB에 정보가 없으면 빈 문자열 처리 (null 방지)
        if (baseUrl == null) baseUrl = "";
        
        // 2. 메뉴 목록 조회
		List<Map<String, Object>> menuList = menuMapper.selectMenuListBySysId(param);

        if (menuList == null || menuList.isEmpty()) {
            return new ArrayList<>();
        }

        Map<String, Map<String, Object>> lookup = new HashMap<>();
        
        for (Map<String, Object> menu : menuList) {
            if (menu == null) continue;
            
            // [변경] DB에서 가져온 baseUrl을 이용하여 URL 조합
            combineUrl(menu, baseUrl);
            
            String menuId = String.valueOf(menu.get("menuId"));
            lookup.put(menuId, menu);
        }

        // 3. 트리 구조 조립
        List<Map<String, Object>> rootMenus = new ArrayList<>();
        for (Map<String, Object> menu : menuList) {
            if (menu == null) continue;

            Object pIdObj = menu.get("parentMenuId");
            String pId = (pIdObj == null) ? null : String.valueOf(pIdObj);

            if (pId == null || "".equals(pId) || "ROOT".equalsIgnoreCase(pId) || "0".equals(pId)) {
                rootMenus.add(menu);
            } else {
                Map<String, Object> parent = lookup.get(pId);

                if (parent != null) {
                	@SuppressWarnings("unchecked")
                    List<Map<String, Object>> children = (List<Map<String, Object>>) parent.get("children");

                    if (children == null) {
                        children = new ArrayList<>();
                        parent.put("children", children);
                    }
                    
                    children.add(menu);
                } else {
                    log.warn("부모 메뉴를 찾을 수 없음: {} (Parent: {})", menu.get("menuId"), pId);
                }
            }
        }
        log.info(">>>>>>>>> getMenuTree rootMenus :: {} ", rootMenus);
        return rootMenus;
    }
	
	/**
	 * https://m.blog.naver.com/obrigadu/50101513978 메뉴 URL 앞에 DB에서 조회한 도메인(BaseUrl)을 붙임
	 */
	private void combineUrl(Map<String, Object> menu, String baseUrl) {
		Object urlObj = menu.get("menuUrl");
		
		// baseUrl이 있고, 메뉴 URL이 존재할 때만 처리
		if (urlObj != null && !baseUrl.isEmpty()) {
			String originalUrl = String.valueOf(urlObj).trim();
			
			// 1. URL이 비어있지 않고
			// 2. 이미 http로 시작하는 외부 링크가 아니고
			// 3. '#' (더미 링크)이 아닐 때만 붙임
			if (!originalUrl.isEmpty() && !originalUrl.startsWith("http") && !originalUrl.equals("#")) {
				
				// 슬래시(/) 중복 방지 및 처리
				if (!baseUrl.endsWith("/") && !originalUrl.startsWith("/")) {
					menu.put("menuUrl", baseUrl + "/" + originalUrl);
				} else if (baseUrl.endsWith("/") && originalUrl.startsWith("/")) {
					menu.put("menuUrl", baseUrl + originalUrl.substring(1));
				} else {
					menu.put("menuUrl", baseUrl + originalUrl);
				}
			}
		}
	}
}