import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.heat';
import { ServiceService } from 'src/app/service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.scss']
})
export class MapDisplayComponent implements OnInit, OnDestroy {
  map: any;
  imageUrl = 'assets/pointer.png';
  selectedLat: number = 0;
  selectedLon: number = 0;
  myLocationLat: number = 0;
  myLocationLon: number = 0;
  marker: any;
  loggedInUser: string = "";
  
  // State variables
  userLat: number = 0;
  userLon: number = 0;
  currentViewLat: number = 0;
  currentViewLon: number = 0;
  
  showSearchBtn: boolean = false;
  currentLayer: string = 'street';
  
  // Layer objects
  tileLayers: any = {};
  
  // Features
  markerClusterGroup: any;
  heatLayer: any;
  showHeatmap: boolean = false;
  routePolyline: any;
  
  // Filter states
  searchRadius: number = 10;
  selectedCategory: string = 'all';
  categories = ['all', 'food', 'travel', 'friends', 'events'];
  
  // Live tracking
  liveTrackingEnabled: boolean = false;
  liveMarkers: Map<string, any> = new Map();
  private destroy$ = new Subject<void>();
  private watchId: any;
  
  // UI States
  showFilters: boolean = false;
  showDirections: boolean = false;
  selectedPost: any = null;
  showMapControls: boolean = false;
  postDistance: string = "";
  postDuration: number = 0;

  constructor(
    private serviceSrv: ServiceService, 
    private router: Router, 
    private location: Location
  ) {
    this.loggedInUser = this.serviceSrv.getUserName();
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  toggleMapControls() {
    this.showMapControls = !this.showMapControls;
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
        this.myLocationLat = pos.coords.latitude;
        this.myLocationLon = pos.coords.longitude;
        
        this.userLat = this.selectedLat;
        this.userLon = this.selectedLon;
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

    // Initialize Marker Cluster Group with iOS-style clusters
    this.markerClusterGroup = (L as any).markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 80,
      iconCreateFunction: (cluster: any) => {
        return this.createClusterIcon(cluster);
      }
    });

    // Create iOS-style user location marker
    const myIcon = L.divIcon({
      html: this.createUserLocationIcon(),
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
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

  // ✨ NEW: Create iOS-style cluster icon
  createClusterIcon(cluster: any): any {
    const count = cluster.getChildCount();
    let size = 44;
    let fontSize = 14;
    let bgColor = '#34c759';
    let textColor = 'white';
    
    if (count <= 10) {
      size = 44;
      fontSize = 14;
      bgColor = '#34c759';
    } else if (count <= 50) {
      size = 52;
      fontSize = 16;
      bgColor = '#ff9500';
    } else {
      size = 60;
      fontSize = 18;
      bgColor = '#ff3b30';
    }

    return L.divIcon({
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${bgColor};
          color: ${textColor};
          font-size: ${fontSize}px;
          font-weight: 700;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.9);
          animation: pulse 2s infinite;
        ">
          ${count}
        </div>
      `,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  // ✨ NEW: Create iOS-style user location icon
  createUserLocationIcon(): string {
    return `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
      ">
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          background: rgba(0, 122, 255, 0.2);
          border-radius: 50%;
          animation: locationPulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          width: 16px;
          height: 16px;
          top: 4px;
          left: 4px;
          background: #007aff;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 
            0 2px 8px rgba(0, 122, 255, 0.4),
            0 0 0 1px rgba(0, 0, 0, 0.1);
        "></div>
      </div>
    `;
  }

  // ✨ NEW: Create iOS-style story marker
  createStoryMarker(story: any): any {
    const isSeen = story.isSeen === true;
    const iconHtml = `
      <div class="story-marker ${isSeen ? '' : 'pulse'}" style="cursor: pointer;">
        <div class="story-image-wrapper">
          <img 
            src="${this.getProfileImage(story.imageUrl)}"
            class="story-image ${isSeen ? 'seen' : 'unseen'}" 
            onerror="this.src='assets/avatar.png'"
          />
        </div>
        <span class="story-username">${this.truncateText(story.username, 10)}</span>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: [80, 90],
      iconAnchor: [40, 45]
    });
  }

  // ✨ NEW: Create iOS-style post marker
  createPostMarker(post: any): any {
    const iconHtml = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
      ">
        <div style="
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          overflow: hidden;
          border: 3px solid white;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        ">
          <img 
            src="${this.getProfileImage(post.profilePicture)}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            "
            onerror="this.src='assets/avatar.png'"
          />
          <div style="
            position: absolute;
            bottom: -6px;
            right: -6px;
            width: 22px;
            height: 22px;
            background: linear-gradient(135deg, #007aff, #0051d5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
              0 2px 8px rgba(0, 122, 255, 0.4),
              0 0 0 2px white;
          ">
            <i class="fa fa-camera" style="color: white; font-size: 10px;"></i>
          </div>
        </div>
        <span style="
          font-size: 11px;
          font-weight: 600;
          color: #1a1a1a;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          padding: 4px 10px;
          border-radius: 12px;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        ">
          ${this.truncateText(post.userName, 10)}
        </span>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: [80, 90],
      iconAnchor: [40, 45]
    });
  }

