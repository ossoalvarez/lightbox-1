// ----------------------------------------
// Lightbox
//
// @author DxF5H
// @version 0.9.6
// @url https://github.com/DxF5H/Lightbox
//
// MIT License
// ----------------------------------------

// Universal Module Definition
(function (window, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD
    define(factory);
  } else if (typeof module === "object" && module.exports) {
    // CommonJS
    module.exports = factory();
  } else {
    // Browser global
    window.lightbox = factory();
  }
}(typeof window !== "undefined" ? window : this, function () {
  var lightbox = function (selector, userOptions) {
    "use strict";


    // -----------------
    // Default options
    // -----------------

    var options = {
      // Display captions, if available.
      captions: true,

      // Set the element where the caption is. Set it to "self" for the a-tag itself
      captionsSelector: "self",

      // Get the caption from given attribute.
      captionAttribute: "title",

      // Display navigation buttons. "auto" hides buttons on touch-enabled devices.
      nav: "auto",

      // Text or HTML for the navigation buttons.
      navText: ["&lsaquo;", "&rsaquo;"],

      // Display close button.
      close: true,

      // Text or HTML for the close button.
      closeText: "&times;",

      // Display current image index
      counter: true,

      // Allow keyboard navigation.
      keyboard: true,

      // Display zoom icon.
      zoom: true,

      // Text or HTML for the zoom icon
      zoomText: "&plus;",

      // Closes the lightbox when clicking outside
      docClose: false,

      // Swipe up to close lightbox
      swipeClose: true,

      // Hide scrollbars if lightbox is displayed.
      scroll: false
    };


    // ------------------
    // Global variables
    // ------------------

    // Array with all images
    var gallery = [];

    // Cache array length
    var galleryLength = null;

    // Array with all slider elements
    var sliderElement = [];

    // Current index
    var currentIndex = 0;

    // Object with touch positions
    var touch = {};

    // If set to true ignore touch events because animation was already fired
    var touchFlag = false;

    // The last focused element before opening the overlay
    var lastFocus = null;


    // --------------------------
    // Create lightbox components
    // --------------------------

    var overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-hidden", "true");
    overlay.classList.add("lightbox-overlay");
    document.getElementsByTagName("body")[0].appendChild(overlay);


    var slider = document.createElement("div");
    slider.classList.add("lightbox-slider");
    overlay.appendChild(slider);


    var prevButton = document.createElement("button");
    prevButton.setAttribute("type", "button");
    prevButton.setAttribute("aria-label", "Previous");
    overlay.appendChild(prevButton);


    var nextButton = document.createElement("button");
    nextButton.setAttribute("type", "button");
    nextButton.setAttribute("aria-label", "Next");
    overlay.appendChild(nextButton);


    var closeButton = document.createElement("button");
    closeButton.setAttribute("type", "button");
    closeButton.setAttribute("aria-label", "Close");
    overlay.appendChild(closeButton);


    var counter = document.createElement("div");
    counter.classList.add("lightbox-counter");
    overlay.appendChild(counter);


    // ------------------
    // Global functions
    // ------------------

    var mergeOptions = function (userOptions, options) {
      Object.keys(userOptions).forEach(function (key) {
        options[key] = userOptions[key];
      });
    };


    var loadImage = function (index, callback) {
      if (typeof gallery[index] === "undefined" || typeof sliderElement[index] === "undefined") {
        return;

        // If image is already loaded run callback and return
      } else if (!sliderElement[index].getElementsByTagName("img")[0].hasAttribute("data-src")) {
        if (callback) {
          callback();
        }
        return;
      }

      var figure = sliderElement[index].getElementsByTagName("figure")[0],
          image = figure.getElementsByTagName("img")[0],
          figcaption = figure.getElementsByTagName("figcaption")[0];

      image.onload = function () {
        var loader = figure.querySelector(".lightbox-loader");
        figure.removeChild(loader);
        image.style.opacity = "1";
        if (figcaption) {
          figcaption.style.opacity = "1";
        }
      };

      image.setAttribute("src", image.getAttribute("data-src"));
      image.removeAttribute("data-src");

      // Run callback
      if (callback) {
        callback();
      }
    };


    var updateOffset = function () {
      var offset = -currentIndex * 100 + "%";

      if (typeof slider.style.perspective !== "undefined") {
        slider.style.transform = "translate(" + offset + ", 0)";
      } else {
        slider.style.left = offset;
      }
    };


    var updateCounter = function () {
      counter.innerHTML = (currentIndex + 1) + "/" + galleryLength;
    };


    var updateFocus = function (direction) {
      prevButton.disabled = false;
      nextButton.disabled = false;

      if (currentIndex === galleryLength - 1) {
        prevButton.disabled = false;
        nextButton.disabled = true;
      } else if (currentIndex === 0) {
        prevButton.disabled = true;
        nextButton.disabled = false;
      }

      if (options.nav) {
        if (!nextButton.disabled && direction !== "left") {
          nextButton.focus();
        } else {
          prevButton.focus();
        }
      } else if (options.close) {
        closeButton.focus();
      }
    };


    var preloadImage = function (index) {
      loadImage(index);
    };


    var nextImage = function () {
      // If next image exists
      if (currentIndex < galleryLength - 1) {
        currentIndex++;

        // Updates
        updateOffset();
        updateCounter();
        updateFocus();

        preloadImage(currentIndex + 1);
      }
    };


    var prevImage = function () {
      // If previous image exists
      if (currentIndex > 0) {
        currentIndex--;

        // Updates
        updateOffset();
        updateCounter();
        updateFocus();

        preloadImage(currentIndex - 1);
      }
    };


    var createOverlay = function () {
      var i = 0,
          x = 0,
          figure = null,
          figuresIds = [],
          figcaption = null,
          figcaptionsIds = [];

      for (; i < galleryLength; ++i) {
        sliderElement[i] = document.createElement("div");
        sliderElement[i].classList.add("lightbox-content");
        sliderElement[i].id = "lightbox-content-" + i;

        // Create figure
        figure = document.createElement("figure");
        figure.innerHTML = "<div class=\"lightbox-loader\"></div>";

        // Create image
        var image = document.createElement("img");
        image.style.opacity = "0";

        if (gallery[i].selector.getElementsByTagName("img")[0].alt) {
          image.alt = gallery[i].selector.getElementsByTagName("img")[0].alt;
        } else {
          image.alt = "";
        }
        image.setAttribute("src", "");
        image.setAttribute("data-src", gallery[i].selector.href);

        // Add image to figure
        figure.appendChild(image);

        // Create figcaption
        if (options.captions) {
          figcaption = document.createElement("figcaption");
          figcaption.style.opacity = "0";

          if (options.captionsSelector == "self" && gallery[i].selector.getAttribute(options.captionAttribute)) {
            figcaption.innerHTML = gallery[i].selector.getAttribute(options.captionAttribute);
          } else if (options.captionsSelector == "img" && gallery[i].selector.getElementsByTagName("img")[0].getAttribute(options.captionAttribute)) {
            figcaption.innerHTML = gallery[i].selector.getElementsByTagName("img")[0].getAttribute(options.captionAttribute);
          }

          if (figcaption.innerHTML) {
            figure.id = "lightbox-figure-" + x;
            figcaption.id = "lightbox-figcaption-" + x;
            figure.appendChild(figcaption);

            figuresIds.push("lightbox-figure-" + x);
            figcaptionsIds.push("lightbox-figcaption-" + x);
            ++x;
          }
        }

        // Add figure slider element
        sliderElement[i].appendChild(figure);

        // Add slider element to slider
        slider.appendChild(sliderElement[i]);
      }

      if (x !== 0) {
        overlay.setAttribute("aria-labelledby", figuresIds.join(" "));
        overlay.setAttribute("aria-describedby", figcaptionsIds.join(" "));
      }

      // Hide buttons if necessary
      if (!options.nav || galleryLength === 1 || (options.nav === "auto" && "ontouchstart" in window)) {
        prevButton.style.display = "none";
        nextButton.style.display = "none";
      } else {
        prevButton.innerHTML = options.navText[0];
        nextButton.innerHTML = options.navText[1];
      }

      // Hide counter if necessary
      if (!options.counter || galleryLength === 1) {
        counter.style.display = "none";
      }

      // Hide close if necessary
      if (!options.close) {
        closeButton.style.display = "none";
      } else {
        closeButton.innerHTML = options.closeText;
      }
    };


    var openOverlay = function (index) {
      if (overlay.getAttribute("aria-hidden") === "false") {
        return;
      }

      if (!options.scroll) {
        document.documentElement.classList.add("lightbox-no-scroll");
        document.body.classList.add("lightbox-no-scroll");
      }

      // Save last focused element
      lastFocus = document.activeElement;

      // Set current index
      currentIndex = index;

      // Reset touch positions
      touch = {
        count: 0,
        startX: null,
        startY: null,
        moveX: null,
        moveY: null,
      };

      // Bind events
      bindEvents();

      // load image
      loadImage(currentIndex, function () {
        preloadImage(currentIndex + 1);
        preloadImage(currentIndex - 1);
      });

      updateOffset();
      updateCounter();
      overlay.setAttribute("aria-hidden", "false");

      updateFocus();
    };


    var closeOverlay = function () {
      if (overlay.getAttribute("aria-hidden") === "true") {
        return;
      }

      if (!options.scroll) {
        document.documentElement.classList.remove("lightbox-no-scroll");
        document.body.classList.remove("lightbox-no-scroll");
      }

      // Unbind events
      unbindEvents();

      overlay.setAttribute("aria-hidden", "true");

      // Focus
      lastFocus.focus();
    };


    // ------------------
    // Event handler
    // ------------------

    var clickHandler = function (event) {
      if (this === prevButton) {
        prevImage();
        updateFocus("left");
      } else if (this === nextButton) {
        nextImage();
        updateFocus("right");
      } else if (this === closeButton || this === overlay && event.target.id.indexOf("lightbox-content") !== -1) {
        closeOverlay();
      }

      event.preventDefault();
    };


    var keyupHandler = function (event) {
      switch (event.keyCode) {
        // Left arrow
        case 37:
          prevImage();
          updateFocus("left");
          break;

        // Right arrow
        case 39:
          nextImage();
          updateFocus("right");
          break;

        // Esc
        case 27:
          closeOverlay();
          break;
      }
    };


    var touchstartHandler = function (event) {
      touch.count++;
      if (touch.count > 1) {
        touch.multitouch = true;
      }
      // Get the touch position
      touch.startX = event.changedTouches[0].pageX;
      touch.startY = event.changedTouches[0].pageY;
    };

    var touchmoveHandler = function (event) {
      // If action was already triggered or multitouch return
      if (touchFlag || touch.multitouch) {
        return;
      }

      touch.moveX = event.changedTouches[0].pageX;
      touch.moveY = event.changedTouches[0].pageY;

      // Move > 50 pixels left or right to navigate
      if (touch.moveX - touch.startX > 50) {
        touchFlag = true;
        prevImage();
      } else if (touch.moveX - touch.startX < -50) {
        touchFlag = true;
        nextImage();

        // Move > 100 pixels up to close the overlay
      } else if (options.swipeClose && touch.startY - touch.moveY > 100) {
        closeOverlay();
      }

      event.preventDefault();
    };


    var touchendHandler = function () {
      touch.count--;
      if (touch.count <= 0) {
        touch.multitouch = false;
      }
      touchFlag = false;
    };


    var trapFocus = function (event) {
      if (overlay.getAttribute("aria-hidden") === "false" && !overlay.contains(event.target)) {
        event.stopPropagation();
        updateFocus();
      }
    };


    var bindEvents = function () {
      if (options.keyboard) {
        document.addEventListener("keyup", keyupHandler, false);
      }

      if (options.docClose) {
        overlay.addEventListener("click", clickHandler, false);
      }

      prevButton.addEventListener("click", clickHandler, false);
      nextButton.addEventListener("click", clickHandler, false);
      closeButton.addEventListener("click", clickHandler, false);
      overlay.addEventListener("touchstart", touchstartHandler, false);
      overlay.addEventListener("touchmove", touchmoveHandler, false);
      overlay.addEventListener("touchend", touchendHandler, false);
      document.addEventListener("focus", trapFocus, true);
    };


    var unbindEvents = function () {
      if (options.keyboard) {
        document.removeEventListener("keyup", keyupHandler, false);
      }

      if (options.docClose) {
        overlay.removeEventListener("click", clickHandler, false);
      }

      prevButton.removeEventListener("click", clickHandler, false);
      nextButton.removeEventListener("click", clickHandler, false);
      closeButton.removeEventListener("click", clickHandler, false);
      overlay.removeEventListener("touchstart", touchstartHandler, false);
      overlay.removeEventListener("touchmove", touchmoveHandler, false);
      overlay.removeEventListener("touchend", touchendHandler, false);
      document.removeEventListener("focus", trapFocus, true);
    };


    // ------
    // Setup
    // ------

    var setup = function (selector) {
      // Merge user options into defaults
      mergeOptions(userOptions, options);

      // Get a list of all elements within the document
      var elements = document.querySelectorAll(selector);

      if (!elements.length) {
        console.log("Ups, I can't find the selector \"" + selector + "\".");
        return;
      }

      // Execute a few things once per element
      [].forEach.call(elements, function(element, index) {
        // Set zoom icon if necessary
        if (options.zoom) {
          var lightboxZoom = document.createElement("div");

          lightboxZoom.classList.add("lightbox-zoom");
          lightboxZoom.innerHTML = options.zoomText;

          element.appendChild(lightboxZoom);
        }

        // Bind event
        element.addEventListener("click", function (event) {
          openOverlay(index);

          event.preventDefault();
        }, true);

        // Add element to gallery
        gallery.push({
          selector: element
        });
      });

      galleryLength = gallery.length;
      createOverlay();
    };


    setup(selector);
  };

  return lightbox;
}));