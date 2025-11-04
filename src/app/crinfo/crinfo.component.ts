import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';


interface Card {
  name: string;
  id: number;
  level: number;
  maxLevel: number;
  rarity: string;
  count: number;
  elixirCost: number;
  iconUrls: {
    medium: string;
  };
  evolutionLevel?: number;
  maxEvolutionLevel?: number;
  starLevel?: number;
}

interface PlayerData {
  tag: string;
  name: string;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  wins: number;
  losses: number;
  battleCount: number;
  cards: Card[];
  currentDeck: Card[];
  arena: {
    name: string;
  };
  clan?: {
    name: string;
  };
}
@Component({
  selector: 'app-crinfo',
  templateUrl: './crinfo.component.html',
  styleUrls: ['./crinfo.component.scss']
})
export class CRInfoComponent implements OnInit {

  constructor(private http: HttpClient) {}


  ngOnInit(): void {
  }
  playerTag = '';
  playerData: PlayerData | null = null;
  filteredCards: Card[] = [];
  searchTerm = '';
  loading = false;
  error = '';
  
  // Filter options
  selectedRarity: string = 'all';
  selectedElixirCost: string = 'all';
  minLevel: number = 1;
  maxLevel: number = 14;
  sortBy: string = 'name';
  sortOrder: string = 'asc';
  
  rarities = ['all', 'common', 'rare', 'epic', 'legendary', 'champion'];
  elixirCosts = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'level', label: 'Level' },
    { value: 'elixirCost', label: 'Elixir Cost' },
    { value: 'rarity', label: 'Rarity' },
    { value: 'count', label: 'Card Count' }
  ];

  showFilters = false;
  viewMode: 'grid' | 'list' = 'grid';


 
  async searchPlayer() {
    if (!this.playerTag.trim()) {
      this.error = 'Please enter a player tag';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      // Replace with your actual API endpoint
      const apiUrl = `https://api.clashroyale.com/v1/players/${this.playerTag}`;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6Ijc0MTIyYmRjLWQxY2UtY2FkYy05OTYzLTgzM2Y4NGY3MDlmNiIsImlhdCI6MTc2MjI1MzM3MCwiZXhwIjoxNzYyMjU2OTcwLCJzdWIiOiJkZXZlbG9wZXIvNjA4OWYzYjItNzA1Ni1jMTcwLTkwZTQtNWUxZTA4ZGYxMzAxIiwic2NvcGVzIjpbInJveWFsZSJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvYnJvbnplIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjEyNC4xMjMuNzcuMC8zMiJdLCJ0eXBlIjoiY2xpZW50In0seyJvcmlnaW5zIjpbImRldmVsb3Blci5jbGFzaHJveWFsZS5jb20iXSwidHlwZSI6ImNvcnMifV19._TNTJln_7iSPdNSr_ZTHVPF8OkEHARfQxbQp_J5NAsiCTw2lMXc2do-q6D5Wy1ur9v7OipRCIbBcs0MXfyf3yg',
      });
       this.http.get<PlayerData>(apiUrl,{ headers }).subscribe({
        next: (data) => {
          this.playerData = data;
          console.log(data);
          
        },
        error: (err) => {
          console.log(err);
          
        }
       })
      
      if (this.playerData) {
        this.filteredCards = [...this.playerData.cards];
        this.applyFilters();
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to fetch player data';
      this.playerData = null;
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    if (!this.playerData) return;

    let cards = [...this.playerData.cards];

    // Apply search filter
    if (this.searchTerm) {
      cards = cards.filter(card => 
        card.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply rarity filter
    if (this.selectedRarity !== 'all') {
      cards = cards.filter(card => card.rarity === this.selectedRarity);
    }

    // Apply elixir cost filter
    if (this.selectedElixirCost !== 'all') {
      cards = cards.filter(card => 
        card.elixirCost === parseInt(this.selectedElixirCost)
      );
    }

    // Apply level range filter
    cards = cards.filter(card => 
      card.level >= this.minLevel && card.level <= this.maxLevel
    );

    // Apply sorting
    cards.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'elixirCost':
          comparison = a.elixirCost - b.elixirCost;
          break;
        case 'rarity':
          comparison = a.rarity.localeCompare(b.rarity);
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredCards = cards;
  }

  resetFilters() {
    this.selectedRarity = 'all';
    this.selectedElixirCost = 'all';
    this.minLevel = 1;
    this.maxLevel = 14;
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.searchTerm = '';
    this.applyFilters();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  getRarityColor(rarity: string): string {
    const colors: { [key: string]: string } = {
      common: '#3498db',
      rare: '#e67e22',
      epic: '#9b59b6',
      legendary: '#f39c12',
      champion: '#1abc9c'
    };
    return colors[rarity] || '#95a5a6';
  }

  getWinRate(): number {
    if (!this.playerData) return 0;
    const total = this.playerData.wins + this.playerData.losses;
    return total > 0 ? (this.playerData.wins / total) * 100 : 0;
  }

}
