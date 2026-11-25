---
layout: post
lang_code: es
locale: es_ES
ref: blackbox-optimization-with-vizier
date: 2023-02-23 00:00:00 -0700
last_modified_at: 2023-02-23 00:00
permalink: /es/blackbox-optimization-with-vizier
title: "Optimización de caja negra y ajuste de hiperparámetros con Vizier de Google"
imgpath: /assets/img/blackbox-optimization-with-vizier
previewurl: /black-box-optimization.png
description: "Un ejemplo práctico de optimización de caja negra con Google Vizier: definir parámetros condicionales, evaluar ensayos y ajustar un modelo a una señal ruidosa."
image: /assets/img/blackbox-optimization-with-vizier/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Entradas y salidas en la optimización de caja negra"
mathjax: true
tags: [machine-learning, optimization]
toc: true
---
{% include description.html content="Optimiza de forma automática e inteligente cualquier tipo de sistema" %}

<style>
img {
  max-height: 350px;
}
</style>

Cuando construyes un modelo de aprendizaje automático —o cualquier otro tipo de sistema algorítmico— tienes que tomar decisiones sobre la arquitectura de tu sistema. Por ejemplo, en una aplicación de aprendizaje automático, quizá necesites decidir cuántas neuronas incluir en una capa de una red neuronal o qué tasa usar en el descenso de gradiente. O si estás construyendo un [filtro de partículas](https://en.wikipedia.org/wiki/Particle_filter) para rastrear el estado de un robot, puede que debas elegir la forma de una función de verosimilitud. O tal vez busques un tamaño de búfer y un número de hilos que minimicen el uso de recursos computacionales. ¿Cómo puedes encontrar la arquitectura óptima para tu sistema?

Podrías intentar encontrarla manualmente. Puedes probar distintos valores para el número de neuronas. Puedes probar distintas tasas de descenso de gradiente. Pero ese proceso es lento, tedioso y propenso a errores. Por suerte, existen servicios capaces de optimizar tu sistema por ti de manera inteligente y eficiente.

<div class="divider"></div>

## Presentando Vizier

[Vizier](https://github.com/google/vizier) es un servicio de optimización creado en Google para la optimización de caja negra (*blackbox*) y el ajuste de hiperparámetros. Puede emplearse para optimizar cualquier tipo de sistema siempre que puedas pasarle entradas —sugeridas por Vizier— y obtener salidas —las métricas que Vizier intenta optimizar, maximizándolas o minimizándolas—. El propio sistema se trata como una caja negra.

![Optimización de caja negra]({{ "/black-box-optimization.png" | prepend: page.imgpath }}){: width="629" height="319" loading="lazy" decoding="async"}
{% include caption.html content="La optimización de caja negra no requiere comprender el sistema en sí, siempre que puedas pasarle entradas y obtener salidas. Fuente: Per Instance Algorithm Configuration for Continuous Black Box Optimization - Figura científica en ResearchGate. Disponible en: https://www.researchgate.net/figure/black-box-Optimization_fig1_322035981 [consultado el 23 de feb. de 2023]" %}

A diferencia de los sistemas de optimización que no son de caja negra, como el [descenso de gradiente](/es/gradient-descent), que exigen conocer la relación entre los parámetros del sistema y la métrica que se minimiza o maximiza, un sistema de caja negra como Vizier no requiere ninguna información interna sobre el sistema. Aun así, puede explorar el espacio de parámetros de manera eficiente y encontrar los valores que optimizan tu sistema. Esto también lo hace más robusto frente a funciones métricas complejas, discontinuas y no convexas.

<div class="divider"></div>

## Parámetros frente a hiperparámetros

Un paréntesis: esta distinción proviene de las aplicaciones de aprendizaje automático, donde los «parámetros» son los valores internos del modelo usados para la inferencia y hallados mediante el entrenamiento con un conjunto de datos, mientras que los hiperparámetros describen la arquitectura del modelo o el procedimiento de entrenamiento. Un servicio de optimización de caja negra como Vizier puede usarse para optimizar cualquier clase de sistema; no será una forma eficiente de entrenar un modelo de aprendizaje automático, pero sí es una excelente manera de optimizar la arquitectura del modelo.

<div class="divider"></div>

## Un ejemplo

Voy a utilizar un ejemplo que no está relacionado con el aprendizaje automático, pero que igualmente demuestra la potencia y sencillez de un algoritmo de optimización de caja negra como Vizier. Supongamos que tenemos una señal ruidosa como la siguiente:

![Una señal ruidosa]({{ "/some-noisy-signal.png" | prepend: page.imgpath }}){: width="368" height="246" loading="lazy" decoding="async"}
{% include caption.html content="Una señal ruidosa." %}

Intentemos encontrar una función analítica que se ajuste a esta señal. No sabemos si conviene ajustar una función [gaussiana](https://en.wikipedia.org/wiki/Normal_distribution) o una de [Laplace](https://en.wikipedia.org/wiki/Laplace_distribution) a la señal, y ambas funciones tienen además sus propios parámetros —como la media y la varianza— que también queremos estimar.

Siempre que podamos darle a Vizier una métrica que optimizar, encontrará una función óptima por nosotros.

<div class="divider"></div>

## Configurar el problema
El primer parámetro que queremos explorar es el tipo de modelo: gaussiano o de Laplace:

```
{
    'parameter_id': 'model',
    'categorical_value_spec' : {
        'values': [
            'gaussian',
            'laplace',
        ]
}
```

Pero cada modelo tiene su propio conjunto de parámetros que define su forma. Llamémoslos «parámetros hijos» de cada modelo.

Para la gaussiana, estos son la media `mu` ($$\mu$$) y la desviación estándar `sigma` ($$\sigma$$).

![Distribución gaussiana con parámetros mu y sigma]({{ "/normal-distribution.png" | prepend: page.imgpath }}){: width="720" height="460" loading="lazy" decoding="async"}
{% include caption.html content="Distribución gaussiana con parámetros mu y sigma. Tomada de: https://commons.wikimedia.org/wiki/File:Normal_Distribution_PDF.svg" %}

Para la distribución de Laplace —la notación varía según la bibliografía— suele haber un parámetro de localización o media `mu` ($$\mu$$) y un factor de escala `b` ($$b$$).

![Distribución de Laplace con parámetros mu y b]({{ "/laplace-distribution.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="Distribución de Laplace con parámetros mu y b. Tomada de: https://commons.wikimedia.org/wiki/File:Laplace_pdf_mod.svg" %}

Para evitar ambigüedades con la media de la gaussiana, llamaremos `a` en lugar de `mu` al parámetro de localización de la distribución de Laplace.

Cuando intentemos ajustar la distribución gaussiana, no queremos que Vizier intente estimar los parámetros de la distribución de Laplace, y viceversa. Por suerte, podemos especificar los parámetros de cada distribución como parámetros hijos, o condicionales, del parámetro padre `model`:

```
'conditional_parameter_specs': [
{
    "parameter_spec": {
        "parameter_id": "mu",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 0,
        "max_value": 10.0,
        },
    },
    "parent_categorical_values": {
        "values": ['gaussian']
    }
},
{
    "parameter_spec": {
        "parameter_id": "sigma",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 1e-1,
        "max_value": 5.0,
        },
    },
    "parent_categorical_values": {
        "values": ['gaussian']
    }
},
    {
    "parameter_spec": {
        "parameter_id": "a",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 0,
        "max_value": 10.0,
        },
    },
    "parent_categorical_values": {
        "values": ['laplace']
    }
},
{
    "parameter_spec": {
        "parameter_id": "b",
        "scale_type": 'UNIT_LINEAR_SCALE',
        "double_value_spec": {
        "min_value": 1e-1,
        "max_value": 5.0,
        },
    },
    "parent_categorical_values": {
        "values": ['laplace']
    }
}]
```

Por último, debemos definir la métrica que Vizier optimizará. Quiero ajustar una función a la señal lo más fielmente posible, y evaluaré la calidad del ajuste calculando la suma de los cuadrados de los residuos entre la función analítica y los datos. Cuanto menor sea ese número, mejor es el ajuste. Todo lo que necesitamos indicarle a Vizier es que existe esta métrica que queremos minimizar:

```
metric_ssr = {
    'metric_id': 'sum_of_squared_residuals',
    'goal': 'MINIMIZE',
}
```

Juntamos todo esto y queda definido nuestro problema:

```
study = {
    'display_name': 'vizier_experiment',
    'study_spec' :
    {
        'parameters': [param_model],
        'metrics': [metric_ssr]
    }
}
```

Fíjate en que Vizier no tiene ninguna comprensión de los parámetros en sí. `Gaussian` y `Laplace` son simplemente valores de un parámetro categórico, y para Vizier no significan nada más. El significado se lo da mi código al consumirlos, pero para Vizier ese código vive dentro de una caja negra. Omito ese código por brevedad, pero puedes encontrarlo completo en el enlace al final del artículo para ver a qué me refiero.


<div class="divider"></div>

## La búsqueda

En cada ensayo (*trial*), Vizier nos sugiere un conjunto de parámetros para probar. Nosotros evaluamos qué tal funcionan esos parámetros, calculamos la métrica (la suma de los residuos al cuadrado) y devolvemos el resultado de la evaluación a Vizier. Vizier utiliza ese resultado para generar el siguiente conjunto de parámetros a probar.

![Vizier sugiriendo parámetros para los ensayos]({{ "/vizier-trials.png" | prepend: page.imgpath }}){: width="1280" height="281" loading="lazy" decoding="async"}
{% include caption.html content="Vizier sugiriendo parámetros para los ensayos." %}

Observa que Vizier solo sugiere parámetros de la gaussiana cuando el modelo es gaussiano, y viceversa para el modelo de Laplace.

¿Cómo busca Vizier los parámetros óptimos? Puede realizar una búsqueda en cuadrícula o aleatoria, pero la verdadera magia reside en la combinación de otros algoritmos que emplea: bandidos basados en procesos gaussianos (*Gaussian process bandits*), búsqueda por combinación lineal o variantes de estos.

A través de GCP podemos consultar gráficos muy interesantes del progreso de Vizier:

![Tabla de estudio que muestra la evolución de la métrica optimizada y los parámetros de cada ensayo]({{ "/study-progress-table.webp" | prepend: page.imgpath }}){: width="1600" height="1071" loading="lazy" decoding="async"}
{% include caption.html content="Tabla de estudio que muestra la evolución de la métrica optimizada y los parámetros de cada ensayo." %}

![Gráfico de coordenadas paralelas que muestra los conjuntos de parámetros probados y el valor resultante de la métrica]({{ "/parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="726" loading="lazy" decoding="async"}
{% include caption.html content="Gráfico de coordenadas paralelas que muestra los conjuntos de parámetros probados y el valor resultante de la métrica." %}

<div class="divider"></div>

## Ajuste optimizado

Podemos ver que la distribución de Laplace supera ligeramente a la gaussiana:

![Gráfico de coordenadas paralelas ampliado para mostrar los mejores ensayos que minimizan la suma de residuos al cuadrado. Se logra un mejor ajuste con una distribución de Laplace que con una gaussiana.]({{ "/optimal-parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="550" loading="lazy" decoding="async"}
{% include caption.html content="Gráfico de coordenadas paralelas ampliado para mostrar los mejores ensayos que minimizan la suma de residuos al cuadrado. Se logra un mejor ajuste con una distribución de Laplace que con una distribución gaussiana." %}

Consultamos a Vizier los parámetros del ensayo óptimo y los representamos gráficamente:

![Ajuste optimizado a la señal ruidosa]({{ "/noisy-signal-fit.png" | prepend: page.imgpath }}){: width="543" height="289" loading="lazy" decoding="async"}
{% include caption.html content="Parámetros optimizados que se ajustan a la señal ruidosa." %}

¡Es un ajuste casi perfecto! Los parámetros que encontró Vizier son muy cercanos a los que utilicé para generar la señal antes de añadir el ruido: una distribución de Laplace con $$a=5$$ y $$b=2$$.

![Señal original de Laplace]({{ "/original-laplace-signal.png" | prepend: page.imgpath }}){: width="862" height="728" loading="lazy" decoding="async"}
{% include caption.html content="Señal original de Laplace." %}

En comparación, una gaussiana tendría un pico más redondeado y colas más delgadas.

![Señal gaussiana]({{ "/gaussian-signal.png" | prepend: page.imgpath }}){: width="878" height="726" loading="lazy" decoding="async"}
{% include caption.html content="Una distribución gaussiana para comparar." %}

<div class="divider"></div>

## ¿Cómo puedo reproducir esto?

El cuaderno de Colab que utilicé para generar este artículo se encuentra [aquí](https://github.com/skzv/vizier-blog-post/blob/main/vizier_blog_post.ipynb). Utilicé la API de Vertex AI Vizier de GCP porque genera gráficos muy vistosos como los que he incluido en este artículo, pero ten en cuenta que puede resultar cara ($1 por ensayo). Vizier también es de código abierto y está disponible [aquí](https://github.com/google/vizier).
