import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';
import { InventoryDeleteDialog, InventoryDeleteDialogData } from './inventory-delete-dialog';

describe('InventoryDeleteDialog', () => {
  let closeSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    closeSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [InventoryDeleteDialog],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: { itemName: 'Testartikel' } satisfies InventoryDeleteDialogData,
        },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
      ],
    }).compileComponents();
  });

  it('renders the item name', async () => {
    const fixture = TestBed.createComponent(InventoryDeleteDialog);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Testartikel');
  });

  it('confirm() closes the dialog with true', () => {
    const fixture = TestBed.createComponent(InventoryDeleteDialog);
    fixture.componentInstance.confirm();
    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('cancel() closes the dialog with false', () => {
    const fixture = TestBed.createComponent(InventoryDeleteDialog);
    fixture.componentInstance.cancel();
    expect(closeSpy).toHaveBeenCalledWith(false);
  });
});
