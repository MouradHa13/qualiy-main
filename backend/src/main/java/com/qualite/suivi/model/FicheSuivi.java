package com.qualite.suivi.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "fiches_suivi")
@Data
@EqualsAndHashCode(callSuper = true)
public class FicheSuivi extends AbstractAuditEntity {
    @Id
    private String id;
    private String projetId;
    private String projetNom;
    private Date dateSaisie = new Date();
    private int avancement; // %
    private String problemes;
    private String decisions;
    private String indicateurs;
    private String sujet;
    private String observations;
    private String statut;
}
