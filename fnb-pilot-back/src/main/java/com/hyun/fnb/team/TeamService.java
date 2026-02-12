package com.hyun.fnb.team;

import com.hyun.fnb.employee.Employee;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamMapper teamMapper;

    public List<Team> findAll() {
        return teamMapper.findAll();
    }

    public List<Employee> findMembers(Long teamId) {
        return teamMapper.findMembers(teamId);
    }
}
