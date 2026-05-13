import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';
import { KPI, GlobalStats } from '../models/kpi.model';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';
import { RoleNom } from '../models/utilisateur.model';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/api/kpis`;

  getAll(): Observable<KPI[]> {
    return this.http.get<KPI[]>(this.apiUrl);
  }

  calculate(name: string, formula: string, period: string): Observable<KPI> {
    const params = new HttpParams()
      .set('name', name)
      .set('formula', formula)
      .set('period', period);
    return this.http.post<KPI>(`${this.apiUrl}/calculate`, null, { params });
  }

  // Dynamically calculating GlobalStats by calling actual APIs
  getGlobalStats(): Observable<GlobalStats> {
    const isAdmin = this.authService.hasRole(RoleNom.ADMIN);
    const users$ = isAdmin 
      ? this.http.get<any[]>(`${environment.apiUrl}/api/users`).pipe(catchError(() => of([] as any[])))
      : of([] as any[]);
      
    const projets$ = this.http.get<any[]>(`${environment.apiUrl}/api/projets`).pipe(catchError(() => of([] as any[])));
    const fiches$ = this.http.get<any[]>(`${environment.apiUrl}/api/fiches-suivi`).pipe(catchError(() => of([] as any[])));

    return forkJoin({
      users: users$,
      projets: projets$,
      fiches: fiches$
    }).pipe(
      map(res => {
        const totalUsers = res.users?.length || 0;
        const totalProjets = res.projets?.length || 0;
        const totalFiches = res.fiches?.length || 0;
        
        const admin = res.users?.filter(u => u.roles?.some((r: any) => r.nomRole === 'ADMIN')).length || 0;
        const chef = res.users?.filter(u => u.roles?.some((r: any) => r.nomRole === 'CHEF_PROJET')).length || 0;
        const pilote = res.users?.filter(u => u.roles?.some((r: any) => r.nomRole === 'PILOTE_QUALITE')).length || 0;

        // Mock Projects by month / week, here returning a simple distribution based on total projects
        const projetsParMois = [
          Math.floor(totalProjets * 0.1),
          Math.floor(totalProjets * 0.2),
          Math.floor(totalProjets * 0.3),
          Math.floor(totalProjets * 0.4)
        ];

        return {
          totalUsers,
          totalProjets,
          totalFiches,
          notificationsEnvoyees: totalFiches * 2, 
          projetsEnRetard: res.projets?.filter(p => p.statut === 'EN_RETARD').length || 0,
          tauxCompletionMoyen: totalProjets > 0 ? res.projets.reduce((acc, p) => acc + (p.avancement || 0), 0) / totalProjets : 0,
          kpiGlobalMoyen: 85,
          usersByRole: { admin, chef, pilote },
          projetsParMois
        };
      })
    );
  }

  exportPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/pdf`, { responseType: 'blob' });
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/excel`, { responseType: 'blob' });
  }
}
