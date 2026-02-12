package com.hyun.fnb.employee;

import java.util.ArrayList;
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

    @GetMapping
    public Object findAll(
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false, defaultValue = "20") Integer size,
        @RequestParam(required = false) String sort,
        @RequestParam(required = false, defaultValue = "asc") String dir,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String position
    ) {
        if (page != null) {
            List<FilterParam> filters = new ArrayList<>();
            if (name != null && !name.isBlank()) {
                filters.add(new FilterParam("name", name));
            }
            if (position != null && !position.isBlank()) {
                filters.add(new FilterParam("position", position));
            }
            return employeeService.findPaginated(
                page,
                size,
                sort,
                dir,
                filters.isEmpty() ? null : filters
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
