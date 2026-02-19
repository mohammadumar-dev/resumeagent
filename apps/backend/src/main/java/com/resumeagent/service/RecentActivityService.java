package com.resumeagent.service;

import com.resumeagent.dto.response.RecentActivityListResponse;
import com.resumeagent.dto.response.RecentActivityResponse;
import com.resumeagent.entity.MasterResume;
import com.resumeagent.entity.Resume;
import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.ResumeStatus;
import com.resumeagent.repository.MasterResumeRepository;
import com.resumeagent.repository.ResumeRepository;
import com.resumeagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecentActivityService {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final MasterResumeRepository masterResumeRepository;

    @Transactional(readOnly = true)
    public RecentActivityListResponse getRecentActivity(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        List<Resume> resumes = resumeRepository.findByUserAndStatusIn(
                user,
                EnumSet.of(ResumeStatus.ACTIVE, ResumeStatus.ARCHIVED),
                Sort.by(Sort.Direction.DESC, "updatedAt")
        );

        List<ActivityEntry> activities = new ArrayList<>();
        for (Resume resume : resumes) {
            addResumeActivities(activities, resume);
        }

        MasterResume masterResume = masterResumeRepository.findByUser(user).orElse(null);
        if (masterResume != null) {
            addMasterResumeActivities(activities, masterResume);
        }

        activities.sort(Comparator.comparing(ActivityEntry::time, Comparator.nullsLast(Comparator.reverseOrder())));

        int totalElements = activities.size();
        int size = pageable.getPageSize();
        int page = pageable.getPageNumber();
        int fromIndex = Math.toIntExact(pageable.getOffset());
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<RecentActivityResponse> items;
        if (fromIndex >= totalElements || size == 0) {
            items = List.of();
        } else {
            items = activities.subList(fromIndex, toIndex).stream()
                    .map(ActivityEntry::response)
                    .collect(Collectors.toList());
        }

        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) totalElements / size);
        boolean hasPrevious = page > 0;
        boolean hasNext = page + 1 < totalPages;

        return RecentActivityListResponse.builder()
                .items(items)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .hasNext(hasNext)
                .hasPrevious(hasPrevious)
                .build();
    }

    private void addResumeActivities(List<ActivityEntry> activities, Resume resume) {
        String title = normalizeTitle(resume.getJobTitleTargeted());
        String company = resume.getCompanyTargeted();

        Instant createdAt = resume.getCreatedAt();
        if (createdAt != null) {
            activities.add(new ActivityEntry(
                    createdAt,
                    RecentActivityResponse.builder()
                            .activity("Resume generated")
                            .title(title)
                            .company(company)
                            .status(resume.getStatus())
                            .time(formatRelativeTime(createdAt))
                            .build()
            ));
        }

        Instant updatedAt = resume.getUpdatedAt();
        if (updatedAt != null && (createdAt == null || !updatedAt.equals(createdAt))) {
            activities.add(new ActivityEntry(
                    updatedAt,
                    RecentActivityResponse.builder()
                            .activity("Resume updated")
                            .title(title)
                            .company(company)
                            .status(resume.getStatus())
                            .time(formatRelativeTime(updatedAt))
                            .build()
            ));
        }
    }

    private void addMasterResumeActivities(List<ActivityEntry> activities, MasterResume masterResume) {
        String title = "Master resume";
        ResumeStatus status = ResumeStatus.ACTIVE;

        Instant createdAt = masterResume.getCreatedAt();
        if (createdAt != null) {
            activities.add(new ActivityEntry(
                    createdAt,
                    RecentActivityResponse.builder()
                            .activity("Master resume created")
                            .title(title)
                            .status(status)
                            .time(formatRelativeTime(createdAt))
                            .build()
            ));
        }

        Instant updatedAt = masterResume.getUpdatedAt();
        if (updatedAt != null && (createdAt == null || !updatedAt.equals(createdAt))) {
            activities.add(new ActivityEntry(
                    updatedAt,
                    RecentActivityResponse.builder()
                            .activity("Master resume updated")
                            .title(title)
                            .status(status)
                            .time(formatRelativeTime(updatedAt))
                            .build()
            ));
        }
    }

    private String normalizeTitle(String title) {
        if (title == null || title.isBlank()) {
            return "Resume";
        }
        return title;
    }

    private String formatRelativeTime(Instant time) {
        if (time == null) {
            return null;
        }

        Instant now = Instant.now();
        if (time.isAfter(now)) {
            return "just now";
        }

        Duration duration = Duration.between(time, now);
        long seconds = duration.getSeconds();
        if (seconds < 60) {
            return "just now";
        }

        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes == 1 ? "1 minute ago" : minutes + " minutes ago";
        }

        long hours = minutes / 60;
        if (hours == 1) {
            return "last hour";
        }
        if (hours < 24) {
            return hours + " hours ago";
        }

        ZoneId zoneId = ZoneId.systemDefault();
        LocalDate activityDate = LocalDate.ofInstant(time, zoneId);
        LocalDate today = LocalDate.now(zoneId);
        long days = ChronoUnit.DAYS.between(activityDate, today);

        if (days == 1) {
            return "yesterday";
        }
        if (days < 7) {
            return days + " days ago";
        }

        long weeks = days / 7;
        if (weeks == 1) {
            return "last week";
        }
        if (weeks < 5) {
            return weeks + " weeks ago";
        }

        long months = ChronoUnit.MONTHS.between(activityDate.withDayOfMonth(1), today.withDayOfMonth(1));
        if (months == 1) {
            return "last month";
        }
        if (months < 12) {
            return months + " months ago";
        }

        long years = ChronoUnit.YEARS.between(activityDate.withDayOfYear(1), today.withDayOfYear(1));
        return years == 1 ? "last year" : years + " years ago";
    }

    private static class ActivityEntry {
        private final Instant time;
        private final RecentActivityResponse response;

        private ActivityEntry(Instant time, RecentActivityResponse response) {
            this.time = time;
            this.response = response;
        }

        private Instant time() {
            return time;
        }

        private RecentActivityResponse response() {
            return response;
        }
    }
}
