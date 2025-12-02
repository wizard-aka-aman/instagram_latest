import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { PostViewComponent } from './profile/post-view/post-view.component';
import { ReelViewComponent } from './profile/reel-view/reel-view.component';
import { DesktopComponent } from './desktop/desktop.component';

const routes: Routes = [
    
    {
        path:'desktop',
        component:DesktopComponent
    },
    {
        path: '',
        loadChildren: () => import('./home/home.module').then(e => e.HomeModule)
    },
    {
        path: 'accounts',
        loadChildren: () => import('./accounts/accounts.module').then(e => e.AccountsModule)
    },
    {
        path: 'search',
        loadChildren: () => import('./search/search.module').then(e => e.SearchModule)
    },
    {
        path: 'reels',
        loadChildren: () => import('./reels/reels.module').then(e => e.ReelsModule)
    },
    {
        path: 'messages',
        loadChildren: () => import('./message/message.module').then(e => e.MessageModule)
    },
    {
        path: 'notifications',
        loadChildren: () => import('./notification/notification.module').then(e => e.NotificationModule)
    },
    {
        path: 'map',
        loadChildren: () => import('./map/map.module').then(e => e.MapModule)
    },
    {
        path: 'more',
        loadChildren: () => import('./more/more.module').then(e => e.MoreModule)
    },
    {
        path: 'explore',
        loadChildren: () => import('./explore/explore.module').then(e => e.ExploreModule)
    },
    {
        path: 'stories/:username',
        loadChildren: () => import('./stories/stories.module').then(e => e.StoriesModule)
    },
    {
        path: 'stories',
        loadChildren: () => import('./stories/stories.module').then(e => e.StoriesModule)
    },
    {
        path: 'not-found',
        component: PagenotfoundComponent
    },
    {
        path: ':username',
        loadChildren: () => import('./profile/profile.module').then(e => e.ProfileModule)
    },
    {
        path: ':username/p/:postid',
        component: PostViewComponent
    },
    {
        path: ':username/reel/:publicid',
        component: ReelViewComponent
    }
    , {
        path: '**',
        component: PagenotfoundComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
