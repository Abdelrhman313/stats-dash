import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { Firestore, collectionData, collection, Timestamp, FirestoreModule, FirestoreError } from '@angular/fire/firestore';

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

  loading = true

  group: any
  group2: any
  exist: any

  firestore: Firestore = inject(Firestore);

  systemGroupsCollection: any
  systemGroups: any

  users: any

  completedVisitsCollection: any
  completedVisits: Info[] = [];

  reduceVisitsAndGroupUsers: any

  usersStats: any

  active: any = 1
  constructor(private apiService: ApiService, private router: Router) {
    // this.apiService.selectedGroup.subscribe((res) => {
    //   if (res) {
    //     this.group = res
    //   } else {
    //     this.router.navigateByUrl('groups');
    //   }
    // })

    if (localStorage.getItem('group')) {
      this.group = localStorage.getItem('group');
      this.group2 = localStorage.getItem('group');
    } else {
      this.router.navigateByUrl('groups');
    }

    this.getDashboardGroups()


  }

  ngOnInit(): void {
    this.getAllCompletedVisits()
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
  }

  checkGroupExist(groups: any) {
    let find = groups?.findIndex((group: any) => group?.display_name?.toLowerCase() == this.group?.toLowerCase())
    if (find >= 0) { this.exist = true; this.group = groups[find]?.name; } else { this.exist = false }
  }

  getAllCompletedVisits() {

    const itemCollection = collection(this.firestore, 'completed visits');
    this.completedVisitsCollection = collectionData(itemCollection);
    this.completedVisitsCollection.subscribe((res: any) => {
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
        default:
          this.completedVisits = res;
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

    this.usersStats = users?.reverse()?.slice(0, 10);

    localStorage.setItem('usersStats', JSON.stringify(this.usersStats))

    this.loading = false
  }



  goToGroups() {
    this.router.navigateByUrl('groups');
  }

  filter(value: any) {
    switch (value) {
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

  goToVisitDetails() {

    localStorage.setItem('group', this.group2)

    this.router.navigateByUrl('visit-details');
  }

  back() {
    history.back()
    localStorage.removeItem('group')
  }
}
