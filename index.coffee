class Tracer extends Batman.App
  @global yes
  @root 'app#index'
  query: ''
class Tracer.Tweet extends Batman.Model
  @persist Batman.LocalStorage
  @destroyAll: -> @get('all')?.forEach (t) -> t.destroy()
class Tracer.AppController extends Batman.Controller
  index: ->
    Tracer.Tweet.destroyAll()
    @render false
  submitSearch: =>
    Tracer.set 'hasSearched', yes
    Tracer.Tweet.destroyAll()
    $.ajax 'http://search.twitter.com/search.json?q=' + encodeURI(Tracer.query),
      dataType: 'jsonp'
      success: (data) ->
        for obj in data.results
          tweet = new Tracer.Tweet obj
          tweet.save (error, record) -> throw error if error
Tracer.run()
