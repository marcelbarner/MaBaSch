import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { InventoryItem, InventoryItemInput } from '../../../core/models/inventory-item.model';

export interface InventoryFormDialogData {
  item: InventoryItem | null;
}

@Component({
  selector: 'app-inventory-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './inventory-form.html',
  styleUrl: './inventory-form.scss',
})
export class InventoryForm {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<InventoryForm>);
  protected readonly data = inject<InventoryFormDialogData>(MAT_DIALOG_DATA);

  protected readonly isEditMode = !!this.data.item;

  protected readonly form = this.fb.nonNullable.group({
    name: [this.data.item?.name ?? '', [Validators.required, Validators.maxLength(200)]],
    category: [this.data.item?.category ?? '', [Validators.required, Validators.maxLength(100)]],
    quantity: [this.data.item?.quantity ?? 0, [Validators.required, Validators.min(0)]],
    minQuantity: [this.data.item?.minQuantity ?? 0, [Validators.required, Validators.min(0)]],
    unit: [this.data.item?.unit ?? '', [Validators.required, Validators.maxLength(50)]],
    price: [this.data.item?.price ?? 0, [Validators.required, Validators.min(0)]],
    location: [this.data.item?.location ?? ''],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const result: InventoryItemInput = {
      name: value.name.trim(),
      category: value.category.trim(),
      quantity: value.quantity,
      minQuantity: value.minQuantity,
      unit: value.unit.trim(),
      price: value.price,
      location: value.location.trim() || null,
    };

    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