  // ✨ NEW: Create iOS-style popup content
  createPopupContent(post: any): string {
    const imageUrl = (post.imageUrl !== 'multiple') 
      ? this.getProfileImage(post.imageUrl) 
      : this.getProfileImage(post.mediaUrl[0]);

    return `
      <div style="
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 4px;
      ">
        <div style="
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          <img 
            src="${this.getProfileImage(post.profilePicture)}"  
            style="
              border-radius: 50%; 
              width: 32px; 
              height: 32px; 
              object-fit: cover; 
              border: 2px solid #007aff;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            "
            onerror="this.src='assets/avatar.png'"
          >
          <span>${post.userName}</span>
        </div>
        
        <img 
          id="postImg-${post.id}" 
          src="${imageUrl}" 
          style="
            width: 180px; 
            height: 180px; 
            border-radius: 16px; 
            cursor: pointer;
            object-fit: cover;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            margin-bottom: 10px;
          "
          onerror="this.src='assets/avatar.png'"
        />
        
        <p style="
          font-size: 13px;
          color: #3a3a3c;
          margin: 8px 0;
          font-weight: 500;
          line-height: 1.4;
        ">
          ${this.truncateText(post.caption, 60)}
        </p>
        
        <button id="directions-${post.id}" class="btn-directions">
          <i class="fa fa-location-arrow"></i> Get Directions
        </button>
      </div>
    `;
  }

  loadStoriesOnMap() {
    this.markerClusterGroup.clearLayers();
    
    this.serviceSrv.getMapStoriesCached(this.loggedInUser).subscribe((stories: any) => {
      const filteredStories = this.filterByRadius(stories);
      const heatData: any[] = [];

      filteredStories.forEach((story: any) => {
        heatData.push([story.latitude, story.longitude, 1]);

        if (!this.showHeatmap) {
          const userIcon = this.createStoryMarker(story);
          const marker = L.marker([story.latitude, story.longitude], { icon: userIcon });
          
          marker.on('click', () => {
            this.router.navigate(['/stories', story.username]);
          });
          
          this.markerClusterGroup.addLayer(marker);
        }
      });

      if (!this.showHeatmap) {
        this.map.addLayer(this.markerClusterGroup);
      }

      this.updateHeatmap(heatData);
    });

    this.serviceSrv.getMapmapPostsCached(this.selectedLat, this.selectedLon, this.searchRadius, this.loggedInUser)
      .subscribe((posts: any) => {
        const filteredPosts = this.filterByCategory(posts);
        
        filteredPosts.forEach((post: any) => {
          const userIcon = this.createPostMarker(post);
          const popupContent = this.createPopupContent(post);

          const marker = L.marker([post.latitude, post.longitude], { icon: userIcon })
            .bindPopup(popupContent, {
              maxWidth: 220,
              className: 'ios-popup'
            });

          marker.on('popupopen', () => {
            const img = document.getElementById(`postImg-${post.id}`);
            if (img) {
              img.addEventListener('click', () => {
                this.router.navigate([`/${post.userName}/p/${post.postId}`]);
              });
            }

            const dirBtn = document.getElementById(`directions-${post.id}`);
            if (dirBtn) {
              dirBtn.addEventListener('click', () => {
                this.showDirectionsTo(post.latitude, post.longitude, post);
              });
            }
          });

          this.markerClusterGroup.addLayer(marker);
        });
      });
  }

  toggleHeatmap() {
    this.showHeatmap = !this.showHeatmap;
    this.loadStoriesOnMap();
  }

  updateHeatmap(data: any[]) {
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
    }

