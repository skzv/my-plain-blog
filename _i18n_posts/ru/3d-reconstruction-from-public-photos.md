---
layout: post
lang_code: ru
locale: ru_RU
ref: 3d-reconstruction-from-public-photos
date: 2025-08-21 00:00:00 -0700
last_modified_at: 2025-08-21 00:00
permalink: /ru/3d-reconstruction-from-public-photos
title: "3D-реконструкция по публичным фотографиям с помощью машинного обучения"
imgpath: /assets/img/3d-reconstruction
previewurl: /3d-reconstruction-preview.png
description: "3D-реконструкция публичных фотографий с помощью Apple Depth Pro, проекции камеры и Open3D. Примеры карт глубины, облаков точек и ограничений модели."
image: /assets/img/3d-reconstruction/3d-reconstruction-preview.png
image_width: 1200
image_height: 630
image_alt: "3D-реконструкция публичной фотографии на основе предсказанной карты глубины"
mathjax: true
tags: [computer-vision, 3d-graphics, machine-learning]
toc: true
---

{% include description.html content="Можно ли воссоздать мир в 3D по обычным публичным фотографиям?" %}

## Картографируем мир

В интернете огромное количество публичных фотографий из самых разных источников: Reddit, YouTube, пользовательские снимки в Google Maps и так далее.

![Пример фотографий из Google Maps]({{ "/google-maps-photos.webp" | prepend: page.imgpath }}){: width="1600" height="1232" fetchpriority="high" decoding="async" style="max-height:400px;width:auto"}
{% include caption.html content="Публичные фотографии, доступные в Google Maps" %}

Мне стало интересно: можно ли создать 3D-карту мира из всех этих данных? При съёмке камера теряет всю информацию о третьем измерении — но с помощью современных моделей машинного обучения мы можем её вернуть и превратить вот такую фотографию:

![Исходное фото Safeway 0]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Публичное исходное изображение Safeway 0." %}

В вот такую 3D-модель:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</div>

Ещё один пример — знаменитый аэропорт Сингапура:

![Исходное фото аэропорта Сингапура]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Публичное исходное изображение аэропорта Сингапура." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</div>

И даже снимок леса:

![Исходное фото леса]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Публичное исходное изображение леса." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</div>

Чтобы получить эти результаты, я использовал ML-модель оценки глубины и немного линейной алгебры.

## Проекция камеры

Камеру можно рассматривать как устройство, выполняющее проекцию из 3D в 2D, как показано на схеме ниже. При этом теряется информация о третьем измерении — глубине.

![Визуализация проекции камеры]({{ "/camera-projection.png" | prepend: page.imgpath }}){: width="850" height="356" loading="lazy" decoding="async"}
{% include caption.html content="Проекция камеры из 3D в 2D. Источник: [1]" %}

Наша задача — восстановить это третье измерение, а затем обратить проекцию.

## Внутренние параметры камеры

Одного лишь знания глубины каждого пикселя недостаточно, чтобы восстановить изображение в 3D. Дело в том, что свойства самой камеры — прежде всего её фокусное расстояние — определяют, как трёхмерные точки отображаются в двумерные пиксели, поэтому для обратного преобразования эти параметры тоже нужны. Посмотрите на демонстрацию ниже, где разные фокусные расстояния дают совершенно разные снимки:

<div style="text-align:center">
  <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="600" height="600" poster="/assets/video/3d-reconstruction/face-focal-length-poster.webp" style="max-height:400px;width:auto">
    <source src="/assets/video/3d-reconstruction/face-focal-length.mp4" type="video/mp4">
    Влияние фокусного расстояния на портрет
  </video>
</div>
{% include caption.html content="Демонстрация влияния фокусного расстояния на изображение. Источник: [2]" %}

Из этого логично следует: если мы хотим реконструировать лицо в 3D по любому из этих снимков, нам необходимо знать характеристики камеры.

Пользуясь свойствами подобных треугольников, показанными ниже, легко увидеть, что связь между точками на изображении и точками в 3D оказывается очень простой:

