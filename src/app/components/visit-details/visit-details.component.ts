import { Component, OnInit, TemplateRef, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDateParserFormatter, NgbDate, ModalDismissReasons, NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/services/api.service';

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

  allUsers: any

  systemUsersCollection: any

  firestore: Firestore = inject(Firestore);

  group: any
  constructor(private router: Router, private apiService: ApiService, private modalService: NgbModal) {
    localStorage.getItem('group') == "ISIS" ? this.group = "Ausis" : this.group = localStorage.getItem('group');

    localStorage.removeItem('visits')

    this.getAllSystemUsers()
  }

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
            info: {
              id: element?.user?.id,
              lat: element?.user?.lat,
              lon: element?.user?.lon,
            },
            visit: visit,
          }
        });

        this.visits?.push(...data);
      });

      this.visits?.sort((a, b) => (a.visit?.completedTime?.seconds + (a.visit?.completedTime?.nanoseconds / 1000000000)) - (b.visit?.completedTime?.seconds + (b.visit?.completedTime?.nanoseconds / 1000000000)));

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

  goToDashboard() {
    this.router.navigateByUrl('dashboard');
  }

  applyFilter(event: any, type: any, select?: any) {
    let filterValue = ''
    if (select) {
      filterValue = event;
    } else {
      filterValue = (event?.target as HTMLInputElement)?.value;
    }

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
    this.filterTypeValue = 0
    this.filteredVisits = this.visits;
    this.fromDate = null
    this.toDate = null
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
      this.filteredVisits = this.visits.filter(
        obj => this.checkDate(obj?.visit?.completedDate));
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

  back() {
    history.back()
    localStorage.removeItem('visits')
  }

  exportElmToExcel(): void {
    const edata = [];
    const udt = {
      data: [
        { A: "Visits Details" }, // title
        {
          A: "Image",
          B: "Sales Person",
          C: "Customer Name",
          D: "Date Of Visit",
          E: "Time",
          F: "Address",
          G: "Governorate",
          H: "Phone",
          I: "Is Mocking",
          J: "Date Of Next Visit",
          K: "Sub Group",
          L: "Classification",
          M: "Distribution",
          N: "Specialty",
          O: "Type",
          P: "Line",
          Q: "Note",
        },
      ],
      skipHeader: true,
    };
    this.filteredVisits.forEach((data, i) => {
      udt.data.push({
        A: data?.visit?.image ? data?.visit?.image : '----',
        B: data?.username ? data?.username : '----',
        C: data?.visit?.searchName ? data?.visit?.searchName : '----',
        D: data?.visit?.dateOfVisit ? data?.visit?.dateOfVisit : '----',
        E: data?.visit?.time ? data?.visit?.time : '----',
        F: data?.visit?.address ? data?.visit?.address : '----',
        G: data?.visit?.governorate ? data?.visit?.governorate : '----',
        H: data?.visit?.phone ? data?.visit?.phone : '----',
        I: data?.visit?.isMocking ? data?.visit?.isMocking : '----',
        J: data?.visit?.dateOfNextVisit ? data?.visit?.dateOfNextVisit : '----',
        K: data?.subgroup ? data?.subgroup : '----',
        L: data?.visit?.classy ? data?.visit?.classy : '----',
        M: data?.visit?.dist ? data?.visit?.dist : '----',
        N: data?.visit?.specialty ? data?.visit?.specialty : '----',
        O: data?.visit?.type ? data?.visit?.type : '----',
        P: data?.visit?.line ? data?.visit?.line : '----',
        Q: data?.visit?.note ? data?.visit?.note : '----',
      });
    });
    edata.push(udt);

    const DateObj = new Date();
    const dateNow =
      DateObj.getFullYear() +
      "-" +
      ("0" + (DateObj.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + DateObj.getDate()).slice(-2);
    this.apiService.exportJsonToExcel(edata, "visits_details_" + dateNow);
  }

  closeResult = '';
  selectedItem: any
  open(content: TemplateRef<any>, item: any) {
    this.selectedItem = item
    this.modalService.open(content, { size: 'xl', centered: true }).result.then(
      (result: any) => {
        this.closeResult = `Closed with: ${result}`;
        this.selectedItem = ''
      },
      (reason: any) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        this.selectedItem = ''
      },
    );
  }

  private getDismissReason(reason: any): string {
    this.selectedItem = ''
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }

  }
}
