package com.hyun.fnb.employee;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterParam {
    private String field;
    private String value;
}
