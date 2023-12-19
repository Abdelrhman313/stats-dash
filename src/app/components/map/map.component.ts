import { MapsAPILoader } from '@agm/core';
import { Component, OnInit, inject } from '@angular/core';

import { Firestore, collectionData, collection, Timestamp, FirestoreModule, FirestoreError } from '@angular/fire/firestore';

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
  paths: any
  constructor(private mapsAPILoader: MapsAPILoader) {
    this.getAllUsersData()
    this.getAllPoints()
  }

  ngOnInit(): void {

  }

  getAllUsersData() {
    if (localStorage.getItem('userMapInfo')) {
      this.user = JSON.parse(localStorage.getItem('userMapInfo') || '{}')

      this.mapCenterPosition = {
        lat: this.user?.lat,
        lng: this.user?.lon
      }

      this.onMapReady(this.map);
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

        this.paths = this.systemPoints?.map((item: any) => {
          return {
            lat: item?.lat,
            lng: item?.lon
          }
        })

        this.loading = false;
      },
      error: (err: any) => {

        this.loading = false;
      }
    })
  }

  onMapReady(map: google.maps.Map) {
    this.map = map
    this.drawPolygon()
    this.loadAllMarkers()
  }

  drawPolygon() {

    if (this.paths?.length) {
      const polygon = new google.maps.Polygon({
        paths: this.paths,
        editable: true,
        draggable: true,
      })

      polygon.setMap(this.map)
    }
  }

  loadAllMarkers(): void {
    this.mapsAPILoader.load().then(() => {

      this.markers?.forEach((markerInfo: any) => {
        //Creating a new marker object
        const marker = new google.maps.Marker({
          ...markerInfo
        });

        //creating a new info window with markers info
        const infoWindow = new google.maps.InfoWindow({
          content: marker.getTitle()
        });

        //Add click event to open info window on marker
        marker.addListener("click", () => {
          infoWindow.open(marker.getMap(), marker);
        });

        //Adding marker to google map
        marker.setMap(this.map);
      });
    });
  }

  back() {
    history.back()
  }
}
