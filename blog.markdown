---
layout: default
title: "Jane's Conference KievII's blog"
description: "News about KievII lib development."
---
{% for page in site.posts limit:5 %}
{% assign body = page.content %}
{% include post-div.html %}
{% endfor %}
<div class="related">
<h3>More Posts</h3>
<p>{% for post in site.posts offset:5 %}<a href="{{ post.url }}">{{ post.title }}</a>{% unless forloop.last %} &middot; {% endunless %}{% endfor %}</p>
</div>