import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collectionData, collection, Timestamp, doc, getDocs, query, where, getDocsFromServer } from '@angular/fire/firestore';
import { NgbCalendar, NgbDateParserFormatter, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

const moment = require('moment');


interface Info {
  address: string;
  classy: string;
  completedDate: string;
  completedTime: Timestamp;
  dateOfNextVisit: string;
  dateOfVisit: string;
  dist: string;
  governorate: string;
  image: string;
  isMocking: string;
  line: boolean;
  name: string;
  note: string;
  phone: string;
  planed: boolean;
  searchName: string;
  specialty: string;
  status: boolean;
  time: string;
  type: string;
  userId: string;
  visitId: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);

  hoveredDate: NgbDate | null = null;
  fromDate!: NgbDate | null
  toDate!: NgbDate | null
  loading = true


  maxDate = { year: new Date().getFullYear(), month: new Date().getUTCMonth() + 1, day: new Date().getDate() }
  group: any
  group2: any
  exist: any
  customDate: any = false
  firestore: Firestore = inject(Firestore);

  systemGroupsCollection: any
  systemGroups: any

  users: any

  completedVisitsCollection: any
  completedVisits: Info[] = [];

  reduceVisitsAndGroupUsers: any

  usersStats: any

  active: any = 1

  width: any
  constructor(private router: Router) {
    if (localStorage.getItem('group')) {
      this.group = localStorage.getItem('group');
      this.group2 = localStorage.getItem('group');
    } else {
      this.router.navigateByUrl('groups');
    }

    this.getDashboardGroups()

    if (window.innerWidth > 575 && window.innerWidth < 768) {
      this.width = 240
    } else if (window.innerWidth > 768 && window.innerWidth < 992) {
      this.width = 540
    } else if (window.innerWidth < 575) {
      this.width = window.innerWidth - 75
    } else {
      this.width = 700
    }
    window.onresize = () => {
      if (window.innerWidth > 575 && window.innerWidth < 768) {
        this.width = 240
      } else if (window.innerWidth > 768 && window.innerWidth < 992) {
        this.width = 540
      } else if (window.innerWidth < 575) {
        this.width = window.innerWidth - 75
      } else {
        this.width = 700
      }
    };
  }



  ngOnInit(): void {
    this.getAllCompletedVisits()
    // this.getData()
  }

  getDashboardGroups() {
    this.loading = true

    const itemCollection = collection(this.firestore, 'Groups_for_admin_panel');
    this.systemGroupsCollection = collectionData(itemCollection);
    this.systemGroupsCollection.subscribe({
      next: (res: any) => {
        this.systemGroups = res;
        this.checkGroupExist(this.systemGroups);
      },
      error: (err: any) => {
        this.getDashboardGroups()
      }
    })

    // pipe(
    //   catchError(err => {
    //     console.log('Handling error locally and rethrowing it...', err);
    //     return throwError(err);
    //   })
    // ).subscribe({
    //   next: (res: any) => {
    //     this.systemGroups = res;
    //     this.checkGroupExist(this.systemGroups);
    //   },
    //   error: (err: any) => {
    //     this.getDashboardGroups()
    //   }
    // })

  }

  checkGroupExist(groups: any) {
    let find = groups?.findIndex((group: any) => group?.display_name?.toLowerCase() == this.group?.toLowerCase())
    if (find >= 0) { this.exist = true; this.group = groups[find]?.name; } else { this.exist = false }
  }

  customSearch = false
  getAllCompletedVisits() {

    const itemCollection = collection(this.firestore, 'completed visits');
    this.completedVisitsCollection = collectionData(itemCollection);
    this.completedVisitsCollection.subscribe((res: any) => {
      localStorage.setItem('allVisits', JSON.stringify(res))
      switch (this.active) {
        case 1:
          this.completedVisits = res?.filter((visit: any) => this.isInToDay(visit?.completedDate));
          break;
        case 2:
          this.completedVisits = res?.filter((visit: any) => this.isInLastWeek(visit?.completedDate));
          break;
        case 3:
          this.completedVisits = res?.filter((visit: any) => this.isInLastMonths(visit?.completedDate));
          break;
        case 4:
          this.completedVisits = res?.filter((visit: any) => this.isInLast3Months(visit?.completedDate));
          break;
        case 5:
          this.completedVisits = res?.filter((visit: any) => this.isYesterDay(visit?.completedDate));
          break;
        case 6:
          this.customSearch = true
          this.completedVisits = res?.filter((visit: any) => this.checkDate(visit?.completedDate));
          break;
        default:
          this.completedVisits = [];
          break;
      }


      this.reduceVisitsAndGroupUsers = this.completedVisits.reduce((group: { [key: string]: Info[] }, item) => {
        if (!group[item.userId]) {
          group[item.userId] = [];
        }
        group[item.userId].push(item);
        return group;
      }, {});

      this.getAllUsers(this.reduceVisitsAndGroupUsers)
    })

  }

  allSystemUsers: any

  getAllUsers(data: any) {
    let usersCollerction: any
    const itemCollection = collection(this.firestore, 'usersV2');
    usersCollerction = collectionData(itemCollection);
    usersCollerction.subscribe((res: any) => {
      this.allSystemUsers = res;

      this.setAllUsers(res, data);
    })
  }

  setAllUsers(currentUsers: any, groupingData: any) {


    let users: any = []

    Object.keys(groupingData).forEach(ele => {
      let item = currentUsers?.find((user: any) => user?.id == ele && user?.group?.toLowerCase() == this.group?.toLowerCase());
      if (item) {
        users?.push({ user: item, count: groupingData[ele]?.length, visits: groupingData[ele] });
      }
    })

    users?.sort((a: any, b: any) => a.count - b.count);

    this.usersStats = users;

    localStorage.setItem('usersStats', JSON.stringify(this.usersStats))

    this.usersStats = users?.reverse()?.slice(0, 10);

    this.loading = false
  }



  goToGroups() {
    this.router.navigateByUrl('groups');
  }

  filter(value: any) {
    switch (value) {
      case 'yesterday':
        this.active = 5;
        break;
      case 'Today':
        this.active = 1;
        break;
      case 'Week':
        this.active = 2;
        break;
      case 'Month':
        this.active = 3;
        break;
      case 'Three Months':
        this.active = 4;
        break;
      case 'custom date':
        this.active = 6
        break;
      default:
        this.active = 1;
        break;
    }

    this.getAllCompletedVisits()

  }

  isInLast3Months(dateToCheck: any) {
    let SD = moment(dateToCheck, "DD/MM/YYYY"),
      val2 = moment().format('DD/MM/YYYY').toString(),
      TD = moment(val2, "DD/MM/YYYY");
    let result2 = TD.diff(SD, 'days')



    return result2 >= 0 && result2 < 90
  }

  isInLastMonths(dateToCheck: any) {
    let SD = moment(dateToCheck, "DD/MM/YYYY"),
      val2 = moment().format('DD/MM/YYYY').toString(),
      TD = moment(val2, "DD/MM/YYYY");
    let result2 = TD.diff(SD, 'days')



    return result2 >= 0 && result2 < 30
  }

  isInLastWeek(dateToCheck: any) {
    let SD = moment(dateToCheck, "DD/MM/YYYY"),
      val2 = moment().format('DD/MM/YYYY').toString(),
      TD = moment(val2, "DD/MM/YYYY");
    let result2 = TD.diff(SD, 'days')


    return result2 >= 0 && result2 < 7
  }

  isInToDay(dateToCheck: any) {
    let SD = moment(dateToCheck, "DD/MM/YYYY"),
      val2 = moment().format('DD/MM/YYYY').toString(),
      TD = moment(val2, "DD/MM/YYYY");
    let result2 = TD.diff(SD, 'days')


    return result2 == 0
  }

  isYesterDay(dateToCheck: any) {
    let SD = moment(dateToCheck, "DD/MM/YYYY"),
      val2 = moment().format('DD/MM/YYYY').toString(),
      TD = moment(val2, "DD/MM/YYYY");
    let result2 = TD.diff(SD, 'days')


    return result2 == 1
  }

  goToVisitDetails() {

    localStorage.setItem('group', this.group2)

    this.router.navigateByUrl('visit-details');
  }

  back() {
    history.back()
    localStorage.removeItem('group')
  }
  equals = (one: NgbDateStruct, two: NgbDateStruct) =>
    one && two && two.year === one.year && two.month === one.month && two.day === one.day;

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && this.equals(date, this.fromDate)) {
      this.toDate = this.fromDate;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    if (this.fromDate && this.toDate) {
      this.filter('custom date')
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

  resetDate() {
    this.customDate = false;
    this.toDate = null
    this.fromDate = null
  }

  querySnapshot: any
  // async getData() {
  //   let username = false
  //   console.log("Getting data!");
  //   this.querySnapshot = (await getDocs(query(collection(this.firestore, 'usersV2'), where('isOnline', '==', username)))).docs.forEach
  //     ((document: any) => {
  //       console.log(document?.data());
  //     });
  // }
}
