import { CommonModule } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { GroupedSupplyItem } from '../../models/supply-item.model';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-supply-items-table',
  imports: [
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './supply-items-table.html',
  styleUrl: './supply-items-table.scss',
})
export class SupplyItemsTable {
  supplyItems = input.required<GroupedSupplyItem[]>();

  // expandedElement = signal<GroupedSupplyItem | null>(null);

  displayedColumns: string[] = [
    'elementItemCode',
    'elementItemName',
    'unitOfMeasure',
    'totalQuantity',
  ]

  constructor() {
    effect(() => {
      console.log('Production items:',this.supplyItems())
    })
  }


  async exportToExcelFormatted(): Promise<void> {
// Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Your App';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('Supply Items');
  
  // Add headers
  const headers = ['Šifra Artikla', 'Naziv Artikla', 'Jedinica mere', 'Ukupna količina'];
  const headerRow = worksheet.addRow(headers);
  
  // Style header row
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
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
  
  // Add data rows
  this.supplyItems().forEach((item, index) => {
    const row = worksheet.addRow([
      item.elementItemCode,
      item.elementItemName,
      item.elementItemUnitOfMeasure,
      item.totalQuantity
    ]);
    
    // Style data row cells
    row.eachCell((cell, colNumber) => { // Note: added colNumber parameter
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
          fgColor: { argb: 'FFF5F5F5' }
        };
      }
      
      // Set alignment based on column number
      // Column numbers: 1 = Šifra Artikla, 2 = Naziv Artikla, 3 = Jedinica mere, 4 = Ukupna količina
      if (colNumber === 4) { // 4th column (Ukupna količina)
        cell.alignment = {
          horizontal: 'right',
          vertical: 'middle'
        };
      } else {
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle'
        };
      }
    });
  });
  
  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column) {
      let maxLength = 0;
      column.eachCell!({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = Math.min(Math.max(maxLength + 2, 12), 50);
    }
  });
  
  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `supply-items-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}
}
