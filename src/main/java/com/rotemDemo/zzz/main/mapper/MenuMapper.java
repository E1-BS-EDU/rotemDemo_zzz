package com.rotemDemo.zzz.main.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MenuMapper {
	List<Map<String, Object>> selectMenuListBySysId(Map<String, String> param);
	
	// [추가] 시스템 ID와 개발 모드로 URL 조회
    String selectSystemUrl(@Param("sysId") String sysId, @Param("dvlMode") String dvlMode);
}
