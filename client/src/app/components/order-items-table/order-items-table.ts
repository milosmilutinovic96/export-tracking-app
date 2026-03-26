import { Component, effect, inject, input, output } from '@angular/core';
import { OrderItem } from '../../models/order-item.model';
import { MatDialog } from '@angular/material/dialog';
import { openEditOrderItemDialog } from '../edit-order-item-dialog/edit-order-item-dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { openConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { DatePipe } from '@angular/common';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import * as ExcelJS from 'exceljs';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-order-items-table',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    DatePipe
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'sr-Latn'}
  ],
  templateUrl: './order-items-table.html',
  styleUrl: './order-items-table.scss',
})
export class OrderItemsTable {
  orderItems = input.required<OrderItem[]>();
  orderItemUpdated = output<OrderItem>();
  orderItemDeleted = output<string>();

  dialogForConfirmation = inject(MatDialog);

  dialog = inject(MatDialog);
  displayedColumns = [
    'productCode', 
    'productName', 
    'unitOfMeasure', 
    'unitsInTransportBox', 
    'orderedQuantityTp',
    'readyQuantity',
    'lot',
    'dateOfExpire', 
    'actions'
  ]

  constructor() {
    effect(() => {
      console.log('Order items: ', this.orderItems());
    })
  }

  async onEditOrderItem(orderItem: OrderItem, flag: string) {
    const updatedOrderItem = await openEditOrderItemDialog(
      this.dialog,
      {
        mode: 'edit',
        orderId: orderItem.orderId,
        orderItem,
        title: 'Izmeni podatke',
        addFlag: flag
      }
    )
    if(updatedOrderItem) {
      this.orderItemUpdated.emit(updatedOrderItem);
    }

  }

  async onDeleteOrderItem(orderItemId: string) {
    const confirmation = await openConfirmationDialog(
          this.dialogForConfirmation,
          {
            message: 'Da li ste sigurni da želite da obrišete artikal sa trebovanja?',
            title: 'Potvrdi akciju'
          }
        );
        if(confirmation) {
          this.orderItemDeleted.emit(orderItemId);
        }
  }

  async exportOrderItemsToExcel(): Promise<void> {
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Your App';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('Order Items');
  
  // Add headers (excluding the Actions column)
  const headers = [
    'Šifra Artikla', 
    'Naziv artikla', 
    'Jed. mere', 
    'JM u TP',
    'Trebovano u TP',
    'Odvojeno TP',
    'Lot',
    'Datum isteka'
  ];
  
  const headerRow = worksheet.addRow(headers);
  
  // Style header row
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' } // Blue background
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' }, // White text
      size: 12,
      name: 'Calibri'
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  // Create DatePipe for formatting dates
  const datePipe = new DatePipe('sr-Latn');
  
  // Add data rows
  this.orderItems().forEach((item, index) => {
    // Format date if exists
    const formattedDate = item.dateOfExpire 
      ? datePipe.transform(item.dateOfExpire, 'dd MMM yyyy') 
      : '';
    
    const row = worksheet.addRow([
      (item.productId as Product)?.productCode || '',
      (item.productId as Product)?.productName || '',
      (item.productId as Product)?.unitOfMeasure || '',
      (item.productId as Product)?.unitsInTransportBox || '',
      item.numberOfOrderedTp || 0,
      item.numberOfReadyTp || 0,
      item.lot || '',
      formattedDate || ''
    ]);
    
    // Style data row cells
    row.eachCell((cell, colNumber) => {
      // Add borders to all cells
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      cell.font = {
        size: 11,
        name: 'Calibri',
        color: { argb: 'FF000000' }
      };
      
      // Alternate row background (zebra striping)
      if (index % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' } // Light gray for alternate rows
        };
      }
      
      // Set alignment based on column number
      // Column numbers:
      // 1 = Šifra Artikla, 2 = Naziv artikla, 3 = Jed. mere, 4 = JM u TP
      // 5 = Trebovano u TP, 6 = Odvojeno TP, 7 = Lot, 8 = Datum isteka
      
      // Right-align numeric columns
      if (colNumber === 4 || colNumber === 5 || colNumber === 6) {
        cell.alignment = {
          horizontal: 'right',
          vertical: 'middle'
        };
      } 
      // Center-align date column
      else if (colNumber === 8) {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
      }
      // Left-align text columns
      else {
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle'
        };
      }
      
      // Special formatting for numbers
      if (colNumber === 4 || colNumber === 5 || colNumber === 6) {
        cell.numFmt = '#,##0'; // Format numbers with thousand separators
      }
    });
  });
  
  // Auto-fit columns with specific widths for better readability
  worksheet.columns.forEach((column, index) => {
    if (column) {
      let maxLength = 0;
      column.eachCell!({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      
      // Set minimum and maximum widths based on column type
      let minWidth = 12;
      let maxWidth = 40;
      
      // Adjust widths for specific columns
      if (index === 1) { // Naziv artikla - wider
        minWidth = 25;
        maxWidth = 60;
      } else if (index === 7) { // Datum isteka - fixed width
        column.width = 15;
        return;
      } else if (index === 3 || index === 4 || index === 5) { // Numeric columns
        minWidth = 12;
        maxWidth = 15;
      }
      
      column.width = Math.min(Math.max(maxLength + 2, minWidth), maxWidth);
    }
  });
  
  // Add a summary row at the bottom (optional)
  if (this.orderItems().length > 0) {
    const totalOrderedTp = this.orderItems().reduce((sum, item) => sum + (item.numberOfOrderedTp || 0), 0);
    const totalReadyTp = this.orderItems().reduce((sum, item) => sum + (item.numberOfReadyTp || 0), 0);
    
    // Add empty row for spacing
    worksheet.addRow([]);
    
    // Add summary row
    const summaryRow = worksheet.addRow([
      'UKUPNO:', 
      '', 
      '', 
      '', 
      totalOrderedTp, 
      totalReadyTp, 
      '', 
      ''
    ]);
    
    // Style summary row
    summaryRow.eachCell((cell, colNumber) => {
      cell.font = {
        bold: true,
        size: 11,
        name: 'Calibri',
        color: { argb: 'FF000000' }
      };
      
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F0FA' } // Light blue background
      };
      
      cell.border = {
        top: { style: 'medium' },
        left: { style: colNumber === 1 ? 'medium' : 'thin' },
        bottom: { style: 'medium' },
        right: { style: colNumber === 8 ? 'medium' : 'thin' }
      };
      
      if (colNumber === 5 || colNumber === 6) {
        cell.alignment = {
          horizontal: 'right',
          vertical: 'middle'
        };
        cell.numFmt = '#,##0';
      } else if (colNumber === 1) {
        cell.alignment = {
          horizontal: 'right',
          vertical: 'middle'
        };
      } else {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
      }
    });
    
    // Merge cells for "UKUPNO:" label
    worksheet.mergeCells(`A${summaryRow.number}:D${summaryRow.number}`);
  }
  
  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `order-items-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}
}
