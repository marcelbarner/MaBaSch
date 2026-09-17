import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { InventoryService } from '../../../core/services/inventory.service';
import { InventoryItem, SortField } from '../../../core/models/inventory-item.model';
import { InventoryForm, InventoryFormDialogData } from '../inventory-form/inventory-form';
import {
  InventoryDeleteDialog,
  InventoryDeleteDialogData,
} from '../inventory-delete-dialog/inventory-delete-dialog';

@Component({
  selector: 'app-inventory-list',
  imports: [
    CurrencyPipe,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.scss',
})
export class InventoryList {
  private readonly inventoryService = inject(InventoryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly searchInput$ = new Subject<string>();

  protected readonly displayedColumns = [
    'name',
    'category',
    'quantity',
    'unit',
    'price',
    'location',
    'actions',
  ];

  protected readonly items = signal<InventoryItem[]>([]);
  protected readonly categories = signal<string[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly selectedCategory = signal('');
  protected readonly sortBy = signal<SortField>('name');
  protected readonly sortDescending = signal(false);

  protected readonly lowStockCount = computed(() => this.items().filter((i) => i.isLowStock).length);

  constructor() {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.search.set(value);
        this.loadItems();
      });

    this.loadCategories();
    this.loadItems();
  }

  onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
    this.loadItems();
  }

  onSortChange(sort: Sort): void {
    if (!sort.direction) {
      this.sortBy.set('name');
      this.sortDescending.set(false);
    } else {
      this.sortBy.set(sort.active as SortField);
      this.sortDescending.set(sort.direction === 'desc');
    }
    this.loadItems();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open<InventoryForm, InventoryFormDialogData>(InventoryForm, {
      data: { item: null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      this.inventoryService.createItem(result).subscribe({
        next: () => {
          this.snackBar.open('Artikel wurde angelegt.', 'OK', { duration: 3000 });
          this.loadItems();
          this.loadCategories();
        },
        error: () => this.showSaveError(),
      });
    });
  }

  openEditDialog(item: InventoryItem): void {
    const dialogRef = this.dialog.open<InventoryForm, InventoryFormDialogData>(InventoryForm, {
      data: { item },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      this.inventoryService.updateItem(item.id, result).subscribe({
        next: () => {
          this.snackBar.open('Artikel wurde aktualisiert.', 'OK', { duration: 3000 });
          this.loadItems();
          this.loadCategories();
        },
        error: () => this.showSaveError(),
      });
    });
  }

  openDeleteDialog(item: InventoryItem): void {
    const dialogRef = this.dialog.open<InventoryDeleteDialog, InventoryDeleteDialogData, boolean>(
      InventoryDeleteDialog,
      { data: { itemName: item.name } },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.inventoryService.deleteItem(item.id).subscribe({
        next: () => {
          this.snackBar.open('Artikel wurde gelöscht.', 'OK', { duration: 3000 });
          this.loadItems();
          this.loadCategories();
        },
        error: () =>
          this.snackBar.open('Löschen fehlgeschlagen. Bitte erneut versuchen.', 'OK', {
            duration: 4000,
          }),
      });
    });
  }

  private loadItems(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.inventoryService
      .getItems({
        search: this.search(),
        category: this.selectedCategory(),
        sortBy: this.sortBy(),
        sortDescending: this.sortDescending(),
      })
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Die Inventarliste konnte nicht geladen werden.');
          this.isLoading.set(false);
        },
      });
  }

  private loadCategories(): void {
    this.inventoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {
        /* Kategorienliste ist nicht kritisch für die Grundfunktion */
      },
    });
  }

  private showSaveError(): void {
    this.snackBar.open('Speichern fehlgeschlagen. Bitte Eingaben prüfen.', 'OK', { duration: 4000 });
  }
}
