# vue-leaflet

> an inteactve map based on VueJS and LeafLet

## Build Setup

``` bash
# to pass the access control check
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security

# serve with hot reload at localhost:8080
npm run dev

```
## Components

``` bash
# parent component
App.vue: for the main view

# child components
VueLeaf.vue: for displaying leaflet map and other user interactions

```

## Plugins & Tools

``` bash
# bootstrap
for Button Groups---display locations of different categories

# vue-js-toggle-button
for Toggle Switch---make choice on enabling the function of adding new locations on the map or not

# vue-notification
for Notification---popup when clicking on the category which has no locations found

# vuetify
for Form Dialog---click on the map, popup a dialog for user to fill the data of new location, like the location name and categories, along with non-empty validations

# Vue2-leaflet-geosearch
for Search Bar---search on the map

# vue-apollo
for using GraphQL to request the coordinates and categories from the pages in ProcessWire

# vue2-leaflet-locatecontrol
for locate the user to the current location

# vue2-leaflet-makercluster
for grouping nearby markers into single clusters

```

# main view
![main view of the map](https://raw.githubusercontent.com/hc96/vue-leaflet/master/images/1.png)

# locations of supermarkets category
![locations of supermarkets category](https://raw.githubusercontent.com/hc96/vue-leaflet/master/images/2.png)

# form dialog for adding new location
![form dialog for adding new location](https://raw.githubusercontent.com/hc96/vue-leaflet/master/images/4.png)
![form dialog for adding new location](https://raw.githubusercontent.com/hc96/vue-leaflet/master/images/3.png)

# search bar
![search bar](https://raw.githubusercontent.com/hc96/vue-leaflet/master/images/5.png)

# notification
![notification](https://raw.githubusercontent.com/hc96/vue-leaflet/master/images/6.png)




