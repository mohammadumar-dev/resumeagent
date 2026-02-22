package com.resumeagent.controller;

import com.resumeagent.dto.request.RegisterAdminAndUserRequest;
import com.resumeagent.dto.response.AdminUserActivitySummaryResponse;
import com.resumeagent.dto.response.AdminUserListResponse;
import com.resumeagent.dto.response.AdminUsersDashboard;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * AdminController
 * Exposes admin-related public HTTP endpoints.
 * This controller is responsible only for:
 * - Handling HTTP requests
 * - Validating input
 * - Delegating business logic to the service layer
 * IMPORTANT:
 * - No business logic should live here
 * - No database access should happen here
 */
@RestController
@RequestMapping(value = "/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * Register a new admin user.
     * Endpoint: POST /api/admin/register
     * Responsibilities:
     * - Accept registration request
     * - Trigger validation using @Valid
     * - Delegate registration logic to AdminService
     * HTTP Behavior:
     * - 201 CREATED on successful registration
     * - 400 BAD REQUEST for validation errors
     * - 409 CONFLICT if email already exists
     *
     * @param request registration request payload
     * @return success response with email info
     */
    @PostMapping(value = "/register")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse register(@Valid @RequestBody RegisterAdminAndUserRequest request) {
        return adminService.registerAdmin(request);
    }

    /**
     * List all users with role USER (paginated).
     * Endpoint: GET /api/admin/users
     */
    @GetMapping(value = "/users")
    @ResponseStatus(HttpStatus.OK)
    public AdminUserListResponse listUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return adminService.listUsers(pageable);
    }

    /**
     * Admin users dashboard stats.
     * Endpoint: GET /api/admin/users/dashboard
     */
    @GetMapping(value = "/dashboard-stats")
    @ResponseStatus(HttpStatus.OK)
    public AdminUsersDashboard getUsersDashboard() {
        return adminService.getUsersDashboard();
    }

    /**
     * Admin summary of a specific user's activity.
     * Endpoint: GET /api/admin/users/{userId}/summary
     */
    @GetMapping(value = "/users/{userId}/summary")
    @ResponseStatus(HttpStatus.OK)
    public AdminUserActivitySummaryResponse getUserSummary(@PathVariable UUID userId) {
        return adminService.getUserActivitySummary(userId);
    }

    /**
     * Soft delete (deactivate) a user or admin by setting emailActive to false.
     * Endpoint: PATCH /api/admin/users/{userId}/deactivate
     */
    @PatchMapping(value = "/users/{userId}/deactivate")
    @ResponseStatus(HttpStatus.OK)
    public CommonResponse deactivateUser(@PathVariable UUID userId) {
        return adminService.deactivateUser(userId);
    }

}
