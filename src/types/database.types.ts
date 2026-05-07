export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      actividades: {
        Row: {
          cliente_id: string | null
          created_at: string
          descripcion: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          org_id: string
          poliza_id: string | null
          siniestro_id: string | null
          tipo: Database["public"]["Enums"]["tipo_actividad"]
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          org_id: string
          poliza_id?: string | null
          siniestro_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_actividad"]
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          org_id?: string
          poliza_id?: string | null
          siniestro_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_actividad"]
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actividades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "actividades_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: false
            referencedRelation: "polizas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: false
            referencedRelation: "v_polizas_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_siniestro_id_fkey"
            columns: ["siniestro_id"]
            isOneToOne: false
            referencedRelation: "siniestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aseguradoras: {
        Row: {
          activo: boolean
          codigo: string | null
          contacto: string | null
          created_at: string
          cuit: string | null
          email: string | null
          id: string
          nombre: string
          org_id: string
          telefono: string | null
        }
        Insert: {
          activo?: boolean
          codigo?: string | null
          contacto?: string | null
          created_at?: string
          cuit?: string | null
          email?: string | null
          id?: string
          nombre: string
          org_id: string
          telefono?: string | null
        }
        Update: {
          activo?: boolean
          codigo?: string | null
          contacto?: string | null
          created_at?: string
          cuit?: string | null
          email?: string | null
          id?: string
          nombre?: string
          org_id?: string
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aseguradoras_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          apellido: string | null
          codigo_postal: string | null
          created_at: string
          cuit_cuil: string | null
          cuit_empresa: string | null
          dni: string | null
          domicilio: string | null
          email: string | null
          estado: Database["public"]["Enums"]["estado_cliente"]
          estado_civil: string | null
          fecha_nacimiento: string | null
          id: string
          localidad: string | null
          nombre: string | null
          nombre_busqueda: string | null
          notas: string | null
          org_id: string
          productor_id: string | null
          provincia: string | null
          razon_social: string | null
          tags: string[] | null
          telefono: string | null
          telefono_alt: string | null
          tipo_persona: Database["public"]["Enums"]["tipo_persona"]
          updated_at: string
        }
        Insert: {
          apellido?: string | null
          codigo_postal?: string | null
          created_at?: string
          cuit_cuil?: string | null
          cuit_empresa?: string | null
          dni?: string | null
          domicilio?: string | null
          email?: string | null
          estado?: Database["public"]["Enums"]["estado_cliente"]
          estado_civil?: string | null
          fecha_nacimiento?: string | null
          id?: string
          localidad?: string | null
          nombre?: string | null
          nombre_busqueda?: string | null
          notas?: string | null
          org_id: string
          productor_id?: string | null
          provincia?: string | null
          razon_social?: string | null
          tags?: string[] | null
          telefono?: string | null
          telefono_alt?: string | null
          tipo_persona?: Database["public"]["Enums"]["tipo_persona"]
          updated_at?: string
        }
        Update: {
          apellido?: string | null
          codigo_postal?: string | null
          created_at?: string
          cuit_cuil?: string | null
          cuit_empresa?: string | null
          dni?: string | null
          domicilio?: string | null
          email?: string | null
          estado?: Database["public"]["Enums"]["estado_cliente"]
          estado_civil?: string | null
          fecha_nacimiento?: string | null
          id?: string
          localidad?: string | null
          nombre?: string | null
          nombre_busqueda?: string | null
          notas?: string | null
          org_id?: string
          productor_id?: string | null
          provincia?: string | null
          razon_social?: string | null
          tags?: string[] | null
          telefono?: string | null
          telefono_alt?: string | null
          tipo_persona?: Database["public"]["Enums"]["tipo_persona"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_productor_id_fkey"
            columns: ["productor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_doc"]
          cliente_id: string | null
          created_at: string
          id: string
          mime_type: string | null
          nombre_archivo: string
          nota: string | null
          org_id: string
          poliza_id: string | null
          siniestro_id: string | null
          size_bytes: number | null
          storage_bucket: string
          storage_path: string
          subido_por: string | null
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["categoria_doc"]
          cliente_id?: string | null
          created_at?: string
          id?: string
          mime_type?: string | null
          nombre_archivo: string
          nota?: string | null
          org_id: string
          poliza_id?: string | null
          siniestro_id?: string | null
          size_bytes?: number | null
          storage_bucket?: string
          storage_path: string
          subido_por?: string | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_doc"]
          cliente_id?: string | null
          created_at?: string
          id?: string
          mime_type?: string | null
          nombre_archivo?: string
          nota?: string | null
          org_id?: string
          poliza_id?: string | null
          siniestro_id?: string | null
          size_bytes?: number | null
          storage_bucket?: string
          storage_path?: string
          subido_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "documentos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: false
            referencedRelation: "polizas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: false
            referencedRelation: "v_polizas_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_siniestro_id_fkey"
            columns: ["siniestro_id"]
            isOneToOne: false
            referencedRelation: "siniestros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_subido_por_fkey"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cliente_id: string | null
          created_at: string
          email: string | null
          etapa: Database["public"]["Enums"]["etapa_lead"]
          fecha_proxima: string | null
          id: string
          nombre: string
          notas: string | null
          org_id: string
          origen: string | null
          perdido_motivo: string | null
          productor_id: string | null
          proxima_accion: string | null
          ramo_interes: Database["public"]["Enums"]["ramo_seguro"] | null
          telefono: string | null
          updated_at: string
          valor_estimado: number | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          email?: string | null
          etapa?: Database["public"]["Enums"]["etapa_lead"]
          fecha_proxima?: string | null
          id?: string
          nombre: string
          notas?: string | null
          org_id: string
          origen?: string | null
          perdido_motivo?: string | null
          productor_id?: string | null
          proxima_accion?: string | null
          ramo_interes?: Database["public"]["Enums"]["ramo_seguro"] | null
          telefono?: string | null
          updated_at?: string
          valor_estimado?: number | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          email?: string | null
          etapa?: Database["public"]["Enums"]["etapa_lead"]
          fecha_proxima?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          org_id?: string
          origen?: string | null
          perdido_motivo?: string | null
          productor_id?: string | null
          proxima_accion?: string | null
          ramo_interes?: Database["public"]["Enums"]["ramo_seguro"] | null
          telefono?: string | null
          updated_at?: string
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_productor_id_fkey"
            columns: ["productor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_config: {
        Row: {
          color_marca: string | null
          dias_aviso_vencimiento: number
          moneda: string
          org_id: string
          updated_at: string
          zona_horaria: string
        }
        Insert: {
          color_marca?: string | null
          dias_aviso_vencimiento?: number
          moneda?: string
          org_id: string
          updated_at?: string
          zona_horaria?: string
        }
        Update: {
          color_marca?: string | null
          dias_aviso_vencimiento?: number
          moneda?: string
          org_id?: string
          updated_at?: string
          zona_horaria?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_config_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      org_usuarios: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          org_id: string
          rol: Database["public"]["Enums"]["rol_usuario"]
          usuario_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          org_id: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          usuario_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          org_id?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_usuarios_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizaciones: {
        Row: {
          activo: boolean
          created_at: string
          cuit: string | null
          direccion: string | null
          email: string | null
          id: string
          logo_url: string | null
          matricula_ssn: string | null
          nombre: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          cuit?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          matricula_ssn?: string | null
          nombre: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          cuit?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          matricula_ssn?: string | null
          nombre?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          apellido: string
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nombre: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          apellido: string
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          nombre: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          apellido?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      polizas: {
        Row: {
          aseguradora_id: string | null
          cliente_id: string
          created_at: string
          endoso: string | null
          estado: Database["public"]["Enums"]["estado_poliza"]
          fecha_emision: string
          id: string
          impuestos: number
          motivo_baja: string | null
          notas: string | null
          numero_poliza: string
          org_id: string
          periodicidad: Database["public"]["Enums"]["periodicidad"]
          prima_neta: number
          prima_total: number | null
          productor_id: string | null
          ramo: Database["public"]["Enums"]["ramo_seguro"]
          suma_asegurada: number | null
          updated_at: string
          vigencia_desde: string
          vigencia_hasta: string
        }
        Insert: {
          aseguradora_id?: string | null
          cliente_id: string
          created_at?: string
          endoso?: string | null
          estado?: Database["public"]["Enums"]["estado_poliza"]
          fecha_emision: string
          id?: string
          impuestos?: number
          motivo_baja?: string | null
          notas?: string | null
          numero_poliza: string
          org_id: string
          periodicidad?: Database["public"]["Enums"]["periodicidad"]
          prima_neta?: number
          prima_total?: number | null
          productor_id?: string | null
          ramo: Database["public"]["Enums"]["ramo_seguro"]
          suma_asegurada?: number | null
          updated_at?: string
          vigencia_desde: string
          vigencia_hasta: string
        }
        Update: {
          aseguradora_id?: string | null
          cliente_id?: string
          created_at?: string
          endoso?: string | null
          estado?: Database["public"]["Enums"]["estado_poliza"]
          fecha_emision?: string
          id?: string
          impuestos?: number
          motivo_baja?: string | null
          notas?: string | null
          numero_poliza?: string
          org_id?: string
          periodicidad?: Database["public"]["Enums"]["periodicidad"]
          prima_neta?: number
          prima_total?: number | null
          productor_id?: string | null
          ramo?: Database["public"]["Enums"]["ramo_seguro"]
          suma_asegurada?: number | null
          updated_at?: string
          vigencia_desde?: string
          vigencia_hasta?: string
        }
        Relationships: [
          {
            foreignKeyName: "polizas_aseguradora_id_fkey"
            columns: ["aseguradora_id"]
            isOneToOne: false
            referencedRelation: "aseguradoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "polizas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_productor_id_fkey"
            columns: ["productor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polizas_accidentes: {
        Row: {
          actividad_cubierta: string | null
          asistencia_medica: number | null
          capital_invalidez: number | null
          capital_muerte: number | null
          horario_cobertura: string | null
          poliza_id: string
        }
        Insert: {
          actividad_cubierta?: string | null
          asistencia_medica?: number | null
          capital_invalidez?: number | null
          capital_muerte?: number | null
          horario_cobertura?: string | null
          poliza_id: string
        }
        Update: {
          actividad_cubierta?: string | null
          asistencia_medica?: number | null
          capital_invalidez?: number | null
          capital_muerte?: number | null
          horario_cobertura?: string | null
          poliza_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "polizas_accidentes_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "polizas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_accidentes_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "v_polizas_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_accidentes_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["id"]
          },
        ]
      }
      polizas_art: {
        Row: {
          actividad_ciiu: string | null
          alicuota: number | null
          cantidad_empleados: number | null
          cuit_empleador: string | null
          masa_salarial: number | null
          poliza_id: string
          razon_social: string | null
          tipo_contrato: string | null
        }
        Insert: {
          actividad_ciiu?: string | null
          alicuota?: number | null
          cantidad_empleados?: number | null
          cuit_empleador?: string | null
          masa_salarial?: number | null
          poliza_id: string
          razon_social?: string | null
          tipo_contrato?: string | null
        }
        Update: {
          actividad_ciiu?: string | null
          alicuota?: number | null
          cantidad_empleados?: number | null
          cuit_empleador?: string | null
          masa_salarial?: number | null
          poliza_id?: string
          razon_social?: string | null
          tipo_contrato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polizas_art_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "polizas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_art_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "v_polizas_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_art_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["id"]
          },
        ]
      }
      polizas_automotor: {
        Row: {
          anio: number | null
          cero_km: boolean | null
          chasis: string | null
          color: string | null
          gnc: boolean | null
          marca: string | null
          modelo: string | null
          motor: string | null
          patente: string | null
          poliza_id: string
          tipo_cobertura: string | null
          uso: string | null
          valor_venal: number | null
          version: string | null
        }
        Insert: {
          anio?: number | null
          cero_km?: boolean | null
          chasis?: string | null
          color?: string | null
          gnc?: boolean | null
          marca?: string | null
          modelo?: string | null
          motor?: string | null
          patente?: string | null
          poliza_id: string
          tipo_cobertura?: string | null
          uso?: string | null
          valor_venal?: number | null
          version?: string | null
        }
        Update: {
          anio?: number | null
          cero_km?: boolean | null
          chasis?: string | null
          color?: string | null
          gnc?: boolean | null
          marca?: string | null
          modelo?: string | null
          motor?: string | null
          patente?: string | null
          poliza_id?: string
          tipo_cobertura?: string | null
          uso?: string | null
          valor_venal?: number | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polizas_automotor_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "polizas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_automotor_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "v_polizas_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_automotor_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["id"]
          },
        ]
      }
      polizas_hogar: {
        Row: {
          capital_contenido: number | null
          capital_edificio: number | null
          coberturas: string[] | null
          domicilio_riesgo: string | null
          poliza_id: string
          superficie_m2: number | null
          tipo_bien: string | null
          tipo_construccion: string | null
        }
        Insert: {
          capital_contenido?: number | null
          capital_edificio?: number | null
          coberturas?: string[] | null
          domicilio_riesgo?: string | null
          poliza_id: string
          superficie_m2?: number | null
          tipo_bien?: string | null
          tipo_construccion?: string | null
        }
        Update: {
          capital_contenido?: number | null
          capital_edificio?: number | null
          coberturas?: string[] | null
          domicilio_riesgo?: string | null
          poliza_id?: string
          superficie_m2?: number | null
          tipo_bien?: string | null
          tipo_construccion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polizas_hogar_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "polizas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_hogar_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "v_polizas_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_hogar_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["id"]
          },
        ]
      }
      polizas_vida: {
        Row: {
          beneficiarios: Json | null
          capital_asegurado: number | null
          fecha_nacimiento: string | null
          fumador: boolean | null
          plan: string | null
          poliza_id: string
          profesion: string | null
          tipo_vida: string | null
        }
        Insert: {
          beneficiarios?: Json | null
          capital_asegurado?: number | null
          fecha_nacimiento?: string | null
          fumador?: boolean | null
          plan?: string | null
          poliza_id: string
          profesion?: string | null
          tipo_vida?: string | null
        }
        Update: {
          beneficiarios?: Json | null
          capital_asegurado?: number | null
          fecha_nacimiento?: string | null
          fumador?: boolean | null
          plan?: string | null
          poliza_id?: string
          profesion?: string | null
          tipo_vida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polizas_vida_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "polizas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_vida_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "v_polizas_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_vida_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: true
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["id"]
          },
        ]
      }
      renovaciones: {
        Row: {
          canal_aviso: string | null
          cliente_id: string
          created_at: string
          created_by: string | null
          estado: string
          fecha_aviso: string | null
          fecha_vencimiento: string
          id: string
          notas: string | null
          org_id: string
          poliza_anterior_id: string
          poliza_nueva_id: string | null
        }
        Insert: {
          canal_aviso?: string | null
          cliente_id: string
          created_at?: string
          created_by?: string | null
          estado?: string
          fecha_aviso?: string | null
          fecha_vencimiento: string
          id?: string
          notas?: string | null
          org_id: string
          poliza_anterior_id: string
          poliza_nueva_id?: string | null
        }
        Update: {
          canal_aviso?: string | null
          cliente_id?: string
          created_at?: string
          created_by?: string | null
          estado?: string
          fecha_aviso?: string | null
          fecha_vencimiento?: string
          id?: string
          notas?: string | null
          org_id?: string
          poliza_anterior_id?: string
          poliza_nueva_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "renovaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "renovaciones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovaciones_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovaciones_poliza_anterior_id_fkey"
            columns: ["poliza_anterior_id"]
            isOneToOne: false
            referencedRelation: "polizas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovaciones_poliza_anterior_id_fkey"
            columns: ["poliza_anterior_id"]
            isOneToOne: false
            referencedRelation: "v_polizas_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovaciones_poliza_anterior_id_fkey"
            columns: ["poliza_anterior_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovaciones_poliza_nueva_id_fkey"
            columns: ["poliza_nueva_id"]
            isOneToOne: false
            referencedRelation: "polizas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovaciones_poliza_nueva_id_fkey"
            columns: ["poliza_nueva_id"]
            isOneToOne: false
            referencedRelation: "v_polizas_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renovaciones_poliza_nueva_id_fkey"
            columns: ["poliza_nueva_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["id"]
          },
        ]
      }
      siniestros: {
        Row: {
          cliente_id: string
          created_at: string
          created_by: string | null
          descripcion: string
          estado: Database["public"]["Enums"]["estado_siniestro"]
          fecha_denuncia: string
          fecha_ocurrencia: string
          fecha_pago: string | null
          id: string
          liquidador: string | null
          lugar_ocurrencia: string | null
          monto_liquidado: number | null
          monto_reclamado: number | null
          numero_siniestro: string | null
          observaciones: string | null
          org_id: string
          poliza_id: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          created_by?: string | null
          descripcion: string
          estado?: Database["public"]["Enums"]["estado_siniestro"]
          fecha_denuncia?: string
          fecha_ocurrencia: string
          fecha_pago?: string | null
          id?: string
          liquidador?: string | null
          lugar_ocurrencia?: string | null
          monto_liquidado?: number | null
          monto_reclamado?: number | null
          numero_siniestro?: string | null
          observaciones?: string | null
          org_id: string
          poliza_id: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string
          estado?: Database["public"]["Enums"]["estado_siniestro"]
          fecha_denuncia?: string
          fecha_ocurrencia?: string
          fecha_pago?: string | null
          id?: string
          liquidador?: string | null
          lugar_ocurrencia?: string | null
          monto_liquidado?: number | null
          monto_reclamado?: number | null
          numero_siniestro?: string | null
          observaciones?: string | null
          org_id?: string
          poliza_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "siniestros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "siniestros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "siniestros_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "siniestros_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "siniestros_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: false
            referencedRelation: "polizas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "siniestros_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: false
            referencedRelation: "v_polizas_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "siniestros_poliza_id_fkey"
            columns: ["poliza_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_polizas_detalle: {
        Row: {
          aseguradora_id: string | null
          aseguradora_nombre: string | null
          cliente_dni: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          cliente_telefono: string | null
          created_at: string | null
          dias_para_vencer: number | null
          endoso: string | null
          estado: Database["public"]["Enums"]["estado_poliza"] | null
          fecha_emision: string | null
          id: string | null
          impuestos: number | null
          motivo_baja: string | null
          notas: string | null
          numero_poliza: string | null
          org_id: string | null
          periodicidad: Database["public"]["Enums"]["periodicidad"] | null
          prima_neta: number | null
          prima_total: number | null
          productor_id: string | null
          productor_nombre: string | null
          ramo: Database["public"]["Enums"]["ramo_seguro"] | null
          suma_asegurada: number | null
          updated_at: string | null
          vigencia_desde: string | null
          vigencia_hasta: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polizas_aseguradora_id_fkey"
            columns: ["aseguradora_id"]
            isOneToOne: false
            referencedRelation: "aseguradoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_vencimientos_proximos"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "polizas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_productor_id_fkey"
            columns: ["productor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_resumen_productor: {
        Row: {
          org_id: string | null
          polizas_vigentes: number | null
          por_vencer: number | null
          prima_total_vigente: number | null
          productor_id: string | null
          productor_nombre: string | null
          ramo: Database["public"]["Enums"]["ramo_seguro"] | null
          vencidas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "polizas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polizas_productor_id_fkey"
            columns: ["productor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_vencimientos_proximos: {
        Row: {
          aseguradora_nombre: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          cliente_telefono: string | null
          dias_restantes: number | null
          estado: Database["public"]["Enums"]["estado_poliza"] | null
          id: string | null
          numero_poliza: string | null
          org_id: string | null
          prima_total: number | null
          ramo: Database["public"]["Enums"]["ramo_seguro"] | null
          vigencia_hasta: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polizas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      actualizar_estado_polizas: { Args: never; Returns: undefined }
      mi_rol: {
        Args: { p_org_id: string }
        Returns: Database["public"]["Enums"]["rol_usuario"]
      }
      mis_orgs: { Args: never; Returns: string[] }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      categoria_doc:
        | "poliza"
        | "endoso"
        | "foto_vehiculo"
        | "denuncia_siniestro"
        | "dni"
        | "cuit"
        | "factura"
        | "liquidacion"
        | "otro"
      estado_cliente: "activo" | "inactivo" | "prospecto" | "baja"
      estado_poliza:
        | "vigente"
        | "por_vencer"
        | "vencida"
        | "cancelada"
        | "suspendida"
        | "siniestro"
        | "en_tramite"
      estado_siniestro:
        | "denunciado"
        | "en_instruccion"
        | "periciado"
        | "aprobado"
        | "rechazado"
        | "pagado"
        | "cerrado"
      etapa_lead:
        | "contactado"
        | "cotizado"
        | "negociacion"
        | "ganado"
        | "perdido"
        | "descartado"
      periodicidad: "mensual" | "trimestral" | "semestral" | "anual"
      ramo_seguro:
        | "automotor"
        | "vida"
        | "accidentes_personales"
        | "hogar"
        | "combinado_familiar"
        | "art"
        | "otros"
      rol_usuario: "admin" | "productor" | "asistente"
      tipo_actividad:
        | "nota"
        | "llamada"
        | "email"
        | "reunion"
        | "whatsapp"
        | "poliza_emitida"
        | "poliza_renovada"
        | "siniestro_denunciado"
        | "documento_subido"
        | "estado_cambiado"
        | "otro"
      tipo_persona: "fisica" | "juridica"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_doc: [
        "poliza",
        "endoso",
        "foto_vehiculo",
        "denuncia_siniestro",
        "dni",
        "cuit",
        "factura",
        "liquidacion",
        "otro",
      ],
      estado_cliente: ["activo", "inactivo", "prospecto", "baja"],
      estado_poliza: [
        "vigente",
        "por_vencer",
        "vencida",
        "cancelada",
        "suspendida",
        "siniestro",
        "en_tramite",
      ],
      estado_siniestro: [
        "denunciado",
        "en_instruccion",
        "periciado",
        "aprobado",
        "rechazado",
        "pagado",
        "cerrado",
      ],
      etapa_lead: [
        "contactado",
        "cotizado",
        "negociacion",
        "ganado",
        "perdido",
        "descartado",
      ],
      periodicidad: ["mensual", "trimestral", "semestral", "anual"],
      ramo_seguro: [
        "automotor",
        "vida",
        "accidentes_personales",
        "hogar",
        "combinado_familiar",
        "art",
        "otros",
      ],
      rol_usuario: ["admin", "productor", "asistente"],
      tipo_actividad: [
        "nota",
        "llamada",
        "email",
        "reunion",
        "whatsapp",
        "poliza_emitida",
        "poliza_renovada",
        "siniestro_denunciado",
        "documento_subido",
        "estado_cambiado",
        "otro",
      ],
      tipo_persona: ["fisica", "juridica"],
    },
  },
} as const
