---
layout: post
title:  First post, this is (mainly) a test.
categories: [first-post, test, markdown]
---
Ok, this is the first test post of [KievII](https://github.com/janesconference/KievII)'s new blog. 

Then, we'll try some pygments highlight:

{% highlight javascript %}
Knob.prototype.onMouseMove = function (curr_x, curr_y) {

    if ((this.start_x !== undefined) && (this.start_y !== undefined)) {

        // This means that the mouse is currently down.
        var deltaY = 0,
            temp_value,
            to_set,
            ret;

        deltaY = curr_y - this.start_y;

        temp_value = this.values.knobvalue;

        // Todo set sensivity.
        to_set = temp_value - deltaY / this.sensivity;

        if (to_set > 1) {
            to_set = 1;
        }
        if (to_set < 0) {
            to_set = 0;
        }

        ret = {"slot" : "knobvalue", "value" : to_set};

        return ret;
    }

    // The mouse is currently up; ignore the event notify.
    return undefined;

};
{% endhighlight %}

This is inline code `inline_code is here`, we should enhance it (there is an unsolved bug that assigns the "code" tag to the highlights).

<div class="update">
Is this the way to trigger an update div?
</div>

