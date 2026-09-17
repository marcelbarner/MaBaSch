import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/inventory-list/inventory-list').then((m) => m.InventoryList),
    title: 'Inventar',
  },
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  { path: '**', redirectTo: 'inventory' },
];
