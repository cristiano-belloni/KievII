desc 'Generate tags page'
task :tags do
  puts "Generating tags..."
  require 'rubygems'
  require 'jekyll'
  include Jekyll::Filters
  
  options = Jekyll.configuration({})
  site = Jekyll::Site.new(options)
  site.read_posts('')
  site.categories.sort.each do |category, posts|
    html = ''
    html << <<-HTML
---
layout: default
title: Postings tagged "#{category}"
---
HTML


    posts.each do |post|
      post_data = post.to_liquid
      html << <<-HTML
[#{post_data['title']}](http://#{post.url})<br />
HTML
    end
    
    File.open("tags/#{category}.markdown", 'w+') do |file|
      file.puts html
    end
  end
  puts 'Done.'
end
