import { Module } from "@nestjs/common";
import { SupplyService } from "./supply.service";
import { SupplyController } from "./supply.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "src/orders/schemas/order.schema";
import { Norm, NormSchema } from "src/norms/norm.schema";


@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Order.name, schema: OrderSchema},
            {name: Norm.name, schema: NormSchema},
        ]),
    ],
    providers: [SupplyService],
    controllers: [SupplyController]
})
export class SupplyModule {}