{%include math.html content=
"
\begin{align}
x = f \frac{X}{Z} \space\space\space\space\space y = f \frac{Y}{Z} \tag{1} \label{eq:camera perspective projection}
\end{align}
" 
%}

![Перспективная проекция камеры]({{ "/camera-perspective-focal.png" | prepend: page.imgpath }}){: width="1073" height="834" loading="lazy" decoding="async"}
{% include caption.html content="Перспективная проекция камеры" %}

Обратив это преобразование, чтобы перенести пиксели изображения обратно в 3D, получаем:

{%include math.html content=
"
\begin{align}
X = \frac{x \cdot Z}{f} \space\space\space\space\space Y = \frac{y \cdot Z}{f} \space\space\space\space\space Z = Z \tag{2} \label{eq:inverse camera perspective projection}
\end{align}
" 
%}

Итак, два недостающих элемента — это глубина каждого пикселя $$Z$$ и фокусное расстояние камеры $$f$$. Ни того, ни другого в публичных фотографиях обычно нет: EXIF-метаданные, которые могли бы содержать сведения о камере, как правило, удаляются при загрузке.

Замечу, что можно описать и полное преобразование между мировой 3D-системой координат и 2D-плоскостью с учётом положения и ориентации камеры (см. ниже). Но в рамках этой статьи мы работаем просто в локальной системе координат самой камеры.

![Полная модель камеры]({{ "/complete-camera-model.jpg" | prepend: page.imgpath }}){: width="1280" height="720" loading="lazy" decoding="async"}
{% include caption.html content="Полная модель камеры. Источник: [3]" %}

## Карты глубины

