import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';
import { InventoryForm, InventoryFormDialogData } from './inventory-form';
import { InventoryItem } from '../../../core/models/inventory-item.model';

describe('InventoryForm', () => {
  let closeSpy: ReturnType<typeof vi.fn>;

  function createComponent(data: InventoryFormDialogData) {
    closeSpy = vi.fn();
    TestBed.configureTestingModule({
      imports: [InventoryForm, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
      ],
    });
    return TestBed.createComponent(InventoryForm);
  }

  describe('create mode (no item)', () => {
    it('defaults to simple mode (no variants)', () => {
      const fixture = createComponent({ item: null });
      expect(fixture.componentInstance['useVariants']()).toBe(false);
    });

    it('does not save when required fields are missing', () => {
      const fixture = createComponent({ item: null });
      fixture.componentInstance.save();
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('builds a simple InventoryItemInput on save', () => {
      const fixture = createComponent({ item: null });
      const form = fixture.componentInstance['form'];
      form.patchValue({
        name: ' Testartikel ',
        category: 'Test',
        quantity: 5,
        minQuantity: 2,
        unit: 'Stk',
        price: 9.99,
        location: ' Lager X ',
      });

      fixture.componentInstance.save();

      expect(closeSpy).toHaveBeenCalledWith({
        name: 'Testartikel',
        category: 'Test',
        quantity: 5,
        minQuantity: 2,
        unit: 'Stk',
        price: 9.99,
        location: 'Lager X',
        variants: null,
      });
    });

    it('toggling variants on switches to variant-array output', () => {
      const fixture = createComponent({ item: null });
      const component = fixture.componentInstance;
      component['form'].patchValue({ name: 'Handschuhe', category: 'Sicherheit' });
      component.toggleVariants(true);
      component['variants']
        .at(0)
        .patchValue({ size: 'M', quantity: 3, minQuantity: 1, price: 2.5 });

      component.save();

      expect(closeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Handschuhe',
          quantity: null,
          minQuantity: null,
          unit: null,
          price: null,
          location: null,
          variants: [
            expect.objectContaining({ size: 'M', quantity: 3, minQuantity: 1, price: 2.5 }),
          ],
        }),
      );
    });

    it('addVariant appends a row and removeVariant removes it, but not the last one', () => {
      const fixture = createComponent({ item: null });
      const component = fixture.componentInstance;

      expect(component['variants'].length).toBe(1);
      component.addVariant();
      expect(component['variants'].length).toBe(2);

      component.removeVariant(1);
      expect(component['variants'].length).toBe(1);

      component.removeVariant(0);
      expect(component['variants'].length).toBe(1);
    });

    it('cancel() closes the dialog with no result', () => {
      const fixture = createComponent({ item: null });
      fixture.componentInstance.cancel();
      expect(closeSpy).toHaveBeenCalledWith();
    });
  });

  describe('edit mode (existing item)', () => {
    it('pre-fills the simple fields for an item without variants', () => {
      const item: InventoryItem = {
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
      };

      const fixture = createComponent({ item });
      const raw = fixture.componentInstance['form'].getRawValue();

      expect(raw.name).toBe('Monitor');
      expect(raw.quantity).toBe(8);
      expect(fixture.componentInstance['useVariants']()).toBe(false);
    });

    it('pre-fills variant rows and defaults to variant mode for an item with variants', () => {
      const item: InventoryItem = {
        id: '1',
        name: 'Arbeitshandschuhe',
        category: 'Sicherheit',
        updatedAt: '',
        hasVariants: true,
        isLowStock: true,
        totalQuantity: 5,
        minPrice: 6.5,
        maxPrice: 6.5,
        quantity: null,
        minQuantity: null,
        unit: null,
        price: null,
        location: null,
        variants: [
          {
            id: 'v1',
            size: 'M',
            manufacturer: null,
            unit: 'Paar',
            quantity: 5,
            minQuantity: 10,
            price: 6.5,
            location: null,
            isLowStock: true,
          },
        ],
      };

      const fixture = createComponent({ item });
      expect(fixture.componentInstance['useVariants']()).toBe(true);
      expect(fixture.componentInstance['variants'].length).toBe(1);
      expect(fixture.componentInstance['variants'].at(0).get('size')?.value).toBe('M');
    });
  });
});
