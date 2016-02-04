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

### Properties
*url* - url to upload the file

*video* - path to a video preview

*maxSize* - max size of a video file

### Events
*onAfterProcessVideo* - occurs after uploading a video file

*onAfterCancel* - occurs when the user canceled uploading video

### TODO
Video uploading progress indicator

