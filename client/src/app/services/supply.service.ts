import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SupplyItem } from '../models/supply-item.model';
import { firstValueFrom } from 'rxjs';
import { Norm } from '../models/norm.model';

@Injectable({
  providedIn: 'root',
})
export class SupplyService {
  http = inject(HttpClient);

  async findAllItemsforOrder(orderId: string): Promise<SupplyItem[]> {
    const supplyItems$ = this.http.get<SupplyItem[]>(`/api/supply/${orderId}`);
    return firstValueFrom(supplyItems$);
  }

  async findAllItems(): Promise<SupplyItem[]> {
    const supplyItems$ = this.http.get<SupplyItem[]>(`/api/supply`);
    return firstValueFrom(supplyItems$);
  }

  async findNorms(normCode: string): Promise<Norm[]> {
    const norms$ = this.http.get<Norm[]>(`/api/norms/${normCode}`);
    return firstValueFrom(norms$);
  }
}
