import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDateParserFormatter, NgbDate } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})

export class TrackingComponent implements OnInit {
  calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);

  hoveredDate: NgbDate | null = null;
  fromDate!: NgbDate | null
  toDate!: NgbDate | null

  loading = true

  usersStats: any[] = []
  filtredUsersStats: any[] = []
  exist: any

  maxDate = { year: new Date().getFullYear(), month: new Date().getUTCMonth() + 1, day: new Date().getDate() }
  filterTypeValue: any
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.getAllUsersData()
  }

  getAllUsersData() {
    this.loading = true;
    if (localStorage.getItem('usersStats')) {
      this.filtredUsersStats = JSON.parse(localStorage.getItem('usersStats') || '{}')
      this.usersStats = JSON.parse(localStorage.getItem('usersStats') || '{}')

      this.exist = true
      this.loading = false;
    } else {
      this.exist = false
      this.loading = false;
    }
  }

  goToMap(info: any) {
    let data = { id: info?.id, lat: info?.lat, lon: info?.lon }
    localStorage.setItem('userMapInfo', JSON.stringify(data))
    this.router.navigateByUrl('map');
  }

  applyFilter(event: Event, type: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (!filterValue) {
      //empty filter, show all countries:
      this.filtredUsersStats = this.usersStats;
    } else {
      if (type == 'username') {
        this.filtredUsersStats = this.usersStats.filter(
          obj => obj?.user?.username.toLowerCase().includes(filterValue.trim().toLowerCase())
        );
      }
    }
  }

  resetFilter() {
    this.filtredUsersStats = this.usersStats;
    this.filterTypeValue = null
    // this.fromDate = null
    // this.toDate = null
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

    // if (this.fromDate && this.toDate) {
    //   this.filtredUsersStats = this.usersStats.filter(
    //     obj => this.checkDate(obj?.visit?.dateOfVisit));
    // }
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

  goToDashboard() {
    this.router.navigateByUrl('dashboard');
  }

  back() {
    history.back()
  }
}
