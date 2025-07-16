import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

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
        path: ':username',
        loadChildren: () => import('./profile/profile.module').then(e => e.ProfileModule)
    },
    {
        path: '**',
        component: PagenotfoundComponent,
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
