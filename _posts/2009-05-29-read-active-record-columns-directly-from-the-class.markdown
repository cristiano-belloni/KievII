---
layout: post
title: Read ActiveRecord columns directly from the class
categories: [ruby, rails, active-record]
---
Sometimes you want to read just a single column from a collection of records, without the overhead of instantiating each and every one.  You could just execute raw SQL, but it's a shame to do away with the nice type conversion `ActiveRecord` provides.  It'd also be a pity to get rid of find scoping, amongst other goodness.

Enter `Tomafro::ColumnReader`:

{% highlight ruby %}
module Tomafro::ColumnReader
  def column_reader(column_name, options = {})
    name = options.delete(:as) || column_name.to_s.pluralize
    column = columns_hash[column_name.to_s]
    
    self.module_eval %{
      def self.#{name}(options = {})
        merged = options.merge(:select => '#{column_name}')
        connection.select_all(construct_finder_sql(merged)).collect do |value| 
          v = value.values.first
          #{column.type_cast_code('v')}
        end
      end
    }
  end
end
{% endhighlight %}

Once you've extended `ActiveRecord::Base` with it, usage is simple.  In your models, declare which columns you want access to:

{% highlight ruby %}
ActiveRecord::Base.extend Tomafro::ColumnReader
 
class Animal < ActiveRecord::Base
  column_reader 'id'
  column_reader 'name'  
 
  named_scope :dangerous, :conditions => {:carnivorous => true} 
end
{% endhighlight %}

Once you've done this, you can access values directly from the class, respecting scope, limits and other finder options.

{% highlight ruby %}
Animal.names 
#=> ['Lion', 'Tiger', 'Zebra', 'Gazelle']
 
Animal.names :limit => 1 
#=> ['Lion'] (Normal finder options supported)
 
Animal.dangerous.names 
#=> ['Lion', 'Tiger'] (Scoping respected)
 
Animal.ids
#=> [1, 2, 3] (Values cast correctly)
{% endhighlight %}