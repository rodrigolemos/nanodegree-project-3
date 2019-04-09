let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoibGVtb3NyIiwiYSI6ImNqdTdjMmNuZzE4YWozem8ydWRqYnJwZGkifQ.YHRqnZmiiowuVccr6Vh2_Q',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.setAttribute('role', 'heading');
  name.setAttribute('aria-label', restaurant.name);
  name.setAttribute('tabindex', '0');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.setAttribute('tabindex', '0');
  address.setAttribute('aria-label', 'Address: ' + restaurant.address);
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.setAttribute('role', 'img');
  image.setAttribute('tabindex', '0');
  image.setAttribute('alt', 'Photo of the restaurant ' + restaurant.name);
  image.setAttribute('aria-label', 'Photo of the restaurant ' + restaurant.name);
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-label', 'Opened: ' + key + ' - ' + operatingHours[key]);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.setAttribute('role', 'heading');
  title.setAttribute('aria-label', 'Reviews');
  title.setAttribute('tabindex', '0');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.setAttribute('role', 'heading');
    noReviews.setAttribute('aria-label', 'No reviews yet');
    noReviews.setAttribute('tabindex', '0');
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  
  const divReview  = document.createElement('li');
  const rowHeader  = document.createElement('div');
  const colHeader  = document.createElement('div');
  const rowContent = document.createElement('div');
  const colContent = document.createElement('div');

  rowHeader.classList.add('row');
  rowContent.classList.add('row');

  colHeader.classList.add('col-xs-12');
  colHeader.classList.add('review-header');
  colContent.classList.add('col-xs-12');
  colContent.classList.add('review-body');

  const name = document.createElement('span');
  name.setAttribute('role', 'heading');
  name.setAttribute('aria-label', review.name);
  name.setAttribute('tabindex', '0');
  name.innerHTML = review.name;
  colHeader.appendChild(name);

  const date = document.createElement('span');
  date.classList.add('review-date');
  date.setAttribute('role', 'heading');
  date.setAttribute('aria-label', review.date);
  date.setAttribute('tabindex', '0');
  date.innerHTML = review.date;
  colHeader.appendChild(date);

  rowHeader.appendChild(colHeader);

  const rating = document.createElement('span');
  rating.classList.add('review-rating');
  rating.setAttribute('role', 'heading');
  rating.setAttribute('aria-label', review.rating);
  rating.setAttribute('tabindex', '0');
  rating.innerHTML = `Rating: ${review.rating}`;
  colContent.appendChild(rating);

  const comments = document.createElement('p');
  comments.setAttribute('aria-label', review.comments);
  comments.setAttribute('tabindex', '0');
  comments.innerHTML = review.comments;
  colContent.appendChild(comments);

  rowContent.appendChild(colContent);

  divReview.appendChild(rowHeader);
  divReview.appendChild(rowContent);

  return divReview;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
