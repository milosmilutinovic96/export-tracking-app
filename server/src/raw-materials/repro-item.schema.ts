import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class ReproItem {
    @Prop({required: true})
    reproCode: string;

    @Prop({required: true})
    reproName: string;

    @Prop({required: true})
    reproUnitOfMeasure: string;

    @Prop({required: true})
    quantity: number;
}

export type ReproItemDocument = HydratedDocument<ReproItem>;
export const ReproItemSchema = SchemaFactory.createForClass(ReproItem);
