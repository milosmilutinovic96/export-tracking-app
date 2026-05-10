import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderItem, OrderItemSchema } from "./order-item.schema";
import { OrderItemsController } from "./order-items.controller";
import { OrderItemsService } from "./order-items.service";
import { Norm, NormSchema } from "src/norms/norm.schema";
import { Product, ProductSchema } from "src/products/product.schema";
import { ProductAndNorms, ProductAndNormsSchema } from "src/products/productWithNorms.schema";


@Module({
    imports: [
        MongooseModule.forFeature([{name: OrderItem.name, schema: OrderItemSchema}]),
        MongooseModule.forFeature([{name: ProductAndNorms.name, schema: ProductAndNormsSchema}])
    ],
    controllers: [OrderItemsController],
    providers: [OrderItemsService]
})
export class OrderItemsModule {}