Этот проект стал возможен благодаря недавно вышедшей модели Apple [DepthPro](https://github.com/apple/ml-depth-pro). Хотя модели оценки глубины существовали уже давно, у этой модели обнаружились два важных отличия:
    1. Она выдаёт глубину в абсолютном метрическом масштабе — это значит, что 3D-реконструкции сохраняют реальные пропорции, даже когда строятся по одному-единственному кадру.
    2. Она сама оценивает фокусное расстояние камеры.

![Тизер Depth Pro]({{ "/depth-pro-teaser.webp" | prepend: page.imgpath }}){: width="1242" height="535" loading="lazy" decoding="async"}
{% include caption.html content="Тизер Depth Pro. Источник: [4]" %}

Я прогнал эту модель через подборку публичных фотографий, получив карты глубины и оценки фокусного расстояния. Например, для вот этого снимка:

![Исходное фото Safeway 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Публичное исходное изображение Safeway 1." %}

Предсказанные карта глубины и фокусное расстояние выглядят так:

![Карта глубины Safeway 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Карта глубины Safeway 1 и фокусное расстояние, предсказанные моделью DepthPro." %}

Затем я применил формулы $$(2)$$, чтобы перенести каждый пиксель обратно в 3D, собрал облако точек и визуализировал его с помощью Open3D:

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</div>

## 3D-реконструкция

Ниже собраны все мои примеры. Особое внимание обратите на панораму Нью-Йорка. Мне было любопытно проверить, как модель справится с по-настоящему огромной сценой вроде небоскрёбов Манхэттена. Как и следовало ожидать, DepthPro не смогла построить хорошую карту глубины: её обучающий датасет почти наверняка был ориентирован на более компактные сцены.

### COEX Mall

![Исходное фото COEX Mall]({{ "/coex-0.jpg" | prepend: page.imgpath }}){: width="924" height="483" loading="lazy" decoding="async"}
{% include caption.html content="Публичное исходное изображение COEX Mall." %}

![Карта глубины COEX Mall]({{ "/coex-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Карта глубины COEX Mall и фокусное расстояние, предсказанные моделью DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1398" height="848" poster="/assets/video/3d-reconstruction/coex-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/coex-recording.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</div>

<div class="divider"></div>

### Лес

![Исходное фото леса]({{ "/forest-0.jpg" | prepend: page.imgpath }}){: width="1500" height="900" loading="lazy" decoding="async"}
{% include caption.html content="Публичное исходное изображение леса." %}

![Карта глубины леса]({{ "/forest-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Карта глубины леса и фокусное расстояние, предсказанные моделью DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1358" height="714" poster="/assets/video/3d-reconstruction/forest-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/forest-recording.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</div>

<div class="divider"></div>

### Панорама Нью-Йорка

![Исходное фото панорамы Нью-Йорка]({{ "/nyc-0.webp" | prepend: page.imgpath }}){: width="1000" height="560" loading="lazy" decoding="async"}
{% include caption.html content="Публичное исходное изображение панорамы Нью-Йорка." %}

![Карта глубины Нью-Йорка]({{ "/nyc-depth-black.png" | prepend: page.imgpath }}){: width="498" height="389" loading="lazy" decoding="async"}
{% include caption.html content="Карта глубины панорамы Нью-Йорка и фокусное расстояние, предсказанные моделью DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1382" height="714" poster="/assets/video/3d-reconstruction/nyc-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/nyc-recording.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</div>

<div class="divider"></div>

### Safeway 1

![Исходное фото Safeway 0]({{ "/safeway-0.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Публичное исходное изображение Safeway 0." %}

![Карта глубины Safeway 0]({{ "/safeway-0-depth-black.png" | prepend: page.imgpath }}){: width="506" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Карта глубины Safeway 0 и фокусное расстояние, предсказанные моделью DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1066" height="776" poster="/assets/video/3d-reconstruction/safeway-0-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-0-recording.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</div>

<div class="divider"></div>

### Safeway 2

![Исходное фото Safeway 1]({{ "/safeway-1.webp" | prepend: page.imgpath }}){: width="680" height="510" loading="lazy" decoding="async"}
{% include caption.html content="Публичное исходное изображение Safeway 1." %}

![Карта глубины Safeway 1]({{ "/safeway-1-depth-black.png" | prepend: page.imgpath }}){: width="507" height="396" loading="lazy" decoding="async"}
{% include caption.html content="Карта глубины Safeway 1 и фокусное расстояние, предсказанные моделью DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1360" height="810" poster="/assets/video/3d-reconstruction/safeway-1-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/safeway-1-recording.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</div>

<div class="divider"></div>

### Аэропорт Сингапура

![Исходное фото аэропорта Сингапура]({{ "/sg-airport-0.jpeg" | prepend: page.imgpath }}){: width="960" height="1280" loading="lazy" decoding="async" style="max-height:600px;width:auto"}
{% include caption.html content="Публичное исходное изображение аэропорта Сингапура." %}

![Карта глубины аэропорта Сингапура]({{ "/sg-airport-0-depth-black.png" | prepend: page.imgpath }}){: width="387" height="432" loading="lazy" decoding="async"}
{% include caption.html content="Карта глубины аэропорта Сингапура и фокусное расстояние, предсказанные моделью DepthPro." %}

<div style="text-align: center;">
    <video autoplay loop muted playsinline disableRemotePlayback loading="lazy" preload="metadata" width="1012" height="1008" poster="/assets/video/3d-reconstruction/sg-airport-recording-poster.webp" style="width: 100%; height: auto;">
        <source src="/assets/video/3d-reconstruction/sg-airport-recording.mp4" type="video/mp4">
        Ваш браузер не поддерживает тег video.
    </video>
</div>

<div class="divider"></div> 

## Примечания

1. Проекция камеры из 3D в 2D. Источник: [ResearchGate](https://www.researchgate.net/figure/The-perspective-projection-of-a-camera-model_fig2_324584663)
2. Демонстрация влияния фокусного расстояния на изображение. Источник: [DIY Photography](https://www.diyphotography.net/gif-explains-changing-focal-length-impacts-portrait)
3. Полная модель камеры. Источник: [Robot Academy](https://robotacademy.net.au/lesson/summary-of-image-geometry/)
4. Тизер Depth Pro. Источник: [Apple](https://github.com/apple/ml-depth-pro)
