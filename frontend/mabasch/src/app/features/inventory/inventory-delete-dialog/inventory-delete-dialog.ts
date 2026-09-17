import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface InventoryDeleteDialogData {
  itemName: string;
}

@Component({
  selector: 'app-inventory-delete-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './inventory-delete-dialog.html',
})
export class InventoryDeleteDialog {
  protected readonly data = inject<InventoryDeleteDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<InventoryDeleteDialog>);

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
