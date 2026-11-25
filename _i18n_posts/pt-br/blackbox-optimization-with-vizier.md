---
layout: post
lang_code: pt-br
locale: pt_BR
ref: blackbox-optimization-with-vizier
date: 2023-02-23 00:00:00 -0700
last_modified_at: 2023-02-23 00:00
permalink: /pt-br/blackbox-optimization-with-vizier
title: "Otimização caixa-preta e ajuste de hiperparâmetros com o Vizier do Google"
imgpath: /assets/img/blackbox-optimization-with-vizier
previewurl: /black-box-optimization.png
description: "Um exemplo prático de otimização caixa-preta com o Google Vizier: defina parâmetros condicionais, avalie testes e ajuste um modelo para se adequar a um sinal ruidoso."
image: /assets/img/blackbox-optimization-with-vizier/og-preview.png
image_width: 1200
image_height: 630
image_alt: "Entradas e saídas na otimização caixa-preta"
mathjax: true
tags: [machine-learning, optimization]
toc: true
---
{% include description.html content="Otimize qualquer tipo de sistema de forma automática e inteligente" %}

<style>
img {
  max-height: 350px;
}
</style>

Quando você constrói um modelo de aprendizado de máquina — ou qualquer outro tipo de sistema algorítmico —, precisa tomar decisões sobre a arquitetura desse sistema. Por exemplo, em uma aplicação de machine learning, talvez precise decidir quantos neurônios colocar em uma camada de uma rede neural ou qual taxa usar no gradiente descendente. Ou, se estiver construindo um [filtro de partículas](https://en.wikipedia.org/wiki/Particle_filter) para rastrear o estado de um robô, talvez precise escolher o formato de uma função de verossimilhança. Talvez você esteja procurando um tamanho de buffer e um número de threads que minimizem o uso de recursos computacionais. Como encontrar a arquitetura ideal para o seu sistema?

Você pode tentar encontrar manualmente. Pode testar diferentes quantidades de neurônios. Pode testar diferentes taxas de gradiente descendente. Mas esse processo é lento, tedioso e sujeito a armadilhas. Felizmente, existem serviços capazes de otimizar o seu sistema para você, de maneira inteligente e eficiente.

<div class="divider"></div>

## Apresentando o Vizier

O [Vizier](https://github.com/google/vizier) é um serviço de otimização criado no Google para otimização caixa-preta e ajuste de hiperparâmetros. Ele pode ser usado para otimizar qualquer tipo de sistema, desde que você consiga passar entradas sugeridas pelo Vizier para o sistema e obter saídas dele — métricas que o Vizier tentará otimizar, maximizando-as ou minimizando-as. O sistema em si é tratado como uma caixa-preta.

![Otimização caixa-preta]({{ "/black-box-optimization.png" | prepend: page.imgpath }}){: width="629" height="319" loading="lazy" decoding="async"}
{% include caption.html content="A otimização caixa-preta não exige nenhum entendimento interno do sistema, desde que seja possível fornecer entradas e obter saídas. Fonte: Per Instance Algorithm Configuration for Continuous Black Box Optimization - Scientific Figure on ResearchGate. Disponível em: https://www.researchgate.net/figure/black-box-Optimization_fig1_322035981 [acesso em 23 fev. 2023]" %}

Diferentemente de métodos que não são caixa-preta, como o [gradiente descendente](/pt-br/gradient-descent), que exigem compreender a relação matemática entre os parâmetros do sistema e a métrica a ser minimizada ou maximizada, um sistema caixa-preta como o Vizier não precisa de nenhum conhecimento interno sobre o funcionamento do sistema. Ainda assim, ele consegue explorar o espaço de parâmetros de forma eficiente e encontrar os valores que otimizam o seu sistema. Isso também o torna mais robusto a funções de métricas complexas, descontínuas e não convexas.

<div class="divider"></div>

## Parâmetros vs. Hiperparâmetros

Um parêntese: essa distinção vem das aplicações de aprendizado de máquina, nas quais "parâmetros" são os valores internos do modelo usados na inferência e aprendidos durante o treinamento em um conjunto de dados, enquanto "hiperparâmetros" descrevem a arquitetura do modelo ou o procedimento de treinamento. Um serviço de otimização caixa-preta como o Vizier pode ser usado para otimizar qualquer tipo de sistema, mas não seria uma forma eficiente de treinar um modelo de aprendizado de máquina. Por outro lado, é uma excelente maneira de otimizar a arquitetura desse modelo.

<div class="divider"></div>

## Um exemplo

Vou usar um exemplo que não tem relação com aprendizado de máquina, mas que demonstra muito bem o poder e a simplicidade de um algoritmo de otimização caixa-preta como o Vizier. Digamos que temos um sinal ruidoso como o abaixo:

![Um sinal ruidoso]({{ "/some-noisy-signal.png" | prepend: page.imgpath }}){: width="368" height="246" loading="lazy" decoding="async"}
{% include caption.html content="Um sinal ruidoso." %}

Vamos tentar encontrar uma função analítica que se ajuste a esse sinal. Não sabemos ainda se queremos ajustar uma função [gaussiana](https://en.wikipedia.org/wiki/Normal_distribution) ou de [Laplace](https://en.wikipedia.org/wiki/Laplace_distribution) ao sinal, e ambas têm seus próprios parâmetros — como média e variância — que também precisamos estimar.

Desde que possamos fornecer ao Vizier uma métrica para otimizar, ele encontrará a função ótima para nós.

<div class="divider"></div>

## Configurando o problema

O primeiro parâmetro que queremos explorar é o tipo de modelo: gaussiano ou de Laplace:

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

Mas cada modelo tem seu próprio conjunto de parâmetros que define o seu formato. Vamos chamá-los de "parâmetros filhos" de cada modelo.

Para a distribuição gaussiana, esses parâmetros são a média `mu` ($$\mu$$) e o desvio padrão `sigma` ($$\sigma$$).

![Distribuição gaussiana com parâmetros mu e sigma.]({{ "/normal-distribution.png" | prepend: page.imgpath }}){: width="720" height="460" loading="lazy" decoding="async"}
{% include caption.html content="Distribuição gaussiana com parâmetros mu e sigma. Extraída de: https://commons.wikimedia.org/wiki/File:Normal_Distribution_PDF.svg" %}

Para a distribuição de Laplace — a notação varia conforme a literatura —, geralmente temos o parâmetro de localização (ou média) `mu` ($$\mu$$) e o fator de escala `b` ($$b$$).

![Distribuição de Laplace com parâmetros mu e b.]({{ "/laplace-distribution.png" | prepend: page.imgpath }}){: width="800" height="600" loading="lazy" decoding="async"}
{% include caption.html content="Distribuição de Laplace com parâmetros mu e b. Extraída de: https://commons.wikimedia.org/wiki/File:Laplace_pdf_mod.svg" %}

Para evitar ambiguidade com a média da gaussiana, vamos chamar o parâmetro de localização da distribuição de Laplace de `a` em vez de `mu`.

Quando estivermos ajustando a distribuição gaussiana, não queremos que o Vizier tente estimar os parâmetros da distribuição de Laplace, e vice-versa. Felizmente, podemos especificar os parâmetros de cada distribuição como parâmetros filhos — ou condicionais — do parâmetro pai `model`:

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

Por fim, precisamos definir a métrica que o Vizier vai otimizar. Quero ajustar uma função ao sinal o mais fielmente possível, e vou avaliar a qualidade do ajuste calculando a soma dos quadrados dos resíduos entre a função analítica e os dados. Quanto menor esse número, melhor o ajuste. Tudo o que precisamos informar ao Vizier é que existe essa métrica que desejamos minimizar:

```
metric_ssr = {
    'metric_id': 'sum_of_squared_residuals',
    'goal': 'MINIMIZE',
}
```

Juntando tudo isso, definimos o nosso problema:

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

Observe que o Vizier não tem nenhum entendimento sobre os parâmetros em si. `Gaussian` e `Laplace` são apenas categorias de um parâmetro categórico e, para o Vizier, não têm nenhum significado além disso. Quem atribui significado a eles é o meu código que os consome — mas, para o Vizier, esse código vive dentro de uma caixa-preta. Omiti o código aqui por brevidade, mas você pode conferi-lo inteiro no link ao final do artigo para ver exatamente o que quero dizer.

<div class="divider"></div>

## Realizando a busca

Em cada teste (_trial_), o Vizier sugere um conjunto de parâmetros para experimentarmos. Nós mesmos avaliamos quão bem esses parâmetros funcionam, calculamos a métrica (a soma dos quadrados dos resíduos) e devolvemos o resultado ao Vizier. Ele usa esse retorno para gerar o próximo conjunto de parâmetros a testar.

![Vizier sugerindo parâmetros para os testes.]({{ "/vizier-trials.png" | prepend: page.imgpath }}){: width="1280" height="281" loading="lazy" decoding="async"}
{% include caption.html content="O Vizier sugerindo parâmetros para os testes." %}

Note que o Vizier só sugere parâmetros gaussianos quando o modelo é gaussiano, e o mesmo vale para o modelo de Laplace.

Como o Vizier busca os parâmetros ótimos? Ele pode fazer busca em grade (_grid search_) ou busca aleatória, mas a verdadeira mágica está na combinação de outros algoritmos que ele emprega: _bandits_ baseados em processos gaussianos, busca por combinação linear ou variações desses métodos.

Pelo GCP, conseguimos acompanhar esses gráficos bem legais do progresso do Vizier:

![Tabela de estudo mostrando a evolução da métrica otimizada e os parâmetros de cada teste]({{ "/study-progress-table.webp" | prepend: page.imgpath }}){: width="1600" height="1071" loading="lazy" decoding="async"}
{% include caption.html content="Tabela de estudo mostrando a evolução da métrica otimizada e os parâmetros de cada teste." %}

![Gráfico de coordenadas paralelas mostrando os conjuntos de parâmetros testados e o valor resultante da métrica]({{ "/parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="726" loading="lazy" decoding="async"}
{% include caption.html content="Gráfico de coordenadas paralelas mostrando os conjuntos de parâmetros testados e o valor resultante da métrica." %}

<div class="divider"></div>

## Ajuste otimizado

Podemos ver que a distribuição de Laplace leva uma leve vantagem sobre a gaussiana:

![Gráfico paralelo com zoom nos melhores testes que minimizam a soma dos quadrados dos resíduos. Um ajuste melhor é obtido com a distribuição de Laplace do que com a gaussiana.]({{ "/optimal-parallel-chart.webp" | prepend: page.imgpath }}){: width="1600" height="550" loading="lazy" decoding="async"}
{% include caption.html content="Gráfico paralelo com zoom nos melhores testes que minimizam a soma dos quadrados dos resíduos. Um ajuste melhor é encontrado com a distribuição de Laplace do que com a distribuição gaussiana." %}

Consultamos o Vizier para obter os parâmetros do teste ótimo e os plotamos:

![Ajuste otimizado ao sinal ruidoso]({{ "/noisy-signal-fit.png" | prepend: page.imgpath }}){: width="543" height="289" loading="lazy" decoding="async"}
{% include caption.html content="Parâmetros otimizados que se ajustam ao sinal ruidoso." %}

É um ajuste quase perfeito! Os parâmetros encontrados pelo Vizier ficaram bem próximos dos que usei para gerar o sinal antes de adicionar ruído: uma distribuição de Laplace com $$a=5$$ e $$b=2$$.

![Sinal original de Laplace]({{ "/original-laplace-signal.png" | prepend: page.imgpath }}){: width="862" height="728" loading="lazy" decoding="async"}
{% include caption.html content="Sinal original de Laplace." %}

Para comparação, uma gaussiana teria um pico mais arredondado e caudas mais finas.

![Sinal gaussiano]({{ "/gaussian-signal.png" | prepend: page.imgpath }}){: width="878" height="726" loading="lazy" decoding="async"}
{% include caption.html content="Uma distribuição gaussiana para comparação." %}

<div class="divider"></div>

## Como posso reproduzir isso?

O notebook do Colab que usei para gerar este artigo pode ser encontrado [aqui](https://github.com/skzv/vizier-blog-post/blob/main/vizier_blog_post.ipynb). Usei a API Vertex AI Vizier do GCP porque ela gera gráficos bem legais como os que incluí neste post, mas vale avisar que pode sair caro ($1 por teste). O Vizier também é de código aberto e está disponível [aqui](https://github.com/google/vizier).
