<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * [B4] Recurso de API de un equipo.
 *
 * Forma exacta del contrato. costo_interno, created_at y updated_at
 * no se incluyen. La categoría solo aparece si la relación está cargada.
 */
class EquipoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'codigo'            => $this->codigo,
            'nombre'            => $this->nombre,
            'estado'            => $this->estado,
            'fecha_adquisicion' => $this->fecha_adquisicion?->format('Y-m-d'),
            'categoria'         => new CategoriaResource($this->whenLoaded('categoria')),
        ];
    }
}
