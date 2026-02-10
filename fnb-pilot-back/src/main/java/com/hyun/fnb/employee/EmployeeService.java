package com.hyun.fnb.employee;

import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private static final Set<String> VALID_COLUMNS = Set.of(
        "id",
        "name",
        "age",
        "position"
    );

    private final EmployeeMapper employeeMapper;

    public List<Employee> findAll() {
        return employeeMapper.findAll();
    }

    public Employee findById(Long id) {
        return employeeMapper.findById(id);
    }

    public Employee create(Employee employee) {
        employeeMapper.insert(employee);
        return employee;
    }

    public Employee update(Long id, Employee employee) {
        employee.setId(id);
        employeeMapper.update(employee);
        return employeeMapper.findById(id);
    }

    public void delete(Long id) {
        employeeMapper.delete(id);
    }

    public Map<String, Object> findPaginated(
        int page,
        int size,
        String sort,
        String dir,
        List<FilterParam> filters
    ) {
        // 컬럼 검증 (SQL Injection 방지)
        String sortCol = (sort != null && VALID_COLUMNS.contains(sort))
            ? sort
            : "id";
        String sortDir = "desc".equalsIgnoreCase(dir) ? "DESC" : "ASC";

        // 필터 컬럼 검증
        if (filters != null) {
            filters.removeIf(f -> !VALID_COLUMNS.contains(f.getField()));
        }

        int total = employeeMapper.count(filters);
        int offset = (page - 1) * size;
        List<Employee> data = employeeMapper.findPaginated(
            filters,
            sortCol,
            sortDir,
            size,
            offset
        );
        int lastPage = (int) Math.ceil((double) total / size);

        return Map.of("last_page", lastPage, "data", data);
    }

    @Transactional
    public Map<String, Object> batch(
        List<Employee> created,
        List<Employee> updated,
        List<Long> deletedIds
    ) {
        // 1) 삭제
        if (deletedIds != null) {
            for (Long id : deletedIds) {
                employeeMapper.delete(id);
            }
        }

        // 2) 수정
        if (updated != null) {
            for (Employee e : updated) {
                employeeMapper.update(e);
            }
        }

        // 3) 추가
        if (created != null) {
            for (Employee e : created) {
                employeeMapper.insert(e);
            }
        }

        return Map.of(
            "created",
            created != null ? created : List.of(),
            "updatedCount",
            updated != null ? updated.size() : 0,
            "deletedCount",
            deletedIds != null ? deletedIds.size() : 0,
            "total",
            employeeMapper.findAll().size()
        );
    }
}
