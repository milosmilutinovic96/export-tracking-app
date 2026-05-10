import { Component, computed, effect, inject, model, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupplyService } from '../../services/supply.service';
import { LoadingService } from '../../services/loading.service';
import { GroupedSupplyItem, NormItem, SupplyItem } from '../../models/supply-item.model';
import { SupplyItemsTable } from '../supply-items-table/supply-items-table';
import { DateRange } from '../date-range/date-range';
import { Repro } from '../../models/repro.model';
import { RawMaterialsService } from '../../services/raw-materials.service';
import { Norm } from '../../models/norm.model';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-supply',
  imports: [
    SupplyItemsTable,
    DateRange,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,

  ],
  templateUrl: './supply.html',
  styleUrl: './supply.scss',
})
export class Supply {
  #supplyItems = signal<SupplyItem[]>([])
  reproItems = signal<Repro[]>([]);
  private route = inject(ActivatedRoute);
  orderId = signal<string>(this.route.snapshot.params['orderId']);
  supplyService = inject(SupplyService);
  loadingService = inject(LoadingService);
  reproItemsService = inject(RawMaterialsService);
  selected = model('all');
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

   customers = computed(() => {

    const newCustomers = this.#supplyItems().map(item => item.orderId.customerId.name);
    return [...new Set(newCustomers)];
  });

  constructor() {
    effect(() => {
      console.log(`Order Id from route: ${this.orderId()}`);
    })

    this.loadSupplyItems()
      .then(() => console.log('Supply items load successfully', this.#supplyItems()));

  }

  supplyItemsForDisplay = computed(() => {
    let items = [...this.#supplyItems()];

    if (this.startDate() && this.endDate()) {
      items = items.filter(item => {
        const date = new Date(item.orderId.deliveryDate!);
        return date >= this.startDate()! && date <= this.endDate()!;
      })
    }
    if (this.selected() !== 'all') {
      items = items.filter(item => item.orderId.customerId.name === this.selected());
    }
    return this.groupSupplyItems(items);
  })





  async loadSupplyItems() {
    try {
      let items: SupplyItem[];
      let reproItems: Repro[];
      reproItems = await this.reproItemsService.findAllRawMaterials();
      this.reproItems.set(reproItems);
      if (this.orderId()) {
        items = await this.supplyService.findAllItemsforOrder(this.orderId());
        const newItems = items.map(item => {
          return {
            id: item.id,
            productCode: item.productCode,
            numberOfOrderedTp: item.numberOfOrderedTp,
            numberOfReadyTp: item.numberOfReadyTp,
            productId: { ...item.productId, norms: [...item.productId!.norms] },
            orderId: item.orderId
          }
        })
        this.#supplyItems.set(newItems);

      } else {
        items = await this.supplyService.findAllItems();
        const newItems = items.map(item => {
          return {
            id: item.id,
            productCode: item.productCode,
            numberOfOrderedTp: item.numberOfOrderedTp,
            numberOfReadyTp: item.numberOfReadyTp,
            productId: { ...item.productId, norms: [...item.productId!.norms] },
            orderId: item.orderId
          }
        })

        this.#supplyItems.set(newItems);
      }
    }
    catch (error) {
      console.error('Error loading supply items: ', error);
    }

  }

  onRangeUpdated(range: { start: Date | null; end: Date | null }) {
    this.startDate.set(range.start);
    this.endDate.set(range.end);
  }


  
 



  private mapNormsToNormItems(item: SupplyItem, finalNorms: Norm[]) {
    return finalNorms
      .map(norm => ({
        norm,
        productCode: item.productId?.productCode,
        productName: item.productId?.productName,
        unitsInTransportBox: item.productId!.unitsInTransportBox,
        totalNeededBox: item.numberOfOrderedTp - item.numberOfReadyTp,
        totalOrderedBox: item.numberOfOrderedTp,
        normUnits: norm.elementItemUnitOfMeasure,
        orderName: item.orderId.customerId.name + ' ' + item.orderId.orderName,
        deliveryDate: item.orderId.deliveryDate,
        totalReadyBox: item.numberOfReadyTp,
        localQuantity: (item.numberOfOrderedTp - item.numberOfReadyTp) * norm.elementItemQuantity
      }))
      .filter(normItem => normItem.totalNeededBox > 0);
  }

  private processSupplyItem(item: SupplyItem) {

    return this.mapNormsToNormItems(item, item.productId!.norms);
  }

  private buildGroupedMap(norms: any[]): Map<string, GroupedSupplyItem> {
    const groupedMap = new Map<string, GroupedSupplyItem>();

    norms.forEach(norm => {
      const existing = groupedMap.get(norm.norm.elementItemCode);

      if (existing) {
        existing.totalQuantity += norm.totalNeededBox * norm.norm.elementItemQuantity;
        existing.items.push(norm);
      } else {
        const available = this.reproItems().find(
          item => item.reproCode === norm.norm.elementItemCode
        )?.quantity;

        groupedMap.set(norm.norm.elementItemCode, {
          elementItemCode: norm.norm.elementItemCode,
          elementItemName: norm.norm.elementItemName,
          elementItemUnitOfMeasure: norm.norm.elementItemUnitOfMeasure,
          totalQuantity: norm.totalNeededBox * norm.norm.elementItemQuantity,
          availableQuantity: available ?? 0,
          items: [norm]
        });
      }
    });

    return groupedMap;
  }

  private groupSupplyItems(items: SupplyItem[]): GroupedSupplyItem[] {
    const norms = items.flatMap(item => this.processSupplyItem(item));
    
    const groupedMap = this.buildGroupedMap(norms);
    console.log('Grouped supply items:', Array.from(groupedMap.values()));
    return Array.from(groupedMap.values());
  }
}
