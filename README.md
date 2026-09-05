# Sample Tracker Pro

Objetivo del proyecto

Quiero construir la primera versión de una aplicación web para la gestión de un laboratorio de materiales.

Por ahora desarrolla únicamente el módulo de INGRESO DE MUESTRAS.
No desarrolles todavía módulos de ensayos, especímenes, máquina de compresión, informes ni programación.

La aplicación debe utilizar:

Supabase / PostgreSQL como base de datos.

n8n como sistema de automatización.

 Un webhook de n8n para procesar PDFs e imágenes mediante un servicio externo de OCR/IA.

 Lovable solamente como frontend y lógica de interacción.

Nunca expongas claves de API de Mistral ni otros servicios externos en el frontend. Lovable solamente debe comunicarse con n8n.

1. Estructura general de la aplicación

Crear una interfaz profesional, limpia y sencilla para un laboratorio.

Menú lateral:

 Inicio

 Ingresos

Por ahora solamente estos dos módulos deben funcionar.

En la página de Inicio mostrar:

 Total de ingresos

 Ingresos pendientes de revisión

 Ingresos aprobados

 Botón grande Nuevo ingreso

2. Página "Ingresos"

Mostrar una tabla con:

 Número de ingreso

 Fecha de recepción

 Código de proyecto

 Proyecto

 Cliente

 Ubicación

 Tipo de origen

 Estado

Permitir buscar por:

 Número de ingreso

 Código de proyecto

 Proyecto

 Cliente

Incluir botón:

+ Nuevo ingreso

3. Nuevo ingreso

Al crear un ingreso preguntar:

¿Cómo desea ingresar la información?

Mostrar tres opciones grandes:

Opción A

Llenar digitalmente

Opción B

Subir PDF

Opción C

Subir imagen

Los tres métodos deben terminar utilizando exactamente la misma estructura de datos.

4. Ingreso digital

Crear un formulario con estos campos:

 Fecha de remisión

 Fecha de recepción

 Código de proyecto

 Proyecto

 Cliente

 Ubicación

 Entregado por

 Recibido por

 Observaciones

Código de proyecto puede quedar vacío.

No inventar información automáticamente.

Mostrar al final:

Guardar y revisar

Antes de guardar definitivamente, mostrar una pantalla de revisión.

5. Ingreso mediante PDF o imagen

Permitir arrastrar o seleccionar:

 PDF

 JPG

 JPEG

 PNG

El archivo NO debe almacenarse permanentemente en Supabase Storage.

Debe utilizarse solamente temporalmente para enviarlo a n8n.

Al presionar:

Procesar documento

enviar el archivo mediante HTTP POST a un webhook de n8n.

Crear la integración dejando la URL del webhook como una variable configurable.

Enviar:

 archivo

 tipo_origen: pdf o imagen

Mientras se procesa mostrar:

Analizando documento...

6. Respuesta esperada de n8n

n8n devolverá JSON con esta estructura aproximada:

{
  "success": true,
  "data": {
    "fecha_remision": "2026-08-28",
    "codigo_proyecto": null,
    "proyecto": "Construcción de obra...",
    "cliente": "COVIUSES",
    "ubicacion": "Quebrada Arena, Siguatepeque",
    "entregado_por": "Juan Pérez",
    "recibido_por": "Eduardo M.",
    "observaciones_ingreso": ""
  },
  "confidence": 0.91,
  "warnings": []
}

Los campos pueden venir como null.

Si la IA no puede determinar un dato, debe mostrarse vacío.

Nunca sustituir un campo vacío inventando información.

7. Pantalla de revisión

Después de recibir el JSON, NO guardar automáticamente el ingreso definitivo.

Mostrar una pantalla:

Revisar ingreso

Todos los campos deben ser editables:

 Fecha de remisión

 Fecha de recepción

 Código de proyecto

 Proyecto

 Cliente

 Ubicación

 Entregado por

 Recibido por

 Observaciones

Si el documento proviene de OCR mostrar también:

 Confianza de extracción

 Advertencias devueltas por n8n

Resaltar visualmente los campos vacíos o con advertencias.

Botones:

Cancelar

Corregir

Aprobar ingreso

Solamente al presionar Aprobar ingreso se deben guardar los datos definitivos en Supabase.

8. Base de datos Supabase

Crear inicialmente solamente la tabla:

ingresos

Columnas:

ingreso_id
numero_ingreso
fecha_remision
fecha_recepcion
codigo_proyecto
proyecto
cliente
ubicacion
entregado_por
recibido_por
observaciones_ingreso
tipo_origen
estado_ingreso
confianza_extraccion
requiere_revision
revisado_por
fecha_revision
creado_en
actualizado_en

Tipos recomendados:

ingreso_id              uuid primary key
numero_ingreso          text unique
fecha_remision          date
fecha_recepcion         date
codigo_proyecto         text nullable
proyecto                text
cliente                 text
ubicacion               text
entregado_por           text nullable
recibido_por            text nullable
observaciones_ingreso   text nullable
tipo_origen             text
estado_ingreso          text
confianza_extraccion    numeric nullable
requiere_revision       boolean
revisado_por            text nullable
fecha_revision          timestamptz nullable
creado_en               timestamptz
actualizado_en          timestamptz

ingreso_id debe ser un UUID generado automáticamente por PostgreSQL/Supabase.

El usuario nunca escribe el ingreso_id.

9. Número visible del ingreso

Crear un número visible independiente del UUID:

ING-2026-00001
ING-2026-00002
ING-2026-00003

Debe generarse automáticamente al aprobar/guardar un ingreso.

El usuario no debe escribir este número.

Debe ser único.

No utilizar numero_ingreso como primary key. Las relaciones futuras deberán utilizar ingreso_id.

10. Estados

Utilizar inicialmente solamente:

borrador
pendiente_revision
aprobado
rechazado

Un documento procesado mediante OCR debe entrar primero como:

pendiente_revision

y solamente cambiar a:

aprobado

después de confirmación humana.

11. Reglas importantes

 No almacenar PDFs ni imágenes en la base de datos.

 No almacenar PDFs ni imágenes permanentemente en Supabase Storage.

 Los archivos solamente pasan temporalmente hacia n8n.

 Guardar únicamente datos estructurados.

 No construir todavía tablas de muestras, especímenes, ensayos ni resultados.

 No crear una tabla gigante pensando en futuros ensayos.

 No agregar campos que no hayan sido especificados sin consultarme.

 Preparar el diseño para agregar posteriormente tablas relacionadas.

 Utilizar nombres de columnas en español sin espacios y en snake_case.

 Mantener una separación clara entre interfaz, automatización y base de datos.

12. Flujo esperado

El flujo final de esta primera versión debe ser:

NUEVO INGRESO
      ↓
Digital / PDF / Imagen
      ↓
Si es PDF o imagen
      ↓
n8n
      ↓
OCR / IA
      ↓
JSON
      ↓
Lovable
      ↓
Revisión humana
      ↓
Aprobar ingreso
      ↓
Supabase

Primero construye solamente esta versión funcional.

Antes de ampliar el esquema de base de datos o crear nuevos módulos, consúltame.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/929593f9-56b5-421f-94d2-4a198c3d3e5b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
