package com.qualite.suivi.repository;

import com.qualite.suivi.model.Utilisateur;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UtilisateurRepository extends MongoRepository<Utilisateur, String> {
    Optional<Utilisateur> findByEmail(String email);
    boolean existsByEmail(String email);
}
