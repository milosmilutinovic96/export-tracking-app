import { Controller, Get, Param } from "@nestjs/common";
import { SupplyService } from "./supply.service";

@Controller('supply')
export class SupplyController {

    constructor(private readonly supplyService: SupplyService) {}

    @Get(':orderId')
    async findAllForOrder(@Param('orderId') orderId: string) {
        const obj = await this.supplyService.findForOrder(orderId);
        return obj;
    }

    @Get()
    async findAll() {
        return await this.supplyService.findForAll();
    }
}