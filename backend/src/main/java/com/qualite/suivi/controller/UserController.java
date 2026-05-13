package com.qualite.suivi.controller;

import com.qualite.suivi.model.Role;
import com.qualite.suivi.model.Utilisateur;
import com.qualite.suivi.repository.RoleRepository;
import com.qualite.suivi.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE')")
    public List<Utilisateur> getAllUsers() {
        return utilisateurRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE')")
    public Utilisateur getUser(@PathVariable String id) {
        return utilisateurRepository.findById(id).orElseThrow();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteUser(@PathVariable String id) {
        utilisateurRepository.deleteById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public Utilisateur createUser(@RequestBody Utilisateur user) {
        if (utilisateurRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        user.setMotDePasse(encoder.encode(user.getMotDePasse()));
        
        // Map roles names to objects if only names are provided
        if (user.getRoles() != null) {
            Set<Role> roles = new HashSet<>();
            user.getRoles().forEach(role -> {
                roleRepository.findByNomRole(role.getNomRole()).ifPresent(roles::add);
            });
            user.setRoles(roles);
        }

        return utilisateurRepository.save(user);
    }
}
