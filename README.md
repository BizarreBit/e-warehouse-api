API Documentation
Endpoint: localhost:8008

[Sign Up]
POST      /auth/signup
BODY      firstName       required
          lastName        required
          email           required
          password        required
RESPONSE  200 token       {token: xxxxxxxxxxxxxxx}
          400 message     {message: error message}
          500 message     {message: internal server error}

[Sign In]
POST      /auth/signin
BODY      email           required
          password        required
RESPONSE  200 token       {token: xxxxxxxxxxxxxxx}
          400 message     {message: invalid credential}
          500 message     {message: internal server error}

[Get User Detail]
GET       /users/me
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 user        {user: {
                                  id,
                                  firstName,
                                  lastName,
                                  email,
                                  profileImage
                                }
                          }
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Update User Profile Image]
PATCH     /users
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
BODY      profileImage    required
RESPONSE  200 url         {profileImage: https//pic.com/xxxxx}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}