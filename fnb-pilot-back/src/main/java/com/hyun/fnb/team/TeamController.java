package com.hyun.fnb.team;

import com.hyun.fnb.employee.Employee;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public List<Team> findAll() {
        return teamService.findAll();
    }

    @GetMapping("/{id}/members")
    public List<Employee> findMembers(@PathVariable Long id) {
        return teamService.findMembers(id);
    }
}
