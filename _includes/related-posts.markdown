<div class="related">
<h3>More Posts</h3>
<p>{% for post in related %}<a href="{{ post.url }}">{{ post.title }}</a>{% unless forloop.last %} &middot; {% endunless %}{% endfor %}</p>
</div>