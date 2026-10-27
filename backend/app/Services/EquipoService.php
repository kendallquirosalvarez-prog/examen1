<?php

namespace App\Services;

use App\Exceptions\ReglaNegocioException;
use App\Models\Equipo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EquipoService
{
    // lista paginada con la categoria cargada y filtros por q y estado
    public function listar(?string $q, ?string $estado, int $porPagina): LengthAwarePaginator
    {
        return Equipo::query()
            ->with('categoria')
            ->when($q, function ($query, $q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('codigo', 'like', "%{$q}%")
                        ->orWhere('nombre', 'like', "%{$q}%");
                });
            })
            ->when($estado, fn ($query, $estado) => $query->where('estado', $estado))
            ->orderBy('codigo')
            ->paginate($porPagina);
    }

    // crea el equipo y lo devuelve con su categoria
    public function crear(array $datos): Equipo
    {
        return Equipo::create($datos)->load('categoria');
    }

    // actualiza y devuelve el equipo con su categoria
    public function actualizar(Equipo $equipo, array $datos): Equipo
    {
        $equipo->update($datos);

        return $equipo->load('categoria');
    }

    public function eliminar(Equipo $equipo): void
    {
        // R1
        if ($equipo->estado === 'prestado') {
            throw new ReglaNegocioException('No se puede eliminar un equipo prestado.');
        }

        $equipo->delete();
    }

    public function prestar(Equipo $equipo): Equipo
    {
        // R2
        if ($equipo->estado === 'mantenimiento') {
            throw new ReglaNegocioException('No se puede prestar un equipo en mantenimiento.');
        }

        if ($equipo->estado === 'prestado') {
            throw new ReglaNegocioException('El equipo ya se encuentra prestado.');
        }

        // si esta disponible se marca como prestado
        $equipo->update(['estado' => 'prestado']);

        return $equipo->load('categoria');
    }
}
