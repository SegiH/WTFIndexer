# WTFIndexer
Overview:

WTFIndexer is an multi-platform application that scrapes the web for the podcast WTF with Marc Maron and saves all of the episode information into a SQL Server database and displays the podcast information in a searchable table with the ability to mark episodes that you want to listen to later and check episodes in and out if you have them saved. 

It can be run as a web application, Android app or iOS app. (Note: It is also supposed to be possible to use Electron to create a native desktop app for Windows, Mac and Linux but I have not been able to get this to work)

Almost every name in each episode should have a hyperlink to that persons' page on IMDB.com where you can see all of their credits. This app will try to automatically get the IMDB link for each name in an episode title when adding a new episode to the database. If it isn't able to identify the name, you can manually update the IMDB link by visiting the persons' IMDB page and using the Javascript bookmarklet below.

![Episodes](https://github.com/SegiH/WTFIndexer/blob/main/screenshots/Episodes.png?raw=true)
![IMDB](https://github.com/SegiH/WTFIndexer/blob/main/screenshots/IMDB.png?raw=true)

# Check In/Out Episodes
This app also has the ability to check episodes in and out on your media server if you have the episodes saved. I added this feature because media players like Emby and Jellyfin cannot play a WTF podcast if you have 500 or more files in a directory. When you try to play a podcast episode, it does not play so I added a way to check in episodes like a library.

Check In/Out is not enabled by default. To enable it, edit assets/default.json and change ```"CheckoutAllowed": "false",``` to ```"CheckoutAllowed": "true",```

## Requirements:

1. Web server (Apache or Nginx)
1. SQL Server database

## Instructions

### Setup
1. Install WTFBackend on your server
1. Build the web app:
   a. `npm install -g @ionic/cli` # Install Ionic framework
   b. `ionic build` # Build the app
   c. Move contents of build to your web server
1. Edit assets\default.json and set the value of all of the properties

1. (Optional) Build the Android App with Android Studio
   a. After building the web app above run the following commands:
   a. `ionic cap copy android`
   a. `ionic cap sync android`
   a. `ionic cap open android`
   a. Android Studio should automatically open the Android project
   a. Build & Deploy it to your device over USB

1. (Optional) Build the iOS App with XCode
   a. After building the web app above run the following commands:
   a. `ionic cap copy ios`
   a. `ionic cap sync ios`
   a. `ionic cap open ios`
   a. XCode should automatically open the iOS project
   a. Build & Deploy it to your device over USB

### Javascript Bookmarklet
To make it easier to add a persons' IMDB link, you can create a bookmarklet that you can click on in your browsers' toolbar to quickly add an IMDB URL.

Edit the JavaScript code below by changing https://www.yoursite.com to the URL where you are hosting this app and save it to a bookmarklet. Save the bookmark to your browser' toolbar. When you visit a persons' IMDB page, click on this bookmarklet to add the page. There is logic in place so you cannot add the same URL twice. If you try to add a URL after it has already been added, the URL will be updated.

```javascript: String.prototype.replaceAll=function(find,replace){return this.replace(new RegExp(find,'g'),replace)};var name=document.querySelector(".itemprop").innerText;var URL=document.location.toString();URL=URL.substring(0,URL.lastIndexOf("/")+1);window.open("https://www.yoursite.com/WTF.php?AddIMDBURL&Name="+name.replaceAll("'","''")+"&Link="+URL,"_blank");event.preventDefault();```