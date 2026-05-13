package com.qualite.suivi.service;

import com.qualite.suivi.model.FicheSuivi;
import com.qualite.suivi.model.Projet;
import com.qualite.suivi.repository.FicheSuiviRepository;
import com.qualite.suivi.repository.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class FicheSuiviService {

    @Autowired
    private FicheSuiviRepository ficheSuiviRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private HistoriqueService historiqueService;

    public FicheSuivi addFicheSuivi(String projetId, FicheSuivi fiche) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        fiche.setDateSaisie(new Date());
        fiche.setProjetId(projet.getId());
        fiche.setProjetNom(projet.getNomProjet());
        FicheSuivi saved = ficheSuiviRepository.save(fiche);

        if (projet.getFichesSuivi() == null) projet.setFichesSuivi(new ArrayList<>());
        projet.getFichesSuivi().add(saved);
        
        // Synchronize project progress with the latest follow-up sheet
        System.out.println("DEBUG - Syncing project " + projet.getNomProjet() + " to " + saved.getAvancement() + "%");
        projet.setAvancement(saved.getAvancement());
        projetRepository.save(projet);

        historiqueService.logAction("FICHE_SUIVI", "CREATE", "Fiche suivi ajoutée pour le projet: " + projet.getNomProjet());
        return saved;
    }

    public List<FicheSuivi> getFichesSuiviByProjet(String projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        return projet.getFichesSuivi();
    }

    public List<FicheSuivi> getAllFichesSuivi() {
        return ficheSuiviRepository.findAll();
    }

    public FicheSuivi updateFicheSuivi(String id, FicheSuivi details) {
        FicheSuivi fiche = ficheSuiviRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));
        
        fiche.setAvancement(details.getAvancement());
        fiche.setProblemes(details.getProblemes());
        fiche.setDecisions(details.getDecisions());
        fiche.setIndicateurs(details.getIndicateurs());
        fiche.setSujet(details.getSujet());
        fiche.setObservations(details.getObservations());
        fiche.setStatut(details.getStatut());

        FicheSuivi updated = ficheSuiviRepository.save(fiche);

        // Update project progress as well
        if (updated.getProjetId() != null) {
            projetRepository.findById(updated.getProjetId()).ifPresent(p -> {
                System.out.println("DEBUG - Updating project " + p.getNomProjet() + " to " + updated.getAvancement() + "%");
                p.setAvancement(updated.getAvancement());
                projetRepository.save(p);
            });
        }

        historiqueService.logAction("FICHE_SUIVI", "UPDATE", "Fiche suivi mise à jour pour le projet: " + updated.getProjetNom());
        return updated;
    }

    public void deleteFicheSuivi(String id) {
        FicheSuivi fiche = ficheSuiviRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fiche non trouvée"));
        
        Projet projet = projetRepository.findById(fiche.getProjetId()).orElse(null);
        if (projet != null && projet.getFichesSuivi() != null) {
            projet.getFichesSuivi().removeIf(f -> f.getId().equals(id));
            
            // Recalculate progress: take the latest remaining fiche or 0
            if (!projet.getFichesSuivi().isEmpty()) {
                FicheSuivi latest = projet.getFichesSuivi().get(projet.getFichesSuivi().size() - 1);
                projet.setAvancement(latest.getAvancement());
            } else {
                projet.setAvancement(0);
            }
            
            projetRepository.save(projet);
        }

        ficheSuiviRepository.deleteById(id);
        historiqueService.logAction("FICHE_SUIVI", "DELETE", "Fiche suivi supprimée pour le projet: " + fiche.getProjetNom());
    }
}
