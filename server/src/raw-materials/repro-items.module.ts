import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Norm, NormSchema } from "src/norms/norm.schema";
import { ReproItem, ReproItemSchema } from "./repro-item.schema";
import { ReproItemsController } from "./repro-items.controller";
import { ReproItemsService } from "./repro-items.service";


@Module({
    imports: [
        MongooseModule.forFeature([{name: ReproItem.name, schema: ReproItemSchema}]),
        MongooseModule.forFeature([{name: Norm.name, schema: NormSchema}])
    ],
    controllers: [ReproItemsController],
    providers: [ReproItemsService]
})
export class ReproItemsModule {}