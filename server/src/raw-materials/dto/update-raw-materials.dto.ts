import { PartialType } from "@nestjs/mapped-types";
import { CreateReproItemDto } from "./raw-materials.dto";



export class UpdateReproItemDto extends PartialType(CreateReproItemDto) {}