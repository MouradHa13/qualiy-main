package com.qualite.suivi.controller;

import com.qualite.suivi.model.Projet;
import com.qualite.suivi.service.ProjetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
public class ProjetController {

    @Autowired
    private ProjetService projetService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'PILOTE_QUALITE', 'ADMIN')")
    public List<Projet> getAllProjets() {
        return projetService.getAllProjets();
    }

    @GetMapping("/chef/{chefId}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'ADMIN')")
    public List<Projet> getProjetsByChef(@PathVariable String chefId) {
        return projetService.getProjetsByChef(chefId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CHEF_PROJET')")
    public Projet createProjet(@RequestBody Projet projet) {
        return projetService.createProjet(projet);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'PILOTE_QUALITE', 'ADMIN')")
    public Projet getProjet(@PathVariable String id) {
        return projetService.getProjetById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'ADMIN')")
    public Projet updateProjet(@PathVariable String id, @RequestBody Projet projet) {
        return projetService.updateProjet(id, projet);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CHEF_PROJET', 'ADMIN')")
    public ResponseEntity<?> deleteProjet(@PathVariable String id) {
        projetService.deleteProjet(id);
        return ResponseEntity.ok().build();
    }
}
