import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class InvoiceItemDto {
  @IsString()
  @MinLength(1)
  description!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}
