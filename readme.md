# NTX Backend Test

This API was developed as a case study project.

## User Roles

In this project, we have users with roles, which are stored in the `users_with_role` table.

### Role Types

1. `aksesGetData`: Users with this role have access to `/api/data/getdata` API
2. `aksesCallMeWss`: Users with this role have access to `/api/data/callmewss` API

## Protected APIs

This two APIs are protected with Json Web Token:
1. `/api/data/getdata`
2. `/api/data/callmewss`

## Unit Test

![Sequelize Delayed 3 Seconds](/unit_test.png)
