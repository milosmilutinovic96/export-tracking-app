import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OrderItem, OrderItemDocument } from "./order-item.schema";
import { Model, Types } from "mongoose";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";
import { Norm, NormDocument } from "src/norms/norm.schema";
import { Product, ProductDocument } from "src/products/product.schema";
import { ProductAndNorms, ProductAndNormsDocument } from "src/products/productWithNorms.schema";


@Injectable()
export class OrderItemsService {
    constructor(
        @InjectModel(OrderItem.name) private orderItemsModel: Model<OrderItemDocument>,
        @InjectModel(ProductAndNorms.name) private productAndNormsModel: Model<ProductAndNormsDocument>
    ) { }

    async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
        const productCode = createOrderItemDto.productCode;
        const product = await this.productAndNormsModel.findOne(
            { productCode }
        ).exec();
        if (!product) {
            throw new NotFoundException(`Product not found!`);
        }
        const tmpOrderItem = { ...createOrderItemDto };
        tmpOrderItem.productId = product._id;
        tmpOrderItem.orderId = new Types.ObjectId(createOrderItemDto.orderId);
        const createdOrderItem = new this.orderItemsModel(tmpOrderItem);
        return (await createdOrderItem.save()).populate('productId');
    }
    async createMultiple(createOrderItemDto: CreateOrderItemDto[]): Promise<OrderItem[]> {
        const newOrderItems: OrderItem[] = [];
        console.log('arrbub', createOrderItemDto);
        for (const orderItem of createOrderItemDto) {
            const productCode = orderItem.productCode;
            const product = await this.productAndNormsModel.findOne(
                { productCode }
            ).exec();
            if (!product) {
                throw new NotFoundException(`Product not found!`);
            }
            const tmpOrderItem: Partial<OrderItem> = {};
            tmpOrderItem.productCode = product.productCode;
            tmpOrderItem.numberOfOrderedTp = orderItem.numberOfOrderedTp;
            tmpOrderItem.numberOfReadyTp = 0;
            tmpOrderItem.productId = product._id;
            tmpOrderItem.orderId = new Types.ObjectId(orderItem.orderId);
            const createdOrderItem = new this.orderItemsModel(tmpOrderItem);
            console.log('this.bub', createdOrderItem);
            const tmpItem = (await createdOrderItem.save()).populate('productId');
            newOrderItems.push(tmpItem as any);
        }
        return newOrderItems;

    }

    async findAll(orderId: string): Promise<OrderItem[]> {
        const objectId = new Types.ObjectId(orderId);
        return this.orderItemsModel.find({ orderId: objectId }).populate('productId').exec();
    }

    async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
        const orderItemForUpdate = { ...updateOrderItemDto };
        console.log(orderItemForUpdate);
        orderItemForUpdate.orderId = new Types.ObjectId(orderItemForUpdate.orderId);
        console.log(orderItemForUpdate);


        const updatedOrderItem = await this.orderItemsModel
            .findByIdAndUpdate(id, orderItemForUpdate, { returnDocument: 'after' })
            .exec();

        if (!updatedOrderItem) {
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        console.log(updatedOrderItem);
        return this.orderItemsModel
            .findById(updatedOrderItem._id)
            .populate('productId')
            .exec();
    }

    async delete(id: string): Promise<OrderItem> {
        const deletedOrderItem = await this.orderItemsModel.findByIdAndDelete(id).exec();

        if (!deletedOrderItem) {
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        return deletedOrderItem;
    }
}