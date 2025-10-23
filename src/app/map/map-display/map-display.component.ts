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
        maxZoom: 19,
      }
    );
 
    // Add both to map
    this.map = L.map('map', {
      center: [this.selectedLat, this.selectedLon],
      zoom: 13,
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
}