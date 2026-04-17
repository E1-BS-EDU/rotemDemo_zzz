package com.rotemDemo.zzz.mapper;

import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Map;

@Mapper
public interface SystemMapper {
	List<Map<String, Object>> selectSystemList(Map<String, String> param);
}
