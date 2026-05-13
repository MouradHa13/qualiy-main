package com.qualite.suivi.service;

import com.qualite.suivi.model.Notification;
import com.qualite.suivi.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getNotificationsByDestinataire(String destinataireId) {
        return notificationRepository.findByDestinataireId(destinataireId);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setLu(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead() {
        List<Notification> all = notificationRepository.findAll();
        all.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(all);
    }

    public void saveNotification(String destinataireId, String message, String type) {
        Notification n = new Notification();
        n.setDestinataireId(destinataireId);
        n.setMessage(message);
        n.setType(type);
        n.setDateEnvoi(new Date());
        n.setLu(false);
        notificationRepository.save(n);
    }

    public void savePublicNotification(Notification notification) {
        notification.setDateEnvoi(new Date());
        notification.setLu(false);
        notificationRepository.save(notification);
    }
}
