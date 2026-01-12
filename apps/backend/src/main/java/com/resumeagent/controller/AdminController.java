package com.resumeagent.controller;

import com.resumeagent.dto.request.RegisterAdminAndUserRequest;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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

}
