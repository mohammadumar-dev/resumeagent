package com.resumeagent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminUsersDashboard {
    private int totalUsersCount;
    private int totalAdmins;
    private int totalUsers;
    private int totalFreePlanUsers;
    private int totalPremiumPlanUsers;
    private int totalResumeGenerations;
}
