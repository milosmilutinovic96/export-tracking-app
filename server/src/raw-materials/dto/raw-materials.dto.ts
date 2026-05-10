import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";


export class CreateReproItemDto {
    
        @IsString()
        @IsNotEmpty()
        reproCode: string;

        @IsString()
        @IsOptional()
        reproName: string;
    
        @IsString()
        @IsOptional()
        reproUnitOfMeasure: string;
    
        @IsNumber()
        @IsNotEmpty()
        quantity: number;
}