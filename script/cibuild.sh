#!/usr/bin/env bash
set -e # halt script on error

bundle exec jekyll build --strict_front_matter
bundle exec ruby script/check_seo.rb
bundle exec htmlproofer _site --disable-external --assume-extension --empty-alt-ignore
