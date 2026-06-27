import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaService } from '../services/empresa.service';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Empresa')
@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Crear empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada' })
  create(@Body() dto: CreateEmpresaDto) {
    return this.empresaService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar empresas activas' })
  findAll() {
    return this.empresaService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener empresa por ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.empresaService.findOne(id);
  }

  @ApiBearerAuth('JWT')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar empresa' })
  @ApiParam({ name: 'id', type: String })
  update(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    return this.empresaService.update(id, dto);
  }

  @ApiBearerAuth('JWT')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar empresa (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.empresaService.remove(id);
  }
}
