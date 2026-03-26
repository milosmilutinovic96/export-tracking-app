import { Component, effect, input, signal } from '@angular/core';
import { GroupedProductionItem, ProductionItem } from '../../models/production-item.model';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as ExcelJS from 'exceljs';

import localeSr from '@angular/common/locales/sr';
import localeSrExtra from '@angular/common/locales/extra/sr';

// Register the locale
registerLocaleData(localeSr, 'sr', localeSrExtra);


@Component({
  selector: 'app-production-items-table',
  imports: [
    MatTableModule,
    DatePipe,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'sr-Latn'}
  ],
  templateUrl: './production-items-table.html',
  styleUrl: './production-items-table.scss',
})
export class ProductionItemsTable {
  productionItems = input.required<GroupedProductionItem[]>();

  expandedElement = signal<GroupedProductionItem | null>(null);

  displayedColumns: string[] = [
    'productCode',
    'productName',
    'unitOfMeasure',
    'quantityInUnitOfMeasure',
    'numberOfOrderedTp',
    'actions'

  ]
  // Child table columns
  childDisplayedColumns: string[] = [ 
    'numberOfOrderedTp', 
    'numberOfReadyTp', 
    'customerName',
    'orderName',
    'deliveryDate'
  ];

  constructor() {
    effect(() => {
      console.log('Production items:',this.productionItems())
    })
  }

  toggleRow(productionItem: GroupedProductionItem) {
    productionItem.isExpanded = !productionItem.isExpanded;
    this.expandedElement.set(this.expandedElement() === productionItem ? null : productionItem);
  }

  async exportProductionItemsToExcel(): Promise<void> {
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Your App';
  workbook.created = new Date();
  
  // Create main worksheet for grouped items
  const mainWorksheet = workbook.addWorksheet('Proizvodni Artikli');
  
  // Add headers for main table
  const mainHeaders = [
    'Šifra Artikla',
    'Naziv Artikla',
    'Jed. mere',
    'Količina u JM',
    'Transportna pakovanja'
  ];
  
  const mainHeaderRow = mainWorksheet.addRow(mainHeaders);
  
  // Style main header row
  mainHeaderRow.eachCell((cell) => {
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
  
  // Add main data rows
  this.productionItems().forEach((item, mainIndex) => {
    // Calculate quantity in unit of measure
    const quantityInUnitOfMeasure = (item.unitsInTransportBox || 0) * (item.totalOrderedTp || 0);
    
    const mainRow = mainWorksheet.addRow([
      item.productCode || '',
      item.productName || '',
      item.unitOfMeasure || '',
      quantityInUnitOfMeasure,
      item.totalOrderedTp || 0
    ]);
    
    // Style main row cells
    mainRow.eachCell((cell, colNumber) => {
      // Add borders
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
      if (mainIndex % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' } // Light gray
        };
      }
      
      // Set alignment based on column
      if (colNumber === 4 || colNumber === 5) { // Numeric columns
        cell.alignment = {
          horizontal: 'right',
          vertical: 'middle'
        };
        cell.numFmt = '#,##0';
      } else {
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle'
        };
      }
    });
    
    // Create a separate worksheet for child items if they exist
    if (item.items && item.items.length > 0) {
      // Check if we already have a details worksheet, if not create one
      let detailsWorksheet = workbook.getWorksheet('Detalji po trebovanjima');
      if (!detailsWorksheet) {
        detailsWorksheet = workbook.addWorksheet('Detalji po trebovanjima');
        
        // Add headers for details table
        const detailHeaders = [
          'Šifra Artikla',
          'Naziv Artikla',
          'Poručeno TP',
          'Odvojeno TP',
          'Kupac',
          'Trebovanje',
          'Datum utovara'
        ];
        
        const detailHeaderRow = detailsWorksheet.addRow(detailHeaders);
        
        // Style detail header row
        detailHeaderRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF5A9BD5' } // Lighter blue for child table
          };
          cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' },
            size: 11,
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
      }
      
      // Add child items
      item.items.forEach((childItem, childIndex) => {
        // Safely access nested properties
        const customerName = childItem.orderId?.customerId?.name || '';
        const orderName = childItem.orderId?.orderName || '';
        const deliveryDate = childItem.orderId?.deliveryDate 
          ? datePipe.transform(childItem.orderId.deliveryDate, 'dd MMM yyyy') 
          : '';
        
        const detailRow = detailsWorksheet.addRow([
          item.productCode || '',
          item.productName || '',
          childItem.numberOfOrderedTp || 0,
          childItem.numberOfReadyTp || 0,
          customerName,
          orderName,
          deliveryDate || ''
        ]);
        
        // Style detail row
        detailRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          cell.font = {
            size: 10,
            name: 'Calibri',
            color: { argb: 'FF000000' }
          };
          
          // Alternate row background
          if (childIndex % 2 === 1) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9F9F9' }
            };
          }
          
          // Set alignment
          if (colNumber === 3 || colNumber === 4) { // TP columns
            cell.alignment = {
              horizontal: 'right',
              vertical: 'middle'
            };
            cell.numFmt = '#,##0';
          } else if (colNumber === 7) { // Date column
            cell.alignment = {
              horizontal: 'center',
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
    }
  });
  
  // Auto-fit main worksheet columns
  mainWorksheet.columns.forEach((column) => {
    if (column) {
      let maxLength = 0;
      column.eachCell!({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      
      // Set min and max widths
      let minWidth = 12;
      let maxWidth = 40;
      
      if (column.number === 2) { // Product name column
        minWidth = 25;
        maxWidth = 60;
      } else if (column.number === 4 || column.number === 5) { // Numeric columns
        minWidth = 15;
        maxWidth = 20;
      }
      
      column.width = Math.min(Math.max(maxLength + 2, minWidth), maxWidth);
    }
  });
  
  // Auto-fit details worksheet columns if it exists
  const detailsWorksheet = workbook.getWorksheet('Detalji po trebovanjima');
  if (detailsWorksheet) {
    detailsWorksheet.columns.forEach((column, index) => {
      if (column) {
        let maxLength = 0;
        column.eachCell!({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        
        // Set specific widths
        let width = Math.min(Math.max(maxLength + 2, 12), 50);
        
        // Adjust for specific columns
        if (index === 0) width = 15; // Product code
        if (index === 1) width = 30; // Product name
        if (index === 4) width = 25; // Customer name
        if (index === 5) width = 20; // Order name
        if (index === 6) width = 15; // Delivery date
        
        column.width = width;
      }
    });
  }
  
  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `proizvodni-artikli-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}
}
