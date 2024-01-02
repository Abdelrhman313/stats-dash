import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDateParserFormatter, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
const moment = require('moment');

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

  usersLocations: any[] = []
  filtredUsersLocations: any[] = []
  exist: any

  maxDate = { year: new Date().getFullYear(), month: new Date().getUTCMonth() + 1, day: new Date().getDate() }
  filterTypeValue: any

  allUsers: any

  systemUsersCollection: any
  systemLocationsCollection: any

  firestore: Firestore = inject(Firestore);

  group: any

  allVisits: any
  allCustomers: any
  constructor(private router: Router) {
    localStorage.removeItem('userMapInfo')
    localStorage.removeItem('userMapPoints')

    localStorage.getItem('group') == "ISIS" ? this.group = "Ausis" : this.group = localStorage.getItem('group');


    if (localStorage.getItem('allVisits')) {
      this.allVisits = JSON.parse(localStorage.getItem('allVisits') || "")
    } else {
      this.allVisits = []
    }
    this.getAllSystemUsers()
    this.getAllSystemLocations()
  }

  ngOnInit(): void {
  }

  getAllCustomers(filterdLoacation: any) {
    let customersCollerction: any
    const itemCollection = collection(this.firestore, 'customersV2');
    customersCollerction = collectionData(itemCollection);
    customersCollerction.subscribe((res: any) => {
      this.getLating(res, filterdLoacation)
    })
  }

  customerPoints: any[] = []
  getLating(customers: any, locations: any) {

    this.allVisits = this.allVisits?.filter((item: any) => item?.userId == this.SalesPersonValue)

    let dateVisits: any = []
    this.allVisits?.forEach((element: any) => {
      if (this.checkDate(element?.completedDate)) {
        dateVisits.push(element)
      }
    });

    customers?.forEach((element: any) => {
      dateVisits?.forEach((el: any) => {
        if (element?.image == el?.image) {
          this.customerPoints?.push({ ...element, pinType: 'customer' })
        }
      });
    });

    if (this.filtredUsersLocations.length) {
      this.filtredUsersLocations = this.filtredUsersLocations.map((item) => {
        return {
          ...item,
          pinType: 'location'
        }
      })
    }

    this.filtredUsersLocations = [...this.filtredUsersLocations, ...this.customerPoints]

    this.groupedData = this.filtredUsersLocations.reduce((group: { [key: string]: any[] }, item) => {
      if (!group[item.date]) {
        group[item.date] = [];
      }
      group[item.date].push(item);
      return group;
    }, {});

    let data: any[] = []
    Object.keys(this.groupedData).forEach(ele => {
      if (ele?.split('/').length > 1) {
        data?.push({ Date: ele?.split('/')[2] + '-' + ele?.split('/')[1] + '-' + ele?.split('/')[0], count: this.groupedData[ele]?.length, points: this.groupedData[ele], user: this.getUserName(this.SalesPersonValue) });
      } else {
        let date: any = moment(new Date(ele)).format("DD/MM/YYYY")
        data?.push({ Date: date?.split('/')[2] + '-' + date?.split('/')[1] + '-' + date?.split('/')[0], count: this.groupedData[ele]?.length, points: this.groupedData[ele], user: this.getUserName(this.SalesPersonValue) });

      }
    })

    data.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    this.filtredUsersLocations = data;

    this.filterDone = true

    this.startFilter = false

  }

  getAllSystemUsers() {
    const itemCollection = collection(this.firestore, 'usersV2');
    this.systemUsersCollection = collectionData(itemCollection);
    this.systemUsersCollection.subscribe({
      next: (res: any) => {
        this.allUsers = res?.filter((item: any) => item?.group?.toLowerCase() == this.group?.toLowerCase())
      },
      error: (err: any) => {
      }
    })
  }

  locations: any
  getAllSystemLocations() {
    const itemCollection = collection(this.firestore, 'locationV2');
    this.systemLocationsCollection = collectionData(itemCollection);
    this.systemLocationsCollection.subscribe({
      next: (res: any) => {
        this.locations = res
        this.getAllUsersData()

      },
      error: (err: any) => {
      }
    })
  }

  getAllUsersData() {
    this.loading = true;
    if (this.locations?.length) {
      this.filtredUsersLocations = []
      this.usersLocations = this.locations;
      this.exist = true
      this.loading = false;
    } else {
      this.exist = false
      this.loading = false;
    }
  }

  goToMap(userId: any, points: any, name: any, Date: any) {
    let user = this.getUserName(userId);
    let data = { id: user?.id, lat: user?.lat, lon: user?.lon }
    localStorage.setItem('userMapInfo', JSON.stringify(data))
    localStorage.setItem('userMapPoints', JSON.stringify(points))
    localStorage.setItem('name', name)
    localStorage.setItem('Date', Date)
    this.router.navigateByUrl('map');
  }

  filterDone: any = false

  startFilter: any = false

  SalesPersonValue: any

  groupedData: any


  applyFilter() {
    this.startFilter = true
    this.customerPoints = []
    // if (this.SalesPersonValue && (!this.toDate && !this.fromDate)) {
    //   console.log(this.SalesPersonValue);

    //   this.filtredUsersLocations = this.usersLocations.filter(
    //     obj => obj?.userId == this.SalesPersonValue
    //   );
    // }

    // if (this.toDate && this.fromDate && !this.SalesPersonValue) {
    //   this.filtredUsersLocations = this.usersLocations.filter(
    //     obj => this.checkDate(obj?.date)
    //   );
    // }

    if (this.SalesPersonValue && (this.toDate && this.fromDate)) {
      this.filtredUsersLocations = this.usersLocations.filter(
        obj => obj?.userId == this.SalesPersonValue
      );

      this.filtredUsersLocations = this.usersLocations.filter(
        obj => this.checkDate(obj?.date)
      );

      this.getAllCustomers(this.filtredUsersLocations)


      // this.filtredUsersLocations?.push(...this.customerPoints)



      // console.log(this.filtredUsersLocations);

    }

  }

  getUserName(id: any) {

    return this.allUsers?.find((user: any) => user?.id == id)
  }

  resetFilter() {
    this.filtredUsersLocations = [];
    this.filterTypeValue = null
    this.fromDate = null
    this.toDate = null
    this.SalesPersonValue = null
    this.filterDone = false

  }

  equals = (one: NgbDateStruct, two: NgbDateStruct) =>
    one && two && two.year === one.year && two.month === one.month && two.day === one.day;

  onDateSelection(date: NgbDate) {


    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && this.equals(date, this.fromDate)) {
      this.toDate = this.fromDate;
    }
    else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
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

  goToDashboard() {
    this.router.navigateByUrl('dashboard');
  }

  back() {
    history.back()
  }
}
