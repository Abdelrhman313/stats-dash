import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
  groups: any
  constructor(private apiService: ApiService, private router: Router) {
    if (localStorage.getItem('userData')) {
      this.groups = JSON.parse(localStorage.getItem('userData') || '{}')?.access;
    } else {
      this.apiService.Logout()
    }
  }

  ngOnInit(): void {
  }

  goToDashboard(group: any) {
    // this.apiService.selectedGroup.next(group);
    localStorage.setItem('group', group)
    this.router.navigateByUrl('dashboard');
  }
}
