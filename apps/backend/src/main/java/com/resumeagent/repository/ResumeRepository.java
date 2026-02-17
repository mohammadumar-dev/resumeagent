package com.resumeagent.repository;

import com.resumeagent.entity.Resume;
import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.ResumeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {

    boolean existsByUser(User user);

    boolean existsByUserId(UUID userId);

    Optional<Resume> findByUser(User user);

    Optional<Resume> findByIdAndUserId(UUID id, UUID userId);

    Page<Resume> findByUserAndStatusIn(User user, Collection<ResumeStatus> statuses, Pageable pageable);
}
