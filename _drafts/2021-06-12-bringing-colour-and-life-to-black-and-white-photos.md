---
title: Bringing Colour and Life to Black and White Photos
updated: 2021-06-12 00:00
imgpath: /assets/img/colourising-black-and-white-photos
---

{% include description.html content="Machine learning allows us to colourise black and white photos with ease, but at what cost?" %}

## A Different Universe

Although colorized photos have technically existed for a century or more ([Sergey Prokudin-Gorsky and Piotr Vedenisov, pioneers of colour photography, travelled around Imperial Russia documenting it in full colour](https://englishrussia.com/2012/05/09/old-color-magic-of-peter-vedenisov/)) ([Library of Congress Archive](https://www.loc.gov/pictures/related/?fi=name&q=Prokudin-Gorski%20%2C%20Serge%20%20Mikha%20lovich%2C%201863-1944\)), it seems the majority of the 20th century was documented in black and white. Especially as much of the world did not have the luxury of colour film even later in the century- my father was developing his own black and white photos into the 1980s-90s in Soviet Ukraine, and while Americans recorded full colour footage of the Vietnam War, the North's perspective seems to be relegated to black and white photography.

![Young boy near the Sim River]({{ "/boy-sim-river.jpeg" | prepend: page.imgpath }})
{% include caption.html content="Young boy near the Sim River, a very early colour photograph from Imperial Russia. This was achieved by taking multiple pictures of the same scene with different colour filters. Courtesy of the Library of Congress." %}

Some will argue that black and white footage has its own special quality, and this may be true. But for me black and white footage disconnects me from the scene. It is clearly distant in time. We all associate black and white footage with the past, as the use of black and white footage in cinematagrophy to refer to a memory shows. And as someone who experiences reality in full colour, black and white footage is difficult to experience. I struggle to put myself into the scene or the characters' shoes, because in my mind it seems to exist in a different, black and white universe. And yet when that footage is colourized, all of sudden everything appears more real, more believable, more tangible. It is then clear that whatever is depicted in the footage is of the same Earth and of the same people, people like you or me. 

And so when my father recently began digitizing our collection of family photos - as physical photos are constantly degrading, or otherwise at risk of being lost forever, along with the histories, memories, and legacies preserved by them - I felt an urge to colorize them, too - so that I could experience them to a fuller extent, and so that my family members could reminisce about their loved ones who are no longer around or remember the memories of their past and their youth.  

<div class="divider"></div>

## Colorizing Photos With AI

Color restoration can be done manually and laboriously. Machine learned models offer a quick and inexpensive way to colourize photos, but they have their limitations, as we will discuss later in this post. Full disclosure: I did not, by any means, train my own model for this purpose. Others have already invested thousands of hours into developing and training models to do exactly that. I found an existing model that does a very good job - although it has its limitations, which were interesting to observe, and which I explore later in this post.

I used the [Image Colorization API from DeepAi](link). The production model deployed by DeepAi appears to be a form of the DeOldify model, which can be found at [this github repo](https://github.com/jantic/DeOldify). 

I don't think the DeepAi API allows you to adjust the model parameters, but you definitely can if you run it yourself from the repo above or [a colab instance](https://colab.research.google.com/github/jantic/DeOldify/blob/master/ImageColorizerColabStable.ipynb). [MyHeritage](link) also offers this API as a service with tunable parameters.

What I did was create a quick script that enables bulk colorization of directories. It iterates over all the photos in a directory, sends them off to Image Colorization API from DeepAi, and downloads the result into a separate folder (ignoring images that have already been colorized). If that would be useful to you, just set your own DeepAi API key as an environment variable and run [this script](https://github.com/skzv/colorize-photos):

```bash
export DL_API_KEY=<your-deep-ai-key>
python3 main.py /path/to/images
```

<div class="divider"></div>

## My Family Photos
Here are some examples of the results on our family photos.

![Mama with Vova]({{ "/mama-and-vova.jpg" | prepend: page.imgpath }})
{% include caption.html content="My mother holding my brother in early '90s Kherson, Ukraine. Courtesy of the Kuznetsov family." %}

![Mama with Vova]({{ "/mama-and-vova-colorized.jpg" | prepend: page.imgpath }})
{% include caption.html content="Now in colour." %}

![Babushka Allarkadina]({{ "/my-grandmother-allarkadina.jpg" | prepend: page.imgpath }})
{% include caption.html content="My grandmother, Allarkadina, likely sometime in the '50s, on her way to university. She graduated from multiple institutes, specializing in electrical engineering, and had a succesful career as a marine electrical engineer." %}

![Babushka Allarkadina]({{ "/my-grandmother-alla-colourised.jpeg" | prepend: page.imgpath }})
{% include caption.html content="In colour." %}

> Looks so nice and alive.

Those words from my father upon seeing the newly coloured photos made it all worth it.

<div class="divider"></div>

## Photos From the Vietnamese War
A couple weeks after preparing this bulk colourising script for my family photos, a post titled ["The Vietnam War from the North Vietnamese Side"](https://news.ycombinator.com/item?id=27283624) made it to the top of Hacker News. It seemed like a perfect opportunity to apply the script, and offer a new perspective on historical footage. Just as ["As They Were"]() made the horrors of WW1 more real and tangible, so did I aim to make the characters of the North Vietnam more relatable, and the scenes more tangible.

![Mama with Vova]({{ "/vietnam-agent-orange.jpeg" | prepend: page.imgpath }})
{% include caption.html content="My mother holding my brother in early '90s Kherson, Ukraine. Courtesy of the Kuznetsov family." %}

![Mama with Vova]({{ "/vietnam-agent-orange-colourised.jpg" | prepend: page.imgpath }})
{% include caption.html content="My mother holding my brother in early '90s Kherson, Ukraine. Courtesy of the Kuznetsov family." %}

![Mama with Vova]({{ "/vietnam-downed-aircraft.jpeg" | prepend: page.imgpath }})
{% include caption.html content="My mother holding my brother in early '90s Kherson, Ukraine. Courtesy of the Kuznetsov family." %}

![Mama with Vova]({{ "/vietnam-downed-aircraft-colourised.jpg" | prepend: page.imgpath }})
{% include caption.html content="My mother holding my brother in early '90s Kherson, Ukraine. Courtesy of the Kuznetsov family." %}

All the original black and white images can be found [here](link), with the colourised versions [here](link). 

<div class="divider"></div>

## Response on Hacker News

My efforts were met with both praise

![Praise]({{ "/praise.png" | prepend: page.imgpath }})

and contempt

![Contempt]({{ "/contempt.png" | prepend: page.imgpath }}) {% include caption.html content="Too bad about the [flagged] comment, because it raised an interesting point. The comment read something like 'Please don't do this.'" %}

but most importantly, they generated a lot of very interesting discussion.

![Discussion]({{ "/discussion.png" | prepend: page.imgpath }})

The full thread spurred by the colourised photos can be found [here](https://news.ycombinator.com/item?id=27284795).

<div class="divider"></div>

## Limitations

There were two aspects of the discussion that stood out to me. First, were the reminders of the limitations of this technology. 

For example, this model invoked on an old image of the Golden Gate produces a white bridge.

![A White Golden Gate?]({{ "/golden-gate.jpeg" | prepend: page.imgpath }}) {% include caption.html content="cite, definitely not white" %}

Some scenes are ambiguous. For example, based on the features in the following, the model cannot differentiate between the ground between a field or asphalt, and incorrectly colours the asphalt green, where a human colouriser may get it right. 

![A celebration]({{ "/a-celebration-colourised.jpg" | prepend: page.imgpath }}) {% include caption.html content="The model can't tell that the ground is asphalt and not grass." %}

Another interesting observation was that clothes seemed to often lack distincive hues, textures, features, or context that made them accurately colourisable. The model tended to colour clothes purple - unless they had distinctive features or context. This is probably because when the model cannot make a good inference about the colour of the clothes, purple is a conservative bet, somewhere in the middle of the ambiguous colour space, that minimizes the training loss.

![Vietnamese divers - all purple?]({{ "/vietnam-divers-colourised.jpg" | prepend: page.imgpath }}) {% include caption.html content="The model can't tell that the ground is asphalt and not grass." %}

Indeed, one of my father's request was to correct the colour of articles in the photos. Unfortunately I did not pursue this request, nor is it immediately obvious to me how I could. But as one commenter remarked, even when the colours are wrong, they still bring the images to life.

<div class="divider"></div>

## Ethical Considerations

Now that some of the limitations are clear, we are in a good position to consider the ethical ramifications of this technology. This was not an aspect that occured to me when I undertook this project, but some of the feedback I received spurred me to reflect, and for that I am thankful.

The main ethical consideration is truth. Similar to the controversy around deepfakes altering what is true, artificial coloration can alter our experience of history. The AI makes choices about the colours of the past, which are not necessarily accurate. For example, if we keep and disseminate the white version of the Golden Gate, produced by such an AI, then the version of the bridge that is experienced by viewers is not historically accurate. Of course, neither is version in the black and white image. Perhaps the trouble is that viewers of the black and white image know that's now what that past looked like, but viewers of the coloured image are easily tricked into believing that is history as it was.

Some may go as far as to say such retouching is rewriting of history, and seek punishment. Take this recent example:

> Cambodia has called on US media group Vice to withdraw an article that featured newly-colourised photographs of victims of the Khmer Rouge, saying the images are an insult to the dead because some had been altered to add smiles.

<p class="caption"><a href="https://www.aljazeera.com/news/2021/4/11/cambodia-condemns-vice-for-altered-khmer-rouge-images">Source</a></p>

This definitely seems a very valid complaint - as it appears the model was over-fit and altered the expressions of the victims in the images, as it was likely trained on mostly smiling-faces, and as a side-effect, altered the faces of the victims to more closely resemble the training data- by smiling. It is a good example of the pitfalls of AI, especially where applied undilligently. 

[MyHeritage](https://www.myheritage.com/incolor), which offers a color restoration service based on the same DeOldify model I have used, attempts to make a compromise by watermarking all their retouched images. I think they make a compelling point:

> We differentiate colorized photos from those photographed originally in color using a special embossed palette symbol in the bottom left corner of colorized photos. While highly realistic, colorized photos have colors that are simulated by automatic algorithms and these colors may not be identical to the real-life colors of the original image. The palette icon appears on all colorized photos so that users can tell them apart from photos that have real colors. We hope that this responsible practice will be adopted by others who use photo colorization technology. Photos that have undergone color restoration do not have an icon because those colors are authentic.

In my case, my family knew that I had artificially colourised our photos, and they could tell the colours were not wholly accurate. But even with the wrong colours the photos, and people and scenes within them, were brought back to life, lighting a spark in my family members who all of sudden were transported to good times decades in the past. It reminds me of my opportunity, when I was volunteer in a retirement home, of being able to show a resident his childhood in Dresden, which he had not visited in 50 years. Technology is a tool, and I'm thankful I live in an age where this magic is possible. 