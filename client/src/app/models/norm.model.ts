

export type Norm = {
    id: string;
    normCode: string;
    normUnitOfMeasure: string;
    elementType: string;
    elementWarehouseID: string;
    elementWarehouseName: string;
    elementItemCode: string;
    elementItemName: string;
    elementItemUnitOfMeasure: string;
    elementItemQuantity: number;
    regularNorms?: Norm[];
    norms202?: Norm[];
}