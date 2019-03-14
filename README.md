# csymapp-api
Csyber Systems Mother Application (csymapp) [api](https://en.wikipedia.org/wiki/Application_programming_interface) provides a [boilerplate](https://en.wikipedia.org/wiki/Boilerplate_code) which implements [Familyfe Role Based Access Control](https://github.com/csymapp/Familyfe_RBAC/) for developing Node.js web applications. It has user (account) management already taken care of as well as access control, so that it can be reused across projects that require these features without having to redo these features.


## Project Signature
 Project | **Csyber Systems Mother Application api (csyma-api)**
 ---|----------------
Email  | [Brian Onang'o](mailto:brian@cseco.co.ke), [Brian Onang'o](mailto:surgbc@gmail.com)
for  | CSECO - Circuits and Systems Engineering Company
Start Date  | 2017 

## Table of Contents
- [csymapp-api](#csymapp-api)
- [Justification](#justification)
- [Features](#features)
- [Dependencies](#dependencies)
- [Prerequisites](#prerequisites)
- [Design](#design)
- [Usage](#usage)
- [Developing](#developing)
- [Todo](#todo)

## csymapp-api

**[⬆ back home](#table-of-contents)**

## Justification
*"...how often would I have gathered thy children together, even as a hen gathereth her chickens under her wings" Matthew 23:37*. When we take care of the mother (application), the child applications will be easier to take care of, for the mother will take care of them.

**[⬆ back home](#table-of-contents)**

## Features
- Local Authentication using Email and Password
- OAuth 1.0a Authentication via Twitter
- OAuth 2.0 Authentication via Facebook, Google, GitHub, LinkedIn, Instagram
- Account Management
- Profile Details
- Change Password
- Forgot Password
- Reset Password
- Link multiple OAuth strategies to one account
- Delete Account
- CSRF protection
- API Examples: Facebook, Foursquare, Last.fm, Tumblr, Twitter, Stripe, LinkedIn and more.
- Group hierarchy

**[⬆ back home](#table-of-contents)**

## Dependencies
- [Familyfe Role Based Access Control](https://github.com/csymapp/Familyfe_RBAC/)

**[⬆ back home](#table-of-contents)**

## Prerequisites
- mariadb
- node.js
- yarn/npm

**[⬆ back home](#table-of-contents)**

## Design
<h6 align="center">Relationships</h6>
<img src="images/csymapp.png" width="100%">

**[⬆ back home](#table-of-contents)**

## Usage
We have created an installation script. Be sure to follow carefully any instuctions given. Especially be sure to edit the files `.env` and `config`
Before running the install script, please ensure you have the [prerequisites](#Prerequisites) installed.

Be sure also to set environment to production `ENV=production` in `.env`. Otherwise anyone will be able to access your admin account because of the common email and password used for development enviroment set-ups.

```sh
cd /root
git clone https://github.com/csymapp/csymapp-api.git
cd csymapp-api/setup
./first_time_setup.sh
nvm use 8
```

**What does this do?** - It creates the databases and relations required, creates the service and creates two test users: an common account for guest users and an administrator account.

**[⬆ back home](#table-of-contents)**

## Developing
Please see the [docs](docs/TOC.md) on how to create applications using csymapp.

**[⬆ back home](#table-of-contents)**

## Todo
- [x] first time setup
- Login
    - [x] local (email)
    - [x] facebook
    - [x] github
    - [x] google
    - [x] twitter
-  [x] Redirect after login
    - [x] Github
**[⬆ back home](#table-of-contents)**

[instructions](https://support.google.com/cloud/answer/6158849?hl=en-GB#authorized-domains)