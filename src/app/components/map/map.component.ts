import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { icon, latLng, marker, tileLayer } from 'leaflet';

import * as L from "leaflet";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  mapCenterPosition: any

  map!: google.maps.Map

  loading = true

  points: any[] = []

  exist: any

  user: any

  firestore: Firestore = inject(Firestore);

  systemPointsCollection: any
  systemPoints: any
  paths: any[] = []
  paths2: any[] = []

  mapOptions: any;

  name: any;
  Date: any;

  allVisits: any
  allCustomers: any
  constructor(private cdref: ChangeDetectorRef) {
    this.getAllUsersData()

    if (localStorage.getItem('allVisits')) {
      this.allVisits = JSON.parse(localStorage.getItem('allVisits') || "")
    } else {
      this.allVisits = []
    }

    this.name = localStorage.getItem('name') ?? '';
    this.Date = localStorage.getItem('Date') ?? '';

    this.getAllCustomers()
  }

  ngOnInit(): void {
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  getAllCustomers() {
    let customersCollerction: any
    const itemCollection = collection(this.firestore, 'customersV2');
    customersCollerction = collectionData(itemCollection);
    customersCollerction.subscribe((res: any) => {
      this.getLating(res)

    })
  }

  customerPoints: any[] = []
  getLating(customers: any) {

    this.allVisits = this.allVisits?.filter((item: any) => item?.userId == this.user?.id)

    let dateVisits: any = []
    this.allVisits?.forEach((element: any) => {
      if (this.checkDate(element?.completedDate)) {
        dateVisits.push(element)
      }
    });

    customers?.forEach((element: any) => {
      dateVisits?.forEach((el: any) => {
        if (element?.image == el?.image) {
          this.customerPoints?.push(element)
        }
      });
    });
    this.getAllPoints()
  }

  checkDate(date: any): any {
    if (this.Date) {
      let visitDate = date?.split('/')
      let selectedDate: any = this.Date?.split('-');
      const start = Date.parse(selectedDate[1] + '/' + selectedDate[2] + '/' + selectedDate[0]);
      const d = Date.parse(visitDate[1] + '/' + visitDate[0] + '/' + visitDate[2]);
      return d == start
    }
  }

  getAllUsersData() {
    if (localStorage.getItem('userMapInfo') && localStorage.getItem('userMapPoints')) {
      this.user = JSON.parse(localStorage.getItem('userMapInfo') || '{}')
      this.systemPoints = JSON.parse(localStorage.getItem('userMapPoints') || '{}')

      this.mapCenterPosition = {
        lat: this.user?.lat,
        lng: this.user?.lon
      }

      this.exist = true
    } else {
      this.exist = false
    }
  }

  markers: any
  bounds = null;

  getAllPoints() {
    this.loading = true

    this.systemPoints?.forEach((item: any) => {
      this.paths?.push({
        lating: [item?.lat, item?.lon],
        info: {
          userName: item?.userName,
          date: item?.date,
          time: item?.time,
          note: item?.note,
          type: item?.description
        }
      })
    })

    this.customerPoints?.forEach((item: any) => {
      this.paths2?.push({
        lating: [item?.lat, item?.lon],
        info: {
          userName: item?.name,
          date: item?.date,
          time: item?.time,
          note: item?.note,
          type: 'check point'
        }
      })
    })

    this.mapOptions = {
      layers: [
        tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { maxZoom: 30, attribution: '...' }),
        marker([this.mapCenterPosition?.lat, this.mapCenterPosition?.lng], {
          icon: icon({
            iconUrl: '/assets/location.png',
            className: 'main-marker'
          }),
        }),

      ],
      zoom: 12,
      center: latLng(this.mapCenterPosition?.lat, this.mapCenterPosition?.lng)
    };

    this.loading = false;
  }

  back() {
    history.back()
  }

  onMapReady2(map: L.Map) {
    let markers: any[] = []
    let markers2: any[] = []

    for (let index = 0; index < this.paths?.length; index++) {
      let popupContent: any = `<p>${this.paths[index]['info']?.userName}  </p><p> ${this.paths[index]['info']?.date} -   ${this.paths[index]['info']?.time}</p><p> ${this.paths[index]['info']?.note} </p>`;

      markers.push(marker(this.paths[index]['lating'], {
        icon: icon({
          iconUrl: this.paths[index]['info']?.type == "attend" ? '/assets/pin2.png' : '/assets/pin.png',
        }),
      }).bindPopup(popupContent, { closeButton: false, closeOnClick: false, autoPan: true, keepInView: true }).openPopup(),)
    }

    if (this.paths2?.length) {
      for (let index = 0; index < this.paths2?.length; index++) {
        let popupContent: any = `<p>${this.paths2[index]['info']?.userName}  </p><p> ${this.paths2[index]['info']?.date} -   ${this.paths2[index]['info']?.time}</p><p> ${this.paths2[index]['info']?.note} </p>`;

        markers2.push(marker(this.paths2[index]['lating'], {
          icon: icon({
            iconUrl: this.paths2[index]['info']?.type == "attend" ? '/assets/pin2.png' : '/assets/pin.png',
            className: 'path2'
          }),
        }).bindPopup(popupContent, { closeButton: false, closeOnClick: false, autoPan: true, keepInView: true }).openPopup(),)
      }

      const group2 = L.featureGroup(markers2);
      group2.addTo(map);
      map.fitBounds(group2.getBounds());
    }

    const group = L.featureGroup(markers);
    group.addTo(map);
    map.fitBounds(group.getBounds());

    let paths: any[] = []

    this.paths?.forEach((item: any) => {
      paths.push(item?.lating)
    })

    let paths2: any[] = []

    this.paths2?.forEach((item: any) => {
      paths2.push(item?.lating)
    })

    // console.log(this.paths);

    if (paths.length) {
      let polyline = L.polyline(paths, { color: '#101828' }).addTo(map);

      map.fitBounds(polyline.getBounds());
    }

    // console.log(this.paths2);
    if (paths2.length) {

      let polyline2 = L.polyline(paths2, { color: '#f00' }).addTo(map);

      map.fitBounds(polyline2.getBounds());
    }
  }
}
