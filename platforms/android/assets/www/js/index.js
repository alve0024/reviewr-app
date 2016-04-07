"use strict" // but no fetch, no let and no const

var app = {
  image: null,
  imgOptions: null,
  imgData: null,
  uuid: null,
  stars: null,
  starValue: null,
  urlGetAllReviews: "https://griffis.edumedia.ca/mad9022/reviewr/reviews/get/",
  urlGetReview: "https://griffis.edumedia.ca/mad9022/reviewr/review/get/",
  urlSetNewReview: "https://griffis.edumedia.ca/mad9022/reviewr/review/set/",
  // Application Constructor
  initialize: function () {
    //document.addEventListener('deviceready', this.onDeviceReady, false); // **********
    document.addEventListener('DOMContentLoaded', this.onDeviceReady);
  },
  init: function () {
    //when page is ready add event listeners to every object as needed
    //add listeners to buttons
    var pl = document.querySelectorAll(".page-link");
    [].forEach.call(pl, function (obj, index) {
      var touchGesture = new Hammer(obj);
      touchGesture.on("tap", app.navigate);
      obj.addEventListener("click", app.navigate);
    });
    //add listeners to pages
    var pages = document.querySelectorAll("[data-role=page]");
    [].forEach.call(pages, function (obj, index) {
      obj.className = "inactive-page";
      if (index == 0) {
        obj.className = "active-page";
      }
      //transitionend or animationend listeners
      obj.addEventListener("animationend", app.pageAnimatedAnimated);
    });
    
    var star = document.querySelectorAll(".rating-star"); 
    [].forEach.call(star, function (obj, index) {
      var tapStar = new Hammer(obj);
      tapStar.on("tap", app.setStars);
    });
    
    // Set the event to the submit button
    var btnSubmit = document.getElementById("btnConfirm");
    var btnTap = new Hammer(btnSubmit);
    btnTap.on('tap', app.submitReview);

    // Set the event to the camera button
    var btnCamera = document.getElementById("btnCamera");
    var cameraTap = new Hammer(btnCamera);
    cameraTap.on('tap', app.accessCamera);   
  },
  setStars: function (ev) {
    var starValue = ev.target.dataset.value;
    app.starValue = starValue;
    var i;
    var starHtml = document.querySelectorAll('.rating-star');
    
    for(i=0; i<5; i++) {
       starHtml[i].style.color = "#ccc";   
    }
    
    for(i=0; i<app.starValue; i++) {
       starHtml[i].style.color = "orange";   
    }
  },
  navigate: function (ev) {
    console.log(ev);
    ev.preventDefault();
    var btn = ev.target;
    var href = btn.href;
    var id = href.split("#")[1];
    //history.pushState();
    var pages = document.querySelectorAll('[data-role="page"]');
    for (var p = 0; p < pages.length; p++) {
      if (pages[p].id === id) {
        pages[p].classList.remove("hidden");
        if (pages[p].className !== "active-page") {
          pages[p].className = "active-page";
        }
      } else {
        if (pages[p].className !== "inactive-page") {
           pages[p].classList.add("hidden");
          pages[p].className = "inactive-page";
        }
      }
    }
  },
  navigateToPage: function (currentPage, wantToGoPage) {
    currentPage.setAttribute("class", "inactive-page");
    currentPage.classList.add("hidden");
    wantToGoPage.setAttribute("class", "active-page");
    wantToGoPage.classList.remove("hidden");
  },
  pageAnimated: function (ev) {
    var page = ev.target;
    if (page.className == "active-page") {
      console.log(ev.target.id, " has just appeared");
    } else {
      console.log(ev.target.id, " has just disappeared");
      ev.target.classList.add("hidden");
    }
  },
  createStars: function (rating) {
    var stars = "";
    var i;
    for(i=1; i<=5; i++) {
      if(i <= rating) {
        stars += '&#x2605';
      } else {
        stars += '&#x2606';
      }
    }
    return stars;
  },
  onDeviceReady: function () {
    app.init();
    app.uuid = '36b6586e1c184083b3644eb7c0d98a3d'; // TODO: Change to device.uuid; 
    var params = new FormData();
    params.append("uuid", app.uuid);
    app.ajaxCall(app.urlGetAllReviews, params, app.gotList, app.ajaxErr);
  },
  ajaxCall: function (url, formData, success, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.addEventListener("load", success);
    xhr.addEventListener("error", fail);
    xhr.send(formData);
  },
  gotList: function (ev) {
    console.log(ev);
    var reviews = JSON.parse(ev.currentTarget.responseText);
    console.log(reviews);
    app.loadReviews(reviews);
  },
  ajaxErr: function (err) {
    alert(err.message);
  },
  loadReviews: function (reviews) {
    var i;
    for (i = reviews["reviews"].length-1; i >= 0 ; i--) {
      app.addNewItemToReviewList(
        reviews["reviews"][i].id,
        reviews["reviews"][i].title,
        reviews["reviews"][i].rating
      );
    }
  },
  addNewItemToReviewList: function (id, title, rating) {
    var reviewList = document.getElementById("reviewList");
    // Create a new Div Element on DOM
    var newDiv = document.createElement("div");
    newDiv.setAttribute("id", id);
    newDiv.setAttribute("class", "itemReview");
    reviewList.appendChild(newDiv);
    var stars = app.createStars(rating);
    newDiv.innerHTML = title + "<br/>" + stars;
    app.addTouchGestureToItemReview(id);
  },
  addTouchGestureToItemReview: function (id) {
    var itemReview = document.getElementById(id);
    var touchGesture = new Hammer(itemReview);
    touchGesture.on("tap", app.getItemDetail);
  },
  getItemDetail: function (ev) {
    ev.preventDefault();
    var target = ev.target;
    var review_id = target.id;
    var params = new FormData();
    params.append("uuid", app.uuid);
    params.append("review_id", review_id);
    app.ajaxCall(app.urlGetReview, params, app.gotReview, app.ajaxErr);
  },
  gotReview: function (ev) {
    var review = JSON.parse(ev.currentTarget.responseText);
    var code = review["code"];
    if (code === 0) {
      document.getElementById("picture_review").src = decodeURIComponent(review["review_details"].img);
      document.getElementById("labelTitle").innerHTML = review["review_details"].title;
      document.getElementById("labelDescription").innerHTML = review["review_details"].review_txt;
      document.getElementById("stars").innerHTML = app.createStars(review["review_details"].rating);
      app.navigateToPage(
        document.getElementById("list"),
        document.getElementById("detail")
      );
    } else {
      console.log(review["message"]);
    }
  },
  submitReview: function (ev) {
    ev.preventDefault();
    var pictureBase64 = encodeURIComponent(app.image);
    var title = document.getElementById("txtTitle").value; // TODO: Limit 40 char
    var description = document.getElementById("txtDescription").value; // TODO: Limit 255 char
    var rating = app.starValue; // TODO: 1-5

    var params = new FormData();
    params.append("uuid", app.uuid);
    params.append("action", "insert");
    params.append("title", title);
    params.append("review_txt", description);
    params.append("rating", rating);
    params.append("img", pictureBase64);
    app.ajaxCall(app.urlSetNewReview, params, app.sentList, app.ajaxErr);
  },
  sentList: function (ev) {
    ev.preventDefault();
    location.reload();
  },
  accessCamera: function () {
    var opts = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      targetWidth: 200,
      targetHeight: 200,
      cameraDirection: Camera.Direction.FRONT,
      saveToPhotoAlbum: false
    };
    navigator.camera.getPicture(app.pictureTaken,
      app.pictureFail,
      opts);
  },
  pictureTaken: function (picture) {
    app.image = "data:image/jpeg;base64," + picture;
    document.getElementById("imgImage").src = app.image;
    navigator.camera.cleanup();
  },
  pictureFail: function (message) {
    alert("Picture not taken because: " + message);
  }
};

app.initialize();