import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDateParserFormatter, NgbDate } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-visit-details',
  templateUrl: './visit-details.component.html',
  styleUrls: ['./visit-details.component.css']
})
export class VisitDetailsComponent implements OnInit {
  calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);

  hoveredDate: NgbDate | null = null;
  fromDate!: NgbDate | null
  toDate!: NgbDate | null

  loading = true

  usersStats: any
  exist: any

  visits: any[] = []
  visitsTemp: any[] = []
  filteredVisits: any[] = []

  maxDate = { year: new Date().getFullYear(), month: new Date().getUTCMonth() + 1, day: new Date().getDate() }

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.getAllUsersData()
  }

  getAllUsersData() {
    this.loading = true;
    if (localStorage.getItem('usersStats')) {
      this.usersStats = JSON.parse(localStorage.getItem('usersStats') || '{}')

      this.usersStats?.forEach((element: any) => {
        let data = element?.visits?.map((visit: any) => {
          return {
            id: element?.user?.id,
            username: element?.user?.username,
            group: element?.user?.group,
            subgroup: element?.user?.subgroup,
            visit: visit,
          }
        });
        this.visits = data;
      });

      localStorage.setItem('visits', JSON.stringify(this.visits))
      this.visitsTemp = JSON.parse(JSON.stringify(this.visits));
      this.filteredVisits = this.visits

      this.exist = true
      this.loading = false;
    } else {
      this.exist = false
      this.loading = false;
    }
  }

  goToDashboard() {
    this.router.navigateByUrl('dashboard');
  }

  applyFilter(event: Event, type: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (!filterValue) {
      //empty filter, show all countries:
      this.filteredVisits = this.visits;
    } else {
      if (type == 'username') {
        this.filteredVisits = this.visits.filter(
          obj => obj.username.toLowerCase().includes(filterValue.trim().toLowerCase())
        );
      }

      if (type == 'Line') {
        this.filteredVisits = this.visits.filter(
          obj => obj?.visit?.line?.toLowerCase().includes(filterValue.trim().toLowerCase())
        );
      }

      if (type == 'Class') {
        this.filteredVisits = this.visits.filter(
          obj => obj?.visit?.classy?.toLowerCase().includes(filterValue.trim().toLowerCase())
        );
      }

      if (type == 'Specialty') {
        this.filteredVisits = this.visits.filter(
          obj => obj?.visit?.specialty?.toLowerCase().includes(filterValue.trim().toLowerCase())
        );
      }

      if (type == 'Type') {
        this.filteredVisits = this.visits.filter(
          obj => obj?.visit?.type?.toLowerCase().includes(filterValue.trim().toLowerCase())
        );
      }


    }
  }
  filterTypeValue: any
  resetFilter() {
    this.filteredVisits = this.visits;
    this.fromDate = null
    this.toDate = null
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    if (this.fromDate && this.toDate) {
      this.filteredVisits = this.visits.filter(
        obj => this.checkDate(obj?.visit?.dateOfVisit));
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {

    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  checkDate(date: any): any {
    if (this.fromDate && this.toDate) {
      let visitDate = date?.split('/')
      const start = Date.parse(this.fromDate?.month + '/' + this.fromDate?.day + '/' + this.fromDate?.year);
      const end = Date.parse(this.toDate?.month + '/' + this.toDate?.day + '/' + this.toDate?.year);
      const d = Date.parse(visitDate[1] + '/' + visitDate[0] + '/' + visitDate[2]);
      return d >= start && d <= end
    }
  }

  goToTracking() {
    this.router.navigateByUrl('tracking');
  }

}
