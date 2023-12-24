import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { Firestore } from '@angular/fire/firestore';
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

  mapOptions: any;

  name: any;
  Date: any;
  constructor(private cdref: ChangeDetectorRef) {
    this.getAllUsersData()
    this.getAllPoints()

    this.name = localStorage.getItem('name') ?? ''
    this.Date = localStorage.getItem('Date') ?? ''
  }

  ngOnInit(): void { }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
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

    for (let index = 0; index < this.paths?.length; index++) {
      let popupContent: any = `<p>${this.paths[index]['info']?.userName}  </p><p> ${this.paths[index]['info']?.date} -   ${this.paths[index]['info']?.time}</p><p> ${this.paths[index]['info']?.note} </p>`;

      markers.push(marker(this.paths[index]['lating'], {
        icon: icon({
          iconUrl: this.paths[index]['info']?.type == "attend" ? '/assets/pin2.png' : '/assets/pin.png',
        }),
      }).bindPopup(popupContent, { closeButton: false, closeOnClick: false, autoPan: true, keepInView: true }).openPopup(),)
    }

    const group = L.featureGroup(markers);

    group.addTo(map);

    map.fitBounds(group.getBounds());

    let paths: any[] = []

    this.paths?.forEach((item: any) => {
      paths.push(item?.lating)
    })

    let polyline = L.polyline(paths, { color: '#101828' }).addTo(map);

    map.fitBounds(polyline.getBounds());
  }
}
