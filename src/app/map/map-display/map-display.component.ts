import { Location } from '@angular/common';
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
  // State variables
  userLat: number = 0; // The actual GPS location
  userLon: number = 0;
  currentViewLat: number = 0; // Where the map is currently looking
  currentViewLon: number = 0;
  
  showSearchBtn: boolean = false;
  currentLayer: string = 'street'; // 'street' | 'satellite' | 'dark'
  
  // Layer objects
  tileLayers: any = {};
  constructor(private serviceSrv: ServiceService, private router: Router , private Location: Location) {
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
  loadStoriesOnMap() {
   this.serviceSrv.getMapStoriesCached(this.loggedInUser).subscribe((stories: any) => {
  stories.forEach((story: any) => {
    const isSeen = story.isSeen === true;

    const iconHtml = `
      <div class="story-marker ${isSeen ? '' : 'pulse'}">
        <div class="story-image-wrapper">
          <img src="${this.getProfileImage(story.imageUrl)}"
               class="story-image ${isSeen ? 'seen' : 'unseen'}" />
        </div>
        <span class="story-username">${story.username}</span>
      </div>
    `;

    const userIcon = L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: [80, 80],
      iconAnchor: [40, 40]
    });

    const marker = L.marker([story.latitude, story.longitude], { icon: userIcon }).addTo(this.map);

    marker.on('click', () => {
      this.router.navigate(['/stories', story.username]);
    });
  });
});


    this.serviceSrv.getMapmapPostsCached(this.selectedLat, this.selectedLon, 8, this.loggedInUser)
  .subscribe((posts: any) => {
    posts.forEach((post: any) => {

      // 🟦 Custom icon for POSTS (distinct from stories)
      const userIcon = L.divIcon({
        html: `
          <div style="text-align:center;">
            <div style="
              position: relative;
              display: inline-block;
            ">
              <img 
                src="${this.getProfileImage(post.profilePicture)}"
                style="width: 45px; height: 45px; border-radius: 10px; 
                       object-fit: cover; border: 2px solid #007bff; 
                       box-shadow: 0 0 5px rgba(0,0,0,0.3);"
              />
              <div style="
                position: absolute;
                bottom: -5px;
                right: -5px;
                background: #007bff;
                border-radius: 50%;
                padding: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <i class="fa fa-image" style="color: white; font-size: 10px;"></i>
              </div>
            </div>
            <br>
            <span style="color:black; font-size:12px; font-weight:500;">
              ${post.userName}
            </span>
          </div>
        `,
        className: '',
        iconSize: [60, 60],
        iconAnchor: [30, 30]
      });

      const marker = L.marker([post.latitude, post.longitude], { icon: userIcon })
        .addTo(this.map)
        .bindPopup(`
          <div style="text-align:center">
            <small>${post.userName}</small><br>
            <img 
              src="${this.getProfileImage(post.profilePicture)}"  
              style="border-radius:10px; width: 50px; height: 50px; object-fit: contain; border: 2px solid #007bff;"
            ><br>
            <img 
              id="postImg-${post.id}" 
              src="${(post.imageUrl != 'multiple') ? this.getProfileImage(post.imageUrl) : this.getProfileImage(post.mediaUrl[0])}" 
              width="100" 
              height="100" 
              style="border-radius:8px; cursor:pointer;"
            ><br>
            <strong>${post.caption}</strong><br>
          </div>
        `);

      marker.on('popupopen', () => {
        const img = document.getElementById(`postImg-${post.id}`);
        if (img) {
          img.addEventListener('click', () => {
            this.router.navigate([`/${post.userName}/p/${post.postId}`]);
          });
        }
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
  close(){
    this.Location.back();
  }
  createMap(lat: number, lon: number) {
    this.tileLayers = {
      street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
      dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 })
    };

    this.map = L.map('map', {
      center: [lat, lon],
      zoom: 13,
      layers: [this.tileLayers['street']],
      zoomControl: false 
    });

    const myIcon = L.divIcon({
      html: `<div style="background-color:#007bff; width:15px; height:15px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px #007bff;"></div>`,
      className: ''
    });
    this.marker = L.marker([lat, lon], { icon: myIcon }).addTo(this.map);

    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      const dist = this.getDistance(center.lat, center.lng, this.currentViewLat, this.currentViewLon);
      if (dist > 0.5) { 
        this.showSearchBtn = true;
      }
    });

    this.currentViewLat = lat;
    this.currentViewLon = lon;
    this.loadStoriesOnMap(); 
  }
  changeLayer(layerName: string) {
    this.currentLayer = layerName; 
    Object.values(this.tileLayers).forEach((layer: any) => this.map.removeLayer(layer));
    this.map.addLayer(this.tileLayers[layerName]);
  }
  centerMap() {
    this.map.flyTo([this.selectedLat, this.selectedLon],15);
    this.currentViewLat = this.selectedLat;
    this.currentViewLon = this.selectedLon;
    this.showSearchBtn = false;
  }
  getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if ((lat1 == lat2) && (lon1 == lon2)) return 0;
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;
    const theta = lon1 - lon2;
    const radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) dist = 1;
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist * 1.609344; // Kilometers
  }
}