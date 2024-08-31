# 3-auth-service

The authentication service is responsible for authenticating users in our application.

This authentication service is used to generate the Json web token. And then it will be sent to the API gateway.

Then it's in the API gateway that we are going to save the JWT token in the cookie session.

This authentication service have some features. These features are `authentication` feature and a `search` feature.

##### Auth Service Features
![alt text](auth-service-features.png)