---
layout: default
title: Fastr Blog
---
<h2>Categories:</h2>
<ul>
{% for category in site.categories %}
  <li><a href="#{{ category | first }}">{{ category | first }}</a></li>
{% endfor %}
</ul>
<h2>Articles by Category:</h2>
<ul>
{% for category in site.categories %}
  <li><a name="{{ category | first }}">{{ category | first }}</a>
    <ul>
    {% for posts in category %}
      {% for post in posts %}
        <li><a href="{{ post.url }}">{{ post.title }}</a></li>
      {% endfor %}
    {% endfor %}
    </ul>
  </li>
{% endfor %}
</ul>
{% for post in site.categories.quickstart %}
<!-- h2><a href=".{{ post.url }}">{{ post.title }}</a></h2 -->
<!-- {{ post.content }} -->
{% endfor %}
Page generated: {{ site.time | date_to_string }}
