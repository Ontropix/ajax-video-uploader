# ajax-video-uploader
HTML5 ajax video uploader 

![Image](images/sample.png)

### Dependancies 
- jQuery
- Bootstrap 3

### Usage
```html
  <div class="videozone"
       data-url="/Home/Upload"
       style="width: 300px; height: 200px">
      <input type="file" name="video" />
  </div>
```

```javascript
  <script type="text/javascript">
      $('.videozone').html5videoupload();
  </script>
```

### Server side
See an [example](https://github.com/Ontropix/ajax-video-uploader/tree/master/server/asp.net%20mvc) of usage in asp.net mvc


