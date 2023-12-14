import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  selectedGroup: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private router: Router) { }

  // Check If User Login
  isLogin() {
    return !!localStorage.getItem('userData');
  }

  // Logout
  Logout() {
    localStorage.clear();
    this.router.navigate(['/login'])
  }
}
