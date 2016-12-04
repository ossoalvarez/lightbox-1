# Lightbox

Simple lightbox script without dependencies (not even jQuery).

## Installation

Simple include `lightbox.css` and `lightbox.js` to your page.

## Usage

Initialize the script by running `lightbox(".lightbox");`. The first argument is a selector to `a` tags containing `img` tags. The HTML code may look like this:

```html
<a href="img/image-1.jpg" class="lightbox" title="">
  <img src="img/thumb/image-1.jpg" alt="Thumbnail 1">
</a>
```

## Options

You can pass an object with custom options as the second parameter.

```js
lightbox(".lightbox", {
  // Options
});
```

The following options are available:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| captions | bool | true | Display captions, if available. |
| captionsSelector | "self", "img" | "self" | Set the element where the caption is. Set it to "self" for the `a` tag itself |
| captionAttribute | string | "title" | Get the caption from given attribute. |
| nav | bool, "auto" | "auto" | Display navigation buttons. "auto" hides buttons on touch-enabled devices. |
| navText | string | ["&lsaquo;", "&rsaquo;"] | Text or HTML for the navigation buttons. |
| close | bool | true | Display close button. |
| closeText | string | "&times;" | Text or HTML for the close button. |
| counter | bool | true | Display current image index |
| keyboard | bool | true | Allow keyboard navigation. |
| zoom | bool | true | Display zoom icon. |
| zoomText | string | "&plus;" | Text or HTML for the zoom icon |
| docClose | bool | false | Closes the lightbox when clicking outside |
| swipeClose | bool | true | Swipe up to close lightbox |
| scroll | bool | false | Hide scrollbars if lightbox is displayed. |

## Supported browsers

* IE 10+
* Chrome
* Firefox
* Opera
* Safari

## To-do list

- Group images

## Notes

Feel free to report any issues. Contributions are always welcome!