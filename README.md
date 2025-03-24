[![Build and Deploy](https://github.com/skzv/my-plain-blog/actions/workflows/github-pages.yml/badge.svg)](https://github.com/skzv/my-plain-blog/actions/workflows/github-pages.yml)

# My Plain Blog

A personal blog, hosted at [blog.skz.dev](https://blog.skz.dev).

Minimalist and elegant while powerful. Supports LaTeX via mathjax, and other embeddings such as videos and images.

Adapted from [The Plain](https://github.com/heiswayi/the-plain) by [Heiswayi Nrird](https://heiswayi.nrird.com).

## Running Locally

Don't use MacOS System Ruby. Use rbenv.

`brew install rbenv ruby-build`

Add `eval "$(rbenv init -)"` to `~/.zshrc`.

Install stable Ruby `rbenv install 3.2.2`. Set as global default `rbenv global 3.2.2`.

Install bundler `gem install bundler`. Install inside project directory `bundle install`.

To run locally, run:
`bundle exec jekyll serve --config _config.yml,_config_development.yml`

To serve drafts, add the `--drafts` option, like:
`bundle exec jekyll serve --drafts`

## License

[MIT](LICENSE)
