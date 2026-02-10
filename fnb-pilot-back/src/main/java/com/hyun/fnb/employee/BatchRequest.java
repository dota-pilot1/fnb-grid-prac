package com.hyun.fnb.employee;

import lombok.Data;

import java.util.List;

@Data
public class BatchRequest {
    private List<Employee> created;
    private List<Employee> updated;
    private List<Long> deletedIds;
}
