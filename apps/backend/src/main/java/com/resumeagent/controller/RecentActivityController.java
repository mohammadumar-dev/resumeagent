package com.resumeagent.controller;

import com.resumeagent.dto.response.RecentActivityListResponse;
import com.resumeagent.service.RecentActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class RecentActivityController {

    private final RecentActivityService recentActivityService;

    @GetMapping("/recent")
    @ResponseStatus(HttpStatus.OK)
    public RecentActivityListResponse getRecentActivity(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        String email = authentication.getName();
        return recentActivityService.getRecentActivity(email, pageable);
    }
}
