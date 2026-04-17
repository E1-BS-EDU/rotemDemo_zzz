package com.rotemDemo.zzz.main.service;


import java.util.List;
import java.util.Map;

public interface MenuService {
	List<Map<String, Object>> getMenuTree(Map<String, String> param);
}
