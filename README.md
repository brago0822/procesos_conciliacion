# Calculadora de Términos de Conciliación

Esta app web básica permite calcular las fechas de términos de procesos de conciliación automáticamente desde la fecha establecida como inicial para el trámite.

The version working is the one inside folder *current*

## Secciones principales

### 1. Configurar procesos  
Permite ver, crear, actualizar y borrar diferentes procesos a tener en cuenta en el cálculo de fechas.  
Cada proceso tiene una cantidad de días hábiles configurada.

### 2. Gestión de festivos  
Permite ver el listado de festivos de Colombia para el 2025 y agregar nuevos si es necesario.  
Los que se agreguen nuevos se pueden editar y eliminar.

### 3. Calcular fechas (Calcular términos)  
Parte principal de la aplicación: con solo ingresar una fecha de inicio del trámite, se podrán calcular todas las fechas de cada uno de los procesos configurados.

---

## Nota  
Se tienen datos por defecto en el código, sin embargo, la información agregada o modificada se guarda y actualiza en el **localStorage**.