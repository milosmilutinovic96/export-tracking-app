import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Norm, NormDocument } from "./norm.schema";
import { Model } from "mongoose";

import { data } from "./output1";
import { CreateNormDto } from "./dto/create-norm.dto";


@Injectable()
export class NormsService {

    constructor(
        @InjectModel(Norm.name) private normModel: Model<NormDocument>
    ) {}

    async findAll(): Promise<Norm[]> {
        return this.normModel.find().exec();
    }

    // async save() {
    //     console.log(data.length);
    //     data.forEach(norm => {
    //         const newNorm: CreateNormDto = {
    //             elementItemCode: String(norm.elementItemCode),
    //             elementItemName: String(norm.elementItemName),
    //             elementItemQuantity: Number(norm.elementItemQuantity),
    //             elementItemUnitOfMeasure: String(norm.elementItemUnitOfMeasure),
    //             elementType: String(norm.elementType!),
    //             elementWarehouseID: String(norm.elementWarehouseID),
    //             elementWarehouseName: String(norm.elementWarehouseName),
    //             normCode: String(norm.normCode)
    //         };

    //         const createdNorm = new this.normModel(newNorm);
    //         createdNorm.save();
    //     });
    //     return this.normModel.find().exec;
    // }
}