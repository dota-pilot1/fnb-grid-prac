package com.hyun.fnb.employee;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public Object findAll(
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false, defaultValue = "20") Integer size,
        @RequestParam(required = false) String sort,
        @RequestParam(required = false, defaultValue = "asc") String dir,
        @RequestParam(required = false) String filter
    ) throws Exception {
        if (page != null) {
            List<FilterParam> filters = null;
            if (filter != null && !filter.isBlank()) {
                filters = objectMapper.readValue(
                    filter,
                    new TypeReference<>() {}
                );
            }
            return employeeService.findPaginated(
                page,
                size,
                sort,
                dir,
                filters
            );
        }
        return employeeService.findAll();
    }

    @GetMapping("/{id}")
    public Employee findById(@PathVariable Long id) {
        return employeeService.findById(id);
    }

    @PostMapping
    public Employee create(@RequestBody Employee employee) {
        return employeeService.create(employee);
    }

    @PutMapping("/{id}")
    public Employee update(
        @PathVariable Long id,
        @RequestBody Employee employee
    ) {
        return employeeService.update(id, employee);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        employeeService.delete(id);
    }

    @PostMapping("/batch")
    public Map<String, Object> batch(@RequestBody BatchRequest request) {
        return employeeService.batch(
            request.getCreated(),
            request.getUpdated(),
            request.getDeletedIds()
        );
    }
}
