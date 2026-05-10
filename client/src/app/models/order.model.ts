import { Customer } from "./customer.model";


export type Order = {
    id: string;
    customerId: string | Customer;
    orderNo: string;
    orderName: string;
    orderDate: Date;
    deliveryDate: Date;
    deliveryDateFromProduction: {date: Date, comment: string}
    state: 'created' | 'loading' | 'delivered';
    loadedOn?: {date: Date, comment: string};
}