import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiService } from '../../../services/kpi.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import html2canvas from 'html2canvas';


interface GlobalStats {
  totalProjets: number;
  totalFiches: number;
  tauxCompletionMoyen: number;
  projetsEnRetard: number;
}

interface KpiStats {
  totalProjets: number;
  projetsEnCours: number;
  projetsTermines: number;
  projetsEnRetard: number;
  avancementMoyen: number;
  totalFiches: number;
}

interface Html2CanvasOptions {
  scale: number;
  logging: boolean;
  useCORS: boolean;
  allowTaint: boolean;
  backgroundColor: string;
}

@Component({
  selector: 'app-kpi-reports',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './kpi-reports.component.html',
  styleUrls: ['./kpi-reports.component.css']
})
export class KpiReportsComponent implements OnInit {
  private kpiService = inject(KpiService);
  toastr = inject(ToastrService);

  @ViewChild('dashboardContent') dashboardContent!: ElementRef;

  stats: KpiStats = {
    totalProjets: 0,
    projetsEnCours: 0,
    projetsTermines: 0,
    projetsEnRetard: 0,
    avancementMoyen: 0,
    totalFiches: 0
  };

  isLoading: boolean = true;
  downloadingPdf: boolean = false;
  downloadingExcel: boolean = false;
  constructor() { }

  ngOnInit(
  ) {
    this.kpiService.getGlobalStats().subscribe({
      next: (globalStats) => {
        this.stats.totalProjets = globalStats.totalProjets;
        this.stats.totalFiches = globalStats.totalFiches;
        this.stats.avancementMoyen = Math.round(globalStats.tauxCompletionMoyen);
        this.stats.projetsEnRetard = globalStats.projetsEnRetard;
        this.stats.projetsEnCours = globalStats.totalProjets - globalStats.projetsEnRetard - (this.stats.projetsTermines || 0);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }
isExporting : boolean = false;
 downloadPdf() {
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
    }).then((canvas: { toDataURL: (arg0: string) => any; height: number; width: number; }) => {
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
    }).catch((error: any) => {
      console.error('Erreur export PDF:', error);
      this.toastr.error('Erreur lors de la capture du dashboard');
    });
  }


  downloadExcel() {
    this.downloadingExcel = true;
    this.kpiService.exportExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rapport_kpi.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingExcel = false;
      },
      error: () => { this.downloadingExcel = false; }
    });
  }
}