    if (this.showHeatmap && data.length > 0) {
      this.heatLayer = (L as any).heatLayer(data, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.0: '#667eea',
          0.4: '#34c759',
          0.6: '#ff9500',
          0.8: '#ff3b30',
          1.0: '#ff2d55'
        }
      }).addTo(this.map);
    }
  }

  async showDirectionsTo(lat: number, lon: number, post: any) {
    this.selectedPost = post;
    this.showDirections = true;

    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${this.userLon},${this.userLat};${lon},${lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c: any) => [c[1], c[0]]);

        this.routePolyline = L.polyline(coords, {
          color: '#007aff',
          weight: 5,
          opacity: 0.8,
          smoothFactor: 1,
          dashArray: '10, 5'
        }).addTo(this.map);

        const duration = Math.round(route.duration / 60);
        const distance = (route.distance / 1000).toFixed(1);
        
        this.postDistance = distance;
        this.postDuration = duration;

        // Zoom to fit the route
        this.map.fitBounds(this.routePolyline.getBounds(), {
          padding: [50, 50]
        });
      }
    } catch (error) {
      console.error('Routing error:', error);
      // If routing fails, still show the directions panel
      this.postDistance = this.getDistance(this.userLat, this.userLon, lat, lon).toFixed(1);
      this.postDuration = Math.round(parseFloat(this.postDistance) * 3); // Rough estimate: 3 min per km
    }
  }

  // New method to open in external maps
  openInExternalMaps(lat: number, lon: number) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${this.userLat},${this.userLon}&destination=${lat},${lon}`,
      '_blank'
    );
  }

  clearDirections() {
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
      this.routePolyline = null;
    }
    this.showDirections = false;
    this.selectedPost = null;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  updateRadius(event: any) {
    this.searchRadius = parseFloat(event.target.value);
    this.loadStoriesOnMap();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.loadStoriesOnMap();
  }

  filterByRadius(items: any[]) {
    return items.filter(item => {
      const dist = this.getDistance(
        this.selectedLat, 
        this.selectedLon, 
        item.latitude, 
        item.longitude
      );
      return dist <= this.searchRadius;
    });
  }

  filterByCategory(posts: any[]) {
    return posts.filter(item => {
      const dist = this.getDistance(
        this.selectedLat, 
        this.selectedLon, 
        item.latitude, 
        item.longitude
      );
      return dist <= this.searchRadius;
    });
  }

  toggleLiveTracking() {
    this.liveTrackingEnabled = !this.liveTrackingEnabled;

    if (this.liveTrackingEnabled) {
      this.startLiveTracking();
    } else {
      this.stopLiveTracking();
    }
  }

  startLiveTracking() {
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLon = pos.coords.longitude;

        this.marker.setLatLng([newLat, newLon]);
        this.userLat = newLat;
        this.userLon = newLon;
      },
      (err) => console.error('Live tracking error:', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }

  stopLiveTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.liveMarkers.forEach(marker => this.map.removeLayer(marker));
    this.liveMarkers.clear();
  }

  updateLiveMarker(username: string, lat: number, lon: number) {
    if (this.liveMarkers.has(username)) {
      this.liveMarkers.get(username).setLatLng([lat, lon]);
    } else {
      const liveIcon = L.divIcon({
        html: `
          <div class="live-marker">
            <div class="live-pulse"></div>
            <i class="fa fa-user" style="color: #34c759;"></i>
            <span>${username}</span>
          </div>
        `,
        className: '',
        iconSize: [60, 60],
        iconAnchor: [30, 30]
      });

      const marker = L.marker([lat, lon], { icon: liveIcon }).addTo(this.map);
      this.liveMarkers.set(username, marker);
    }
  }

  changeLayer(layerName: string) {
    this.currentLayer = layerName;
    Object.values(this.tileLayers).forEach((layer: any) => this.map.removeLayer(layer));
    this.map.addLayer(this.tileLayers[layerName]);
  }

  centerMap() {
    this.map.flyTo([this.myLocationLat, this.myLocationLon], 15, {
      duration: 1.5,
      easeLinearity: 0.25
    });
    this.currentViewLat = this.myLocationLat;
    this.currentViewLon = this.myLocationLon;
    this.showSearchBtn = false;
  }

  searchThisArea() {
    const center = this.map.getCenter();
    this.selectedLat = center.lat;
    this.selectedLon = center.lng;
    this.currentViewLat = center.lat;
    this.currentViewLon = center.lng;
    this.showSearchBtn = false;
    this.loadStoriesOnMap();
  }

  getProfileImage(image: string | null): string {
    if (!image || image === 'null') {
      return 'assets/avatar.png';
    }
    return  image;
  }

  close() {
    this.location.back();
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
    return dist * 1.609344;
  }

  // ✨ NEW: Helper method to truncate text
  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}