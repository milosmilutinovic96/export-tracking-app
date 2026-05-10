import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Product, ProductSchema } from "./product.schema";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { Norm, NormSchema } from "src/norms/norm.schema";
import { ProductAndNorms, ProductAndNormsSchema } from "./productWithNorms.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema},
            { name: Norm.name, schema: NormSchema},
            { name: ProductAndNorms.name, schema: ProductAndNormsSchema},
        ])
    ],
    controllers: [ProductsController],
    providers: [ProductsService]
})
export class ProductsModule {}