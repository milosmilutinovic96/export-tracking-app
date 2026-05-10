import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Repro } from "../models/repro.model";
import { firstValueFrom } from "rxjs";


@Injectable({
    providedIn: 'root',
})
export class RawMaterialsService {
    http = inject(HttpClient);

    async findAllRawMaterials(): Promise<Repro[]> {
        const rawMaterials$ = this.http.get<Repro[]>(`/api/raw-materials`);
        return firstValueFrom(rawMaterials$);
    }

    async createRepro(repro: Partial<Repro>): Promise<Repro> {
        const repro$ = this.http.post<Repro>('/api/raw-materials', repro);
        return firstValueFrom(repro$);
    }

    async updateRepro(reproId: string, changes: Partial<Repro>): Promise<Repro> {
        const updatedRepro$ = this.http.patch<Repro>(`/api/raw-materials/${reproId}`, changes);
        return firstValueFrom(updatedRepro$);
    }

    async deleteOrderItem(reproId: string) {
        const deletedRepro$ = this.http.delete(`/api/raw-materials/${reproId}`);
        return firstValueFrom(deletedRepro$);
    }
}