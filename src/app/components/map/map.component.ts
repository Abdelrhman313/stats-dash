import { MapsAPILoader } from '@agm/core';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { Firestore, collectionData, collection, Timestamp, FirestoreModule, FirestoreError } from '@angular/fire/firestore';
import { icon, latLng, marker, polygon, tileLayer } from 'leaflet';

import * as L from "leaflet";

declare const google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  mapCenterPosition: any

  map!: google.maps.Map

  private geoCoder: any;

  loading = true

  points: any[] = []

  exist: any

  user: any

  firestore: Firestore = inject(Firestore);

  systemPointsCollection: any
  systemPoints: any
  paths: any[] = []

  mapOptions: any;
  constructor(private cdref: ChangeDetectorRef) {
    this.getAllUsersData()
    this.getAllPoints()
  }

  ngOnInit(): void {

  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  getAllUsersData() {
    if (localStorage.getItem('userMapInfo')) {
      this.user = JSON.parse(localStorage.getItem('userMapInfo') || '{}')

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
    const itemCollection = collection(this.firestore, 'locationV2');
    this.systemPointsCollection = collectionData(itemCollection);
    this.systemPointsCollection.subscribe({
      next: (res: any) => {
        this.systemPoints =
          res?.filter(((obj: any) => obj?.userId == this.user?.id));

        this.markers = this.systemPoints?.map((item: any) => {
          return {
            position: new google.maps.LatLng(item?.lat, item?.lon),
            map: this.map,
            title: item?.description
          }
        })

        this.systemPoints?.forEach((item: any) => {
          this.paths?.push([item?.lat, item?.lon])
        })

        this.mapOptions = {
          layers: [
            tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
            marker([this.mapCenterPosition?.lat, this.mapCenterPosition?.lng], {
              icon: icon({
                iconUrl: '/assets/location.png',
                className:'main-marker'
              }),
            }),

          ],
          zoom: 12,
          center: latLng(this.mapCenterPosition?.lat, this.mapCenterPosition?.lng)
        };

        this.loading = false;
      },
      error: (err: any) => {

        this.loading = false;
      }
    })
  }

  back() {
    history.back()
  }


  onMapReady2(map: L.Map) {
    let markers: any[] = []

    for (let index = 0; index < this.paths?.length; index++) {
      markers.push(marker(this.paths[index], {
        icon: icon({
          iconUrl: '/assets/pin.png',
        }),
      }))
    }

    const group = L.featureGroup(markers);

    group.addTo(map);

    map.fitBounds(group.getBounds());

    let polyline = L.polyline(this.paths, { color: '#101828' }).addTo(map);

    map.fitBounds(polyline.getBounds());
  }
}
