package com.qualite.suivi.controller;

import com.qualite.suivi.model.Notification;
import com.qualite.suivi.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/test")
    public String test() {
        return "Notifications API is REACHABLE";
    }

    @GetMapping("/mes-notifications")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'CHEF_PROJET', 'ROLE_CHEF_PROJET', 'PILOTE_QUALITE', 'ROLE_PILOTE_QUALITE')")
    public List<Notification> getMyNotifications() {
        return notificationService.getAllNotifications();
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'CHEF_PROJET', 'ROLE_CHEF_PROJET', 'PILOTE_QUALITE', 'ROLE_PILOTE_QUALITE')")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'CHEF_PROJET', 'ROLE_CHEF_PROJET', 'PILOTE_QUALITE', 'ROLE_PILOTE_QUALITE')")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> createNotification(@RequestBody Notification notification) {
        notificationService.savePublicNotification(notification);
        return ResponseEntity.ok().build();
    }
}
