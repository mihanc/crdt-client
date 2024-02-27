import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'rooms', loadComponent: () => import('./pages/rooms/rooms.component').then((mod) => mod.RoomsComponent) },
  { path: 'rooms/:id', loadComponent: () => import('./pages/room/room.component').then((mod) => mod.RoomComponent) },
];
