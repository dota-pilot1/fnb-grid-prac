package com.hyun.fnb.employee;

import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface EmployeeMapper {

    @Select("SELECT * FROM employees ORDER BY id")
    List<Employee> findAll();

    @Select("SELECT * FROM employees WHERE id = #{id}")
    Employee findById(Long id);

    @Insert("INSERT INTO employees (name, age, position) VALUES (#{name}, #{age}, #{position})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Employee employee);

    @Update("UPDATE employees SET name = #{name}, age = #{age}, position = #{position} WHERE id = #{id}")
    int update(Employee employee);

    @Delete("DELETE FROM employees WHERE id = #{id}")
    int delete(Long id);

    int count(@Param("filters") List<FilterParam> filters);

    List<Employee> findPaginated(
            @Param("filters") List<FilterParam> filters,
            @Param("sortCol") String sortCol,
            @Param("sortDir") String sortDir,
            @Param("limit") int limit,
            @Param("offset") int offset
    );
}
