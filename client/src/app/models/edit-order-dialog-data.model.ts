import { Customer } from "./customer.model";
import { Order } from "./order.model";


export type EditOrderDialogData = {
    mode: 'create' | 'edit';
    title: string;
    order?: Order;
    customerId: string | Customer;
}