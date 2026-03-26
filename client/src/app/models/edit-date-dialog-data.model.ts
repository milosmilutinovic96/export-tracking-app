import { Order } from "./order.model";


export type EditDateDialogData = {
    title: string;
    order?: Order;
    customerId: string;
}