import {
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class InvoiceItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  description!: string;

  @IsNumber()
  @Min(0)
  @Max(1_000_000)
  quantity!: number;

  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  unitPrice!: number;
}
