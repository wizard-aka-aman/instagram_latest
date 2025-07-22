import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { PostViewComponent } from './profile/post-view/post-view.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
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
        path: 'messages',
        loadChildren: () => import('./message/message.module').then(e => e.MessageModule)
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
    } 
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
