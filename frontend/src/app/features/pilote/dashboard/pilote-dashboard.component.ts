import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { KpiService } from '../../../services/kpi.service';
import { FicheService } from '../../../services/fiche.service';
import { ProjetService } from '../../../services/projet.service';
import { NotificationService } from '../../../services/notification.service';
import { GlobalStats, KPI } from '../../../models/kpi.model';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-pilote-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './pilote-dashboard.component.html',
  styleUrls: ['./pilote-dashboard.component.css']
})
export class PiloteDashboardComponent implements OnInit {
  kpiService = inject(KpiService);
  ficheService = inject(FicheService);
  projetService = inject(ProjetService);
  notificationService = inject(NotificationService);
  toastr = inject(ToastrService);
  spinner = inject(NgxSpinnerService);

  @ViewChild('dashboardContent') dashboardContent!: ElementRef;

  stats: GlobalStats | null = null;
  fiches: any[] = [];
  periodeFilter = 30; // jours
  isExporting = false;
  
  // Charts Configurations
  public chartOptions = { responsive: true, maintainAspectRatio: false };
  public lineChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [{ data: [65, 59, 80, 81, 56, 55], label: 'Taux avancement global', borderColor: '#14b8a6', tension: 0.4 }]
  };
  
  public doughnutChartData = {
    labels: ['En cours', 'Terminés', 'En retard'],
    datasets: [{ data: [15, 45, 10], backgroundColor: ['#3b82f6', '#10b981', '#ef4444'] }]
  };

  public barChartData = {
    labels: ['Projet A', 'Projet B', 'Projet C', 'Projet D'],
    datasets: [{ data: [12, 19, 3, 5], label: 'Non-conformités', backgroundColor: '#a855f7' }]
  };

  ngOnInit() {
    this.refreshData();
    // Auto-refresh every 60s
    setInterval(() => this.refreshData(false), 60000);
  }

  formatNumber(value: number | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined) return '0.00';
    return parseFloat(value.toString()).toFixed(decimals);
  }

  refreshData(showSpinner = true) {
    if (showSpinner) this.spinner.show();
    
    this.kpiService.getGlobalStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loadFiches();
        this.loadDoughnutChart();
        if (showSpinner) this.spinner.hide();
      },
      error: () => {
        if (showSpinner) this.spinner.hide();
      }
    });

    this.kpiService.getAll().subscribe({
      next: (kpis: KPI[]) => {
        // Map true data to charts in a complete implementation
      }
    });
  }

  loadFiches() {
  this.ficheService.getAllFichesSuivi().subscribe({
    next: (res: any[]) => this.fiches = (res || []).filter(f => f != null)
  });
}

  loadDoughnutChart() {
    this.projetService.getAll().subscribe({
      next: (projets) => {
        const enCours = projets.filter(p => !p.statut || p.statut === 'EN_COURS' || p.statut === 'NOUVEAU').length;
        const termines = projets.filter(p => p.statut === 'TERMINE').length;
        const enRetard = projets.filter(p => p.statut === 'EN_RETARD').length;

        this.doughnutChartData = {
          ...this.doughnutChartData,
          datasets: [{ ...this.doughnutChartData.datasets[0], data: [enCours, termines, enRetard] }]
        };

        const projectNames = projets.slice(0, 4).map(p => p.nomProjet);
        const randomAnomalies = projectNames.map(() => Math.floor(Math.random() * 10)); // simulated
        if (projectNames.length > 0) {
          this.barChartData = {
            ...this.barChartData,
            labels: projectNames,
            datasets: [{ ...this.barChartData.datasets[0], data: randomAnomalies, label: 'Non-conformités par Projet' }]
          };
        }
      }
    });
  }

  exporterPdf() {
    this.isExporting = true;
    
    const element = this.dashboardContent?.nativeElement || document.querySelector('.space-y-6');
    if (!element) {
      this.toastr.error('Impossible de capturer l\'interface');
      this.isExporting = false;
      return;
    }

    html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      // Ajouter l'image au PDF
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Ajouter date et titre
      const date = new Date().toLocaleDateString('fr-FR');
      pdf.setFontSize(10);
      pdf.text(`Rapport - ${date}`, 10, pdf.internal.pageSize.getHeight() - 5);

      pdf.save(`Dashboard_KPI_${new Date().toISOString().split('T')[0]}.pdf`);
      this.isExporting = false;
      this.toastr.success('PDF exporté avec succès');
    }).catch(error => {
      console.error('Erreur export PDF:', error);
      this.isExporting = false;
      this.toastr.error('Erreur lors de la capture du dashboard');
    });
  }

  exporterExcel() {
    this.isExporting = true;
    
    try {
      // Préparer les données
      const statsData = [
        ['KPI & Suivi Qualité - Rapport'],
        ['Date', new Date().toLocaleDateString('fr-FR')],
        [],
        ['STATISTIQUES GLOBALES'],
        ['Projets en retard', this.stats?.projetsEnRetard || 0],
        ['Taux Complétion Moyen (%)', this.formatNumber(this.stats?.tauxCompletionMoyen)],
        ['KPI Global Moyen', this.formatNumber(this.stats?.kpiGlobalMoyen)],
        ['Notifications (Mois)', this.stats?.notificationsEnvoyees || 0],
        [],
        ['DÉTAIL DES FICHES'],
        ['ID', 'Projet', 'Responsable', 'Statut', 'Taux Avancement (%)']
      ];

      // Ajouter les fiches
      this.fiches.forEach(fiche => {
        statsData.push([
          fiche.id || '-',
          fiche.ficheProjet?.projet?.nom || '-',
          fiche.responsableAction ? `${fiche.responsableAction.prenom} ${fiche.responsableAction.nom}` : 'Non assigné',
          fiche.statutAction?.replace('_', ' ') || '-',
          this.formatNumber(fiche.tauxAvancement)
        ]);
      });

      // Créer le workbook
      const ws = XLSX.utils.aoa_to_sheet(statsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport KPI');

      // Formater les colonnes
      ws['!cols'] = [
        { wch: 8 },
        { wch: 25 },
        { wch: 25 },
        { wch: 15 },
        { wch: 20 }
      ];

      // Télécharger
      XLSX.writeFile(wb, `Dashboard_KPI_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      this.isExporting = false;
      this.toastr.success('Excel exporté avec succès');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      this.isExporting = false;
      this.toastr.error('Erreur lors de l\'export Excel');
    }
  }

  notifierRetard(fiche: any) {
    if (!fiche.responsableAction) return;
    this.notificationService.envoyerNotification(fiche.responsableAction.id, `Retard signalé sur la fiche ${fiche.id}`, 'RETARD')
      .subscribe({
        next: () => this.toastr.success('Notification de retard envoyée avec succès.')
      });
  }
}
