package com.hyun.fnb.team;

import com.hyun.fnb.employee.Employee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TeamMapper {

    @Select("SELECT * FROM teams ORDER BY id")
    List<Team> findAll();

    @Select("SELECT * FROM employees WHERE team_id = #{teamId} ORDER BY id")
    List<Employee> findMembers(@Param("teamId") Long teamId);
}
