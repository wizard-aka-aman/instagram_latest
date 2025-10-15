import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { ServiceService } from 'src/app/service.service';
@Component({
  selector: 'app-map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.scss']
})
export class MapDisplayComponent implements OnInit {
  map: any;
  imageUrl = 'assets/pointer.png';
  selectedLat: number = 0;
  selectedLon: number = 0;
  marker: any;
  loggedInUser: string = ""
  constructor(private serviceSrv: ServiceService, private router: Router) {
    this.loggedInUser = this.serviceSrv.getUserName()
  }

  ngOnInit() { }

  // ✅ Change: map load kar after view init
  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.selectedLat = pos.coords.latitude;
        this.selectedLon = pos.coords.longitude;

        this.createMap(this.selectedLat, this.selectedLon);
      },
      (err) => {
        console.warn('Geolocation failed, using default location');
        this.selectedLat = 28.6139;
        this.selectedLon = 77.2090;

        this.createMap(this.selectedLat, this.selectedLon);
      }
    );
  }

  createMap(lat: number, lon: number) {
    // Map create karo
    // Satellite layer (base)
    const satellite = L.tileLayer(
      `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
      {
        maxZoom: 17,
      }
    );
 
    // Add both to map
    this.map = L.map('map', {
      center: [this.selectedLat, this.selectedLon],
      zoom: 17,
      layers: [satellite]
    });

    // Current location marker
    this.marker = L.marker([lat, lon], { draggable: false }).addTo(this.map);
    this.marker.on('dragend', (e: any) => {
      const latLng = e.target.getLatLng();
      this.selectedLat = latLng.lat;
      this.selectedLon = latLng.lng;
    });

    // 🧩 Fix: wait a bit then adjust map size
    setTimeout(() => {
      this.map.invalidateSize();
      this.loadStoriesOnMap();
    }, 500);
  }

  loadStoriesOnMap() {
    this.serviceSrv.getMapStoriesCached(this.loggedInUser).subscribe((stories: any) => {
      console.log('Stories (cached/API):', stories);

      stories.forEach((story: any) => {
        const userIcon = L.divIcon({
          html: `<div style="color: black; text-align: center;">
                 <img src="${this.getProfileImage(story.imageUrl)}"
                      style="width: 50px; height: 50px; border-radius: 50%; object-fit: contain;" />
                 <span>${story.username}</span>
               </div>`,
          className: '',
          iconSize: [80, 50],
          iconAnchor: [40, 25]
        });

        const marker = L.marker([story.latitude, story.longitude], { icon: userIcon }).addTo(this.map);

        marker.on('click', () => {
          this.router.navigate(['/stories', story.username]);
        });
      });
    });
  }
  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return 'data:image/jpeg;base64,' + image;
  }
}