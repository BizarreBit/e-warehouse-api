API Documentation
Endpoint: localhost:8008

*** User ***

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

[Change User Password]
PATCH     /auth
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
BODY      oldPassword     required
          newPassword     required
RESPONSE  204 No Content
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}
          
[Change User Email]
PATCH     /auth/id
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
BODY      newEmail     required
          password     required
RESPONSE  204 No Content
          400 message     {message: error message}
          401 message     {message: unauthorized access}
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
PATCH     /users/image
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
BODY      profileImage    required
RESPONSE  200 url         {profileImage: https//pic.com/xxxxx}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Update User Profile Detail]
PATCH     /users
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
BODY      firstName OR
          lastName        required
RESPONSE  200 new value   {firstName, lastName}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

*** Group ***

[Get Group]
GET       /groups
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 groups      {groups: [{id, name}]}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Create Group]
POST      /groups
BODY      name            required
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 group       {group: {id, name}}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Edit Group]
PATCH     /groups/:groupId
BODY      name            required
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 group       {group: {id, name}}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Delete Group]
DELETE    /groups/:groupId
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
BODY      isCascadeDelete
RESPONSE  204 isCascadeDelete {isCascadeDelete: false OR true}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

*** Family ***

[Get Family]
GET       /families
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 families    {families: [{id, name, group}]}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Create Family]
POST      /families
BODY      name            required
          groupId         
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 family      {family: {id, name, group}}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Edit Family]
PATCH     /families/:familyId
BODY      name OR
          groupId         required
          isCascadeGroupEdit   optional
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 family      {family: {id, name, group}, isCascadeGroupEdit }
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Delete Family]
DELETE    /families/:familyId
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 OK          {isCascadeDelete: true OR false}
          204 No Content
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

*** Item ***

[Get Item]
GET       /items
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 items       {items: [{
                            id, name, sku, barcode, altName, image, 
                            weight, width, length, height, position, 
                            price, avgCost, group, family}]}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Create Item]
POST      /items
BODY      name            required
          sku             required
          barcode, altName, image, 
          weight, width, length, height, 
          position, active,
          price, avgCost
          groupId
          familyId
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 item        {item: {
                            id, name, sku, barcode, altName, image, 
                            weight, width, length, height, position, 
                            price, avgCost, group, family}}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Edit Item]
PATCH     /items/:itemId
BODY      name, sku,
          barcode, altName, image, 
          weight, width, length, height, 
          position, active,
          price, avgCost
          groupId OR
          familyId        required
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 item        {item: {
                            id, name, sku, barcode, altName, image, 
                            weight, width, length, height, position, 
                            active, price, avgCost, group, family}}
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}

[Delete Item]
DELETE    /items/:itemId
HEADER    Authorization   Bearer xxxxxxxxxxxxxxx
RESPONSE  200 OK          {isCascadeDelete: true OR false}
          204 No Content
          400 message     {message: error message}
          401 message     {message: unauthorized access}
          500 message     {message: internal server error}