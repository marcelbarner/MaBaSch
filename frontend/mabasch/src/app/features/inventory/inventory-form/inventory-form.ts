import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryItem, InventoryItemInput, InventoryItemVariantInput } from '../../../core/models/inventory-item.model';

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
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './inventory-form.html',
  styleUrl: './inventory-form.scss',
})
export class InventoryForm {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<InventoryForm>);
  protected readonly data = inject<InventoryFormDialogData>(MAT_DIALOG_DATA);

  protected readonly isEditMode = !!this.data.item;
  protected readonly useVariants = signal(this.data.item?.hasVariants ?? false);

  protected readonly form = this.fb.nonNullable.group({
    name: [this.data.item?.name ?? '', [Validators.required, Validators.maxLength(200)]],
    category: [this.data.item?.category ?? '', [Validators.required, Validators.maxLength(100)]],
    quantity: [this.data.item?.quantity ?? 0, [Validators.required, Validators.min(0)]],
    minQuantity: [this.data.item?.minQuantity ?? 0, [Validators.required, Validators.min(0)]],
    unit: [this.data.item?.unit ?? '', [Validators.required, Validators.maxLength(50)]],
    price: [this.data.item?.price ?? 0, [Validators.required, Validators.min(0)]],
    location: [this.data.item?.location ?? ''],
    variants: this.fb.array(
      (this.data.item?.variants.length ? this.data.item.variants : [null]).map((variant) =>
        this.buildVariantGroup(variant ?? undefined),
      ),
    ),
  });

  protected get variants(): FormArray {
    return this.form.controls.variants;
  }

  toggleVariants(useVariants: boolean): void {
    this.useVariants.set(useVariants);
  }

  addVariant(): void {
    this.variants.push(this.buildVariantGroup());
  }

  removeVariant(index: number): void {
    if (this.variants.length > 1) {
      this.variants.removeAt(index);
    }
  }

  save(): void {
    const useVariants = this.useVariants();

    if (useVariants) {
      this.variants.updateValueAndValidity();
      if (this.variants.invalid || !this.form.controls.name.valid || !this.form.controls.category.valid) {
        this.form.controls.name.markAsTouched();
        this.form.controls.category.markAsTouched();
        this.variants.markAllAsTouched();
        return;
      }
    } else if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const result: InventoryItemInput = {
      name: raw.name.trim(),
      category: raw.category.trim(),
      quantity: useVariants ? null : raw.quantity,
      minQuantity: useVariants ? null : raw.minQuantity,
      unit: useVariants ? null : raw.unit.trim(),
      price: useVariants ? null : raw.price,
      location: useVariants ? null : raw.location.trim() || null,
      variants: useVariants
        ? raw.variants.map(
            (v): InventoryItemVariantInput => ({
              size: v.size.trim() || null,
              manufacturer: v.manufacturer.trim() || null,
              unit: v.unit.trim() || null,
              quantity: v.quantity,
              minQuantity: v.minQuantity,
              price: v.price,
              location: v.location.trim() || null,
            }),
          )
        : null,
    };

    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private buildVariantGroup(variant?: {
    size: string | null;
    manufacturer: string | null;
    unit: string | null;
    quantity: number;
    minQuantity: number;
    price: number;
    location: string | null;
  }) {
    return this.fb.nonNullable.group({
      size: [variant?.size ?? ''],
      manufacturer: [variant?.manufacturer ?? ''],
      unit: [variant?.unit ?? ''],
      quantity: [variant?.quantity ?? 0, [Validators.required, Validators.min(0)]],
      minQuantity: [variant?.minQuantity ?? 0, [Validators.required, Validators.min(0)]],
      price: [variant?.price ?? 0, [Validators.required, Validators.min(0)]],
      location: [variant?.location ?? ''],
    });
  }
}
