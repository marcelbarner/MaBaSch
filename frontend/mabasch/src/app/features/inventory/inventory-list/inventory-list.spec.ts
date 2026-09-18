import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { InventoryList } from './inventory-list';
import { InventoryService } from '../../../core/services/inventory.service';
import { InventoryItem } from '../../../core/models/inventory-item.model';

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: '1',
    name: 'Monitor',
    category: 'Elektronik',
    updatedAt: '',
    hasVariants: false,
    isLowStock: false,
    totalQuantity: 8,
    minPrice: 259,
    maxPrice: 259,
    quantity: 8,
    minQuantity: 6,
    unit: 'Stück',
    price: 259,
    location: 'Lager B2',
    variants: [],
    ...overrides,
  };
}

function makeInventoryServiceSpy() {
  return {
    getItems: vi.fn().mockReturnValue(of([makeItem()])),
    getCategories: vi.fn().mockReturnValue(of(['Elektronik'])),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  } satisfies Partial<Record<keyof InventoryService, ReturnType<typeof vi.fn>>>;
}

describe('InventoryList', () => {
  let inventoryServiceSpy: ReturnType<typeof makeInventoryServiceSpy>;
  let dialogSpy: { open: ReturnType<typeof vi.fn> };
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };

  function configure() {
    TestBed.configureTestingModule({
      imports: [InventoryList],
      providers: [
        provideZonelessChangeDetection(),
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    });
  }

  function createComponent() {
    inventoryServiceSpy = makeInventoryServiceSpy();
    dialogSpy = { open: vi.fn() };
    snackBarSpy = { open: vi.fn() };
    configure();
    return TestBed.createComponent(InventoryList);
  }

  it('loads items and categories on init', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    expect(inventoryServiceSpy.getItems).toHaveBeenCalled();
    expect(inventoryServiceSpy.getCategories).toHaveBeenCalled();
    expect(component['items']()).toEqual([makeItem()]);
    expect(component['isLoading']()).toBe(false);
  });

  it('sets an error message when loading items fails', () => {
    inventoryServiceSpy = makeInventoryServiceSpy();
    inventoryServiceSpy.getItems.mockReturnValue(throwError(() => new Error('boom')));
    dialogSpy = { open: vi.fn() };
    snackBarSpy = { open: vi.fn() };
    configure();
    const fixture = TestBed.createComponent(InventoryList);

    expect(fixture.componentInstance['errorMessage']()).toBe(
      'Die Inventarliste konnte nicht geladen werden.',
    );
    expect(fixture.componentInstance['isLoading']()).toBe(false);
  });

  it('computes lowStockCount from loaded items', () => {
    inventoryServiceSpy = makeInventoryServiceSpy();
    inventoryServiceSpy.getItems.mockReturnValue(
      of([makeItem({ id: '1', isLowStock: true }), makeItem({ id: '2', isLowStock: false })]),
    );
    dialogSpy = { open: vi.fn() };
    snackBarSpy = { open: vi.fn() };
    configure();
    const fixture = TestBed.createComponent(InventoryList);

    expect(fixture.componentInstance['lowStockCount']()).toBe(1);
  });

  it('debounces search input and reloads items with the search term', async () => {
    vi.useFakeTimers();
    try {
      const fixture = createComponent();
      inventoryServiceSpy.getItems.mockClear();

      fixture.componentInstance.onSearchInput('Monitor');
      await vi.advanceTimersByTimeAsync(299);
      expect(inventoryServiceSpy.getItems).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(inventoryServiceSpy.getItems).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Monitor' }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('onCategoryChange updates state and reloads', () => {
    const fixture = createComponent();
    inventoryServiceSpy.getItems.mockClear();

    fixture.componentInstance.onCategoryChange('Elektronik');

    expect(fixture.componentInstance['selectedCategory']()).toBe('Elektronik');
    expect(inventoryServiceSpy.getItems).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Elektronik' }),
    );
  });

  it('onSortChange sets sortBy/sortDescending and resets on empty direction', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    component.onSortChange({ active: 'price', direction: 'desc' });
    expect(component['sortBy']()).toBe('price');
    expect(component['sortDescending']()).toBe(true);

    component.onSortChange({ active: 'price', direction: '' });
    expect(component['sortBy']()).toBe('name');
    expect(component['sortDescending']()).toBe(false);
  });

  it('toggleExpanded and isExpanded track a single expanded item', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    const item = makeItem();

    expect(component.isExpanded(item)).toBe(false);
    component.toggleExpanded(item);
    expect(component.isExpanded(item)).toBe(true);
    component.toggleExpanded(item);
    expect(component.isExpanded(item)).toBe(false);
  });

  it('unitDisplay shows the common unit or "Mehrere" when they differ', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    const simple = makeItem();
    expect(component.unitDisplay(simple)).toBe('Stück');

    const uniform = makeItem({
      hasVariants: true,
      variants: [
        {
          id: 'v1',
          size: 'S',
          manufacturer: null,
          unit: 'Paar',
          quantity: 1,
          minQuantity: 1,
          price: 1,
          location: null,
          isLowStock: false,
        },
        {
          id: 'v2',
          size: 'M',
          manufacturer: null,
          unit: 'Paar',
          quantity: 1,
          minQuantity: 1,
          price: 1,
          location: null,
          isLowStock: false,
        },
      ],
    });
    expect(component.unitDisplay(uniform)).toBe('Paar');

    const mixed = makeItem({
      hasVariants: true,
      variants: [
        {
          id: 'v1',
          size: 'S',
          manufacturer: null,
          unit: 'Paar',
          quantity: 1,
          minQuantity: 1,
          price: 1,
          location: null,
          isLowStock: false,
        },
        {
          id: 'v2',
          size: 'M',
          manufacturer: null,
          unit: 'Stück',
          quantity: 1,
          minQuantity: 1,
          price: 1,
          location: null,
          isLowStock: false,
        },
      ],
    });
    expect(component.unitDisplay(mixed)).toBe('Mehrere');
  });

  it('priceDisplay shows a single price or a range', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    const single = makeItem({ minPrice: 10, maxPrice: 10 });
    expect(component.priceDisplay(single)).toContain('10');
    expect(component.priceDisplay(single)).not.toContain('–');

    const range = makeItem({ minPrice: 5, maxPrice: 15 });
    expect(component.priceDisplay(range)).toContain('–');
  });

  it('locationDisplay shows the common location or "Mehrere" when they differ', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    const mixed = makeItem({
      hasVariants: true,
      variants: [
        {
          id: 'v1',
          size: 'S',
          manufacturer: null,
          unit: 'Paar',
          quantity: 1,
          minQuantity: 1,
          price: 1,
          location: 'A',
          isLowStock: false,
        },
        {
          id: 'v2',
          size: 'M',
          manufacturer: null,
          unit: 'Paar',
          quantity: 1,
          minQuantity: 1,
          price: 1,
          location: 'B',
          isLowStock: false,
        },
      ],
    });
    expect(component.locationDisplay(mixed)).toBe('Mehrere');
  });

  it('openCreateDialog creates the item and reloads on a successful dialog result', () => {
    const fixture = createComponent();
    const afterClosed = of({
      name: 'Neu',
      category: 'Test',
      quantity: 1,
      minQuantity: 1,
      unit: 'Stk',
      price: 1,
      location: null,
      variants: null,
    });
    dialogSpy.open.mockReturnValue({ afterClosed: () => afterClosed });
    inventoryServiceSpy.createItem.mockReturnValue(of(makeItem()));
    inventoryServiceSpy.getItems.mockClear();

    fixture.componentInstance.openCreateDialog();

    expect(inventoryServiceSpy.createItem).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Artikel wurde angelegt.',
      'OK',
      expect.any(Object),
    );
    expect(inventoryServiceSpy.getItems).toHaveBeenCalled();
  });

  it('openCreateDialog does nothing when the dialog is cancelled', () => {
    const fixture = createComponent();
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(undefined) });

    fixture.componentInstance.openCreateDialog();

    expect(inventoryServiceSpy.createItem).not.toHaveBeenCalled();
  });

  it('openEditDialog updates the item and shows a success message', () => {
    const fixture = createComponent();
    const item = makeItem();
    dialogSpy.open.mockReturnValue({
      afterClosed: () =>
        of({
          name: 'Geändert',
          category: 'Test',
          quantity: 1,
          minQuantity: 1,
          unit: 'Stk',
          price: 1,
          location: null,
          variants: null,
        }),
    });
    inventoryServiceSpy.updateItem.mockReturnValue(of(item));

    fixture.componentInstance.openEditDialog(item);

    expect(inventoryServiceSpy.updateItem).toHaveBeenCalledWith(item.id, expect.any(Object));
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Artikel wurde aktualisiert.',
      'OK',
      expect.any(Object),
    );
  });

  it('openEditDialog shows an error message when the update fails', () => {
    const fixture = createComponent();
    const item = makeItem();
    dialogSpy.open.mockReturnValue({
      afterClosed: () =>
        of({
          name: 'Geändert',
          category: 'Test',
          quantity: 1,
          minQuantity: 1,
          unit: 'Stk',
          price: 1,
          location: null,
          variants: null,
        }),
    });
    inventoryServiceSpy.updateItem.mockReturnValue(throwError(() => new Error('boom')));

    fixture.componentInstance.openEditDialog(item);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Speichern fehlgeschlagen. Bitte Eingaben prüfen.',
      'OK',
      expect.any(Object),
    );
  });

  it('openDeleteDialog deletes the item when confirmed', () => {
    const fixture = createComponent();
    const item = makeItem();
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) });
    inventoryServiceSpy.deleteItem.mockReturnValue(of(undefined));

    fixture.componentInstance.openDeleteDialog(item);

    expect(inventoryServiceSpy.deleteItem).toHaveBeenCalledWith(item.id);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Artikel wurde gelöscht.',
      'OK',
      expect.any(Object),
    );
  });

  it('openDeleteDialog does nothing when not confirmed', () => {
    const fixture = createComponent();
    const item = makeItem();
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) });

    fixture.componentInstance.openDeleteDialog(item);

    expect(inventoryServiceSpy.deleteItem).not.toHaveBeenCalled();
  });

  it('openDeleteDialog shows an error message when deletion fails', () => {
    const fixture = createComponent();
    const item = makeItem();
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) });
    inventoryServiceSpy.deleteItem.mockReturnValue(throwError(() => new Error('boom')));

    fixture.componentInstance.openDeleteDialog(item);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Löschen fehlgeschlagen. Bitte erneut versuchen.',
      'OK',
      expect.any(Object),
    );
  });
});
