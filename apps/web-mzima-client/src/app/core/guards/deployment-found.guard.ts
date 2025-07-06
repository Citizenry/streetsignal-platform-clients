import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SessionService } from '@services';
import { filter, Observable, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeploymentFoundGuard implements CanActivate {
  constructor(private router: Router, private service: SessionService) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.service.deploymentInfo$.pipe(
      filter((deploymentInfo) => deploymentInfo !== false),
      take(1),
      switchMap(() => {
        if (this.service.siteFound) {
          return [true];
        }
        return [this.router.parseUrl('/notfound')];
      }),
    );
  }
}
