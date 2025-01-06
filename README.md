# RateYourStyle
 
RateYourStyle was an online fashion community to help users discover their personal style. Key features of RYS included:
- User uploaded outfit pics
- AI assisted outfit descriptions
- Aggregating user clothes into a virtual closet
- Aggregating data about user clothes to give statstics like cost per wear, most worn items 
- Searchable discover page for users to discover each others outfits and closets 
- Ability to leave reviews and comments on each others outfits 
- Ability to request style feedback from specific users
- Sign up via Oauth with Gmail
- Sign in via OTP or username/password combo

After enrolling in Georgia Tech's OMSCS program, RYS was also used to complete a class project for CS-6460: Educational Technology ([final paper here](https://docs.google.com/document/d/11ttMS-oyOHvuVtpwAu6F555S5bqA0oe6H9TYv8izRP8/edit?usp=sharing)). Two features were added as part of that project:
- Educational modules about color science
- Personal color anlaysis web app 

## Screenshares

### Home
<img src="/screenshares/homepage.gif" width="600" />


### Virtual closet and stats

<img src="/screenshares/closet.gif" width="600" />


### Outfit and reviews 

<img src="/screenshares/outfit.gif" width="600" />

### Outfit upload 

<img src="/screenshares/outfit-upload.gif" width="600" />

### Discover

<img src="/screenshares/discover.gif" width="600" />

### Signin

<img src="/screenshares/signin.gif" width="600" />


### Color Science page

<img src="/screenshares/color-science.gif" width="600" />

### Color Analysis page

<img src="/screenshares/color-analysis.gif" width="600" />


## Local Development 

RYS was designed with microservice architecture in mind. The main components include:

- server: handles outfit uploading, getting user outfits, posting reviews
- server-auth: handles user authentication and account sign up
- server-search (not included): hanldes search on discover page 
- server-image: handles uploading images to GCP, and getting outfit descriptions from OpenAI
- ui: creates the frontend for YoutubeBacklinks

### Requirements
To build and run RYS locally, you need the following:

- Docker installed
- A GCP account and a GCP project created. See https://console.cloud.google.com
- OpenAI dev account
- Gmail SMTP
- Under the secrets/ subdirectory, create the following files:
   - localdev_sa.json # service account key to GCP with GCS access
   - openai.key

### Running locally 

1. Use `docker-compose up --build` to bring up the entire stack