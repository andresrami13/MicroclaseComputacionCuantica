# Link para la presentación computación cuantica

https://udistritaleduco-my.sharepoint.com/:p:/g/personal/anramirezv_udistrital_edu_co/IQA4iR0JLaHiT4_lvbojLKUYAWvqUpIeTtRMouBhmhMOlJQ?rtime=KEnVvher3kg

# Link para el Quantic Composer de IBM

https://quantum.cloud.ibm.com/composer

# Link para la App Interactiva microclase computacion cuantica

https://microclase-computacion-cuantica.vercel.app/

# 🧪 App Interactiva de Computación Cuántica

Guía rápida para estudiantes · Objetivo final: construir un **Estado de Bell** en 
IBM Quantum Composer.

---

## ¿Cómo usar la app?

Primero entras al link https://microclase-computacion-cuantica.vercel.app/

La app tiene **4 módulos** que debes recorrer en orden. Cada uno te prepara para el siguiente, y 
todos apuntan al mismo destino: que cuando abras IBM Quantum Composer, ya sepas exactamente qué estás viendo y qué vas a hacer.

---

## Módulo 1 — Bit vs Qubit

**¿Qué haces aquí?**
Comparas cómo funciona un bit clásico (0 ó 1, sin más) contra un qubit, que puede estar en superposición antes de ser medido.

**Interacción:** Usa el toggle del bit clásico y luego presiona **"Medir"** en el qubit. 
Hazlo varias veces y observa cómo el resultado cambia.

**Lo que debes entender:** Un qubit no es 0 ni 1 hasta que lo mides. Esa es la diferencia fundamental.

---

## Módulo 2 — Visualizador de Superposición

**¿Qué haces aquí?**
Aplicas tu primera compuerta cuántica: la **compuerta Hadamard (H)**. Esta compuerta pone un qubit en 
superposición perfecta (50% de probabilidad de colapsar a 0, 50% a 1).

**Interacción:** Presiona **"Aplicar H"**, luego **"Medir"**. Repite varias veces. Fíjate en cómo el
 histograma se va equilibrando a medida que acumulas mediciones.

**Lo que debes entender:** La compuerta H es el primer paso para crear el Estado de Bell. En IBM Quantum Composer, 
es la primera puerta que vas a arrastrar.

---

## Módulo 3 — Constructor de Circuito

**¿Qué haces aquí?**
Armas el circuito del Estado de Bell completo: **H sobre q[0]**,
 luego **CNOT con control en q[0] y objetivo en q[1]**.

**Interacción:** Arrastra la compuerta H al qubit q[0] y luego arrastra CNOT. 
Observa cómo el circuito se ve casi idéntico al de IBM Quantum Composer.

**Lo que debes entender:** Esto es exactamente lo que vas a replicar en el Composer. 
La estética es parecida a propósito.

---

## Módulo 4 — Simulador de Shots

**¿Qué haces aquí?**
Ejecutas tu circuito y ves cómo el histograma se construye con múltiples repeticiones (shots).
 Un solo disparo no es suficiente para ver el patrón estadístico.

**Interacción:** Presiona **"Ejecutar"** con 1 shot primero, luego con 1024. 
Observa cómo el histograma converge a dos barras casi iguales: `00` y `11`.

**Lo que debes entender:** El resultado `00` y `11` con ~50% cada uno **es** el Estado de Bell. 
En IBM lo verás igual al ejecutar tu circuito.

---
> 💡 **Tip:** IBM usa notación *little-endian* — los qubits se leen de derecha a izquierda. El estado `01` significa `q[0] = 1, q[1] = 0`.
