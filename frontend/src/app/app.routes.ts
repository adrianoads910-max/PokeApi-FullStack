import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Favorites } from './components/favorites/favorites';
import { Equip } from './components/equip/equip';
import { List } from './components/list/list';
import { Register } from './components/register/register';
import { AuthGuard } from './guards/auth-guard';
import { UserProfile } from './components/user-profile/user-profile';
import { Users } from './components/users/users';




export const routes: Routes = [
    {
        path: "",
        component: Home
    },
    {
        path: "home",
        component: Home
    },
    {
        path: "register",
        component: Register
    },
    {
        path: "login",
        component: Login
    },
    {
        path: "favorites",
        component: Favorites, canActivate: [AuthGuard]
    },
    {
        path: "equipe",
        component: Equip, canActivate: [AuthGuard]
    },
    {
        path: "lista",
        component: List
    },
    {
        path: "profile",
        component: UserProfile

    },
    {
        path: "users",
        component: Users, canActivate: [AuthGuard]
    },

];
